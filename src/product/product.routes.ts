import { Router } from "express";
import { WinstonLogger } from "../utils/logger/winston.logger";
import { ProductRepository } from "../repositories/product.repository";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { Validator } from "../utils/middlewares/validator.middleware";
import { IdDto } from "../dtos/id.dto";
import { ProductUpdateDto } from "./dtos/product-update.dto";
import { MerchantAuthGaurd } from "../utils/middlewares/guards/merchant.auth.guard";
import { JWTService } from "../utils/jwt/jwt.service";
import { MerchantRepository } from "../repositories/merchant.repository";
import { ProductCreateDto } from "./dtos/product-create.dto";
import { MulterMiddleware } from "../utils/middlewares/file-parser.middleware";

const logger = new WinstonLogger("ProductService");
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository, logger);
const productController = new ProductController(productService);
const jwtService = new JWTService();
const merchantRepository = new MerchantRepository();
const merchantAuthGaurd = new MerchantAuthGaurd(merchantRepository, logger, jwtService);

const validator = new Validator();
const fileParser = new MulterMiddleware(logger);

const router = Router();


// Get Product by Id
router.get("/:id",
    validator.single(IdDto, "params"),
    productController.getProductById
);

// Get product by merchantId
router.get("/merchant/:merchantId",
    validator.single(IdDto, "params"),
    productController.getProductByMerchantId
);

// Get product by marketId
router.get("/market/:marketId",
    validator.single(IdDto, "params"),
    productController.getMarketProducts
);

// Create a Product
router.post("/",
    fileParser.multiple("productImages", 10),
    validator.single(ProductCreateDto, "body"),
    merchantAuthGaurd.authorise(),
    productController.createProduct
);

// Add Product Images
router.post("/:productId/images",
    fileParser.multiple("productImages", 10),
    validator.single(IdDto, "params"),
    merchantAuthGaurd.authorise(),
    productController.addProductImages
);

// Remove Product Image
router.delete("/:productId/images/:imageId",
    validator.single(IdDto, "params"),
    merchantAuthGaurd.authorise(),
    productController.removeProductImage
);

// Make Display Image
router.put("/:productId/images/:imageId/display",
    validator.single(IdDto, "params"),
    merchantAuthGaurd.authorise(),
    productController.makeDisplayImage
);

// Update Product
router.put("/:id",
    validator.multiple([
        { schema: IdDto, source: "params" },
        { schema: ProductUpdateDto, source: "body" }
    ]),
    merchantAuthGaurd.authorise(),
    productController.updateProduct
);


// Delete Product
router.delete("/:id",
    validator.single(IdDto, "params"),
    merchantAuthGaurd.authorise(),
    productController.deleteProduct
);

export default router;