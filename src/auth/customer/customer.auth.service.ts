import { EventEmitter } from "stream";
import { BcryptService } from "../../utils/bcrypt/bcrypt.service";
import { EmailService } from "../../utils/email/email.service";
import { JWTService } from "../../utils/jwt/jwt.service";
import { ILogger } from "../../utils/logger/logger.interface";
import { IAuthService } from "../interfaces/auth.service.interface";
import { eventEmmiter } from "../../utils/events";
import { EmailPaths, EmailSubjects } from "../../constants/email.enum";
import { LoginRequestDto } from "../dtos/login-request.dto";
import { LoginResponseDto } from "../dtos/login-response.dto";
import { cryptoService } from "../../utils/crytpo/crypto.service";
import { CustomerRepository } from "../../repositories/customer.repository";
import { ErrorMessages } from "../../constants/error-messages.enum";
import { UnauthorizedException } from "../../utils/exceptions/unauthorized.exception";
import { CustomerRegisterRequestDto } from "../dtos/customer-register-request.dto";
import { BadRequestException } from '../../utils/exceptions/bad-request.exception';
import { InternalServerException } from '../../utils/exceptions/internal-server.exception';
import { EmailVerificationRequestDto } from "../dtos/email-verification-request.dto";
import { NotFoundException } from '../../utils/exceptions/not-found.exception';
import { IVerifyEmailRequest, VerifyEmailRequestByCodeDto, VerifyEmailRequestByTokenDto } from "../dtos/verify-email-request.dto";
import { ForgotPasswordRequestDto } from "../dtos/forgot-password-request.dto";
import { ResetPasswordRequestDto } from "../dtos/reset-password-request.dto";
import { DataFormatterHelper } from "../../helpers/format.helper";
import { Prisma } from "@prisma/client";


export class CustomerAuthService implements IAuthService {
    private readonly logger: ILogger;
    private readonly bcryptService: BcryptService;
    private readonly jwtService: JWTService;
    private readonly emailService: EmailService;
    private readonly eventEmiter: EventEmitter;
    private readonly customerRepository: CustomerRepository;

    constructor(
        logger: ILogger,
        bcryptService: BcryptService,
        jwtService: JWTService,
        customerRepository: CustomerRepository
    ) {
        this.logger = logger;
        this.bcryptService = bcryptService;
        this.jwtService = jwtService;
        this.emailService = new EmailService();
        this.eventEmiter = eventEmmiter;
        this.customerRepository = customerRepository;
        this.initializeEventHandlers();
    }

    initializeEventHandlers() {
        this.eventEmiter.on(`sendCustomerPasswordResetEmail`, async (data: { email: string, resetCode: string }) => {
            const { email, resetCode } = data;
            // const link = url + `/${token}`;
            await this.emailService.sendMail({
                to: email,
                subject: EmailSubjects.PASSWORD_RESET_CUSTOMER,
                options: {
                    template: EmailPaths.PASSWORD_RESET,
                    data: { resetCode }
                }
            })
        });

        this.eventEmiter.on(`sendCustomerEmailVerificationEmail`, async (data: { email: string, token: string, verificationCode: number, url: string }) => {
            const { email, token, verificationCode, url } = data;
            const link = url + `?token=${token}`;
            await this.emailService.sendMail({
                to: email,
                subject: EmailSubjects.EMAIL_VERIFICATION_CUSTOMER,
                options: {
                    template: EmailPaths.EMAIL_VERIFICATION,
                    data: { link, verificationCode }
                }
            })
        });

        this.eventEmiter.on(`sendCustomerWelcomeEmail`, async (data: { email: string, firstName: string, lastName: string }) => {
            const { email, firstName, lastName } = data;
            await this.emailService.sendMail({
                to: email,
                subject: EmailSubjects.WELCOME,
                options: {
                    template: EmailPaths.WELCOME,
                    data: { firstName, lastName }
                }
            })
        });

    }

    private getToken(payload: { [key: string]: any }, expiresIn: string = "15m"): string {
        const hash = this.jwtService.signPayload(payload, expiresIn);
        const token = cryptoService.encrypt(hash);
        return token;
    }

    private getPayload(token: string): { [key: string]: any } {
        const decrypted = cryptoService.decrypt(token);
        const payload = this.jwtService.verifyToken(decrypted);
        return payload;
    }

    private getVerifyEmailData(data: VerifyEmailRequestByCodeDto | VerifyEmailRequestByTokenDto): IVerifyEmailRequest {
        let result: IVerifyEmailRequest;
        if ("code" in data) {
            result = { email: data.email, verificationCode: data.code };
        } else {
            const token = decodeURIComponent(data.token)
            result = <IVerifyEmailRequest>this.getPayload(token);
        }
        return result;
    }


    async login(loginData: LoginRequestDto): Promise<LoginResponseDto> {
        const { email, password } = loginData;

        const customer = await this.customerRepository.getCustomerByEmail(email);
        if (!customer) {
            this.logger.error(ErrorMessages.INVALID_EMAIL_PASSWORD);
            throw new UnauthorizedException(ErrorMessages.INVALID_EMAIL_PASSWORD);
        }

        const isPasswordMatch = await this.bcryptService.comparePassword(password, customer.password!);
        if (!isPasswordMatch) {
            this.logger.error(ErrorMessages.INVALID_EMAIL_PASSWORD);
            throw new UnauthorizedException(ErrorMessages.INVALID_EMAIL_PASSWORD);
        }

        const payload = { email: customer.email, id: customer.id };
        const accessToken = this.getToken(payload, "10h");
        const _refreshToken = cryptoService.random();
        const refreshToken = this.getToken({ email: customer.email, refreshToken: _refreshToken }, "7d");
        await this.customerRepository.update(customer.id, { refreshToken: _refreshToken });
        const response = new LoginResponseDto();
        response.id = customer.id;
        response.accessToken = accessToken;
        response.refreshToken = refreshToken;
        return response;
    }

    async register(registerData: CustomerRegisterRequestDto, url: string): Promise<boolean> {
        const { email, firstName, lastName, password, dateOfBirth } = registerData;

        // Set up date of birth as Date object
        if (dateOfBirth) {
            registerData.dateOfBirth = new Date(dateOfBirth);
        }

        // Check if email is already registered
        const customer = await this.customerRepository.getCustomerByEmail(email);
        if (customer) {
            this.logger.error(ErrorMessages.EMAIL_EXISTS);
            throw new BadRequestException(ErrorMessages.EMAIL_EXISTS);
        }
        try {
            // Hash password
            const hashedPassword = await this.bcryptService.hashPassword(password);
            registerData.password = hashedPassword;

            // Create customer
            const { addresses, phoneNumbers, ...newCustomerData } = registerData;
            const formatedPhoneNumbers = DataFormatterHelper.formatPhoneNumbers(phoneNumbers);
            const newCustomer = await this.customerRepository.create(newCustomerData, addresses, formatedPhoneNumbers);

            // Send welcome email
            this.eventEmiter.emit("sendCustomerWelcomeEmail", { email, firstName, lastName });

            // Send email verification code
            const verificationCode = cryptoService.randomInt();
            await this.customerRepository.update(newCustomer.id, { emailVerificationCode: verificationCode });
            const _token = this.getToken({ email, verificationCode });
            const token = encodeURIComponent(_token);
            this.eventEmiter.emit("sendCustomerEmailVerificationEmail", { email, token, verificationCode, url });
            return true;
        } catch (e) {
            this.logger.error(`${ErrorMessages.REGISTER_CUSTOMER_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.REGISTER_CUSTOMER_FAILED);
        }
    }

    async emailVerification(emailVerificationData: EmailVerificationRequestDto, url: string): Promise<boolean> {
        const { email } = emailVerificationData;
        const customer = await this.customerRepository.getCustomerByEmail(email);
        if (!customer) {
            this.logger.error(ErrorMessages.CUSTOMER_NOT_FOUND);
            throw new NotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND);
        }
        const verificationCode = cryptoService.randomInt();
        await this.customerRepository.update(customer.id, { emailVerificationCode: verificationCode });
        const _token = this.getToken({ email, verificationCode });
        const token = encodeURIComponent(_token)
        this.eventEmiter.emit("sendCustomerEmailVerificationEmail", { email, token, verificationCode, url });
        return true;
    }

    async verifyEmail(verifyEmailData: VerifyEmailRequestByCodeDto | VerifyEmailRequestByTokenDto): Promise<boolean> {
        try {
            const { email, verificationCode } = this.getVerifyEmailData(verifyEmailData);
            const customer = await this.customerRepository.getCustomerByEmail(email);
            if (!customer) {
                this.logger.error(ErrorMessages.CUSTOMER_NOT_FOUND);
                throw new NotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND);
            }
            if (customer.emailVerificationCode !== verificationCode) {
                this.logger.error(ErrorMessages.INVALID_VERIFICATION_TOKEN);
                throw new BadRequestException(ErrorMessages.INVALID_VERIFICATION_TOKEN);
            }
            await this.customerRepository.update(customer.id, { emailVerifiedAt: new Date(), emailVerificationCode: null });
            return true;
        } catch (e) {
            // if (e instanceof JsonWebTokenError) {
            this.logger.error(ErrorMessages.INVALID_VERIFICATION_TOKEN);
            throw new BadRequestException(ErrorMessages.INVALID_VERIFICATION_TOKEN);
            // } else {
            //     this.logger.error(`${ErrorMessages.EMAIL_VERIFICATION_FAILED}: ${e}`);
            //     throw new InternalServerException(ErrorMessages.EMAIL_VERIFICATION_FAILED);
            //     // throw new HttpException(httpStatus.INTERNAL_SERVER_ERROR, ErrorMessages.EMAIL_VERIFICATION_FAILED);
            // }
        }

    }

    async forgotPassword(forgotPasswordData: ForgotPasswordRequestDto): Promise<boolean> {
        const { email } = forgotPasswordData;
        const customer = await this.customerRepository.getCustomerByEmail(email);
        if (!customer) {
            this.logger.error(ErrorMessages.CUSTOMER_NOT_FOUND);
            throw new NotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND);
        }
        const resetCode = cryptoService.randomInt();
        await this.customerRepository.update(customer.id, { passwordResetCode: resetCode });
        // const token = this.getToken({ email, resetCode });
        this.eventEmiter.emit("sendCustomerPasswordResetEmail", { email, resetCode });
        return true;
    }

    async resetPassword(resetPasswordData: ResetPasswordRequestDto): Promise<boolean> {
        try {
            const { resetCode, newPassword, email } = resetPasswordData;
            // const decrypted = cryptoService.decrypt(token);
            // const { email, resetCode } = this.jwtService.verifyToken(decrypted);
            const customer = await this.customerRepository.getCustomerByEmail(email);
            if (!customer) {
                this.logger.error(ErrorMessages.CUSTOMER_NOT_FOUND);
                throw new NotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND);
            }
            if (customer.passwordResetCode !== resetCode) {
                this.logger.error(ErrorMessages.INVALID_RESET_TOKEN);
                throw new BadRequestException(ErrorMessages.INVALID_RESET_TOKEN);
            }
            const hashedPassword = await this.bcryptService.hashPassword(newPassword);
            await this.customerRepository.update(customer.id, { password: hashedPassword, passwordResetCode: null });
            return true;
        } catch (e) {
            // if (e instanceof JsonWebTokenError) {
            this.logger.error(ErrorMessages.INVALID_VERIFICATION_TOKEN);
            throw new BadRequestException(ErrorMessages.INVALID_VERIFICATION_TOKEN);
            // } else {
            //     this.logger.error(`${ErrorMessages.EMAIL_VERIFICATION_FAILED}: ${e}`);
            //     throw new InternalServerException(ErrorMessages.EMAIL_VERIFICATION_FAILED);
            //     // throw new HttpException(httpStatus.INTERNAL_SERVER_ERROR, ErrorMessages.EMAIL_VERIFICATION_FAILED);
            // }
        }
    }

    async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
        try {
            const payload = this.getPayload(refreshToken);
        const { email, refreshToken: _refreshToken } = payload;
        const customer = await this.customerRepository.getCustomerByEmail(email);
        if (!customer) {
            this.logger.error(ErrorMessages.CUSTOMER_NOT_FOUND);
            throw new NotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND);
        }
        if(!customer.refreshToken) {
            this.logger.error(ErrorMessages.REFRESH_TOKEN_NOT_EXISTS);
            throw new UnauthorizedException(ErrorMessages.REFRESH_TOKEN_NOT_EXISTS);
        }
        if (customer.refreshToken !== _refreshToken) {
            this.logger.error(ErrorMessages.INVALID_REFRESH_TOKEN);
            throw new UnauthorizedException(ErrorMessages.INVALID_REFRESH_TOKEN);
        }
        const newAccessToken = this.getToken({ email, id: customer.id }, "10h");
        const response = new LoginResponseDto();
        response.id = customer.id;
        response.accessToken = newAccessToken;
        response.refreshToken = refreshToken;
        return response;
        } catch (e) {
            this.logger.error(`${ErrorMessages.INVALID_REFRESH_TOKEN}: ${e}`);
            throw new UnauthorizedException(ErrorMessages.INVALID_REFRESH_TOKEN);
        }
    }

    async logout(refreshToken: string): Promise<boolean> {
        const payload = this.getPayload(refreshToken);
        const { email } = payload;
        const customer = await this.customerRepository.getCustomerByEmail(email);
        if (!customer) {
            this.logger.error(ErrorMessages.CUSTOMER_NOT_FOUND);
            throw new NotFoundException(ErrorMessages.CUSTOMER_NOT_FOUND);
        }
        await this.customerRepository.update(customer.id, { refreshToken: null });
        return true;
    }

    async googleCreateOrLogin(profile: any): Promise<string> {
        const { emails: [{ value, verified }], id, name: { familyName, givenName }, photos } = profile;
        try {
            const customer = await this.customerRepository.getByGoogleId(id);
            if (!customer) {
                let customerData: Prisma.CustomerCreateInput = {
                    email: value,
                    googleId: id,
                    firstName: givenName,
                    lastName: familyName,
                    emailVerifiedAt: verified ? new Date() : null,
                    displayImage: photos[0].value
                }
                const newCustomer = await this.customerRepository.create(customerData);
                const payload = { email: newCustomer.email, id: newCustomer.id };
                const accessToken = this.getToken(payload, "10h");
                const _refreshToken = cryptoService.random();
                const refreshToken = this.getToken({ email: newCustomer.email, refreshToken: _refreshToken }, "7d");
                await this.customerRepository.update(newCustomer.id, { refreshToken: _refreshToken });
                const result = this.getToken({id: newCustomer.id, accessToken, refreshToken}, "7m");
                return encodeURIComponent(result);
            } else {
                const payload = { email: customer.email, id: customer.id };
                const accessToken = this.getToken(payload, "10h");
                const _refreshToken = cryptoService.random();
                const refreshToken = this.getToken({ email: customer.email, refreshToken: _refreshToken }, "7d");
                await this.customerRepository.update(customer.id, { refreshToken: _refreshToken });
                const result = this.getToken({id: customer.id, accessToken, refreshToken}, "7m");
                return encodeURIComponent(result);
            }
        } catch (e) {
            this.logger.error(`${ErrorMessages.GOOGLE_AUTH_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.GOOGLE_AUTH_FAILED);
        }
    }

    async exchangeToken(token: string): Promise<LoginResponseDto> {
        try {
            token = decodeURIComponent(token)
            const { id, accessToken, refreshToken } = this.getPayload(token);
            if (!id || !accessToken || !refreshToken) {
                this.logger.error(ErrorMessages.INVALID_EXCHANGE_TOKEN);
                throw new BadRequestException(ErrorMessages.INVALID_EXCHANGE_TOKEN);
            };
            const response = new LoginResponseDto();
            response.id = id;
            response.accessToken = accessToken;
            response.refreshToken = refreshToken;
            return response;
        } catch (e) {
            this.logger.error(`${ErrorMessages.INVALID_EXCHANGE_TOKEN}: ${e}`);
            throw new BadRequestException(ErrorMessages.INVALID_EXCHANGE_TOKEN);
        }
    }
}
