import {
    IsString,
    IsNumber,
    IsDateString
} from 'class-validator';

export class StormInputDto {
  @IsString()
  area: string;

  @IsNumber()
  longitude: number;
  
  @IsNumber()
  latitude: number;
  
  @IsDateString()
  date: string;

  @IsString()
  degree: string;

  @IsNumber()
  windSpeed: number;
}