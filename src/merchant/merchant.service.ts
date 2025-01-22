import { Prisma } from "@prisma/client";
import { ErrorMessages } from "../constants/error-messages.enum";
import { DataFormatterHelper } from "../helpers/format.helper";
import { AddressRepository } from "../repositories/address.repository";
import { MerchantRepository } from "../repositories/merchant.repository";
import { PhoneNumberRepository } from "../repositories/phone-number.repository";
import { InternalServerException } from "../utils/exceptions/internal-server.exception";
import { NotFoundException } from "../utils/exceptions/not-found.exception";
import { WinstonLogger } from "../utils/logger/winston.logger";
import { MerchantUpdateDto } from "./dtos/merchant-update.dto";
import { MarketRepository } from '../repositories/market.repository';
import { UnauthorizedException } from "../utils/exceptions/unauthorized.exception";

export class MerchantService {
    constructor(
        private readonly merchantRepository: MerchantRepository,
        private readonly marketRepository: MarketRepository,
        private readonly addressRepository: AddressRepository,
        private readonly phoneNumberRepository: PhoneNumberRepository,
        private readonly logger: WinstonLogger
    ) { }

    async getMerchantById(id: string) {
        try {
            const merchant = await this.merchantRepository.getMerchantById(id);
            if (!merchant) {
                throw new NotFoundException(ErrorMessages.MERCHANT_NOT_FOUND);
            }
            return merchant;
        } catch (e) {
            this.logger.error(`${ErrorMessages.GET_MERCHANT_BY_ID_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.GET_MERCHANT_BY_ID_FAILED);
        }
    }

    async getMerchantsByMarketId(marketId: string) {
        try {
            const merchants = await this.merchantRepository.getMarketMerchants(marketId);
            return merchants;
        } catch (error) {
            this.logger.error(`${ErrorMessages.GET_MERCHANTS_BY_MARKET_ID_FAILED}: ${error}`);
            throw new InternalServerException(ErrorMessages.GET_MERCHANTS_BY_MARKET_ID_FAILED);
        }
    }

    async updateMerchant(merchantId: string, merchantUpdateDto: MerchantUpdateDto) {
        try {
            const { phoneNumbers, addresses, brandName, marketName , email} = merchantUpdateDto;
            let merchant: Prisma.MerchantUpdateInput = {};
            // Update Brand Name
            if (brandName) {
                merchant.brandName = brandName;
            }
            if (email) {
                const emailInstance = await this.merchantRepository.getMerchantByEmail(email);
                if (emailInstance && emailInstance.id !== merchantId) {
                    throw new UnauthorizedException(ErrorMessages.EMAIL_EXISTS);
                }
                merchant.email = email;
                merchant.emailVerifiedAt = null;
                merchant.googleId = null;
            }
            // Update Phone Numbers
            if (phoneNumbers) {
                const mappedPhoneNumbers = DataFormatterHelper.formatPhoneNumbers(phoneNumbers);
                await this.phoneNumberRepository.deleteMerchantNumbers(merchantId);
                await this.phoneNumberRepository.createMerchantPhoneNumbers(merchantId, mappedPhoneNumbers);
            }

            // Update Addresses
            if (addresses) {
                addresses.map(async (address) => {
                    const addressInstance = await this.addressRepository.getUniqueByMerchantId(address.name, merchantId);
                    if (addressInstance) {
                        await this.addressRepository.updateByMerchantId(address.name, merchantId, address);
                    } else {
                        await this.addressRepository.createMerchantAddress(merchantId, address);
                    }
                })
            }

            if(marketName) {
                // Check if market name is unique
                const marketNameExists = await this.marketRepository.findByName(marketName);
                if(!marketNameExists) {
                    throw new NotFoundException(ErrorMessages.MARKET_NOT_FOUND);
                }
            }


            const updatedMerchant = await this.merchantRepository.update(merchantId, merchant, marketName);
            return updatedMerchant;
        } catch (e) {
            this.logger.error(`${ErrorMessages.UPDATE_MERCHANT_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.UPDATE_MERCHANT_FAILED);
        }
    }

    async deleteMerchant(merchantId: string) {
        try {
            await this.merchantRepository.delete(merchantId);
            return true;
        } catch (e) {
            this.logger.error(`${ErrorMessages.DELETE_MERCHANT_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.DELETE_MERCHANT_FAILED);
        }
    }
}