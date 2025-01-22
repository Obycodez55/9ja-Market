import axios from 'axios';
import { configService } from '../utils/config/config.service';


// QuickTeller Payment Repository

export class QuickTellerPaymentRepository {
    async verifyPayment(reference: string, amount: number){
        const BASE_URL = 'https://qa.interswitchng.com/collections/api/v1/gettransaction.json';
        const MERCHANT_CODE = configService.get<string>('QUICKTELLER_MERCHANT_CODE')!;

        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    merchantcode: MERCHANT_CODE,
                    transactionreference: reference,
                    amount: amount
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error verifying payment:', error);
            return false;
        }
    }
}