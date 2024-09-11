import {
    IsString,
    IsNumber
  } from 'class-validator';

export class StormInputDto {
    @IsString()
  _id?: string;

  @IsString()
  area: string;

  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;

  // expectedTime: ez milyen típus legyen? Ne felejtsük le az @isX() annotációt!

  @IsString()
  degree: string;

  @IsNumber()
  windSpeed: number;
}