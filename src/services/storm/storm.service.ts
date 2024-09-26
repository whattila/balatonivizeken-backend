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

  sendStormAlert(storm: StormInputDto): Promise<Storm> {
    this.eventEmitter.emit(StormService.NEW_STORM_EVENT_NAME, storm);

    // we save the storm data to the database for accountabilty
    const newStorm = new this.stormModel({
      ...storm,
      _id: undefined
    })
    return newStorm.save();
  }
}