import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { getDashboardHtml } from './dashboard.html';

@Controller()
export class DashboardController {
  private getWebDistPath(): string | null {
    const candidatePaths = [
      path.resolve(process.cwd(), 'packages/web/dist'),
      path.resolve(process.cwd(), '../web/dist'),
      path.resolve(__dirname, '../../../web/dist'),
      path.resolve(__dirname, '../../../../packages/web/dist'),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(path.join(p, 'index.html'))) {
        return p;
      }
    }
    return null;
  }

  @Get()
  getRoot(@Req() req: Request, @Res() res: Response) {
    const webDist = this.getWebDistPath();
    if (webDist) {
      return res.sendFile(path.join(webDist, 'index.html'));
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(getDashboardHtml());
  }

  @Get('dashboard')
  getDashboard(@Res() res: Response) {
    const webDist = this.getWebDistPath();
    if (webDist) {
      return res.sendFile(path.join(webDist, 'index.html'));
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(getDashboardHtml());
  }

  @Get('explorer')
  getExplorer(@Res() res: Response) {
    const webDist = this.getWebDistPath();
    if (webDist) {
      return res.sendFile(path.join(webDist, 'index.html'));
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(getDashboardHtml());
  }

  @Get('assets/:filename')
  getAsset(@Req() req: Request, @Res() res: Response) {
    const webDist = this.getWebDistPath();
    if (webDist) {
      // req.path is like '/assets/index-5h285f0L.js'
      const relativeAsset = req.path.replace(/^\/+/, '');
      const assetPath = path.join(webDist, relativeAsset);
      if (fs.existsSync(assetPath)) {
        return res.sendFile(assetPath);
      }
    }
    return res.status(404).send('Asset not found');
  }
}

