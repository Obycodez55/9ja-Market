import { NextFunction, Request, RequestHandler, Response } from "express";
import { ProductService } from "./product.service";
import { ResponseDto } from "../dtos/response.dto";
import { ResponseStatus } from "../dtos/interfaces/response.interface";
import { SuccessMessages } from "../constants/success-messages.enum";
import { HttpStatus } from "../constants/http-status.enum";
import { Product } from "@prisma/client";
import { DataFormatterHelper } from "../helpers/format.helper";


export class ProductController {
    constructor(private readonly productService: ProductService) { }

    private formatProductData(productData: Product): void {
        DataFormatterHelper.formatDatabaseObject<Product>(productData, ["merchantId"], "id");
    }
    /**
 * Get Product by Id
 * @param request {Request}
 * @param response (Response}
 * @param next {NextFunction}
 */
    getProductById: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.productService.getProductById(request.params.id);
            this.formatProductData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_PRODUCT_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
* Create New Product
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/
    createProduct: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const merchantId = request.body.merchant.id;
            delete request.body.merchant;
            const files = request.files as Express.Multer.File[];
            const result = await this.productService.createProduct(merchantId, request.body, files);
            this.formatProductData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.CREATE_PRODUCT_SUCCESS, result);
            return response.status(HttpStatus.CREATED).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
* Add Product Images
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/
    addProductImages: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.productService.addProductImages(request.params.productId, request.files as Express.Multer.File[]);
            this.formatProductData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.ADD_PRODUCT_IMAGES_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
* Delete Product Image
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/
    removeProductImage: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            await this.productService.removeProductImage(request.params.productId, request.params.imageId);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.REMOVE_PRODUCT_FROM_CART_SUCCESS);
            return response.status(HttpStatus.NO_CONTENT).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
* Make Display Image
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/
    makeDisplayImage: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.productService.makeDisplayImage(request.params.productId, request.params.imageId);
            this.formatProductData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.UPDATE_PRODUCT_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
* Get Merchant Products
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/
    getProductByMerchantId: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.productService.getMerchantProducts(request.params.merchantId);
            result.forEach((product) => this.formatProductData(product));
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_MERCHANT_PRODUCTS_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }


        /**
* Get Market Products
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/

    getMarketProducts: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.productService.getMarketProducts(request.params.marketId);
            result.forEach((product) => this.formatProductData(product));
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_MARKET_PRODUCTS_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
 * Update Product
 * @param request {Request}
 * @param response (Response}
 * @param next {NextFunction}
 */

    updateProduct: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.productService.updateProduct(request.params.id, request.body, request.body.merchant.id);
            this.formatProductData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.UPDATE_PRODUCT_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
 * Delete Product
 * @param request {Request}
 * @param response (Response}
 * @param next {NextFunction}
 */

    deleteProduct: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            await this.productService.deleteProduct(request.params.id);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.DELETE_PRODUCT_SUCCESS);
            return response.status(HttpStatus.NO_CONTENT).send(resObj);
        } catch (e) {
            next(e);
        }
    }
}