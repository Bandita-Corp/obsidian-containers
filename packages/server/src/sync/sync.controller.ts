import { Controller, Post, Get, Body, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SyncService } from './sync.service';
import {
  SyncPushRequestDto,
  SyncPushResponseDto,
  SyncPullRequestDto,
  SyncPullResponseDto,
  SyncDiffRequestDto,
  SyncDiffResponseDto,
  SyncStatusDto,
} from '@workspace/shared';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('status')
  async getStatus(): Promise<SyncStatusDto> {
    return this.syncService.getStatus();
  }

  @Post('diff')
  async getDiff(@Body() body: SyncDiffRequestDto): Promise<SyncDiffResponseDto> {
    return this.syncService.diff(body);
  }

  @Post('push')
  async pushChanges(@Body() body: SyncPushRequestDto): Promise<SyncPushResponseDto> {
    return this.syncService.push(body);
  }

  @Post('pull')
  async pullChanges(@Body() body: SyncPullRequestDto): Promise<SyncPullResponseDto> {
    return this.syncService.pull(body);
  }

  /**
   * Server-Sent Events (SSE) stream for notifying clients of remote commits.
   */
  @Sse('events')
  sendEvents(): Observable<MessageEvent> {
    return this.syncService.getEventsStream().pipe(
      map((event) => ({
        data: event,
      }))
    );
  }
}
