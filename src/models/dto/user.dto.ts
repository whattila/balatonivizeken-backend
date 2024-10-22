import { Exclude, Expose, Transform, Type } from "class-transformer";
import { User } from "../schema/user.schema";
import { Types } from "mongoose";

@Exclude()
export class UserDto implements User {
    @Expose()
    @Transform((value) => new Types.ObjectId(value.obj._id), {
        toClassOnly: true,
    })
    @Type(() => String)
    _id?: Types.ObjectId;

    @Expose()
    username: string;

    @Expose()
    phoneNumber: string;

    @Expose()
    userType: string;

    @Expose()
    emailAddress: string;

    @Expose()
    familyName: string;

    @Expose()
    givenName: string;

    isEmailVerified: boolean;
    verificationCode?: string;
    passwordHash?: string;
}