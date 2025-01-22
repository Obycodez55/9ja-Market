import { Ad, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { databaseService } from "../utils/database";


export class AdRepository {
    private readonly adDelegate: Prisma.AdDelegate<DefaultArgs>;
    constructor() {
        this.adDelegate = databaseService.ad;
    }

    create(data: Prisma.AdCreateInput): Promise<Ad> {
        return new Promise(async (resolve, reject) => {
            try {
                const ad = await this.adDelegate.create({ 
                    data
                 });
                resolve(ad);
            } catch (e) {
                reject(e);
            }
        });
    }


    getAd(adId: string): Promise<Ad | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const ad = await this.adDelegate.findUnique({ where: { id: adId } });
                resolve(ad);
            } catch (e) {
                reject(e);
            }
        });
    }

    getFreeAd(productId: string): Promise<Ad | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const ad = await this.adDelegate.findFirst({ where: { level: 0, product: { id: productId } } });
                resolve(ad);
            } catch (e) {
                reject(e);
            }
        });
    }

    getAds(): Promise<Ad[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const ads = await this.adDelegate.findMany();
                resolve(ads);
            } catch (e) {
                reject(e);
            }
        });
    }

    getAdsByProductId(productId: string): Promise<Ad[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const ads = await this.adDelegate.findMany({ where: { productId } });
                resolve(ads);
            } catch (e) {
                reject(e);
            }
        });
    }

    getAdsByMerchantId(merchantId: string): Promise<Ad[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const ads = await this.adDelegate.findMany({ where: { product: { merchantId } } });
                resolve(ads);
            } catch (e) {
                reject(e);
            }
        });
    }

    update(adId: string, data: Prisma.AdUpdateInput): Promise<Ad> {
        return new Promise(async (resolve, reject) => {
            try {
                const ad = await this.adDelegate.update({ where: { id: adId }, data });
                resolve(ad);
            } catch (e) {
                reject(e);
            }
        });
    }
}