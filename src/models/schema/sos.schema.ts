import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { LatLng } from "./lat_lng.schema";

export type SosDocument = Sos & Document;

@Schema({ collection: 'sos' })
export class Sos {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  boatId: string;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  lastPositions: LatLng[]; // The most recent position is at the end!
}

export const SosSchema = SchemaFactory.createForClass(Sos);