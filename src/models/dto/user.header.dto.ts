import { Exclude, Expose, Transform, Type } from "class-transformer";
import { User } from "../schema/user.schema";
import { Types } from "mongoose";

@Exclude()
export class UserHeaderDto implements User {
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

    emailAddress: string;
    isEmailVerified: boolean;
    familyName: string;
    givenName: string;
    verificationCode?: string;
    passwordHash?: string;
}