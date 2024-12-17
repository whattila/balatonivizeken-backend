import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class RegistrationInputDto {
  @IsString()
  username: string;

  @IsString()
  emailAddress: string;

  @IsString()
  password: string;

  @IsString()
  familyName: string;

  @IsString()
  givenName: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  userType: string;

  @IsOptional()
  @IsString()
  invitationCode?: string;
}
