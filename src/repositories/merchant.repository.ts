import { Merchant, Prisma } from "@prisma/client";
import { IMerchantRepository } from "./interfaces/merchant.repository.interface";
import { databaseService } from "../utils/database";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class MerchantRepository implements IMerchantRepository {
    private readonly merchantDelegate: Prisma.MerchantDelegate<DefaultArgs>;

    constructor() {
        this.merchantDelegate = databaseService.merchant;
    }

    findAll(): Promise<Merchant[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchants = await this.merchantDelegate.findMany();
                resolve(merchants)
            } catch (e) {
                reject(e)
            }
        })
    }

    getMerchantById(id: string, options: { products: boolean } = { products: false }): Promise<Merchant | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchant = await this.merchantDelegate.findUnique({
                    where: { id },
                    include: {
                        addresses: true,
                        phoneNumbers: true,
                        products: options.products
                    }
                });
                resolve(merchant)
            } catch (e) {
                reject(e);
            }
        })
    }

    getMarketMerchants(marketId: string): Promise<Merchant[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchants = await this.merchantDelegate.findMany({
                    where: { marketId },
                    include: {
                        addresses: true,
                        phoneNumbers: true,
                        products: {
                            include: {
                                displayImage: true,
                                images: true,
                                ratings: true
                            }
                        }
                    }
                });
                resolve(merchants)
            } catch (e) {
                reject(e)
            }
        })
    }

    getMerchantByEmail(email: string, options: { products: boolean } = { products: false }): Promise<Merchant | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchant = await this.merchantDelegate.findUnique({
                    where: { email },
                    include: {
                        addresses: true,
                        phoneNumbers: true,
                        products: options.products
                    }
                });
                resolve(merchant)
            } catch (e) {
                reject(e);
            }
        })
    }

    getMerchantByBrandName(brandName: string, options: { products: boolean } = { products: false }): Promise<Merchant | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchant = await this.merchantDelegate.findUnique({
                    where: { brandName },
                    include: {
                        addresses: true,
                        phoneNumbers: true,
                        products: options.products
                    }
                });
                resolve(merchant)
            } catch (e) {
                reject(e);
            }
        })
    }

    getMerchantByGoogleId(googleId: string): Promise<Merchant | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchant = await this.merchantDelegate.findUnique({
                    where: { googleId },
                    include: {
                        addresses: true,
                        phoneNumbers: true,
                    }
                });
                resolve(merchant)
            } catch (e) {
                reject(e);
            }
        })
    }

    isEmailVerified(id: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchant = await this.merchantDelegate.findUnique({ where: { id } });
                resolve(!!merchant?.emailVerifiedAt);
            } catch (e) {
                reject(e);
            }
        })
    }

    update(id: string, data: Prisma.MerchantUpdateInput, marketName?: string): Promise<Merchant> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchant = await this.merchantDelegate.update({
                    where: { id },
                    data: {
                        ...data,
                        market: marketName ? {
                            connect: {
                                name: marketName
                            }
                        } : undefined
                    },
                    include: {
                        addresses: true,
                        phoneNumbers: true
                    }
                });
                resolve(merchant)
            } catch (e) {
                reject(e);
            }
        })
    }

    create(data: Prisma.MerchantCreateInput, addresses: Prisma.AddressCreateManyMerchantInput[] = [], phoneNumbers: Prisma.PhoneNumberCreateManyMerchantInput[] = [], marketName?: string): Promise<Merchant> {
        return new Promise(async (resolve, reject) => {
            try {
                const merchant = await this.merchantDelegate.create({
                    data: {
                        ...data,
                        addresses: {
                            createMany: {
                                data: addresses
                            }
                        },
                        phoneNumbers: {
                            createMany: {
                                data: phoneNumbers
                            }
                        },
                        market: marketName ? {
                            connect: {
                                name: marketName
                            }
                        } : undefined
                    },
                    include: {
                        addresses: true,
                        phoneNumbers: true
                    }
                });
                resolve(merchant)
            } catch (e) {
                reject(e);
            }
        })
    }


    delete(id: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.merchantDelegate.delete({ where: { id } });
                resolve(true)
            } catch (e) {
                reject(e);
            }
        })
    }
}