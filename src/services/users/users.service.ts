import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../models/schema/user.schema';
import { UserHeaderDto } from '../../models/dto/user.header.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '../../models/dto/user.dto';
import { UserType } from '../../models/enums/user_type.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: User): Promise<User> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id).lean();
  }

  async findByUserName(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username: username }).lean();
  }

  async findByEmailAddress(emailAddress: string): Promise<User> {
    return this.userModel.findOne({ emailAddress: emailAddress }).lean();
  }

  async getUserHeaders(): Promise<UserHeaderDto[]> {
    const users = await this.userModel.find({ userType: { $ne: UserType.ADMIN }}).lean();
    return plainToInstance(UserHeaderDto, users);
  }

  async getSingleUser(id: string): Promise<UserDto> {
    const user = this.userModel.findById(id).lean();
    return plainToInstance(UserDto, user);
  }
}
