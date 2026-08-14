import { Module } from '@nestjs/common';
import { ContainerManagerService } from './container-manager.service';
import { ContainersController } from './containers.controller';

@Module({
  controllers: [ContainersController],
  providers: [ContainerManagerService],
  exports: [ContainerManagerService],
})
export class ContainersModule {}
