import { Product } from "@prisma/client";
import { ProductRepository } from "../repositories/product.repository";
import { WinstonLogger } from "../utils/logger/winston.logger";
import { NotFoundException } from "../utils/exceptions/not-found.exception";
import { InternalServerException } from "../utils/exceptions/internal-server.exception";
import { ProductCreateDto } from "./dtos/product-create.dto";
import { ErrorMessages } from "../constants/error-messages.enum";
import { DefaultValues } from "../constants/default.enum";
import { ProductUpdateDto } from "./dtos/product-update.dto";
import { UnauthorizedException } from "../utils/exceptions/unauthorized.exception";
import { BaseException } from "../utils/exceptions/base.exception";
import { DataFormatterHelper } from "../helpers/format.helper";


export class ProductService {

    constructor(
        private readonly productRepository: ProductRepository,
        private readonly logger: WinstonLogger
    ) { }

    async getProductById(id: string): Promise<Product> {
        try {
            const product = await this.productRepository.getById(id);
            if (!product) {
                throw new NotFoundException("Product not found");
            }
            return product;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.GET_PRODUCT_BY_ID_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.GET_PRODUCT_BY_ID_FAILED);
        }
    }

    async getMerchantProducts(merchantId: string): Promise<Product[]> {
        try {
            const products = await this.productRepository.getMerchantProducts(merchantId);
            return products;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.GET_MERCHANT_PRODUCTS_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.GET_MERCHANT_PRODUCTS_FAILED);
        }
    }

    async getMarketProducts(marketId: string): Promise<Product[]> {
        try {
            const products = await this.productRepository.getMarketProducts(marketId);
            return products;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.GET_MARKET_PRODUCTS_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.GET_MARKET_PRODUCTS_FAILED);
        }
    }

    async createProduct(merchantId: string, productData: ProductCreateDto, files: Express.Multer.File[]): Promise<Product> {
        try {
            if (!files || files.length < 1) {
                throw new InternalServerException(ErrorMessages.PRODUCT_IMAGES_NOT_FOUND);
            }
            DataFormatterHelper.formatProductData(productData);
            const displayImage = files[0].path ||  DefaultValues.PRODUCT_DISPLAY_IMAGE;
            const productImages = files.slice(1).map(file => file.path);
            const product = await this.productRepository.create(merchantId, productData, displayImage, productImages);
            return product;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.CREATE_PRODUCT_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.CREATE_PRODUCT_FAILED);
        }
    }

    async updateProduct(id: string, productData: ProductUpdateDto, merchantId: string): Promise<Product> {
        try {
            const product = await this.productRepository.getById(id);
            if (!product) {
                throw new NotFoundException(ErrorMessages.PRODUCT_NOT_FOUND);
            }

            // Ensure Merchant is Authorized to Update Product
            if (product.merchantId !== merchantId) {
                this.logger.error(ErrorMessages.MERCHANT_UNAUTHORIZED);
                throw new UnauthorizedException(ErrorMessages.MERCHANT_UNAUTHORIZED);
            }
            DataFormatterHelper.formatProductData(productData);
            const updatedProduct = await this.productRepository.update(id, productData);
            return updatedProduct;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.UPDATE_PRODUCT_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.UPDATE_PRODUCT_FAILED);
        }
    }

    async deleteProduct(id: string): Promise<boolean> {
        try {
            await this.productRepository.delete(id);
            return true;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.DELETE_PRODUCT_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.DELETE_PRODUCT_FAILED);
        }
    }

    async addProductImages(productId: string, files: Express.Multer.File[]): Promise<Product> {
        try {
            if (!files || files.length < 1) {
                throw new InternalServerException(ErrorMessages.PRODUCT_IMAGES_NOT_FOUND);
            }
            const productImages = files.map(file => file.path);
            const product = await this.productRepository.addImages(productId, productImages);
            return product;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.ADD_PRODUCT_IMAGES_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.ADD_PRODUCT_IMAGES_FAILED);
        }
    }

    async removeProductImage(productId: string, imageId: string): Promise<Product> {
        try {
            const product = await this.productRepository.removeImage(productId, imageId);
            return product;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.REMOVE_PRODUCT_IMAGE_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.REMOVE_PRODUCT_IMAGE_FAILED);
        }
    }

    async makeDisplayImage(productId: string, imageId: string): Promise<Product> {
        try {
            const product = await this.productRepository.makeDisplayImage(productId, imageId);
            return product;
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }
            this.logger.error(`${ErrorMessages.MAKE_DISPLAY_IMAGE_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.MAKE_DISPLAY_IMAGE_FAILED);
        }
    }
}