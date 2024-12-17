import { Exclude, Expose, Transform, Type } from "class-transformer";
import { Boat } from "../schema/boat.schema";
import { Types } from "mongoose";
import { LatLng } from "../schema/lat_lng.schema";

@Exclude()
export class BoatHeaderDto implements Boat {
    @Expose()
    @Transform((value) => new Types.ObjectId(value.obj._id), {
        toClassOnly: true,
    })
    @Type(() => String)
    _id?: Types.ObjectId;

    @Expose()
    boatType: string;

    @Expose()
    displayName: string;

    userId: string;
    gpsEnabled: boolean;
    longitude: number;
    latitude: number;
    lastPositions: LatLng[];
    boatColor?: string;
}