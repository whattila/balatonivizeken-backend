import { IsArray, IsString } from "class-validator";
import { LatLng } from "src/models/schema/lat_lng.schema";

export class NoGoZoneInputDto {
    @IsString()
    _id?: string;

    @IsArray()
    zonePoints: LatLng[];
}