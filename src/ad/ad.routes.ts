import { Router } from "express";
import { AdService } from "./ad.service";
import { AdRepository } from "../repositories/ad.repository";
import { QuickTellerPaymentRepository } from "../repositories/payment.repository";
import { ProductRepository } from "../repositories/product.repository";
import { TransactionRepository } from "../repositories/transaction.repository";
import { WinstonLogger } from "../utils/logger/winston.logger";
import { AdController } from "./ad.controller";
import { Validator } from "../utils/middlewares/validator.middleware";
import { MerchantAuthGaurd } from "../utils/middlewares/guards/merchant.auth.guard";
import { MerchantRepository } from "../repositories/merchant.repository";
import { JWTService } from "../utils/jwt/jwt.service";
import { InitializeAdPaymentDto } from "./dtos/initialize-ad-payment.dto";



const router = Router();

const merchantRepository = new MerchantRepository();
const jwtService = new JWTService()
const adRepository = new AdRepository();
const paymentService = new QuickTellerPaymentRepository();
const productRepository = new ProductRepository();
const transactionRepository = new TransactionRepository();
const logger = new WinstonLogger("AdService");
const adService = new AdService(adRepository, paymentService, productRepository, transactionRepository, logger);
const adController = new AdController(adService);

const validator = new Validator();
const merchantAuthGaurd = new MerchantAuthGaurd(merchantRepository, logger, jwtService);


// Activate Free Ad
router.post("/free/:productId", merchantAuthGaurd.authorise({strict: true}), adController.activateFreeAd);

// Initialize Ad Payment
router.post("/initialize/:level/:productId", validator.single(InitializeAdPaymentDto, "params") ,merchantAuthGaurd.authorise({strict: true}), adController.initializeAdPayment);

// Verify Ad Payment
router.post("/verify/:reference", merchantAuthGaurd.authorise({strict: true}), adController.verifyAdPayment);


export default router;