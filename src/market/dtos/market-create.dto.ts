import { Prisma } from "@prisma/client";
import { IsBooleanString, IsDefined, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class MarketCreateDto implements Prisma.MarketCreateInput{
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    declare name: string;

    @IsDefined()
    @IsString()
    @IsNotEmpty()
    declare address: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    declare description: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    declare city: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    declare state: string; 

    @IsOptional()
    @IsBooleanString()
    declare isMall: boolean;
}