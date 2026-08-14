import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { getDashboardHtml } from './dashboard.html';

@Controller()
export class DashboardController {
  @Get()
  getRoot(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(getDashboardHtml());
  }

  @Get('dashboard')
  getDashboard(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(getDashboardHtml());
  }
}
