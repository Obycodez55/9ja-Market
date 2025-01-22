import { MarketService } from "./market.service";
import { DataFormatterHelper } from "../helpers/format.helper";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ResponseDto } from "../dtos/response.dto";
import { ResponseStatus } from "../dtos/interfaces/response.interface";
import { SuccessMessages } from "../constants/success-messages.enum";
import { HttpStatus } from "../constants/http-status.enum";
import { Market } from "@prisma/client";

export class MarketController {
    constructor(private readonly marketService: MarketService) { }

    private formatMarketData(marketData: Market): void {
        DataFormatterHelper.formatDatabaseObject<Market>(marketData, [], "id");
    }

    /**
    * Get Market Details
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */
    getMarketById: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.marketService.getMarketById(request.params.marketId);
            this.formatMarketData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_MARKET_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
    * Get Market Details by name
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */
    getMarketByName: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.marketService.getMarketByName(request.body.name);
            this.formatMarketData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_MARKET_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
       * Get Markets Names
       * @param request {Request}
       * @param response {Response}
       * @param next {NextFunction}
       */

    getMarketNames: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.marketService.findMarketNames();
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_MARKET_NAMES_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }


    /**
    * Get All Markets
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */
    getAllMarkets: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.marketService.findAllMalls();
            result.forEach(this.formatMarketData);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_ALL_MARKETS_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
    * Get All Malls
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */
    getAllMalls: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.marketService.findAllMalls();
            result.forEach(this.formatMarketData);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.GET_ALL_MALLS_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }


    /**
    * Create Market
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */
    createMarket: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.marketService.createMarket(request.body, request.file);
            this.formatMarketData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.CREATE_MARKET_SUCCESS, result);
            return response.status(HttpStatus.CREATED).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
    * Update Market
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */
    updateMarket: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.marketService.updateMarket(request.params.marketId, request.body);
            this.formatMarketData(result);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.UPDATE_MARKET_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }

    /**
    * Delete Market
    * @param request {Request}
    * @param response {Response}
    * @param next {NextFunction}
    */
    deleteMarket: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const result = await this.marketService.deleteMarket(request.params.id);
            const resObj = new ResponseDto(ResponseStatus.SUCCESS, SuccessMessages.DELETE_MARKET_SUCCESS, result);
            return response.status(HttpStatus.OK).send(resObj);
        } catch (e) {
            next(e);
        }
    }
}