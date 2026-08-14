import { Module } from '@nestjs/common';
import { SyncModule } from './sync/sync.module';
import { ContainersModule } from './containers/containers.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [SyncModule, ContainersModule, DashboardModule],
})
export class AppModule {}
