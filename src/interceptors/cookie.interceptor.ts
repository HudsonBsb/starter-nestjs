import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

const TOKEN_KEY = 'X-TOKEN-BSBNUTRI';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
    constructor(private readonly jwtService: JwtService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request: Request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();
        const TOKEN = request.cookies[TOKEN_KEY];
        if (request.url === '/login')
            return next
                .handle()
        else
            try {
                const verify = TOKEN && this.jwtService.verify(TOKEN);
                if (!verify)
                    response.location('/login');
                else
                    return next
                        .handle()
            } catch (e) {
                response.redirect('/login');
            }
    }
}