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
  CommitSummaryDto,
  CommitDetailDto,
  FileVersionDto,
  RestoreFileVersionRequestDto,
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

  // --- Time Machine REST Endpoints ---

  @Get(':id/commits')
  async getCommits(
    @Param('id') id: string,
    @Query('limit') limit?: string
  ): Promise<CommitSummaryDto[]> {
    const container = this.containerManager.getContainer(id);
    if (!container.getCommits) return [];
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return container.getCommits(parsedLimit);
  }

  @Get(':id/commits/:commit')
  async getCommitDetail(
    @Param('id') id: string,
    @Param('commit') commitHash: string
  ): Promise<CommitDetailDto> {
    const container = this.containerManager.getContainer(id);
    if (!container.getCommitDetail) {
      throw new BadRequestException('Commit details not supported for this container.');
    }
    return container.getCommitDetail(commitHash);
  }

  @Get(':id/file-history')
  async getFileHistory(
    @Param('id') id: string,
    @Query('path') filePath: string,
    @Query('limit') limit?: string
  ): Promise<CommitSummaryDto[]> {
    if (!filePath) {
      throw new BadRequestException('Query parameter "path" is required.');
    }
    const container = this.containerManager.getContainer(id);
    if (!container.getFileHistory) return [];
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return container.getFileHistory(filePath, parsedLimit);
  }

  @Get(':id/file-version')
  async getFileVersion(
    @Param('id') id: string,
    @Query('path') filePath: string,
    @Query('commit') commitHash: string
  ): Promise<FileVersionDto> {
    if (!filePath || !commitHash) {
      throw new BadRequestException('Query parameters "path" and "commit" are required.');
    }
    const container = this.containerManager.getContainer(id);
    if (!container.getFileAtCommit) {
      throw new BadRequestException('Version history not supported for this container.');
    }
    return container.getFileAtCommit(filePath, commitHash);
  }

  @Post(':id/file-restore')
  async restoreFileVersion(
    @Param('id') id: string,
    @Body() body: RestoreFileVersionRequestDto
  ): Promise<{ success: boolean; commit: string; message: string }> {
    if (!body.path || !body.commitHash) {
      throw new BadRequestException('Fields "path" and "commitHash" are required.');
    }
    const container = this.containerManager.getContainer(id);
    if (!container.restoreFileVersion) {
      throw new BadRequestException('File restore not supported for this container.');
    }
    return container.restoreFileVersion(body);
  }
}

