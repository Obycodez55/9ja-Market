import { Product } from "@prisma/client";
import { ProductRepository } from "../repositories/product.repository";
import { WinstonLogger } from "../utils/logger/winston.logger";
import { NotFoundException } from "../utils/exceptions/not-found.exception";
import { InternalServerException } from "../utils/exceptions/internal-server.exception";
import { ProductCreateDto } from "./dtos/product-create.dto";
import { ErrorMessages } from "../constants/error-messages.enum";
import { DefaultValues } from "../constants/default.enum";
import { ProductUpdateDto } from "./dtos/product-update.dto";


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
            this.logger.error(`${ErrorMessages.GET_PRODUCT_BY_ID_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.GET_PRODUCT_BY_ID_FAILED);
        }
    }

    async createProduct(marketId: string, productData: ProductCreateDto): Promise<Product> {
        try {
            const displayImage = DefaultValues.PRODUCT_DISPLAY_IMAGE;
            const productCreateData = { ...productData, displayImage };
            const product = await this.productRepository.create(marketId, productCreateData);
            return product;
        } catch (e) {
            this.logger.error(`${ErrorMessages.CREATE_PRODUCT_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.CREATE_PRODUCT_FAILED);
        }
    }

    async updateProduct(id: string, productData: ProductUpdateDto): Promise<Product> {
        try {
            const product = await this.productRepository.getById(id);
            if (!product) {
                throw new NotFoundException(ErrorMessages.PRODUCT_NOT_FOUND);
            }
            const updatedProduct = await this.productRepository.update(id, productData);
            return updatedProduct;
        } catch (e) {
            this.logger.error(`${ErrorMessages.UPDATE_PRODUCT_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.UPDATE_PRODUCT_FAILED);
        }
    }

    async deleteProduct(id: string): Promise<boolean> {
        try {
            await this.productRepository.delete(id);
            return true;
        } catch (e) {
            this.logger.error(`${ErrorMessages.DELETE_PRODUCT_FAILED}: ${e}`);
            throw new InternalServerException(ErrorMessages.DELETE_PRODUCT_FAILED);
        }
    }
}