import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocationInput } from '../../models/dto/input/location_update.input.dto';
import { StormInputDto } from '../../models/dto/input/storm.input.dto';
import { Storm } from '../../models/schema/storm.schema';

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

  async getStormsInRange(centerPoint: LocationInput): Promise<Storm[]> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const storms = await this.stormModel.find({ date: { $gte: twoHoursAgo }}).sort({ date: -1 }).lean();
    const stormsInRange: Storm[] = []; //return only the storms in 10km range from centerPoint
    storms.forEach((storm) => {
      const distanceBetweenPoints = this._calculateHaversineDistance(
        storm.latitude,
        storm.longitude,
        centerPoint.latitude,
        centerPoint.longitude,
      );

      if (distanceBetweenPoints <= 10) {
        return stormsInRange.push(storm);
      }
    });

    return stormsInRange;
  }

  _calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const earthRadiusKm = 6371; // Radius of the Earth in kilometers

    const dLat = this._degreesToRadians(lat2 - lat1);
    const dLon = this._degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._degreesToRadians(lat1)) *
        Math.cos(this._degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusKm * c; // Distance in kilometers

    return distance;
  }

  _degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}