import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from '../../services/auth/auth.service';

import { JwtModule } from '@nestjs/jwt';
import config from '../../config/keys';
import { UsersModule } from '../user/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: config.jwtSecret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
