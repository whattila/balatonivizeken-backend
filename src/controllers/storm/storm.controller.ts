import { Controller, Post, MessageEvent, Sse, Body } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';
import { StormService } from '../../services/storm/storm.service';
import { StormInputDto } from 'src/models/dto/input/storm.input.dto';

@Controller('storm')
export class StormController {
  constructor(
      private stormService: StormService,
      private eventEmitter: EventEmitter2,
    ) {}

    @Sse('alerts')
    stormAlerts(): Observable<MessageEvent> {
      return fromEvent(this.eventEmitter, StormService.NEW_STORM_EVENT_NAME).pipe(
        map((storm) => ({ id: 'new-stormalert', data: storm }) as MessageEvent), // Can I convert storm to StormInputDto? Should I?
      );
    }

    @Post('new')
    async createStorm(@Body() storm: StormInputDto) {
      // ...
      this.stormService.sendStormAlert(storm); // should I do anything before and after this?
      // ...
    }
}