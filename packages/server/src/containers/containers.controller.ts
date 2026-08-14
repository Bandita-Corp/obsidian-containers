import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ContainerManagerService } from './container-manager.service';
import {
  ContainerSummaryDto,
  RegisterContainerRequestDto,
  FolderTreeNode,
  FileItemDto,
  SyncDiffRequestDto,
  SyncDiffResponseDto,
  SyncPushRequestDto,
  SyncPushResponseDto,
  SyncPullRequestDto,
  SyncPullResponseDto,
  SyncStatusDto,
  ContainerChangesResponseDto,
} from '@workspace/shared';

@Controller('containers')
export class ContainersController {
  constructor(private readonly containerManager: ContainerManagerService) {}

  @Get()
  async listContainers(): Promise<ContainerSummaryDto[]> {
    return this.containerManager.listContainers();
  }

  @Post('register')
  async registerContainer(@Body() body: RegisterContainerRequestDto): Promise<ContainerSummaryDto> {
    return this.containerManager.registerContainer(body);
  }

  @Get(':id')
  async getContainerSummary(@Param('id') id: string): Promise<ContainerSummaryDto> {
    const container = this.containerManager.getContainer(id);
    return container.getSummary();
  }

  @Delete(':id')
  async deleteContainer(@Param('id') id: string): Promise<{ success: boolean }> {
    const deleted = await this.containerManager.deleteContainer(id);
    return { success: deleted };
  }

  @Get(':id/tree')
  async getTree(@Param('id') id: string): Promise<FolderTreeNode> {
    return this.containerManager.getContainerTree(id);
  }

  @Get(':id/files')
  async listFiles(@Param('id') id: string): Promise<FileItemDto[]> {
    const container = this.containerManager.getContainer(id);
    return container.listAllFiles();
  }

  @Get(':id/file')
  async readFile(
    @Param('id') id: string,
    @Query('path') filePath: string
  ): Promise<FileItemDto> {
    if (!filePath) {
      throw new BadRequestException('Query parameter "path" is required.');
    }
    const container = this.containerManager.getContainer(id);
    return container.readFile(filePath);
  }

  @Post(':id/file')
  async writeFile(
    @Param('id') id: string,
    @Body() body: { path: string; content: string }
  ): Promise<{ success: boolean; path: string }> {
    if (!body.path) {
      throw new BadRequestException('Field "path" is required.');
    }
    const container = this.containerManager.getContainer(id);
    await container.writeFile(body.path, body.content || '');
    return { success: true, path: body.path };
  }

  @Delete(':id/file')
  async deleteFile(
    @Param('id') id: string,
    @Query('path') filePath: string
  ): Promise<{ success: boolean; path: string }> {
    if (!filePath) {
      throw new BadRequestException('Query parameter "path" is required.');
    }
    const container = this.containerManager.getContainer(id);
    await container.deleteFile(filePath);
    return { success: true, path: filePath };
  }

  // --- Unified Container Sync Endpoints (Simple & Git) ---

  @Get(':id/status')
  async getStatus(@Param('id') id: string): Promise<SyncStatusDto> {
    const container = this.containerManager.getContainer(id);
    return container.getStatus();
  }

  @Get(':id/changes')
  async getChangesSince(
    @Param('id') id: string,
    @Query('sinceCommit') sinceCommit?: string,
    @Query('sinceRef') sinceRef?: string
  ): Promise<ContainerChangesResponseDto> {
    const container = this.containerManager.getContainer(id);
    return container.getChangesSince(sinceCommit || sinceRef);
  }

  @Post(':id/diff')
  async getDiff(
    @Param('id') id: string,
    @Body() body: SyncDiffRequestDto
  ): Promise<SyncDiffResponseDto> {
    const container = this.containerManager.getContainer(id);
    return container.diff(body);
  }

  @Post(':id/push')
  async pushChanges(
    @Param('id') id: string,
    @Body() body: SyncPushRequestDto
  ): Promise<SyncPushResponseDto> {
    const container = this.containerManager.getContainer(id);
    return container.push(body);
  }

  @Post(':id/pull')
  async pullChanges(
    @Param('id') id: string,
    @Body() body: SyncPullRequestDto
  ): Promise<SyncPullResponseDto> {
    const container = this.containerManager.getContainer(id);
    return container.pull(body);
  }
}
