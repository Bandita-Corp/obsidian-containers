import {
  ContainerSummaryDto,
  RegisterContainerRequestDto,
  FolderTreeNode,
  FileItemDto,
  SyncStatusDto,
  CommitSummaryDto,
  CommitDetailDto,
  FileVersionDto,
  RestoreFileVersionRequestDto,
  SyncPushRequestDto,
  SyncPushResponseDto,
  SyncPullRequestDto,
  SyncPullResponseDto,
} from '@workspace/shared';

const BASE_URL = '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.message) {
        errorMsg = Array.isArray(errorJson.message)
          ? errorJson.message.join(', ')
          : errorJson.message;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Containers
  async listContainers(): Promise<ContainerSummaryDto[]> {
    const res = await fetch(`${BASE_URL}/containers`);
    return handleResponse<ContainerSummaryDto[]>(res);
  },

  async getContainer(id: string): Promise<ContainerSummaryDto> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}`);
    return handleResponse<ContainerSummaryDto>(res);
  },

  async registerContainer(body: RegisterContainerRequestDto): Promise<ContainerSummaryDto> {
    const res = await fetch(`${BASE_URL}/containers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<ContainerSummaryDto>(res);
  },

  async deleteContainer(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async getTree(id: string): Promise<FolderTreeNode> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}/tree`);
    return handleResponse<FolderTreeNode>(res);
  },

  async listFiles(id: string): Promise<FileItemDto[]> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}/files`);
    return handleResponse<FileItemDto[]>(res);
  },

  async readFile(id: string, filePath: string): Promise<FileItemDto> {
    const res = await fetch(
      `${BASE_URL}/containers/${encodeURIComponent(id)}/file?path=${encodeURIComponent(filePath)}`
    );
    return handleResponse<FileItemDto>(res);
  },

  async writeFile(id: string, filePath: string, content: string): Promise<{ success: boolean; path: string }> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content }),
    });
    return handleResponse<{ success: boolean; path: string }>(res);
  },

  async deleteFile(id: string, filePath: string): Promise<{ success: boolean; path: string }> {
    const res = await fetch(
      `${BASE_URL}/containers/${encodeURIComponent(id)}/file?path=${encodeURIComponent(filePath)}`,
      {
        method: 'DELETE',
      }
    );
    return handleResponse<{ success: boolean; path: string }>(res);
  },

  async getStatus(id: string): Promise<SyncStatusDto> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}/status`);
    return handleResponse<SyncStatusDto>(res);
  },

  // Time Machine
  async getCommits(id: string, limit = 50): Promise<CommitSummaryDto[]> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}/commits?limit=${limit}`);
    return handleResponse<CommitSummaryDto[]>(res);
  },

  async getCommitDetail(id: string, commitHash: string): Promise<CommitDetailDto> {
    const res = await fetch(
      `${BASE_URL}/containers/${encodeURIComponent(id)}/commits/${encodeURIComponent(commitHash)}`
    );
    return handleResponse<CommitDetailDto>(res);
  },

  async getFileHistory(id: string, filePath: string, limit = 50): Promise<CommitSummaryDto[]> {
    const res = await fetch(
      `${BASE_URL}/containers/${encodeURIComponent(id)}/file-history?path=${encodeURIComponent(filePath)}&limit=${limit}`
    );
    return handleResponse<CommitSummaryDto[]>(res);
  },

  async getFileVersion(id: string, filePath: string, commitHash: string): Promise<FileVersionDto> {
    const res = await fetch(
      `${BASE_URL}/containers/${encodeURIComponent(id)}/file-version?path=${encodeURIComponent(filePath)}&commit=${encodeURIComponent(commitHash)}`
    );
    return handleResponse<FileVersionDto>(res);
  },

  async restoreFileVersion(
    id: string,
    body: RestoreFileVersionRequestDto
  ): Promise<{ success: boolean; commit: string; message: string }> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}/file-restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<{ success: boolean; commit: string; message: string }>(res);
  },

  // Sync operations
  async pushChanges(id: string, body: SyncPushRequestDto): Promise<SyncPushResponseDto> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<SyncPushResponseDto>(res);
  },

  async pullChanges(id: string, body: SyncPullRequestDto): Promise<SyncPullResponseDto> {
    const res = await fetch(`${BASE_URL}/containers/${encodeURIComponent(id)}/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<SyncPullResponseDto>(res);
  },
};
