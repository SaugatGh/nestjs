import { UserService } from './user.service';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from '@prisma/client';
import { GetUser } from './../auth/decoder/get-user.decoter';
import { JwtGuard } from './../auth/guard/jwt.guard';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  //* Its's like Get/users/test
  @Get('me')
  getMe(@GetUser() user: User, @GetUser('email') email: string) {
    console.log({ email });
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
