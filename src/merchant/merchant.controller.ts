import { Merchant } from "@prisma/client";
import { MerchantService } from "./merchant.service";
import { DataFormatterHelper } from "../helpers/format.helper";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ResponseDto } from "../dtos/response.dto";
import { ResponseStatus } from "../dtos/interfaces/response.interface";
import { SuccessMessages } from "../constants/success-messages.enum";
import { HttpStatus } from "../constants/http-status.enum";


export class MerchantController {
    constructor(private readonly merchantService: MerchantService) { }

    private formatMerchantData(merchantData: Merchant): void {
        DataFormatterHelper.formatDatabaseObject<Merchant>(merchantData, ["refreshToken", "emailVerificationCode", "password", "passwordResetCode", "refreshToken"], "id");
    }

    /**
* Get Merchant Details
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/
    getMerchantById: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.merchantService.getMerchantById(request.body.merchant.id);
            this.formatMerchantData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_MERCHANT_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }


    /**
    * Get Merchants by Market
    * @param request {Request}
    * @param response (Response}
    * @param next {NextFunction}
    */
    getMerchantsByMarket: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.merchantService.getMerchantsByMarketId(request.params.marketId);
            result.forEach(this.formatMerchantData);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_MERCHANTS_BY_MARKET_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
* Update Merchant Details
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/

    updateMerchant: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.merchantService.updateMerchant(request.params.merchantId, request.body);
            this.formatMerchantData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.UPDATE_MERCHANT_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
* Delete Merchant
* @param request {Request}
* @param response (Response}
* @param next {NextFunction}
*/

    deleteMerchant: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.merchantService.deleteMerchant(request.params.merchantId);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.DELETE_MERCHANT_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }
}