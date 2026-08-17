import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as crypto from 'crypto';
import {
  ContainerType,
  ContainerSummaryDto,
  FolderTreeNode,
  FileItemDto,
  FileDiffItemDto,
  SyncDiffRequestDto,
  SyncDiffResponseDto,
  SyncPushRequestDto,
  SyncPushResponseDto,
  SyncPullRequestDto,
  SyncPullResponseDto,
  SyncStatusDto,
  ContainerChangesResponseDto,
  ConflictStrategy,
  ParsedNoteMetadataDto,
  CommitSummaryDto,
  CommitDetailDto,
  FileVersionDto,
  RestoreFileVersionRequestDto,
} from '@workspace/shared';
import { IContainer } from './container.interface';
import { NoteParserUtil } from './note-parser.util';

export class SimpleContainer implements IContainer {
  private readonly logger = new Logger(SimpleContainer.name);
  readonly id: string;
  readonly name: string;
  readonly type: ContainerType = 'simple';
  readonly description?: string;
  readonly rootPath: string;

  constructor(id: string, name: string, rootPath: string, description?: string) {
    this.id = id;
    this.name = name;
    this.rootPath = rootPath;
    this.description = description;
  }

  async initialize(): Promise<void> {
    try {
      if (!fsSync.existsSync(this.rootPath)) {
        await fs.mkdir(this.rootPath, { recursive: true });
        this.logger.log(`Created Simple Container directory: ${this.rootPath}`);
      }

      const existingEntries = await fs.readdir(this.rootPath);
      if (existingEntries.length === 0) {
        // Create a starter note with tags for demonstration
        const welcomePath = path.join(this.rootPath, 'Welcome.md');
        const starterContent = `---
title: Welcome to Simple Container
tags: [welcome, obsidian, container, structure, simple]
created: ${new Date().toISOString()}
---

# Welcome to ${this.name}

This is a **Simple Container** designed for lightweight, high-performance direct filesystem note management without Git overhead.

## Features
- Direct file and folder hierarchy loading
- Fast two-way synchronization and diff calculation
- Automatic tag & metadata extraction (e.g. #workspace #notes #minimal)
- Conflict resolution strategies (Client wins, Server wins, Backup fork)

Enjoy your simplified Obsidian vault!
`;
        await fs.writeFile(welcomePath, starterContent, 'utf-8');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize simple container at ${this.rootPath}`, error);
      throw error;
    }
  }

  async getSummary(): Promise<ContainerSummaryDto> {
    const files = await this.listAllFilePaths();
    let latestModifiedTime = 0;
    let totalSizeBytes = 0;

    for (const relPath of files) {
      try {
        const fullPath = path.join(this.rootPath, relPath);
        const stat = await fs.stat(fullPath);
        totalSizeBytes += stat.size;
        if (stat.mtimeMs > latestModifiedTime) {
          latestModifiedTime = stat.mtimeMs;
        }
      } catch {
        // Ignore stat errors
      }
    }

    const lastModifiedIso = latestModifiedTime ? new Date(latestModifiedTime).toISOString() : undefined;

    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      totalFiles: files.length,
      totalSizeBytes,
      lastModified: lastModifiedIso,
      currentCommit: lastModifiedIso ? `rev-${latestModifiedTime}` : undefined,
      isGit: false,
    };
  }

  async getTree(): Promise<FolderTreeNode> {
    return this.buildTreeNode(this.rootPath, '');
  }

  async readFile(relativePath: string): Promise<FileItemDto> {
    const safePath = this.sanitizeRelativePath(relativePath);
    const fullPath = path.join(this.rootPath, safePath);

    if (!fsSync.existsSync(fullPath)) {
      throw new Error(`File not found: ${safePath}`);
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const isMarkdown = safePath.endsWith('.md');
    const metadata: ParsedNoteMetadataDto | undefined = isMarkdown
      ? NoteParserUtil.parse(content, path.basename(safePath, '.md'))
      : undefined;

    const hash = this.computeHash(content);

    return {
      path: safePath,
      content,
      hash,
      metadata,
    };
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const safePath = this.sanitizeRelativePath(relativePath);
    const fullPath = path.join(this.rootPath, safePath);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    this.logger.log(`[SimpleContainer:${this.id}] Wrote file ${safePath}`);
  }

  async deleteFile(relativePath: string): Promise<void> {
    const safePath = this.sanitizeRelativePath(relativePath);
    const fullPath = path.join(this.rootPath, safePath);

    if (fsSync.existsSync(fullPath)) {
      await fs.unlink(fullPath);
      this.logger.log(`[SimpleContainer:${this.id}] Deleted file ${safePath}`);
    }
  }

  async listAllFiles(): Promise<FileItemDto[]> {
    const relPaths = await this.listAllFilePaths();
    const result: FileItemDto[] = [];

    for (const relPath of relPaths) {
      try {
        const fileItem = await this.readFile(relPath);
        result.push(fileItem);
      } catch (err) {
        this.logger.warn(`Could not read file ${relPath}: ${err.message}`);
      }
    }

    return result;
  }

  async createFolder(folderPath: string): Promise<void> {
    const safePath = this.sanitizeRelativePath(folderPath);
    const fullPath = path.join(this.rootPath, safePath);
    await fs.mkdir(fullPath, { recursive: true });
    this.logger.log(`[SimpleContainer:${this.id}] Created folder ${safePath}`);
  }

  async deleteFolder(folderPath: string): Promise<void> {
    const safePath = this.sanitizeRelativePath(folderPath);
    const fullPath = path.join(this.rootPath, safePath);
    if (fsSync.existsSync(fullPath)) {
      await fs.rm(fullPath, { recursive: true, force: true });
      this.logger.log(`[SimpleContainer:${this.id}] Deleted folder ${safePath}`);
    }
  }

  async renamePath(oldPath: string, newPath: string): Promise<void> {
    const safeOld = this.sanitizeRelativePath(oldPath);
    const safeNew = this.sanitizeRelativePath(newPath);
    const fullOld = path.join(this.rootPath, safeOld);
    const fullNew = path.join(this.rootPath, safeNew);

    if (!fsSync.existsSync(fullOld)) {
      throw new Error(`Path does not exist: ${safeOld}`);
    }

    await fs.mkdir(path.dirname(fullNew), { recursive: true });
    await fs.rename(fullOld, fullNew);
    this.logger.log(`[SimpleContainer:${this.id}] Renamed ${safeOld} -> ${safeNew}`);
  }

  async getStatus(): Promise<SyncStatusDto> {
    try {
      const allFiles = await this.listAllFilePaths();
      let latestModifiedTime = 0;
      let totalSizeBytes = 0;

      for (const relPath of allFiles) {
        try {
          const fullPath = path.join(this.rootPath, relPath);
          const stat = await fs.stat(fullPath);
          totalSizeBytes += stat.size;
          if (stat.mtimeMs > latestModifiedTime) {
            latestModifiedTime = stat.mtimeMs;
          }
        } catch {
          // Ignore
        }
      }

      const lastModifiedIso = latestModifiedTime ? new Date(latestModifiedTime).toISOString() : undefined;
      const revision = lastModifiedIso ? `rev-${latestModifiedTime}` : 'stateless';

      return {
        status: 'ok',
        currentCommit: revision,
        totalTrackedFiles: allFiles.length,
        totalSizeBytes,
        repositoryPath: this.rootPath,
        containerType: this.type,
        lastModified: lastModifiedIso,
        lastCommitMessage: `Filesystem state at ${lastModifiedIso || 'clean'}`,
        lastCommitDate: lastModifiedIso,
      };
    } catch (error) {
      this.logger.error(`Error getting status for Simple Container ${this.id}`, error);
      return {
        status: 'error',
        currentCommit: '',
        totalTrackedFiles: 0,
        repositoryPath: this.rootPath,
      };
    }
  }

  async getChangesSince(sinceRef?: string): Promise<ContainerChangesResponseDto> {
    const allFiles = await this.listAllFiles();
    const discoveredTagsSet = new Set<string>();
    const files: FileDiffItemDto[] = [];

    let sinceTimestamp = 0;
    if (sinceRef) {
      const cleanRef = sinceRef.replace(/^rev-|^ts-/, '');
      const parsedNum = Number(cleanRef);
      if (!isNaN(parsedNum)) {
        sinceTimestamp = parsedNum;
      } else {
        const parsedDate = Date.parse(cleanRef);
        if (!isNaN(parsedDate)) {
          sinceTimestamp = parsedDate;
        }
      }
    }

    let latestTime = 0;

    for (const file of allFiles) {
      if (file.metadata?.tags) {
        file.metadata.tags.forEach((t) => discoveredTagsSet.add(t));
      }

      let fileMtime = 0;
      try {
        const fullPath = path.join(this.rootPath, file.path);
        const stat = await fs.stat(fullPath);
        fileMtime = stat.mtimeMs;
        if (fileMtime > latestTime) {
          latestTime = fileMtime;
        }
      } catch {
        // Ignore
      }

      if (!sinceTimestamp || fileMtime > sinceTimestamp) {
        files.push({
          path: file.path,
          status: sinceTimestamp ? 'modified' : 'added',
          metadata: file.metadata,
        });
      }
    }

    const currentRevision = latestTime ? `rev-${latestTime}` : 'stateless';

    return {
      containerId: this.id,
      containerType: this.type,
      serverCommit: currentRevision,
      baseCommit: sinceRef,
      files,
      allDiscoveredTags: Array.from(discoveredTagsSet),
      totalChanges: files.length,
      hasConflicts: false,
    };
  }

  async diff(dto: SyncDiffRequestDto): Promise<SyncDiffResponseDto> {
    const diffItems: FileDiffItemDto[] = [];
    const discoveredTagsSet = new Set<string>();
    let hasConflicts = false;

    const serverFilesMap = new Map<string, { content: string; mtimeMs: number; metadata?: ParsedNoteMetadataDto }>();
    const allServerPaths = await this.listAllFilePaths();

    let latestServerMtime = 0;

    for (const relPath of allServerPaths) {
      try {
        const fullPath = path.join(this.rootPath, relPath);
        const stat = await fs.stat(fullPath);
        const content = await fs.readFile(fullPath, 'utf-8');
        if (stat.mtimeMs > latestServerMtime) {
          latestServerMtime = stat.mtimeMs;
        }

        let metadata: ParsedNoteMetadataDto | undefined;
        if (relPath.endsWith('.md')) {
          metadata = NoteParserUtil.parse(content, path.basename(relPath, '.md'));
          metadata.tags.forEach((t) => discoveredTagsSet.add(t));
        }

        serverFilesMap.set(relPath, {
          content,
          mtimeMs: stat.mtimeMs,
          metadata,
        });
      } catch {
        // Ignore
      }
    }

    const localProcessedPaths = new Set<string>();

    for (const localFile of dto.localChanges || []) {
      const safePath = this.sanitizeRelativePath(localFile.path);
      localProcessedPaths.add(safePath);

      const serverEntry = serverFilesMap.get(safePath);

      let metadata = localFile.metadata;
      if (!metadata && safePath.endsWith('.md') && localFile.content) {
        metadata = NoteParserUtil.parse(localFile.content, path.basename(safePath, '.md'));
      }
      if (metadata?.tags) {
        metadata.tags.forEach((t) => discoveredTagsSet.add(t));
      }

      if (localFile.deleted) {
        if (serverEntry) {
          diffItems.push({
            path: safePath,
            status: 'deleted',
            metadata: serverEntry.metadata,
          });
        }
        continue;
      }

      if (!serverEntry) {
        diffItems.push({
          path: safePath,
          status: 'added',
          metadata,
        });
      } else {
        if (serverEntry.content !== localFile.content) {
          diffItems.push({
            path: safePath,
            status: 'modified',
            metadata,
          });
        }
      }
    }

    const serverCommit = latestServerMtime ? `rev-${latestServerMtime}` : 'stateless';

    return {
      serverCommit,
      baseCommit: dto.baseCommit,
      files: diffItems,
      hasConflicts,
      totalChanges: diffItems.length,
      allDiscoveredTags: Array.from(discoveredTagsSet),
    };
  }

  async push(dto: SyncPushRequestDto): Promise<SyncPushResponseDto> {
    if (!dto.files || dto.files.length === 0) {
      const status = await this.getStatus();
      return {
        success: true,
        newCommit: status.currentCommit || `rev-${Date.now()}`,
        filesChanged: 0,
        message: 'No files provided to save.',
      };
    }

    let filesModifiedCount = 0;

    for (const file of dto.files) {
      const safeRelativePath = this.sanitizeRelativePath(file.path);
      const resolution = dto.resolutions?.[file.path];

      if (resolution === ConflictStrategy.SERVER_WINS) {
        continue;
      }

      if (resolution === ConflictStrategy.CREATE_BACKUP_FORK) {
        const ext = path.extname(safeRelativePath);
        const nameWithoutExt = safeRelativePath.slice(0, safeRelativePath.length - ext.length);
        const forkPath = `${nameWithoutExt}.client${ext}`;
        await this.writeFile(forkPath, file.content);
        filesModifiedCount++;
        continue;
      }

      if (file.deleted) {
        await this.deleteFile(safeRelativePath);
        filesModifiedCount++;
      } else {
        await this.writeFile(safeRelativePath, file.content);
        filesModifiedCount++;
      }
    }

    const newRevision = `rev-${Date.now()}`;
    this.logger.log(`[SimpleContainer:${this.id}] Pushed ${filesModifiedCount} files. Revision: ${newRevision}`);

    return {
      success: true,
      newCommit: newRevision,
      filesChanged: filesModifiedCount,
      message: `Successfully updated ${filesModifiedCount} files in Simple Container.`,
    };
  }

  async pull(dto: SyncPullRequestDto): Promise<SyncPullResponseDto> {
    const status = await this.getStatus();
    const currentRev = status.currentCommit || `rev-${Date.now()}`;

    // If specific paths requested
    if (dto.paths && dto.paths.length > 0) {
      const selectedFiles: FileItemDto[] = [];
      for (const p of dto.paths) {
        try {
          const f = await this.readFile(p);
          selectedFiles.push(f);
        } catch {
          // If file deleted on server
          selectedFiles.push({
            path: this.sanitizeRelativePath(p),
            content: '',
            deleted: true,
          });
        }
      }
      return {
        commit: currentRev,
        files: selectedFiles,
        isFullSync: false,
      };
    }

    // Incremental pull based on timestamp if sinceCommit provided
    if (dto.sinceCommit) {
      let sinceTimestamp = 0;
      const cleanRef = dto.sinceCommit.replace(/^rev-|^ts-/, '');
      const parsedNum = Number(cleanRef);
      if (!isNaN(parsedNum)) {
        sinceTimestamp = parsedNum;
      } else {
        const parsedDate = Date.parse(cleanRef);
        if (!isNaN(parsedDate)) {
          sinceTimestamp = parsedDate;
        }
      }

      if (sinceTimestamp > 0) {
        const allRelPaths = await this.listAllFilePaths();
        const changedFiles: FileItemDto[] = [];

        for (const relPath of allRelPaths) {
          try {
            const fullPath = path.join(this.rootPath, relPath);
            const stat = await fs.stat(fullPath);
            if (stat.mtimeMs > sinceTimestamp) {
              const fileItem = await this.readFile(relPath);
              changedFiles.push(fileItem);
            }
          } catch {
            // Ignore
          }
        }

        return {
          commit: currentRev,
          files: changedFiles,
          isFullSync: false,
        };
      }
    }

    // Full snapshot
    const allFiles = await this.listAllFiles();
    return {
      commit: currentRev,
      files: allFiles,
      isFullSync: true,
    };
  }

  private async buildTreeNode(currentDir: string, relativeDir: string): Promise<FolderTreeNode> {
    const nodeName = relativeDir ? path.basename(relativeDir) : this.name;
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    const children: FolderTreeNode[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // ignore hidden files/dirs

      const childRelPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      const childFullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        const subTree = await this.buildTreeNode(childFullPath, childRelPath);
        children.push(subTree);
      } else if (entry.isFile()) {
        let metadata: ParsedNoteMetadataDto | undefined;
        let size = 0;

        try {
          const stat = await fs.stat(childFullPath);
          size = stat.size;
          if (entry.name.endsWith('.md')) {
            const content = await fs.readFile(childFullPath, 'utf-8');
            metadata = NoteParserUtil.parse(content, path.basename(entry.name, '.md'));
          }
        } catch {
          // ignore metadata read failures
        }

        children.push({
          name: entry.name,
          path: childRelPath,
          type: 'file',
          size,
          metadata,
        });
      }
    }

    return {
      name: nodeName,
      path: relativeDir || '/',
      type: 'folder',
      children,
    };
  }

  private async listAllFilePaths(currentDir = this.rootPath, relativePrefix = ''): Promise<string[]> {
    const results: string[] = [];
    if (!fsSync.existsSync(currentDir)) return results;

    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.listAllFilePaths(fullPath, relPath);
        results.push(...subFiles);
      } else if (entry.isFile()) {
        results.push(relPath);
      }
    }

    return results;
  }

  private sanitizeRelativePath(filePath: string): string {
    const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return normalized.replace(/^[/\\]+/, '').replace(/\\/g, '/');
  }

  private computeHash(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
  }

  // --- Time Machine Fallbacks ---

  async getCommits(limit = 50): Promise<CommitSummaryDto[]> {
    return [];
  }

  async getCommitDetail(commitHash: string): Promise<CommitDetailDto> {
    return {
      hash: commitHash,
      shortHash: commitHash.substring(0, 7),
      author: 'System',
      date: new Date().toISOString(),
      message: 'Simple container snapshot',
      files: [],
    };
  }

  async getFileHistory(filePath: string, limit = 50): Promise<CommitSummaryDto[]> {
    return [];
  }

  async getFileAtCommit(filePath: string, commitHash: string): Promise<FileVersionDto> {
    const file = await this.readFile(filePath);
    return {
      commitHash,
      shortHash: commitHash.substring(0, 7),
      path: file.path,
      content: file.content,
      author: 'System',
      date: new Date().toISOString(),
      message: 'Current file state',
      metadata: file.metadata,
    };
  }

  async restoreFileVersion(dto: RestoreFileVersionRequestDto): Promise<{ success: boolean; commit: string; message: string }> {
    return {
      success: false,
      commit: '',
      message: 'Version restore is only supported on Git-backed containers.',
    };
  }
}

