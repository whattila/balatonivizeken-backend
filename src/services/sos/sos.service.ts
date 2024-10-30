import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SosInputDto } from "src/models/dto/input/sos.input.dto";
import { Sos } from "src/models/schema/sos.schema";
import { BoatService } from "../boat/boat.service";
import { UsersService } from "../users/users.service";
import { plainToInstance } from "class-transformer";
import { SosHeaderDto } from "src/models/dto/sos.header.dto";

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

  async sendSos(sos: SosInputDto): Promise<void> {
    const newSos = await this._saveSos(sos);
    this.eventEmitter.emit(SosService.NEW_SOS_EVENT_NAME, newSos);
  }

  async _saveSos(sos: SosInputDto): Promise<Sos> {
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
    return newSos.save();
  }

  async getAllSos(): Promise<SosHeaderDto[]> {
    const sos = await this.sosModel.find({}).sort({ date: -1 }).lean();
    return plainToInstance(SosHeaderDto, sos);
  }

  async getSosById(sosId: string): Promise<Sos> {
    const sos = await this.sosModel.findOne({_id: sosId}).lean();
    if (!sos) {
      throw new NotFoundException('A segélykérés nem található');
    }
    return sos;
  }
}