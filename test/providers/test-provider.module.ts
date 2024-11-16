import { Module } from '@nestjs/common';
import { AuthModule } from '../../src/controllers/auth/auth.module';
import { BoatModule } from '../../src/controllers/boat/boat.module';
import { NoGoZoneModule } from '../../src/controllers/no_go_zone/no_go_zone.module';
import { TestBoatProvider } from './test-boat.provider';
import { TestUserProvider } from './test-user.provider';
import { UsersModule } from '../../src/controllers/user/users.module';
import { TestNoGoZoneProvider } from './test-no_go_zone.provider';
import { SosModule } from '../../src/controllers/sos/sos.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StormModule } from '../../src/controllers/storm/storm.module';

@Module({
  imports: [AuthModule, BoatModule, UsersModule, NoGoZoneModule, SosModule, StormModule, EventEmitterModule.forRoot()],
  providers: [TestUserProvider, TestBoatProvider, TestNoGoZoneProvider],
  exports: [TestUserProvider, TestBoatProvider, TestNoGoZoneProvider],
})
export class TestProviderModule {}