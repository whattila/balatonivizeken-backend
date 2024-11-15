import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model, Types } from 'mongoose';
import { User } from '../../src/models/schema/user.schema';
import { UsersService } from '../../src/services/users/users.service';
import {
  clearCollections,
  closeInMongodConnection,
  initializeDatabase,
  rootMongooseTestModule,
} from '../modules/mongoose.module';
import { TestProviderModule } from '../providers/test-provider.module';
import { TestUserProvider } from '../providers/test-user.provider';

describe('UsersService', () => {
  let connection: mongoose.Connection;

  let usersService: UsersService;
  let userProvider: TestUserProvider;
  let userModel: Model<User>;

  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
      imports: [rootMongooseTestModule(), TestProviderModule],
    }).compile();

    connection = module.get(getConnectionToken('Database'));

    usersService = module.get<UsersService>(UsersService);
    userProvider = module.get<TestUserProvider>(TestUserProvider);
    userModel = module.get<Model<User>>(User.name + 'Model');

    await userProvider.init();
  });

  it('should check that the service exists', () => {
    expect(usersService).toBeDefined();
  });

  describe('getUserHeaders', () => {
    it('should only get non-admin users', async () => {
        const adminUser = {
            _id: new Types.ObjectId('67140ae152cf83d9d01df5dc'),
            username: 't96bed',
            emailAddress: 'jancso.adam90@gmail.com',
            phoneNumber: '+36309846500',
            userType: 'admin',
            familyName: 'Jancso',
            givenName: 'Adam',
            passwordHash: '$2a$05$CeR/AL6pdp2MgOpClqM66O1HGtOFuz/pkwe9kI6w5GXxkoa1IYIXS', // Xyz123#@
            isEmailVerified: true,
        }
        await userModel.insertMany([
            {
                _id: new Types.ObjectId('6707e48c6999c9ddb2f7210d'),
                username: 'nwvrra',
                emailAddress: 'ahhidati070@gmail.com',
                phoneNumber: '+36309846500',
                userType: 'lifeguard',
                familyName: 'Hidan',
                givenName: 'Attila',
                passwordHash: '$2a$05$CeR/AL6pdp2MgOpClqM66O1HGtOFuz/pkwe9kI6w5GXxkoa1IYIXS', // Xyz123#@
                isEmailVerified: true,
            },
            adminUser
        ]);
        const users = await userModel.find();
        expect(users.length).toEqual(3);

        const userHeaders = await usersService.getUserHeaders();
        expect(userHeaders.length).toEqual(2);
        expect(userHeaders).not.toContainEqual(adminUser);
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
