import { PaymentFor, Prisma, Transaction } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { databaseService } from "../utils/database";


export class TransactionRepository {
    private readonly transactionDelegate: Prisma.TransactionDelegate<DefaultArgs>;
    constructor() {
        this.transactionDelegate = databaseService.transaction;
    }

    create(data: Omit<Prisma.TransactionCreateInput, "merchant">, merchantId: string): Promise<Transaction> {
        return new Promise(async (resolve, reject) => {
            try {
                const transaction = await this.transactionDelegate.create({ data: {
                    ...data,
                    merchant: { connect: { id: merchantId } }
                } });
                resolve(transaction);
            } catch (e) {
                reject(e);
            }
        });
    }

    getTransaction(transactionId: string): Promise<Transaction | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const transaction = await this.transactionDelegate.findUnique({ where: { id: transactionId } });
                resolve(transaction);
            } catch (e) {
                reject(e);
            }
        });
    }

    getTransactions(): Promise<Transaction[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const transactions = await this.transactionDelegate.findMany();
                resolve(transactions);
            } catch (e) {
                reject(e);
            }
        });
    }

    getAdsTransactions(): Promise<Transaction[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const transactions = await this.transactionDelegate.findMany({ where: { for: PaymentFor.ADVERTISEMENT } });
                resolve(transactions);
            } catch (e) {
                reject(e);
            }
        });
    }

    update(transactionId: string, data: Prisma.TransactionUpdateInput): Promise<Transaction> {
        return new Promise(async (resolve, reject) => {
            try {
                const transaction = await this.transactionDelegate.update({ where: { id: transactionId }, data });
                resolve(transaction);
            } catch (e) {
                reject(e);
            }
        });
    }
}