import mongoose, { Model } from "mongoose";
import { NoGoZoneService } from "../../src/services/no_go_zones/no_go_zones.service";
import { TestNoGoZoneProvider } from "../providers/test-no_go_zone.provider";
import { NoGoZone } from "../../src/models/schema/no_go_zone.schema";
import { clearCollections, closeInMongodConnection, initializeDatabase, rootMongooseTestModule } from "../modules/mongoose.module";
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { TestProviderModule } from '../providers/test-provider.module';

describe('NoGoZoneService', () => {
    let connection: mongoose.Connection;

    let noGoZoneService: NoGoZoneService;
    let noGoZoneProvider: TestNoGoZoneProvider;
    let noGoZoneModel: Model<NoGoZone>;

    beforeAll(async () => {
        await initializeDatabase();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [],
          imports: [rootMongooseTestModule(), TestProviderModule],
        }).compile();
    
        connection = module.get(getConnectionToken('Database'));
    
        noGoZoneService = module.get<NoGoZoneService>(NoGoZoneService);
        noGoZoneProvider = module.get<TestNoGoZoneProvider>(TestNoGoZoneProvider);
        noGoZoneModel = module.get<Model<NoGoZone>>(NoGoZone.name + 'Model');
    
        await noGoZoneProvider.init();
    });

    it('should check that the service exists', () => {
        expect(noGoZoneService).toBeDefined();
    });

    describe('updateZone', () => {
        it('should create new no-go zone when input doesnt have id', async () => {
          const noGoZones = await noGoZoneModel.find();
          expect(noGoZones.length).toEqual(1);
    
          await noGoZoneService.updateZone({
            zonePoints : [
                { latitude: 46.785, longitude: 17.447 },
                { latitude: 46.782, longitude: 17.498 },
                { latitude: 46.791, longitude: 17.460 },
            ]
          });
          const updatedNoGoZones = await noGoZoneModel.find();
          expect(updatedNoGoZones.length).toEqual(2);
        });
    
        it('should update no-go zone when input does have id', async () => {
          const noGoZones = await noGoZoneModel.find();
          expect(noGoZones.length).toEqual(1);
    
          await noGoZoneService.updateZone({
            _id: noGoZoneProvider.defaultNoGoZone._id.toString(),
            zonePoints : [
                { latitude: 46.785, longitude: 17.447 },
                { latitude: 46.782, longitude: 17.498 },
                { latitude: 46.791, longitude: 17.460 },
            ]
          });
          const updatedNoGoZones = await noGoZoneModel.find();
          expect(updatedNoGoZones.length).toEqual(1);
    
          const updatedNoGoZone = await noGoZoneModel
            .findById(noGoZoneProvider.defaultNoGoZone._id.toString())
            .lean();
    
          expect(updatedNoGoZone.zonePoints.length).toEqual(3);
          expect(updatedNoGoZone.zonePoints.at(0)).toEqual({ latitude: 46.785, longitude: 17.447 });
        });
    });

    afterEach(async () => {
        // CleanUp - Each test should start fresh
        await clearCollections(connection);
        jest.clearAllMocks();
      });
    
      afterAll(async () => {
        await closeInMongodConnection();
      });
});