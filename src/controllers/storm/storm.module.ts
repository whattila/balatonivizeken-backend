import { Module } from "@nestjs/common";
import { StormController } from "./storm.controller";
import { StormService } from "../../services/storm/storm.service";
import { MongooseModule } from '@nestjs/mongoose';
import { Storm, StormSchema } from '../../models/schema/storm.schema';

const mongooseModul = [
  MongooseModule.forFeature([{ name: Storm.name, schema: StormSchema }]),
];

@Module({
    imports: [...mongooseModul],
    controllers: [StormController],
    providers: [StormService],
    exports: [StormService, ...mongooseModul],
})
export class StormModule {}