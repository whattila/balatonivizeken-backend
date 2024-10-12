import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SosInputDto } from "src/models/dto/input/sos.input.dto";
import { Sos } from "src/models/schema/sos.schema";
import { BoatService } from "../boat/boat.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class SosService {
  constructor(
    @InjectModel(Sos.name)
    private readonly sosModel: Model<Sos>,
    private boatService: BoatService,
    private usersService: UsersService,
    private eventEmitter: EventEmitter2
  ) {}

  static readonly NEW_SOS_EVENT_NAME = 'new-sos-alert';

  async sendSos(sos: SosInputDto): Promise<Sos> {
    // we update the boat's location and last positions with the sos data
    await this.boatService.updateLocation(sos.boatId, {latitude: sos.latitude, longitude: sos.longitude});
    const boat = await this.boatService.getBoatById(sos.boatId);
    const user = await this.usersService.findById(boat.userId);
    const newSos = new this.sosModel({
      ...sos,
      _id: undefined,
      phoneNumber: user.phoneNumber,
      lastPositions: boat.lastPositions
    })
    this.eventEmitter.emit(SosService.NEW_SOS_EVENT_NAME, newSos);

    // we save the sos data to the database for accountabilty
    return newSos.save();
  }
}