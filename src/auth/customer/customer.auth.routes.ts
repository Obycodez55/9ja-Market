import { Router } from "express";
import { CustomerAuthController } from "./customer.auth.controller";
import { CustomerAuthService } from "./customer.auth.service";
import { WinstonLogger } from "../../utils/logger/winston.logger";
import { BcryptService } from "../../utils/bcrypt/bcrypt.service";
import { JWTService } from "../../utils/jwt/jwt.service";
import { CustomerRepository } from "../../repositories/customer.repository";
import { Validator } from "../../utils/middlewares/validator.middleware";
import { LoginRequestDto } from "../dtos/login-request.dto";
import { CustomerRegisterRequestDto } from "../dtos/customer-register-request.dto";
import { EmailVerificationRequestDto } from "../dtos/email-verification-request.dto";
import { VerifyEmailRequestByCodeDto, VerifyEmailRequestByTokenDto } from "../dtos/verify-email-request.dto";
import { ForgotPasswordRequestDto } from "../dtos/forgot-password-request.dto";
import { ResetPasswordRequestDto } from "../dtos/reset-password-request.dto";
import passport from "passport";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { ExchangeTokenDto } from "../dtos/exchange-token.dto";

const router = Router();
const validator = new Validator();

// Customer Auth Service Dependencies
const logger = new WinstonLogger('CustomerAuthService');
const bcryptService = new BcryptService();
const jwtService = new JWTService();
const customerRepository = new CustomerRepository();


// Customer Auth Service
const customerAuthService = new CustomerAuthService(logger, bcryptService, jwtService, customerRepository);

// Customer Auth Controller
const customerAuthController = new CustomerAuthController(customerAuthService);

// Login Route
router.post('/login', validator.single(LoginRequestDto), customerAuthController.login);

// Register Route
router.post('/signup', validator.single(CustomerRegisterRequestDto), customerAuthController.register);

// Email Verification Route
router.post('/email-verification', validator.single(EmailVerificationRequestDto), customerAuthController.emailVerification);

// Verify Email By Token Param Route
router.get('/verify-email-token', validator.single(VerifyEmailRequestByTokenDto, "query"), customerAuthController.verifyEmailByQuery);

// Verify Email Route
router.post('/verify-email', validator.single(VerifyEmailRequestByCodeDto), customerAuthController.verifyEmail);

// Forgot Password Route
router.post('/forgot-password', validator.single(ForgotPasswordRequestDto), customerAuthController.forgotPassword);

// Reset Password Route
router.put('/reset-password', validator.single(ResetPasswordRequestDto), customerAuthController.resetPassword);

// Refresh Access Token Route
router.post('/refresh-token', validator.single(RefreshTokenDto), customerAuthController.refreshToken);

// Google Auth Initiator Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false, state: 'customer' }));

// Google Auth Callback Route
router.get('/google/callback', customerAuthController.googleAuth);

// Exchange Google token
router.get("/exchange-token", validator.single(ExchangeTokenDto, "query"), customerAuthController.exchangeToken)

// Logout Route
router.delete('/logout', validator.single(RefreshTokenDto),  customerAuthController.logout);

export default router;