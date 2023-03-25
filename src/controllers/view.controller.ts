import { Get, Controller, Res, Req, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { CookieInterceptor } from 'src/interceptors/cookie.interceptor';

@Controller()
@UseInterceptors(CookieInterceptor)
export class ViewController {

  @Get('')
  index(@Res() res: Response) {
    return res.render('index');
  }

  @Get('login')
  login(@Res() res: Response) {
    return res.render('login');
  }

  @Get('pdf')
  pdf(@Res() res: Response) {
    return res.render('pdf', {
      now: new Date().toLocaleDateString()
    });
  }
}