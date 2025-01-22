import { Prisma, Product } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { databaseService } from "../utils/database";


export class ProductRepository {
    private readonly productDelegate: Prisma.ProductDelegate<DefaultArgs>;

    constructor() {
        this.productDelegate = databaseService.product;
    }


    findAll(): Promise<Product[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const products = await this.productDelegate.findMany({
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(products);
            } catch (error) {
                reject(error);
            }
        });
    }

    getById(id: string): Promise<Product | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await this.productDelegate.findUnique({
                    where: { id },
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(product);
            } catch (error) {
                reject(error);
            }
        });
    }

    getMerchantProducts(merchantId: string): Promise<Product[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const products = await this.productDelegate.findMany({
                    where: { merchantId }, include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(products);
            } catch (error) {
                reject(error);
            }
        });
    }

    getMarketProducts(marketId: string): Promise<Product[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const products = await this.productDelegate.findMany({
                    where: {
                        merchant: {
                            marketId
                        }
                    },
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(products);
            } catch (error) {
                reject(error);
            }
        })
    }

    getFeaturedProducts(merchantId: string): Promise<Product[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const products = await this.productDelegate.findMany({
                    where: {
                        merchantId,
                        NOT: { featuredDate: null }
                    },
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    },
                    orderBy: {
                        featuredDate: 'desc'
                    }
                });
                resolve(products);
            } catch (error) {
                reject(error);
            }
        });
    }

    update(id: string, product: Prisma.ProductUpdateInput): Promise<Product> {
        return new Promise(async (resolve, reject) => {
            try {
                const updatedProduct = await this.productDelegate.update({
                    where: { id },
                    data: product,
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(updatedProduct);
            } catch (error) {
                reject(error);
            }
        });
    }

    create(merchantId: string, product: Prisma.ProductCreateWithoutMerchantInput, displayImage: string, productImages: string[]): Promise<Product> {
        return new Promise(async (resolve, reject) => {
            try {
                const newProduct = await this.productDelegate.create({
                    data: {
                        ...product,
                        merchant: {
                            connect: {
                                id: merchantId
                            },
                        },
                        images: {
                            createMany: {
                                data: productImages.map((image) => ({ url: image }))
                            }
                        },
                        displayImage: {
                            create: {
                                url: displayImage,
                            }
                        }
                    },
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(newProduct);
            } catch (error) {
                reject(error);
            }
        });
    }


    delete(id: string): Promise<Product> {
        return new Promise(async (resolve, reject) => {
            try {
                const deletedProduct = await this.productDelegate.delete({ where: { id } });
                resolve(deletedProduct);
            } catch (error) {
                reject(error);
            }
        });
    }

    makeDisplayImage(productId: string, imageId: string): Promise<Product> {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await this.productDelegate.update({
                    where: { id: productId },
                    data: {
                        displayImage: {
                            connect: {
                                id: imageId
                            }
                        }
                    },
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(product);
            } catch (error) {
                reject(error);
            }
        });
    }

    addImages(productId: string, productImages: string[]): Promise<Product> {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await this.productDelegate.update({
                    where: { id: productId },
                    data: {
                        images: {
                            createMany: {
                                data: productImages.map((image) => ({ url: image }))
                            }
                        }
                    },
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(product);
            } catch (error) {
                reject(error);
            }
        });
    }

    removeImage(productId: string, imageId: string): Promise<Product> {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await this.productDelegate.update({
                    where: { id: productId },
                    data: {
                        images: {
                            delete: { id: imageId }
                        }
                    },
                    include: {
                        displayImage: true,
                        images: true,
                        ratings: true
                    }
                });
                resolve(product);
            } catch (error) {
                reject(error);
            }
        });
    }
}