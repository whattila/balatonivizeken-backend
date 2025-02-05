import mongoose, { Model } from 'mongoose';
import { SosService } from '../../src/services/sos/sos.service';
import { Sos } from '../../src/models/schema/sos.schema';
import { clearCollections, closeInMongodConnection, initializeDatabase, rootMongooseTestModule } from '../modules/mongoose.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TestProviderModule } from '../providers/test-provider.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { TestUserProvider } from '../providers/test-user.provider';
import { TestBoatProvider } from '../providers/test-boat.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Boat } from '../../src/models/schema/boat.schema';
import { NotFoundException } from '@nestjs/common';

describe('SosService', () => {
    let connection: mongoose.Connection;

    let sosService: SosService;
    let userProvider: TestUserProvider;
    let boatProvider: TestBoatProvider;
    let sosModel: Model<Sos>;
    let boatModel: Model<Boat>;

    beforeAll(async () => {
        await initializeDatabase();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
            imports: [rootMongooseTestModule(), TestProviderModule],
        }).compile();

        connection = module.get(getConnectionToken('Database'));

        sosService = module.get<SosService>(SosService);
        boatProvider = module.get<TestBoatProvider>(TestBoatProvider);
        userProvider = module.get<TestUserProvider>(TestUserProvider);
        sosModel = module.get<Model<Sos>>(Sos.name + 'Model');
        boatModel = module.get<Model<Boat>>(Boat.name + 'Model');

        await userProvider.init();
        await boatProvider.init();
    });

    it('should check that the service exists', () => {
        expect(sosService).toBeDefined();
    });

    describe('sendSos', () => {
        it('sos is saved with correct data', async () => {
            const soses = await sosModel.find();
            expect(soses.length).toEqual(0);

            const newSos = {
                userId: userProvider.defaultUser._id.toString(),
                boatId: boatProvider.defaultBoat._id.toString(),
                longitude: boatProvider.defaultBoat.longitude,
                latitude: boatProvider.defaultBoat.latitude,
                date: new Date(Date.now()).toISOString()
            };
            await sosService.sendSos(newSos);

            const updatedSoses = await sosModel.find();
            expect(updatedSoses.length).toEqual(1);
            expect(updatedSoses[0].userId).toEqual(userProvider.defaultUser._id.toString());
            expect(updatedSoses[0].latitude).toEqual(boatProvider.defaultBoat.latitude);
        });

        it('EventEmitter2.emit is called with SosService.NEW_SOS_EVENT_NAME', async () => {
            const newSos = {
                userId: userProvider.defaultUser._id.toString(),
                boatId: boatProvider.defaultBoat._id.toString(),
                longitude: boatProvider.defaultBoat.longitude,
                latitude: boatProvider.defaultBoat.latitude,
                date: new Date(Date.now()).toISOString()
            };
            const emitMock = jest
                .spyOn(EventEmitter2.prototype, 'emit')
                .mockImplementation((event: string, ...values: any[]) => true);

            await sosService.sendSos(newSos);

            expect(emitMock).toHaveBeenCalledWith(
                SosService.NEW_SOS_EVENT_NAME,
                expect.anything(),
            );
        });

        it('should update location and last positions of boat with boatId', async () => {
            const originalBoat = await boatModel.findById(boatProvider.defaultBoat._id);
            expect(originalBoat.longitude).toEqual(boatProvider.defaultBoat.longitude);
            expect(originalBoat.latitude).toEqual(boatProvider.defaultBoat.latitude);
            const newSos = {
                userId: userProvider.defaultUser._id.toString(),
                boatId: boatProvider.defaultBoat._id.toString(),
                longitude: 0.2,
                latitude: 0.1,
                date: new Date(Date.now()).toISOString()
            };
            
            await sosService.sendSos(newSos);
            
            const updatedBoat = await boatModel.findById(boatProvider.defaultBoat._id);
            expect(updatedBoat.longitude).toEqual(0.2);
            expect(updatedBoat.latitude).toEqual(0.1);
            expect(updatedBoat.lastPositions.at(-1)).toEqual({
                latitude: 0.1,
                longitude: 0.2,
            });
        })
    });

    describe('getAllSos', () => {
        it('only soses no earlier than 2 hours ago are returned', async () => {
            const originalSoses = await sosModel.find();
            expect(originalSoses.length).toEqual(0);

            const earlySos = {
                userId: userProvider.defaultUser._id.toString(),
                boatId: boatProvider.defaultBoat._id.toString(),
                longitude: boatProvider.defaultBoat.longitude,
                latitude: boatProvider.defaultBoat.latitude,
                date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                phoneNumber: userProvider.defaultUser.phoneNumber,
                lastPositions: boatProvider.defaultBoat.lastPositions
            };
            const soses = [
                earlySos, // it may be hard to see: earlySos is also in the array!
                {
                    userId: userProvider.defaultUser._id.toString(),
                    boatId: boatProvider.defaultBoat._id.toString(),
                    longitude: boatProvider.defaultBoat.longitude,
                    latitude: boatProvider.defaultBoat.latitude,
                    date: new Date(Date.now()).toISOString(),
                    phoneNumber: userProvider.defaultUser.phoneNumber,
                    lastPositions: boatProvider.defaultBoat.lastPositions
                },
                {
                    userId: userProvider.defaultUser._id.toString(),
                    boatId: boatProvider.defaultBoat._id.toString(),
                    longitude: boatProvider.defaultBoat.longitude,
                    latitude: boatProvider.defaultBoat.latitude,
                    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    phoneNumber: userProvider.defaultUser.phoneNumber,
                    lastPositions: boatProvider.defaultBoat.lastPositions
                }
            ];
            await sosModel.insertMany(soses);
            const newSoses = await sosModel.find();
            expect(newSoses.length).toEqual(3);

            const sosHeaders = await sosService.getAllSos();

            expect(sosHeaders.length).toEqual(2);
            expect(sosHeaders[0].date).not.toEqual(earlySos.date);
            expect(sosHeaders[1].date).not.toEqual(earlySos.date);
        });

        it('soses are in descending order by date', async () => {
            const originalSoses = await sosModel.find();
            expect(originalSoses.length).toEqual(0);

            const soses = [
                {
                    userId: userProvider.defaultUser._id.toString(),
                    boatId: boatProvider.defaultBoat._id.toString(),
                    longitude: boatProvider.defaultBoat.longitude,
                    latitude: boatProvider.defaultBoat.latitude,
                    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    phoneNumber: userProvider.defaultUser.phoneNumber,
                    lastPositions: boatProvider.defaultBoat.lastPositions
                },
                {
                    userId: userProvider.defaultUser._id.toString(),
                    boatId: boatProvider.defaultBoat._id.toString(),
                    longitude: boatProvider.defaultBoat.longitude,
                    latitude: boatProvider.defaultBoat.latitude,
                    date: new Date(Date.now()).toISOString(),
                    phoneNumber: userProvider.defaultUser.phoneNumber,
                    lastPositions: boatProvider.defaultBoat.lastPositions
                },
                {
                    userId: userProvider.defaultUser._id.toString(),
                    boatId: boatProvider.defaultBoat._id.toString(),
                    longitude: boatProvider.defaultBoat.longitude,
                    latitude: boatProvider.defaultBoat.latitude,
                    date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    phoneNumber: userProvider.defaultUser.phoneNumber,
                    lastPositions: boatProvider.defaultBoat.lastPositions
                }
            ];
            await sosModel.insertMany(soses);
            
            const sosHeaders = await sosService.getAllSos();

            expect(sosHeaders.length).toEqual(3);
            expect(sosHeaders[0].date).toEqual(soses[1].date);
            expect(sosHeaders[1].date).toEqual(soses[2].date);
            expect(sosHeaders[2].date).toEqual(soses[0].date);
        });
    });

    describe('getSosById', () => {
        beforeEach(async () => {
            const sos = {
                userId: userProvider.defaultUser._id.toString(),
                boatId: boatProvider.defaultBoat._id.toString(),
                longitude: boatProvider.defaultBoat.longitude,
                latitude: boatProvider.defaultBoat.latitude,
                date: new Date(Date.now()).toISOString(),
                phoneNumber: userProvider.defaultUser.phoneNumber,
                lastPositions: boatProvider.defaultBoat.lastPositions
            };
            await sosModel.create(sos);
        });

        it('should fail because sos with given id does not exist', async () => {
            await expect(() =>
                sosService.getSosById(userProvider.defaultUser._id.toString()),
            ).rejects.toThrow(NotFoundException);
        });

        it('should return sos by id', async () => {
            const soses = await sosModel.find().lean();
            expect(soses.length).toEqual(1);

            const sos = soses[0];
            const result = await sosService.getSosById(
              sos._id.toString(),
            );

            expect(result).toEqual(sos as Sos);
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
})