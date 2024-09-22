import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class ExchangeTokenDto{
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    declare token: string;
}