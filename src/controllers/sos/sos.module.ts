import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SosController } from "./sos.controller";
import { SosService } from "src/services/sos/sos.service";
import { Sos, SosSchema } from "src/models/schema/sos.schema";
import { BoatModule } from "../boat/boat.module";

const mongooseModul = [
    MongooseModule.forFeature([{ name: Sos.name, schema: SosSchema }]),
  ];
  
  @Module({
      imports: [BoatModule, ...mongooseModul],
      controllers: [SosController],
      providers: [SosService],
      exports: [SosService, ...mongooseModul],
  })
  export class SosModule {}