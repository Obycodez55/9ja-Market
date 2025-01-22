import { Prisma } from "@prisma/client";
import { AddressCreateDto } from "../../dtos/address-create.dto";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

interface MerchantUpdateInput extends Omit<Prisma.MerchantUpdateInput, "phoneNumbers" | "addresses"> {
    phoneNumbers?: string[];
    addresses?: AddressCreateDto[];
}

export class MerchantUpdateDto implements MerchantUpdateInput{
    @IsEmail()
    @IsNotEmpty()
    email?: string

    @IsString()
    @IsNotEmpty()
    brandName?: string | Prisma.StringFieldUpdateOperationsInput | undefined;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(2, { message: 'phoneNumbers must contain 2 elements' })
    @ArrayMaxSize(2, { message: 'phoneNumbers must contain 2 elements' })
    phoneNumbers?: string[] | undefined;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddressCreateDto)
    addresses?: AddressCreateDto[];

    @IsString()
    @IsNotEmpty()
    marketName?: string;
}