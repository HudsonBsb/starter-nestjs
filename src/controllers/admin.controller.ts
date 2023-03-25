import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthGuard, AuthUser } from 'src/decorators/auth.decorator';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly userService: UserService) { }

    @Post('users')
    @AuthGuard()
    async login(@AuthUser() auth: any, @Body() user: User) {
        if (auth.roles?.find((r: string) => r === 'ADMIN'))
            return this.userService.create(user);
        else
            return new HttpException('Não autorizado.', HttpStatus.FORBIDDEN);
    }

}