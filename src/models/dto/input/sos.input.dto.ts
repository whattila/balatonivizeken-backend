import {
    IsString,
    IsNumber,
    IsPhoneNumber,
    IsDateString
} from 'class-validator';

export class SosInputDto {
    @IsString()
    userId: string;

    @IsString()
    boatId: string;

    @IsNumber()
    longitude: number;

    @IsNumber()
    latitude: number;

    @IsDateString()
    date: string;

    @IsPhoneNumber()
    phoneNumber: string;
}

