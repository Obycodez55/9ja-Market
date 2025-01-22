import { Router } from "express";
import { MarketController } from "./market.controller";
import { MarketService } from "./market.service";
import { MarketRepository } from "../repositories/market.repository";
import { WinstonLogger } from "../utils/logger/winston.logger";
import { Validator } from "../utils/middlewares/validator.middleware";
import { IdDto } from "../dtos/id.dto";
import { MarketUpdateDto } from "./dtos/market-update.dto";
import { MarketCreateDto } from "./dtos/market-create.dto";
import { GetByNameDto } from "./dtos/get-by-name.dto";
import { MulterMiddleware } from "../utils/middlewares/file-parser.middleware";

const router = Router();
const marketRepository = new MarketRepository();
const logger = new WinstonLogger("MarketService");
const marketService = new MarketService(marketRepository, logger);
const marketController = new MarketController(marketService);
const validator = new Validator();
const fileParser = new MulterMiddleware(logger);

router.get("/names", marketController.getMarketNames);

router.get("/", marketController.getAllMarkets);

router.get("/malls", marketController.getAllMalls);

router.get("/", validator.single(GetByNameDto, "body"), marketController.getMarketByName);

router.get("/:marketId", validator.single(IdDto, "params"), marketController.getMarketById);


router.post("/",
    fileParser.single("displayImage"),
    validator.single(MarketCreateDto, "body"),
    marketController.createMarket
);

router.put("/:marketId",
    fileParser.single("displayImage"),
    validator.multiple([
        { schema: IdDto, source: "params" },
        { schema: MarketUpdateDto, source: "body" }
    ]), marketController.updateMarket);

router.delete("/:marketId", validator.single(IdDto, "params"), marketController.deleteMarket);

export default router;