import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AdService } from './ad.service';
import { ResponseDto } from '../dtos/response.dto';
import { ResponseStatus } from '../dtos/interfaces/response.interface';
import { HttpStatus } from '../constants/http-status.enum';
import { SuccessMessages } from '../constants/success-messages.enum';
import { AdPrices } from '../constants/ad-constants.enum';


export class AdController {
    constructor(private readonly adService: AdService) { }



    /**
    * Activate Free Ad
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */
    
    activateFreeAd: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.adService.activateFreeAd(request.params.productId, request.body.merchant);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.FREE_AD_ACTIVATION_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }


    /**
    * Initialize Ad Payment
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */

    initializeAdPayment: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.adService.initializeAdPayment(request.params.level as unknown as keyof typeof AdPrices, request.params.productId, request.body.merchant);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.AD_PAYMENT_INITIALIZATION_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

     /**
    * Verify Ad Payment
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */

    verifyAdPayment: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.adService.verifyAdPayment(request.params.reference);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.AD_PAYMENT_VERIFICATION_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }
}