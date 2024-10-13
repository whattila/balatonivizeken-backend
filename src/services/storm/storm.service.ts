import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StormInputDto } from 'src/models/dto/input/storm.input.dto';
import { Storm } from 'src/models/schema/storm.schema';

@Injectable()
export class StormService {
  constructor(
    @InjectModel(Storm.name)
    private readonly stormModel: Model<Storm>,
    private eventEmitter: EventEmitter2
  ) {}

  static readonly NEW_STORM_EVENT_NAME = 'new-storm-alert';

  async sendStormAlert(storm: StormInputDto): Promise<void> {
    const newStorm = await this._saveStormAlert(storm);
    this.eventEmitter.emit(StormService.NEW_STORM_EVENT_NAME, newStorm);
  }

  async _saveStormAlert(storm: StormInputDto): Promise<Storm> {
    const newStorm = new this.stormModel({
      ...storm,
      _id: undefined
    })
    return newStorm.save();
  }

  async getStorms(): Promise<Storm[]> {
    const storms = await this.stormModel.find({}).lean();
    return storms;
  }
}