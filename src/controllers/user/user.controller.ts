import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth_guard/auth.guard";
import { UserDto } from "src/models/dto/user.dto";
import { UserHeaderDto } from "src/models/dto/user.header.dto";
import { User } from "src/models/schema/user.schema";
import { UsersService } from "src/services/users/users.service";

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
    constructor(private usersService: UsersService) {}

    @Get()
    async getAllUserHeaders(): Promise<UserHeaderDto[]> {
        return this.usersService.getUserHeaders();
    }

    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<UserDto> {
        return this.usersService.getSingleUser(id);
    }
}