import { Exclude, Transform, Type } from "class-transformer";
import { Sos } from "../schema/sos.schema";
import { Types } from "mongoose";
import { LatLng } from "../schema/lat_lng.schema";

export class SosHeaderDto implements Sos {
    @Transform((value) => new Types.ObjectId(value.obj._id), {
        toClassOnly: true,
    })
    @Type(() => String)
    _id?: Types.ObjectId;

    longitude: number;
    latitude: number;
    date: string;
    userId: string;
    boatId: string;
    phoneNumber: string;

    @Exclude()
    lastPositions: LatLng[];
}