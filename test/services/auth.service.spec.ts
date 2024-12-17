import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AuthService } from '../../src/services/auth/auth.service';
import {
  clearCollections,
  closeInMongodConnection,
  initializeDatabase,
  rootMongooseTestModule,
} from '../modules/mongoose.module';
import { TestProviderModule } from '../providers/test-provider.module';
import { TestUserProvider } from '../providers/test-user.provider';

describe('AuthService', () => {
  let connection: mongoose.Connection;

  let authService: AuthService;
  let userProvider: TestUserProvider;

  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
      imports: [rootMongooseTestModule(), TestProviderModule],
    }).compile();

    connection = module.get(getConnectionToken('Database'));

    authService = module.get<AuthService>(AuthService);
    userProvider = module.get<TestUserProvider>(TestUserProvider);

    await userProvider.init();
  });

  it('should check that the service exists', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should fail because user doesnt exist', async () => {
      await expect(() =>
        authService.signIn({username: 'asd', password: 'asd', userType: 'normal'}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail because password is wrong', async () => {
      await expect(() =>
        authService.signIn({ username: 'takee', password: 'asd', userType: 'normal'}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail because user type is not the same given at registration', async () => {
      await expect(() => 
        authService.signIn({ username: 'takee', password: 'asd', userType: 'lifeguard'}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should signIn', async () => {
      const result = await authService.signIn({
        username: 'takee',
        password: 'Xyz123#@',
        userType: 'normal'
      });
      expect(result).toBeDefined();
    });
  });

  describe('register', () => {
    it('should fail because user with given email already exists', async () => {
      await expect(() =>
        authService.registration({
          username: 'asd',
          password: 'asd',
          emailAddress: 'test@test.com',
          familyName: 'asd',
          givenName: 'asd',
          phoneNumber: '+36309846500',
          userType: 'normal'
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail because user with given username already exists', async () => {
      await expect(() =>
        authService.registration({
          username: 'takee',
          password: 'asd',
          emailAddress: 'tes1t@test.com',
          familyName: 'asd',
          givenName: 'asd',
          phoneNumber: '+36309846500',
          userType: 'normal'
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail because invitation code does not equal with lifeguard invitation code', async () => {
      await expect(() =>
        authService.registration({
          username: 'test',
          password: 'asd',
          emailAddress: 'tes1t@test.com',
          familyName: 'asd',
          givenName: 'asd',
          phoneNumber: '+36309846500',
          userType: 'lifeguard',
          invitationCode: 'pamela'
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail because invitation code does not equal with admin invitation code', async () => {
      await expect(() =>
        authService.registration({
          username: 'test',
          password: 'asd',
          emailAddress: 'tes1t@test.com',
          familyName: 'asd',
          givenName: 'asd',
          phoneNumber: '+36309846500',
          userType: 'admin',
          invitationCode: 'baywatch'
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail because user type is invalid', async () => {
      await expect(() =>
        authService.registration({
          username: 'test',
          password: 'asd',
          emailAddress: 'tes1t@test.com',
          familyName: 'asd',
          givenName: 'asd',
          phoneNumber: '+36309846500',
          userType: 'administrator',
          invitationCode: 'alfabravo'
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register normal user', async () => {
      const result = await authService.registration({
        username: 'test',
        password: 'asd',
        emailAddress: 'tes1t@test.com',
        familyName: 'asd',
        givenName: 'asd',
        phoneNumber: '+36309846500',
        userType: 'normal'
      });
      expect(result).toBeDefined();
    });

    it('should register lifeguard user', async () => {
      const result = await authService.registration({
        username: 'test',
        password: 'asd',
        emailAddress: 'tes1t@test.com',
        familyName: 'asd',
        givenName: 'asd',
        phoneNumber: '+36309846500',
        userType: 'lifeguard',
        invitationCode: 'baywatch'
      });
      expect(result).toBeDefined();
    });

    it('should register admin user', async () => {
      const result = await authService.registration({
        username: 'test',
        password: 'asd',
        emailAddress: 'tes1t@test.com',
        familyName: 'asd',
        givenName: 'asd',
        phoneNumber: '+36309846500',
        userType: 'admin',
        invitationCode: 'alfabravo'
      });
      expect(result).toBeDefined();
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
