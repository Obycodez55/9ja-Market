import { Prisma } from "@prisma/client";
import { AddressCreateDto } from "../../dtos/address-create.dto";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

interface CustomerUpdateInput extends Omit<Prisma.CustomerUpdateInput, "phoneNumbers" | "addresses"> {
    phoneNumbers?: string[];
    addresses?: AddressCreateDto[];
}

export class CustomerUpdateDto implements CustomerUpdateInput{   
    @IsEmail()
    @IsNotEmpty()
    email?: string

    @IsString()
    @IsNotEmpty()
    lastName?: string | Prisma.StringFieldUpdateOperationsInput | undefined;

    @IsString()
    @IsNotEmpty()
    firstName?: string | Prisma.StringFieldUpdateOperationsInput | undefined;

    @IsNotEmpty()
    @IsDateString()
    dateOfBirth?: string | Date;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(2, { message: 'phoneNumbers must contain 2 elements' })
    @ArrayMaxSize(2, { message: 'phoneNumbers must contain 2 elements' })
    phoneNumbers?: string[] | undefined;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddressCreateDto)
    addresses?: AddressCreateDto[];
}