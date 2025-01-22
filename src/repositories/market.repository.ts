import { Market, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { databaseService } from "../utils/database";


export class MarketRepository {
    private readonly marketDelegate: Prisma.MarketDelegate<DefaultArgs>;
    constructor() {
        this.marketDelegate = databaseService.market;
    }

    findAllMarkets(): Promise<Market[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const markets = await this.marketDelegate.findMany({
                    where: { isMall: false }
                });
                resolve(markets);
            } catch (error) {
                reject(error);
            }
        });
    }

    findAllMalls(): Promise<Market[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const malls = await this.marketDelegate.findMany({
                    where: { isMall: true }
                });
                resolve(malls);
            } catch (error) {
                reject(error);
            }
        });
    }

    findNames(): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const names = await this.marketDelegate.findMany({ select: { name: true } });
                resolve(names.map(n => n.name));
            } catch (error) {
                reject(error);
            }
        });
    }

    findByName(name: string): Promise<Market | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const market = await this.marketDelegate.findUnique({ where: { name } });
                resolve(market);
            } catch (error) {
                reject(error);
            }
        });
    }

    findById(id: string): Promise<Market | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const market = await this.marketDelegate.findUnique({ where: { id } });
                resolve(market);
            } catch (error) {
                reject(error);
            }
        });
    }

    createMarket(market: Prisma.MarketCreateInput): Promise<Market> {
        return new Promise(async (resolve, reject) => {
            try {
                const createdMarket = await this.marketDelegate.create({ data: market });
                resolve(createdMarket);
            } catch (error) {
                reject(error);
            }
        });
    }

    updateMarket(id: string, market: Prisma.MarketUpdateInput): Promise<Market> {
        return new Promise(async (resolve, reject) => {
            try {
                const updatedMarket = await this.marketDelegate.update({ where: { id }, data: market });
                resolve(updatedMarket);
            } catch (error) {
                reject(error);
            }
        });
    }

    deleteMarket(id: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.marketDelegate.delete({ where: { id } });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

}