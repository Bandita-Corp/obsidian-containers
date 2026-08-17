import { ConflictStrategy, FileConflictInfo } from './conflict';

export type ContainerType = 'simple' | 'git';

/**
 * Parsed metadata for a Markdown note (tags, frontmatter, stats).
 */
export interface ParsedNoteMetadataDto {
  /** All tags found in note, including inline #tags and frontmatter tags */
  tags: string[];
  /** Parsed YAML frontmatter key-value pairs */
  frontmatter: Record<string, any>;
  /** Note title (first H1 heading or filename) */
  title?: string;
  /** List of section headings found in the file */
  headings: string[];
  /** Calculated word count */
  wordCount: number;
  /** Character count */
  characterCount: number;
}

/**
 * File descriptor transferred between client and server.
 */
export interface FileItemDto {
  /** Relative path of the markdown file within the container, e.g. "notes/daily/2026-08-15.md" */
  path: string;
  /** File content in UTF-8 string format */
  content: string;
  /** Optional SHA-256 hash or mtime timestamp of the file */
  hash?: string;
  /** Indicates whether this file has been deleted */
  deleted?: boolean;
  /** Parsed metadata (tags, headings, stats) */
  metadata?: ParsedNoteMetadataDto;
}

export type FileDiffStatus = 'added' | 'modified' | 'deleted' | 'unmodified' | 'conflict';

/**
 * Detailed diff item for a specific file.
 */
export interface FileDiffItemDto {
  path: string;
  status: FileDiffStatus;
  /** Git diff patch representation (if applicable) */
  patch?: string;
  /** If in conflict, provides extra context for resolution */
  conflictInfo?: FileConflictInfo;
  /** Parsed note metadata (tags, frontmatter, stats) */
  metadata?: ParsedNoteMetadataDto;
}

/**
 * Hierarchical tree node representing files and directories in a container.
 */
export interface FolderTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  metadata?: ParsedNoteMetadataDto;
  children?: FolderTreeNode[];
}

/**
 * Configuration for registering or persisting a container.
 */
export interface ContainerConfigDto {
  id: string;
  name: string;
  type: ContainerType;
  description?: string;
  rootPath?: string;
  createdAt?: string;
  lastSyncedCommit?: string;
}

/**
 * Registration request payload.
 */
export interface RegisterContainerRequestDto {
  id?: string;
  name: string;
  type: ContainerType;
  description?: string;
  rootPath?: string;
}

/**
 * Summary view of a registered container.
 */
export interface ContainerSummaryDto {
  id: string;
  name: string;
  type: ContainerType;
  description?: string;
  totalFiles: number;
  totalSizeBytes?: number;
  currentCommit?: string;
  lastCommitMessage?: string;
  lastCommitDate?: string;
  lastModified?: string;
  isGit: boolean;
}

/**
 * Request payload for querying diffs between client and server.
 */
export interface SyncDiffRequestDto {
  /** Optional container identifier (if calling container-specific sync) */
  containerId?: string;
  /** The last commit hash the client synchronized against */
  baseCommit?: string;
  /** List of locally changed files with their current content/hashes */
  localChanges: FileItemDto[];
}

/**
 * Response payload returning the diff calculation.
 */
export interface SyncDiffResponseDto {
  /** Current Git HEAD commit hash on the server */
  serverCommit: string;
  /** Base commit that was compared */
  baseCommit?: string;
  /** Diffs for all files needing attention (push or pull or conflict) */
  files: FileDiffItemDto[];
  /** Overall summary */
  hasConflicts: boolean;
  totalChanges: number;
  /** All unique tags discovered across all changed files */
  allDiscoveredTags?: string[];
}

/**
 * Response payload for inspecting container changes since previous pull/sync.
 */
export interface ContainerChangesResponseDto {
  containerId: string;
  containerType: ContainerType;
  serverCommit?: string;
  baseCommit?: string;
  files: FileDiffItemDto[];
  allDiscoveredTags: string[];
  totalChanges: number;
  hasConflicts: boolean;
}

/**
 * Request payload to push client modifications to the server.
 */
export interface SyncPushRequestDto {
  /** The base commit hash that client changes were made upon */
  baseCommit?: string;
  /** Commit message authored by the client / system */
  message?: string;
  /** Changed and deleted files */
  files: FileItemDto[];
  /** Conflict resolution decisions (if pushing with resolved conflicts) */
  resolutions?: Record<string, ConflictStrategy>;
}

/**
 * Response payload after pushing changes to the server.
 */
export interface SyncPushResponseDto {
  success: boolean;
  /** The newly created Git commit hash */
  newCommit: string;
  /** Number of files committed */
  filesChanged: number;
  /** Any warnings or message */
  message: string;
}

/**
 * Request payload to pull changes from the server.
 */
export interface SyncPullRequestDto {
  /** The commit hash from which the client wants updates */
  sinceCommit?: string;
  /** List of specific file paths if pulling selectively (optional) */
  paths?: string[];
}

/**
 * Response payload containing server files and latest commit info.
 */
export interface SyncPullResponseDto {
  /** The current Git commit hash of the returned state */
  commit: string;
  /** List of files created/modified/deleted since `sinceCommit` */
  files: FileItemDto[];
  /** True if this is a full initial pull instead of incremental */
  isFullSync: boolean;
}

/**
 * Server health and repository state.
 */
export interface SyncStatusDto {
  status: 'ok' | 'initializing' | 'error';
  currentCommit?: string;
  totalTrackedFiles: number;
  repositoryPath: string;
  totalSizeBytes?: number;
  containerType?: ContainerType;
  lastModified?: string;
  lastCommitMessage?: string;
  lastCommitDate?: string;
}

/**
 * Server-Sent Events (SSE) notification payload.
 */
export interface SyncServerEventDto {
  type: 'commit_created' | 'conflict_detected' | 'server_ready' | 'container_updated';
  containerId?: string;
  commit?: string;
  timestamp: string;
  author?: string;
  message?: string;
}

/**
 * Summary information for a single Git commit in Time Machine.
 */
export interface CommitSummaryDto {
  hash: string;
  shortHash: string;
  author: string;
  authorEmail?: string;
  date: string;
  relativeDate?: string;
  message: string;
  body?: string;
  filesChanged?: number;
  insertions?: number;
  deletions?: number;
}

/**
 * Diff entry for a single file inside a commit.
 */
export interface CommitFileDiffDto {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied' | 'unmodified';
  patch?: string;
  insertions?: number;
  deletions?: number;
}

/**
 * Detailed commit info including all file diffs and patches.
 */
export interface CommitDetailDto extends CommitSummaryDto {
  files: CommitFileDiffDto[];
}

/**
 * Snapshot of a file at a specific historical commit.
 */
export interface FileVersionDto {
  commitHash: string;
  shortHash: string;
  path: string;
  content: string;
  author: string;
  date: string;
  message: string;
  patch?: string;
  metadata?: ParsedNoteMetadataDto;
}

/**
 * Request payload for reverting or restoring a file to a specific commit version.
 */
export interface RestoreFileVersionRequestDto {
  path: string;
  commitHash: string;
  message?: string;
}

