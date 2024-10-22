import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../models/schema/user.schema';
import { UsersService } from 'src/services/users/users.service';
import { UserController } from './user.controller';

const mongooseModule = [
  MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
];

@Module({
  imports: [...mongooseModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService, ...mongooseModule],
})
export class UsersModule {}
