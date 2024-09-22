import { Router } from "express";
import { MarketAuthController } from "./market.auth.controller";
import { MarketAuthService } from "./market.auth.service";
import { WinstonLogger } from "../../utils/logger/winston.logger";
import { BcryptService } from "../../utils/bcrypt/bcrypt.service";
import { JWTService } from "../../utils/jwt/jwt.service";
import { MarketRepository } from "../../repositories/market.repository";
import { Validator } from "../../utils/middlewares/validator.middleware";
import { LoginRequestDto } from "../dtos/login-request.dto";
import { MarketRegisterRequestDto } from "../dtos/market-register-request.dto";
import { EmailVerificationRequestDto } from "../dtos/email-verification-request.dto";
import { VerifyEmailRequestByCodeDto, VerifyEmailRequestByTokenDto } from "../dtos/verify-email-request.dto";
import { ForgotPasswordRequestDto } from "../dtos/forgot-password-request.dto";
import { ResetPasswordRequestDto } from "../dtos/reset-password-request.dto";
import passport from "passport";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { ExchangeTokenDto } from "../dtos/exchange-token.dto";

const router = Router();
const validator = new Validator();

// Market Auth Service Dependencies
const logger = new WinstonLogger('MarketAuthService');
const bcryptService = new BcryptService();
const jwtService = new JWTService();
const marketRepository = new MarketRepository();


// Market Auth Service
const marketAuthService = new MarketAuthService(logger, bcryptService, jwtService, marketRepository);

// Market Auth Controller
const marketAuthController = new MarketAuthController(marketAuthService);

// Login Route
router.post('/login', validator.single(LoginRequestDto), marketAuthController.login);

// Register Route
router.post('/signup', validator.single(MarketRegisterRequestDto), marketAuthController.register);

// Email Verification Route
router.post('/email-verification', validator.single(EmailVerificationRequestDto), marketAuthController.emailVerification);

// Verify Email By Token Param Route
router.post('/verify-email-token', validator.single(VerifyEmailRequestByTokenDto, "query"), marketAuthController.verifyEmailByQuery);

// Verify Email Route
router.post('/verify-email', validator.single(VerifyEmailRequestByCodeDto), marketAuthController.verifyEmail);

// Forgot Password Route
router.post('/forgot-password', validator.single(ForgotPasswordRequestDto), marketAuthController.forgotPassword);

// Reset Password Route
router.put('/reset-password', validator.single(ResetPasswordRequestDto), marketAuthController.resetPassword);

// Refresh Access Token Route
router.post('/refresh-token', validator.single(RefreshTokenDto), marketAuthController.refreshToken);

// Google Auth Initiator Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false, state: 'market' }));

// Google Auth Callback Route
router.get('/google/callback', marketAuthController.googleAuth);

// Exchange Google token
router.get("/exchange-token",validator.single(ExchangeTokenDto, "query"), marketAuthController.exchangeToken)

// Logout Route
router.delete('/logout',validator.single(RefreshTokenDto), marketAuthController.logout);

export default router;