import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth_guard/auth.guard';
import { NoGoZone } from '../../models/schema/no_go_zone.schema';
import { NoGoZoneService } from '../../services/no_go_zones/no_go_zones.service';
import { NoGoZoneInputDto } from '../../models/dto/input/no_go_zone.input.dto';

@UseGuards(AuthGuard)
@Controller('zone')
export class NoGoZoneController {
  constructor(private noGoZoneService: NoGoZoneService) {}

  @Post('update')
  async updateZone(@Body() payload: NoGoZoneInputDto): Promise<NoGoZone> {
    return this.noGoZoneService.updateZone(payload);
  }

  @Get()
  async getAllZones(): Promise<NoGoZone[]> {
    return this.noGoZoneService.getZones();
  }

  @Delete('delete/:id')
  async deleteZone(@Param('id') id: string): Promise<void> {
    await this.noGoZoneService.deleteZone(id);
  }
}
