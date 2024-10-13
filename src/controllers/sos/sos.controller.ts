import { Body, Controller, MessageEvent, Post, Sse, UseGuards, Get, Param } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { fromEvent, map, Observable } from "rxjs";
import { AuthGuard } from "src/auth_guard/auth.guard";
import { SosInputDto } from "src/models/dto/input/sos.input.dto";
import { Sos } from "src/models/schema/sos.schema";
import { SosService } from "src/services/sos/sos.service";

@UseGuards(AuthGuard)
@Controller('sos')
export class SosController {
    constructor(
        private sosService: SosService,
        private eventEmitter: EventEmitter2
    ) {}

    @Sse('alerts')
    sosAlerts(): Observable<MessageEvent> {
        return fromEvent(this.eventEmitter, SosService.NEW_SOS_EVENT_NAME).pipe(
            map((sos) => ({ id: 'new-sosalert', data: sos }) as MessageEvent), // Can I convert sos to Sos? Should I?
        );
    }

    @Post('send')
    async sendSos(@Body() sos: SosInputDto) {
        await this.sosService.sendSos(sos);
    }

    @Get()
    async getAllSos(): Promise<Sos[]> {
        return this.sosService.getAllSos();
    }

    @Get('by-id/:id')
    async getSosById(@Param('id') id: string): Promise<Sos> {
        return this.sosService.getSosById(id);
    }
}