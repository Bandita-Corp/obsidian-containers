import { requestUrl, RequestUrlParam } from 'obsidian';
import {
  SyncStatusDto,
  SyncDiffRequestDto,
  SyncDiffResponseDto,
  SyncPushRequestDto,
  SyncPushResponseDto,
  SyncPullRequestDto,
  SyncPullResponseDto,
  ContainerSummaryDto,
  RegisterContainerRequestDto,
  FolderTreeNode,
  FileItemDto,
  ContainerChangesResponseDto,
} from '@workspace/shared';

export class SyncApiClient {
  constructor(private getBaseUrl: () => string) {}

  private get baseUrl(): string {
    return this.getBaseUrl().replace(/\/+$/, '');
  }

  // --- Multi-Container Endpoints ---

  async listContainers(): Promise<ContainerSummaryDto[]> {
    return this.request<ContainerSummaryDto[]>({
      url: `${this.baseUrl}/containers`,
      method: 'GET',
    });
  }

  async registerContainer(dto: RegisterContainerRequestDto): Promise<ContainerSummaryDto> {
    return this.request<ContainerSummaryDto>({
      url: `${this.baseUrl}/containers/register`,
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getContainerSummary(containerId: string): Promise<ContainerSummaryDto> {
    return this.request<ContainerSummaryDto>({
      url: `${this.baseUrl}/containers/${containerId}`,
      method: 'GET',
    });
  }

  async getContainerTree(containerId: string): Promise<FolderTreeNode> {
    return this.request<FolderTreeNode>({
      url: `${this.baseUrl}/containers/${containerId}/tree`,
      method: 'GET',
    });
  }

  async listContainerFiles(containerId: string): Promise<FileItemDto[]> {
    return this.request<FileItemDto[]>({
      url: `${this.baseUrl}/containers/${containerId}/files`,
      method: 'GET',
    });
  }

  async getContainerFile(containerId: string, path: string): Promise<FileItemDto> {
    return this.request<FileItemDto>({
      url: `${this.baseUrl}/containers/${containerId}/file?path=${encodeURIComponent(path)}`,
      method: 'GET',
    });
  }

  async saveContainerFile(containerId: string, path: string, content: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      url: `${this.baseUrl}/containers/${containerId}/file`,
      method: 'POST',
      body: JSON.stringify({ path, content }),
    });
  }

  async deleteContainer(containerId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      url: `${this.baseUrl}/containers/${containerId}`,
      method: 'DELETE',
    });
  }

  async deleteContainerFile(containerId: string, path: string): Promise<{ success: boolean; path: string }> {
    return this.request<{ success: boolean; path: string }>({
      url: `${this.baseUrl}/containers/${containerId}/file?path=${encodeURIComponent(path)}`,
      method: 'DELETE',
    });
  }

  // --- Git Container & Sync Endpoints ---

  async getContainerStatus(containerId: string): Promise<SyncStatusDto> {
    return this.request<SyncStatusDto>({
      url: `${this.baseUrl}/containers/${containerId}/status`,
      method: 'GET',
    });
  }

  /**
   * Retrieves all file changes, patches, and discovered tags since previous pull/sync.
   */
  async getChangesSinceSync(containerId: string, sinceCommit?: string): Promise<ContainerChangesResponseDto> {
    const query = sinceCommit ? `?sinceCommit=${encodeURIComponent(sinceCommit)}` : '';
    return this.request<ContainerChangesResponseDto>({
      url: `${this.baseUrl}/containers/${containerId}/changes${query}`,
      method: 'GET',
    });
  }

  async getContainerDiff(containerId: string, dto: SyncDiffRequestDto): Promise<SyncDiffResponseDto> {
    return this.request<SyncDiffResponseDto>({
      url: `${this.baseUrl}/containers/${containerId}/diff`,
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async pushContainerChanges(containerId: string, dto: SyncPushRequestDto): Promise<SyncPushResponseDto> {
    return this.request<SyncPushResponseDto>({
      url: `${this.baseUrl}/containers/${containerId}/push`,
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async pullContainerChanges(containerId: string, dto: SyncPullRequestDto): Promise<SyncPullResponseDto> {
    return this.request<SyncPullResponseDto>({
      url: `${this.baseUrl}/containers/${containerId}/pull`,
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // --- Legacy / Direct Endpoints ---

  async getStatus(): Promise<SyncStatusDto> {
    return this.request<SyncStatusDto>({
      url: `${this.baseUrl}/sync/status`,
      method: 'GET',
    });
  }

  async getDiff(dto: SyncDiffRequestDto): Promise<SyncDiffResponseDto> {
    return this.request<SyncDiffResponseDto>({
      url: `${this.baseUrl}/sync/diff`,
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async pushChanges(dto: SyncPushRequestDto): Promise<SyncPushResponseDto> {
    return this.request<SyncPushResponseDto>({
      url: `${this.baseUrl}/sync/push`,
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async pullChanges(dto: SyncPullRequestDto): Promise<SyncPullResponseDto> {
    return this.request<SyncPullResponseDto>({
      url: `${this.baseUrl}/sync/pull`,
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  private async request<T>(params: RequestUrlParam): Promise<T> {
    try {
      const response = await requestUrl({
        ...params,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(params.headers || {}),
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return response.json as T;
      }
      throw new Error(`Server returned HTTP ${response.status}: ${response.text}`);
    } catch (error) {
      console.error(`Sync API error on [${params.method}] ${params.url}:`, error);
      throw error;
    }
  }
}
