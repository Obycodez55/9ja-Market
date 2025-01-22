import { Customer, Prisma } from "@prisma/client";
import { CustomerRepository } from "../repositories/customer.repository";
import { WinstonLogger } from "../utils/logger/winston.logger";
import { NotFoundException } from "../utils/exceptions/not-found.exception";
import { InternalServerException } from "../utils/exceptions/internal-server.exception";
import { CustomerUpdateDto } from "./dtos/customer-update.dto";
import { AddressRepository } from "../repositories/address.repository";
import { PhoneNumberRepository } from "../repositories/phone-number.repository";
import { DataFormatterHelper } from "../helpers/format.helper";
import { UnauthorizedException } from "../utils/exceptions/unauthorized.exception";
import { ErrorMessages } from "../constants/error-messages.enum";


export class CustomerService {
    private readonly customerRepository: CustomerRepository;
    private readonly addressRepository: AddressRepository;
    private readonly phoneNumberRepository: PhoneNumberRepository;
    private readonly logger: WinstonLogger;

    constructor(customerRepository: CustomerRepository, addressRepository: AddressRepository, phoneNumberRepository: PhoneNumberRepository, logger: WinstonLogger) {
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
        this.phoneNumberRepository = phoneNumberRepository
        this.logger = logger;
    }

    async getCustomerById(id: string): Promise<Customer> {
        try {
            const customer = await this.customerRepository.getCustomerById(id);
            if (!customer) {
                throw new NotFoundException("Customer not found");
            }
            return customer;
        } catch (e) {
            this.logger.error(`Error getting customer by id: ${e}`);
            throw new InternalServerException("Error getting customer by id");
        }
    }

    async updateCustomer(customerId: string, customerUpdateDto: CustomerUpdateDto): Promise<Customer> {
        try {
            const { phoneNumbers, addresses,dateOfBirth, lastName, firstName, email } = customerUpdateDto;
            let customer: Prisma.CustomerUpdateInput = {};
            // Update Date of Birth
            if (dateOfBirth) {
                customer.dateOfBirth = DataFormatterHelper.formatDate(dateOfBirth);
            }
            if (email) {
                const emailInstance = await this.customerRepository.getCustomerByEmail(email);
                if (emailInstance && emailInstance.id !== customerId) {
                    throw new UnauthorizedException(ErrorMessages.EMAIL_EXISTS);
                }
                customer.email = email;
                customer.emailVerifiedAt = null;
                customer.googleId = null;
            }
            // Set firstName and LastName
            customer.firstName = firstName;
            customer.lastName = lastName;

            // Update Phone Numbers
            if (phoneNumbers) {
                const mappedPhoneNumbers = DataFormatterHelper.formatPhoneNumbers(phoneNumbers);
                await this.phoneNumberRepository.deleteCustomerNumbers(customerId);
                await this.phoneNumberRepository.createCustomerPhoneNumbers(customerId, mappedPhoneNumbers);
            }

            // Update Addresses
            if (addresses) {
                await Promise.all(addresses.map(async (address) => {
                    const addressInstance = await this.addressRepository.getUniqueByCustomerId(address.name, customerId);
                    if (addressInstance) {
                        await this.addressRepository.updateByCustomerId(address.name, customerId, address);
                    } else {
                        await this.addressRepository.createCustomerAddress(customerId, address);
                    }
                }));
            }

            // Update The Customer
            const updatedCustomer = await this.customerRepository.update(customerId, customer);
            return updatedCustomer;
        } catch (e) {
            if (e instanceof UnauthorizedException) {
                throw e;
            }
            this.logger.error(`Error updating customer: ${e}`);
            throw new InternalServerException("Error updating customer");
        }
    }

    async deleteCustomer(customerId: string): Promise<boolean> {
        try {
            await this.customerRepository.delete(customerId);
            return true;
        } catch (e) {
            this.logger.error(`Error deleting customer: ${e}`);
            throw new InternalServerException("Error deleting customer");
        }
    }

}