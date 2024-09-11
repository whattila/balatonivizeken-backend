import { Module } from "@nestjs/common";
import { StormController } from "./storm.controller";
import { StormService } from "src/services/storm/storm.service";

// MongooseModule, lásd a boat.module.ts-ben!

@Module({
    imports: [],
    controllers: [StormController],
    providers: [StormService],
    exports: [StormService],
})
export class StormModule {}