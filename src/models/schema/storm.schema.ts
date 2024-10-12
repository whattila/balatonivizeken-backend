import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type StormDocument = Storm & Document;

@Schema({collection: 'storm'})
export class Storm {
    _id?: Types.ObjectId;

    @Prop({ required: true })
    area: string;
  
    @Prop({ required: true })
    longitude: number;
  
    @Prop({ required: true })
    latitude: number;
  
    @Prop({ required: true })
    date: string;
  
    @Prop({ required: true })
    degree: string;
  
    @Prop({ required: true })
    windSpeed: number;
}

export const StormSchema = SchemaFactory.createForClass(Storm);