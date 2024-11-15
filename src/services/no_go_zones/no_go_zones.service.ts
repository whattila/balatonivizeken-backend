import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NoGoZone } from '../../models/schema/no_go_zone.schema';
import { NoGoZoneInputDto } from '../../models/dto/input/no_go_zone.input.dto';

@Injectable()
export class NoGoZoneService {
  constructor(
    @InjectModel(NoGoZone.name)
    private readonly noGoZoneModel: Model<NoGoZone>,
  ) {}

  async updateZone(inputZone: NoGoZoneInputDto): Promise<NoGoZone> {
    if (inputZone._id == undefined) {
      const newZone = new this.noGoZoneModel({
        ...inputZone,
        _id: undefined,
      });

      return newZone.save();
    } else {
      return await this.noGoZoneModel.findByIdAndUpdate(inputZone._id, inputZone, {
        new: true,
      });
    }
  }

  async getZones(): Promise<NoGoZone[]> {
    const noGoZones = await this.noGoZoneModel.find({}).lean();
    return noGoZones;
  }

  async deleteZone(id: string): Promise<void> {
    await this.noGoZoneModel.deleteOne({ _id: id });
  }
}
