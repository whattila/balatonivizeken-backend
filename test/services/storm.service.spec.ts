import mongoose, { Model } from 'mongoose';
import { StormService } from '../../src/services/storm/storm.service';
import { Storm } from '../../src/models/schema/storm.schema';
import { clearCollections, closeInMongodConnection, initializeDatabase, rootMongooseTestModule } from '../modules/mongoose.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TestProviderModule } from '../providers/test-provider.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('StormService', () => {
    let connection: mongoose.Connection;

    let stormService: StormService;
    let stormModel: Model<Storm>;

    beforeAll(async () => {
        await initializeDatabase();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
            imports: [rootMongooseTestModule(), TestProviderModule],
        }).compile();

        connection = module.get(getConnectionToken('Database'));

        stormService = module.get<StormService>(StormService);
        stormModel = module.get<Model<Storm>>(Storm.name + 'Model');
    });

    it('should check that the service exists', () => {
        expect(stormService).toBeDefined();
    });

    describe('sendStormAlert', () => {
        it('storm is saved with correct data', async () => {
            const storms = await stormModel.find();
            expect(storms.length).toEqual(0);

            const newStorm = {
                area: 'Szigliget',
                longitude: 17.438,
                latitude: 46.793,
                date: new Date(Date.now()).toISOString(),
                degree: 'second',
                windSpeed: 94
            };
            await stormService.sendStormAlert(newStorm);

            const updatedStorms = await stormModel.find();
            expect(updatedStorms.length).toEqual(1);
            expect(updatedStorms[0].area).toEqual(newStorm.area);
            expect(updatedStorms[0].degree).toEqual(newStorm.degree);
        });

        it('EventEmitter2.emit is called with StormService.NEW_STORM_EVENT_NAME', async () => {
            const newStorm = {
                area: 'Szigliget',
                longitude: 17.438,
                latitude: 46.793,
                date: new Date(Date.now()).toISOString(),
                degree: 'second',
                windSpeed: 94
            };
            const emitMock = jest
                .spyOn(EventEmitter2.prototype, 'emit')
                .mockImplementation((event: string, ...values: any[]) => true);

            await stormService.sendStormAlert(newStorm);

            expect(emitMock).toHaveBeenCalledWith(
                StormService.NEW_STORM_EVENT_NAME,
                expect.anything(),
            );
        });
    });

    describe('getStormsInRange', () => {
        it('only storms no earlier than 2 hours ago are returned', async () => {
            const originalStorms = await stormModel.find();
            expect(originalStorms.length).toEqual(0);

            const earlyStorm = {
                area: 'Szigliget',
                longitude: 17.438,
                latitude: 46.793,
                date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                degree: 'second',
                windSpeed: 94
            };
            const storms = [
                earlyStorm, // it may be hard to see: earlyStorm is also in the array!
                {
                    area: 'Szigliget',
                    longitude: 17.438,
                    latitude: 46.793,
                    date: new Date(Date.now()).toISOString(),
                    degree: 'basic',
                    windSpeed: 15
                },
                {
                    area: 'Szigliget',
                    longitude: 17.438,
                    latitude: 46.793,
                    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    degree: 'first',
                    windSpeed: 55
                }
            ];
            await stormModel.insertMany(storms);
            const newStorms = await stormModel.find();
            expect(newStorms.length).toEqual(3);

            const stormHeaders = await stormService.getStormsInRange({
                longitude: 17.438,
                latitude: 46.793,
            }); // location equals the location of the storms so no storms are excluded because of distance

            expect(stormHeaders.length).toEqual(2);
            expect(stormHeaders[0].date).not.toEqual(earlyStorm.date);
            expect(stormHeaders[1].date).not.toEqual(earlyStorm.date);
        });

        it('storms are in descending order by date', async () => {
            const originalStorms = await stormModel.find();
            expect(originalStorms.length).toEqual(0);

            const storms = [
                {
                    area: 'Szigliget',
                    longitude: 17.438,
                    latitude: 46.793,
                    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    degree: 'second',
                    windSpeed: 94
                },
                {
                    area: 'Szigliget',
                    longitude: 17.438,
                    latitude: 46.793,
                    date: new Date(Date.now()).toISOString(),
                    degree: 'basic',
                    windSpeed: 15
                },
                {
                    area: 'Szigliget',
                    longitude: 17.438,
                    latitude: 46.793,
                    date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    degree: 'first',
                    windSpeed: 55
                }
            ];
            await stormModel.insertMany(storms);

            const stormHeaders = await stormService.getStormsInRange({
                longitude: 17.438,
                latitude: 46.793,
            }); // location equals the location of the storms so no storms are excluded because of distance

            expect(stormHeaders.length).toEqual(3);
            expect(stormHeaders[0].date).toEqual(storms[1].date);
            expect(stormHeaders[1].date).toEqual(storms[2].date);
            expect(stormHeaders[2].date).toEqual(storms[0].date);
        });

        it('should only get storms in range', async () => {
            const storms = [
                {
                    area: 'Balatonszemes',
                    longitude: 17.739,
                    latitude: 46.832,
                    date: new Date(Date.now()).toISOString(),
                    degree: 'second',
                    windSpeed: 94
                },
                {
                    area: 'Keszthely',
                    longitude: 17.247,
                    latitude: 46.765,
                    date: new Date(Date.now()).toISOString(),
                    degree: 'basic',
                    windSpeed: 15
                },
                {
                    area: 'Balatonfüred',
                    longitude: 17.885,
                    latitude: 46.959,
                    date: new Date(Date.now()).toISOString(),
                    degree: 'first',
                    windSpeed: 55
                }
            ];
            await stormModel.insertMany(storms);

            const stormHeaders = await stormService.getStormsInRange({
                longitude: 17.247,
                latitude: 46.765,
            });

            expect(stormHeaders.length).toEqual(1);
            expect(stormHeaders[0].area).toEqual('Keszthely');
        })
    });

    afterEach(async () => {
        // CleanUp - Each test should start fresh
        await clearCollections(connection);
        jest.clearAllMocks();
    });
    
    afterAll(async () => {
        await closeInMongodConnection();
    });
})