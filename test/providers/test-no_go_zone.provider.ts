import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NoGoZone } from "../../src/models/schema/no_go_zone.schema";

@Injectable()
export class TestNoGoZoneProvider {
    defaultNoGoZone: NoGoZone | null;

    constructor(
        @InjectModel(NoGoZone.name)
        private noGoZoneModel: Model<NoGoZone>
    ) {}

    async init(): Promise<void> {
        const tmp = await this.noGoZoneModel.create({
            zonePoints : [
                { latitude: 46.757, longitude: 17.387 },
                { latitude: 46.726, longitude: 17.362 },
                { latitude: 46.742, longitude: 17.412 },
                { latitude: 46.717, longitude: 17.417 },
                { latitude: 46.736, longitude: 17.468 }
            ]
        });

        this.defaultNoGoZone = tmp.toObject();
    }
}