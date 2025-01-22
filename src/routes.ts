import { Router } from "express";
import { HomeController } from "./home/home.controller";

import AuthRouter from './auth/auth.routes';
import CustomerRouter from './customer/customer.routes';
import MerchantRouter from './merchant/merchant.routes';
import MarketRouter from './market/market.routes';
import ProductRouter from './product/product.routes';
import AdRouter from './ad/ad.routes';

const router = Router();

// Home Route
const home = new HomeController();
router.get("/", home.index);

// Authentication Module
router.use('/auth', AuthRouter);

// Customer Module
router.use('/customer', CustomerRouter);

// Merchant Module
router.use('/merchant', MerchantRouter);

// Market Moduel
router.use('/market', MarketRouter);

// Product Module
router.use('/product', ProductRouter);

// Ad Module
router.use('/ad', AdRouter); 


export default router;