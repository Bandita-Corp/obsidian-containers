import {
  ContainerType,
  ContainerSummaryDto,
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

/**
 * Base interface representing an isolated storage container (vault).
 */
export interface IContainer {
  readonly id: string;
  readonly name: string;
  readonly type: ContainerType;
  readonly description?: string;
  readonly rootPath: string;

  /**
   * Initializes any storage requirements (directories, configs).
   */
  initialize(): Promise<void>;

  /**
   * Returns a high-level summary of the container.
   */
  getSummary(): Promise<ContainerSummaryDto>;

  /**
   * Builds the complete hierarchical file and directory tree.
   */
  getTree(): Promise<FolderTreeNode>;

  /**
   * Reads a single file from the container, including parsed metadata.
   */
  readFile(relativePath: string): Promise<FileItemDto>;

  /**
   * Writes/updates a file inside the container.
   */
  writeFile(relativePath: string, content: string): Promise<void>;

  /**
   * Deletes a file from the container.
   */
  deleteFile(relativePath: string): Promise<void>;

  /**
   * Lists all files with their content and parsed metadata.
   */
  listAllFiles(): Promise<FileItemDto[]>;

  /**
   * Creates a directory folder inside the container.
   */
  createFolder?(folderPath: string): Promise<void>;

  /**
   * Deletes a directory folder inside the container.
   */
  deleteFolder?(folderPath: string): Promise<void>;

  /**
   * Renames or moves a file/folder inside the container.
   */
  renamePath?(oldPath: string, newPath: string): Promise<void>;

  /**
   * Computes a diff between client changes and container files.
   */
  diff(dto: SyncDiffRequestDto): Promise<SyncDiffResponseDto>;

  /**
   * Pushes client modifications and persists them into the container.
   */
  push(dto: SyncPushRequestDto): Promise<SyncPushResponseDto>;

  /**
   * Pulls incremental changes or full container state.
   */
  pull(dto: SyncPullRequestDto): Promise<SyncPullResponseDto>;

  /**
   * Calculates and returns all changes and tag metadata since a previous pull/sync.
   */
  getChangesSince(sinceRef?: string): Promise<ContainerChangesResponseDto>;

  /**
   * Returns container status and storage statistics.
   */
  getStatus(): Promise<SyncStatusDto>;

  /**
   * Time Machine: Returns commit history for the container.
   */
  getCommits?(limit?: number): Promise<CommitSummaryDto[]>;

  /**
   * Time Machine: Returns detailed diff and file patches for a specific commit.
   */
  getCommitDetail?(commitHash: string): Promise<CommitDetailDto>;

  /**
   * Time Machine: Returns commit history affecting a specific file.
   */
  getFileHistory?(filePath: string, limit?: number): Promise<CommitSummaryDto[]>;

  /**
   * Time Machine: Retrieves a snapshot of a file at a historical commit.
   */
  getFileAtCommit?(filePath: string, commitHash: string): Promise<FileVersionDto>;

  /**
   * Time Machine: Reverts / restores a file to a specific historical commit.
   */
  restoreFileVersion?(dto: RestoreFileVersionRequestDto): Promise<{ success: boolean; commit: string; message: string }>;
}

/**
 * Git-specific extension methods for containers backed by Git versioning.
 */
export interface IGitContainerExtension {
  diff(dto: SyncDiffRequestDto): Promise<SyncDiffResponseDto>;
  push(dto: SyncPushRequestDto): Promise<SyncPushResponseDto>;
  pull(dto: SyncPullRequestDto): Promise<SyncPullResponseDto>;
  getChangesSince(sinceCommit?: string): Promise<ContainerChangesResponseDto>;
  getStatus(): Promise<SyncStatusDto>;
  getCommits(limit?: number): Promise<CommitSummaryDto[]>;
  getCommitDetail(commitHash: string): Promise<CommitDetailDto>;
  getFileHistory(filePath: string, limit?: number): Promise<CommitSummaryDto[]>;
  getFileAtCommit(filePath: string, commitHash: string): Promise<FileVersionDto>;
  restoreFileVersion(dto: RestoreFileVersionRequestDto): Promise<{ success: boolean; commit: string; message: string }>;
}

