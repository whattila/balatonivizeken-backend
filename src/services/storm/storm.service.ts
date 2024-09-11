import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StormInputDto } from 'src/models/dto/input/storm.input.dto';

@Injectable()
export class StormService {
  constructor(private eventEmitter: EventEmitter2) {}

  static readonly NEW_STORM_EVENT_NAME = 'new-storm';

  sendStormAlert(storm: StormInputDto) {
    this.eventEmitter.emit(StormService.NEW_STORM_EVENT_NAME, storm);
  }
}