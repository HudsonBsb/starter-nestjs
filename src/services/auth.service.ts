import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly userSevice: UserService,
        private readonly jwtService: JwtService
    ) { }

    async login(email: string, password: string): Promise<{ accessToken: string, user: User }> {
        return this.verify(email, password);
    }

    async getMe(id: number): Promise<User> {
        return this.userSevice.findById(id);
    }

    private validate(password: string, hash: string): boolean {
        const result = bcrypt.compareSync(password, hash);
        if (!result) throw new UnauthorizedException('Usuário ou senha incorreto.');
        return result;
    }

    private async verify(email: string, decryptedPass: string): Promise<{ accessToken: string, user: User }> {
        try {
            const { password, ...user } = await this.userSevice.findByEmail(email);
            if (!user) throw new UnauthorizedException('Usuário ou senha incorreto.');
            return user && this.validate(decryptedPass, password) &&
                { accessToken: this.jwtService.sign({ ...user }), user: user as User }
        } catch (ex) {
            if (!(ex instanceof HttpException))
                throw new UnauthorizedException('Usuário ou senha incorreto.');
            throw ex;
        }
    }

    // async updatePassword({ id }: User, current: string, password: string): Promise<User> {
    //     const user = await this.userSevice.findById(id);
    //     if (!bcrypt.compareSync(current, user.password)) throw new HttpException('Senha atual não confere.', HttpStatus.BAD_REQUEST);
    //     return this.userSevice.update({ ...user, password } as User);
    // }

    verifyAuth(token: string): boolean {
        return !token || !!this.jwtService.verify(token);
    }
}
