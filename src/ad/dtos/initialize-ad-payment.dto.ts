import { IsDefined, IsInt, IsUUID, Max, Min } from "class-validator";

export class InitializeAdPaymentDto{
    @IsDefined()
    @IsInt()
    @Min(1)
    @Max(3)
    declare level : number;

    @IsDefined()
    @IsUUID()
    declare productId : string;
}