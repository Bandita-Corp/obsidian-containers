import { Logger } from '@nestjs/common';
import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
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
  CommitFileDiffDto,
  FileVersionDto,
  RestoreFileVersionRequestDto,
} from '@workspace/shared';
import { IContainer, IGitContainerExtension } from './container.interface';
import { NoteParserUtil } from './note-parser.util';

export class GitContainer implements IContainer, IGitContainerExtension {
  private readonly logger = new Logger(GitContainer.name);
  readonly id: string;
  readonly name: string;
  readonly type: ContainerType = 'git';
  readonly description?: string;
  readonly rootPath: string;
  private git: SimpleGit;

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
        this.logger.log(`Created Git Container directory: ${this.rootPath}`);
      }

      this.git = simpleGit(this.rootPath);
      const isRepo = await this.git.checkIsRepo();

      if (!isRepo) {
        this.logger.log(`Initializing new Git repository for container ${this.id} at ${this.rootPath}`);
        await this.git.init();
        await this.git.addConfig('user.name', process.env.GIT_USER_NAME || 'Obsidian Container Engine');
        await this.git.addConfig('user.email', process.env.GIT_USER_EMAIL || 'container@obsidian.local');

        // Create initial starter note with rich tags
        const initFilePath = path.join(this.rootPath, 'Welcome.md');
        const initialContent = `---
title: Welcome to Git Container
tags: [git, sync, versioning, obsidian, history]
created: ${new Date().toISOString()}
---

# Welcome to ${this.name} (Git Backed)

This is a **Git Container** providing full revision tracking, change visualization, and synchronization.

## Features
- **Changes Display:** View changes since previous pull/sync (#sync #changes)
- **Tag Inspection:** Auto-extracts tags like #dev, #productivity, #project
- **3-Way Merging & Conflict Handling:** Full control over client vs. server changes
`;
        await fs.writeFile(initFilePath, initialContent, 'utf-8');
        await this.git.add('Welcome.md');
        await this.git.commit('chore: initialize git container workspace');
        this.logger.log(`[GitContainer:${this.id}] Initial repository commit created successfully.`);
      } else {
        this.logger.log(`[GitContainer:${this.id}] Found existing Git repository at ${this.rootPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize git repository for container ${this.id}`, error);
      throw error;
    }
  }

  async getSummary(): Promise<ContainerSummaryDto> {
    try {
      const head = await this.getHeadCommitHash();
      const log = await this.git.log({ maxCount: 1 }).catch(() => ({ latest: null }));
      const latest = log.latest;
      const allFiles = await this.listAllFilePaths();

      return {
        id: this.id,
        name: this.name,
        type: this.type,
        description: this.description,
        totalFiles: allFiles.length,
        currentCommit: head,
        lastCommitMessage: latest?.message,
        lastCommitDate: latest?.date,
        isGit: true,
      };
    } catch (error) {
      this.logger.error(`Error fetching summary for container ${this.id}`, error);
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        totalFiles: 0,
        isGit: true,
      };
    }
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

    return {
      path: safePath,
      content,
      metadata,
    };
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const safePath = this.sanitizeRelativePath(relativePath);
    const fullPath = path.join(this.rootPath, safePath);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async deleteFile(relativePath: string): Promise<void> {
    const safePath = this.sanitizeRelativePath(relativePath);
    const fullPath = path.join(this.rootPath, safePath);

    if (fsSync.existsSync(fullPath)) {
      await fs.unlink(fullPath);
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

  async getStatus(): Promise<SyncStatusDto> {
    try {
      const head = await this.getHeadCommitHash();
      const log = await this.git.log({ maxCount: 1 }).catch(() => ({ latest: null }));
      const latest = log.latest;
      const allFiles = await this.listAllFilePaths();

      return {
        status: 'ok',
        currentCommit: head,
        totalTrackedFiles: allFiles.length,
        repositoryPath: this.rootPath,
        lastCommitMessage: latest?.message,
        lastCommitDate: latest?.date,
      };
    } catch (error) {
      this.logger.error(`Error fetching sync status for container ${this.id}`, error);
      return {
        status: 'error',
        currentCommit: '',
        totalTrackedFiles: 0,
        repositoryPath: this.rootPath,
      };
    }
  }

  /**
   * Primary Git Feature: Displays all changes and discovered tags since previous pull/sync.
   */
  async getChangesSince(sinceCommit?: string): Promise<ContainerChangesResponseDto> {
    const serverCommit = await this.getHeadCommitHash();
    const files: FileDiffItemDto[] = [];
    const discoveredTagsSet = new Set<string>();

    if (!sinceCommit || sinceCommit === serverCommit) {
      return {
        containerId: this.id,
        containerType: this.type,
        serverCommit,
        baseCommit: sinceCommit,
        files: [],
        allDiscoveredTags: [],
        totalChanges: 0,
        hasConflicts: false,
      };
    }

    let isCommitValid = false;
    try {
      await this.git.catFile(['-e', `${sinceCommit}^{commit}`]);
      isCommitValid = true;
    } catch {
      this.logger.warn(`sinceCommit "${sinceCommit}" not found in git history for container ${this.id}.`);
    }

    if (isCommitValid) {
      const diffSummary = await this.git.diffSummary([sinceCommit, 'HEAD']);
      for (const diffFile of diffSummary.files) {
        const filePath = this.sanitizeRelativePath(diffFile.file);
        const fullPath = path.join(this.rootPath, filePath);
        const fileExists = fsSync.existsSync(fullPath);

        let status: 'added' | 'modified' | 'deleted' = 'modified';
        let metadata: ParsedNoteMetadataDto | undefined;

        if (!fileExists) {
          status = 'deleted';
        } else if (
          'changes' in diffFile &&
          'insertions' in diffFile &&
          'deletions' in diffFile &&
          (diffFile as any).changes === (diffFile as any).insertions &&
          (diffFile as any).deletions === 0
        ) {
          status = 'added';
        }

        if (fileExists && filePath.endsWith('.md')) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            metadata = NoteParserUtil.parse(content, path.basename(filePath, '.md'));
            metadata.tags.forEach((t) => discoveredTagsSet.add(t));
          } catch {
            // ignore metadata errors
          }
        }

        // Get diff patch snippet
        let patch: string | undefined;
        try {
          patch = await this.git.raw(['diff', `${sinceCommit}..HEAD`, '--', filePath]);
        } catch {
          // ignore patch errors
        }

        files.push({
          path: filePath,
          status,
          patch,
          metadata,
        });
      }
    } else {
      // Return all current files as added if sinceCommit was invalid
      const allFiles = await this.listAllFiles();
      for (const file of allFiles) {
        if (file.metadata) {
          file.metadata.tags.forEach((t) => discoveredTagsSet.add(t));
        }
        files.push({
          path: file.path,
          status: 'added',
          metadata: file.metadata,
        });
      }
    }

    return {
      containerId: this.id,
      containerType: this.type,
      serverCommit,
      baseCommit: sinceCommit,
      files,
      allDiscoveredTags: Array.from(discoveredTagsSet),
      totalChanges: files.length,
      hasConflicts: false,
    };
  }

  async diff(dto: SyncDiffRequestDto): Promise<SyncDiffResponseDto> {
    const serverCommit = await this.getHeadCommitHash();
    const diffItems: FileDiffItemDto[] = [];
    let hasConflicts = false;
    const discoveredTagsSet = new Set<string>();

    const serverModifiedFiles = new Set<string>();

    if (dto.baseCommit && dto.baseCommit !== serverCommit) {
      try {
        const diffSummary = await this.git.diffSummary([dto.baseCommit, 'HEAD']);
        for (const file of diffSummary.files) {
          serverModifiedFiles.add(this.sanitizeRelativePath(file.file));
        }
      } catch (err) {
        this.logger.warn(`Could not compute diff against baseCommit ${dto.baseCommit}: ${err.message}`);
      }
    }

    for (const localFile of dto.localChanges || []) {
      const safePath = this.sanitizeRelativePath(localFile.path);
      const serverFullPath = path.join(this.rootPath, safePath);
      const serverFileExists = fsSync.existsSync(serverFullPath);
      const serverContent = serverFileExists ? await fs.readFile(serverFullPath, 'utf-8') : '';

      // Parse metadata from local content
      let metadata: ParsedNoteMetadataDto | undefined;
      if (safePath.endsWith('.md')) {
        metadata = NoteParserUtil.parse(localFile.content, path.basename(safePath, '.md'));
        metadata.tags.forEach((t) => discoveredTagsSet.add(t));
      }

      const isServerModified = serverModifiedFiles.has(safePath);

      if (isServerModified) {
        if (localFile.content !== serverContent) {
          hasConflicts = true;
          diffItems.push({
            path: safePath,
            status: 'conflict',
            conflictInfo: {
              filePath: safePath,
              clientContent: localFile.content,
              serverContent,
              baseCommit: dto.baseCommit || '',
              serverCommit,
              diffSummary: 'File modified concurrently on client and server.',
            },
            metadata,
          });
          continue;
        }
      }

      if (!serverFileExists && !localFile.deleted) {
        diffItems.push({
          path: safePath,
          status: 'added',
          metadata,
        });
      } else if (localFile.deleted && serverFileExists) {
        diffItems.push({
          path: safePath,
          status: 'deleted',
          metadata,
        });
      } else if (localFile.content !== serverContent) {
        diffItems.push({
          path: safePath,
          status: 'modified',
          metadata,
        });
      }
    }

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
      const head = await this.getHeadCommitHash();
      return {
        success: true,
        newCommit: head,
        filesChanged: 0,
        message: 'No files provided to push.',
      };
    }

    let filesModifiedCount = 0;

    for (const file of dto.files) {
      const safeRelativePath = this.sanitizeRelativePath(file.path);
      const absoluteFilePath = path.join(this.rootPath, safeRelativePath);
      const resolution = dto.resolutions?.[file.path];

      if (resolution === ConflictStrategy.SERVER_WINS) {
        continue;
      }

      if (resolution === ConflictStrategy.CREATE_BACKUP_FORK) {
        const ext = path.extname(safeRelativePath);
        const nameWithoutExt = safeRelativePath.slice(0, safeRelativePath.length - ext.length);
        const forkPath = path.join(this.rootPath, `${nameWithoutExt}.client${ext}`);
        await fs.mkdir(path.dirname(forkPath), { recursive: true });
        await fs.writeFile(forkPath, file.content, 'utf-8');
        filesModifiedCount++;
        continue;
      }

      if (file.deleted) {
        if (fsSync.existsSync(absoluteFilePath)) {
          await fs.unlink(absoluteFilePath);
          filesModifiedCount++;
        }
      } else {
        await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
        await fs.writeFile(absoluteFilePath, file.content, 'utf-8');
        filesModifiedCount++;
      }
    }

    await this.git.add('.');
    const status = await this.git.status();

    let newCommitHash = await this.getHeadCommitHash();

    if (status.files.length > 0) {
      const commitMessage = dto.message || `sync: container ${this.id} update (${filesModifiedCount} files)`;
      const commitResult = await this.git.commit(commitMessage);
      newCommitHash = commitResult.commit || (await this.getHeadCommitHash());
      this.logger.log(`[GitContainer:${this.id}] Committed changes. New HEAD: ${newCommitHash}`);
    }

    return {
      success: true,
      newCommit: newCommitHash,
      filesChanged: filesModifiedCount,
      message: 'Changes successfully committed to Git container.',
    };
  }

  async pull(dto: SyncPullRequestDto): Promise<SyncPullResponseDto> {
    const headCommit = await this.getHeadCommitHash();

    if (dto.sinceCommit && dto.sinceCommit === headCommit) {
      return {
        commit: headCommit,
        files: [],
        isFullSync: false,
      };
    }

    let isIncremental = false;

    if (dto.sinceCommit) {
      try {
        await this.git.catFile(['-e', `${dto.sinceCommit}^{commit}`]);
        isIncremental = true;
      } catch {
        this.logger.warn(`sinceCommit "${dto.sinceCommit}" not found. Falling back to full sync.`);
        isIncremental = false;
      }
    }

    if (isIncremental && dto.sinceCommit) {
      const changedFiles: FileItemDto[] = [];
      const diffOutput = await this.git.raw(['diff', '--name-status', dto.sinceCommit, 'HEAD']);
      const lines = diffOutput.trim().split('\n').filter(Boolean);

      for (const line of lines) {
        const parts = line.split(/\s+/);
        const statusLetter = parts[0];
        const filePath = parts[1];

        if (!filePath) continue;

        const safePath = this.sanitizeRelativePath(filePath);
        const isDeleted = statusLetter.startsWith('D');
        let content = '';
        let metadata: ParsedNoteMetadataDto | undefined;

        if (!isDeleted) {
          const fullPath = path.join(this.rootPath, safePath);
          if (fsSync.existsSync(fullPath)) {
            content = await fs.readFile(fullPath, 'utf-8');
            if (safePath.endsWith('.md')) {
              metadata = NoteParserUtil.parse(content, path.basename(safePath, '.md'));
            }
          }
        }

        changedFiles.push({
          path: safePath,
          content,
          deleted: isDeleted,
          metadata,
        });
      }

      return {
        commit: headCommit,
        files: changedFiles,
        isFullSync: false,
      };
    }

    // Full snapshot
    const allFiles = await this.listAllFiles();
    return {
      commit: headCommit,
      files: allFiles,
      isFullSync: true,
    };
  }

  private async getHeadCommitHash(): Promise<string> {
    try {
      const hash = await this.git.revparse(['HEAD']);
      return hash.trim();
    } catch {
      return '';
    }
  }

  private async buildTreeNode(currentDir: string, relativeDir: string): Promise<FolderTreeNode> {
    const nodeName = relativeDir ? path.basename(relativeDir) : this.name;
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    const children: FolderTreeNode[] = [];

    for (const entry of entries) {
      if (entry.name === '.git' || entry.name.startsWith('.')) continue;

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
          // ignore metadata read errors
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
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === '.git' || entry.name.startsWith('.')) continue;

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

  // --- Time Machine Implementations ---

  async getCommits(limit = 50): Promise<CommitSummaryDto[]> {
    try {
      const log = await this.git.log({ maxCount: limit });
      return log.all.map((c) => ({
        hash: c.hash,
        shortHash: c.hash.substring(0, 7),
        author: c.author_name,
        authorEmail: c.author_email,
        date: c.date,
        message: c.message,
        body: c.body,
      }));
    } catch (err) {
      this.logger.warn(`Could not get commits for container ${this.id}: ${err.message}`);
      return [];
    }
  }

  async getCommitDetail(commitHash: string): Promise<CommitDetailDto> {
    try {
      // Get commit basic info
      const log = await this.git.log({ from: commitHash, maxCount: 1 });
      const commit = log.latest || {
        hash: commitHash,
        author_name: 'Unknown',
        author_email: '',
        date: new Date().toISOString(),
        message: 'Commit details',
        body: '',
      };

      // Check if root commit or has parent
      let diffOutput = '';
      try {
        diffOutput = await this.git.raw(['show', '--name-status', '--oneline', commitHash]);
      } catch (e) {
        diffOutput = '';
      }

      // Parse changed files
      const files: CommitFileDiffDto[] = [];
      const lines = diffOutput.trim().split('\n');
      
      // Skip the first line if it's the oneline header
      const fileLines = lines.length > 0 && lines[0].includes(commitHash.substring(0, 7)) ? lines.slice(1) : lines;

      for (const line of fileLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(/\s+/);
        const statusLetter = parts[0];
        const filePath = parts[1];

        if (!filePath) continue;

        let status: CommitFileDiffDto['status'] = 'modified';
        if (statusLetter.startsWith('A')) status = 'added';
        else if (statusLetter.startsWith('D')) status = 'deleted';
        else if (statusLetter.startsWith('R')) status = 'renamed';
        else if (statusLetter.startsWith('C')) status = 'copied';

        // Extract individual file patch
        let patch = '';
        try {
          patch = await this.git.raw(['show', `${commitHash}`, '--', filePath]);
        } catch {
          patch = '';
        }

        files.push({
          path: this.sanitizeRelativePath(filePath),
          status,
          patch,
        });
      }

      return {
        hash: commit.hash,
        shortHash: commit.hash.substring(0, 7),
        author: commit.author_name,
        authorEmail: commit.author_email,
        date: commit.date,
        message: commit.message,
        body: commit.body,
        filesChanged: files.length,
        files,
      };
    } catch (err) {
      this.logger.error(`Error retrieving commit detail for ${commitHash}:`, err);
      throw new Error(`Failed to get commit detail: ${err.message}`);
    }
  }

  async getFileHistory(filePath: string, limit = 50): Promise<CommitSummaryDto[]> {
    const safePath = this.sanitizeRelativePath(filePath);
    try {
      const log = await this.git.log({ file: safePath, maxCount: limit });
      return log.all.map((c) => ({
        hash: c.hash,
        shortHash: c.hash.substring(0, 7),
        author: c.author_name,
        authorEmail: c.author_email,
        date: c.date,
        message: c.message,
        body: c.body,
      }));
    } catch (err) {
      this.logger.warn(`Could not get file history for ${safePath}: ${err.message}`);
      return [];
    }
  }

  async getFileAtCommit(filePath: string, commitHash: string): Promise<FileVersionDto> {
    const safePath = this.sanitizeRelativePath(filePath);
    try {
      const content = await this.git.show([`${commitHash}:${safePath}`]);
      let author = 'Unknown';
      let date = new Date().toISOString();
      let message = '';

      try {
        const log = await this.git.log({ from: commitHash, maxCount: 1 });
        if (log.latest) {
          author = log.latest.author_name;
          date = log.latest.date;
          message = log.latest.message;
        }
      } catch {
        // use defaults if log lookup fails
      }

      let metadata: ParsedNoteMetadataDto | undefined;
      if (safePath.endsWith('.md')) {
        metadata = NoteParserUtil.parse(content, path.basename(safePath, '.md'));
      }

      return {
        commitHash,
        shortHash: commitHash.substring(0, 7),
        path: safePath,
        content,
        author,
        date,
        message,
        metadata,
      };
    } catch (err) {
      this.logger.error(`Error retrieving file "${safePath}" at commit "${commitHash}":`, err);
      throw new Error(`Could not load revision: ${err.message}`);
    }
  }

  async restoreFileVersion(
    dto: RestoreFileVersionRequestDto
  ): Promise<{ success: boolean; commit: string; message: string }> {
    const safePath = this.sanitizeRelativePath(dto.path);
    try {
      const content = await this.git.show([`${dto.commitHash}:${safePath}`]);
      const fullPath = path.join(this.rootPath, safePath);

      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');

      await this.git.add(safePath);
      const commitMsg = dto.message || `Time Machine: Revert "${safePath}" to commit ${dto.commitHash.substring(0, 7)}`;
      const result = await this.git.commit(commitMsg);
      const newCommit = result.commit || (await this.getHeadCommitHash());

      return {
        success: true,
        commit: newCommit,
        message: commitMsg,
      };
    } catch (err) {
      this.logger.error(`Error reverting file "${safePath}" to commit "${dto.commitHash}":`, err);
      throw new Error(`Failed to restore file revision: ${err.message}`);
    }
  }
}

