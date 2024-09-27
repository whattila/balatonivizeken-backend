import {
    IsString,
    IsNumber
} from 'class-validator';

export class StormInputDto {
  @IsString()
  area: string;

  @IsNumber()
  longitude: number;
  
  @IsNumber()
  latitude: number;
  
  @IsNumber()
  hour: number;

  @IsNumber()
  minute: number;

  @IsString()
  degree: string;

  @IsNumber()
  windSpeed: number;
}