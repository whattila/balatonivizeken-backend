import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../auth_guard/auth.guard";
import { UserDto } from "../../models/dto/user.dto";
import { UserHeaderDto } from "../../models/dto/user.header.dto";
import { UsersService } from "../../services/users/users.service";

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