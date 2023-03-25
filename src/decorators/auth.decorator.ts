import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard as Guard } from '@nestjs/passport';

export const AuthUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;
        return data ? user?.[data] : user;
    }
);

export const AuthGuard = () => {
    return applyDecorators(
        UseGuards(
            Guard('jwt')));
}
