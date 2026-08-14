import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { Subject, Observable } from 'rxjs';
import {
  FileItemDto,
  FileDiffItemDto,
  SyncPushRequestDto,
  SyncPushResponseDto,
  SyncPullRequestDto,
  SyncPullResponseDto,
  SyncDiffRequestDto,
  SyncDiffResponseDto,
  SyncStatusDto,
  SyncServerEventDto,
  ConflictStrategy,
} from '@workspace/shared';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);
  private git: SimpleGit;
  private vaultPath: string;
  private readonly events$ = new Subject<SyncServerEventDto>();

  constructor() {
    this.vaultPath = process.env.VAULT_STORAGE_PATH || path.resolve(process.cwd(), 'data', 'vault');
  }

  async onModuleInit(): Promise<void> {
    await this.initializeRepository();
  }

  /**
   * Returns an Observable stream for Server-Sent Events (SSE).
   */
  getEventsStream(): Observable<SyncServerEventDto> {
    return this.events$.asObservable();
  }

  /**
   * Initializes the local Git repository inside the configured vault directory.
   */
  public async initializeRepository(): Promise<void> {
    try {
      if (!fsSync.existsSync(this.vaultPath)) {
        await fs.mkdir(this.vaultPath, { recursive: true });
        this.logger.log(`Created vault directory: ${this.vaultPath}`);
      }

      this.git = simpleGit(this.vaultPath);
      const isRepo = await this.git.checkIsRepo();

      if (!isRepo) {
        this.logger.log(`Initializing new Git repository at ${this.vaultPath}`);
        await this.git.init();
        await this.git.addConfig('user.name', process.env.GIT_USER_NAME || 'Obsidian Sync Server');
        await this.git.addConfig('user.email', process.env.GIT_USER_EMAIL || 'sync@obsidian.local');

        // Create an initial commit to establish HEAD branch
        const initFilePath = path.join(this.vaultPath, '.vault-init.md');
        await fs.writeFile(initFilePath, '# Obsidian Vault Initialized\n\nManaged by Custom Sync Server.', 'utf-8');
        await this.git.add('.vault-init.md');
        await this.git.commit('chore: initialize workspace repository');
        this.logger.log('Initial repository commit created successfully.');
      } else {
        this.logger.log(`Git repository found at ${this.vaultPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize git repository at ${this.vaultPath}`, error);
      throw error;
    }
  }

  /**
   * Retrieves current repository status and HEAD commit hash.
   */
  async getStatus(): Promise<SyncStatusDto> {
    try {
      const head = await this.getHeadCommitHash();
      const log = await this.git.log({ maxCount: 1 });
      const latest = log.latest;
      const allFiles = await this.listAllVaultFiles();

      return {
        status: 'ok',
        currentCommit: head,
        totalTrackedFiles: allFiles.length,
        repositoryPath: this.vaultPath,
        lastCommitMessage: latest?.message,
        lastCommitDate: latest?.date,
      };
    } catch (error) {
      this.logger.error('Error fetching sync status', error);
      return {
        status: 'error',
        currentCommit: '',
        totalTrackedFiles: 0,
        repositoryPath: this.vaultPath,
      };
    }
  }

  /**
   * Pushes incoming client file modifications into the Git repository and commits them.
   *
   * CONFLICT HANDLING IN PUSH:
   * -------------------------------------------------------------
   * If a client pushes files with resolved conflict decisions:
   * - CLIENT_WINS: writes client content directly.
   * - SERVER_WINS: ignores client content for that file.
   * - CREATE_BACKUP_FORK: writes client content to a separate `*.client.md` file.
   */
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
      const absoluteFilePath = path.join(this.vaultPath, safeRelativePath);
      const resolution = dto.resolutions?.[file.path];

      if (resolution === ConflictStrategy.SERVER_WINS) {
        // Skip overwriting, keeping server version
        continue;
      }

      if (resolution === ConflictStrategy.CREATE_BACKUP_FORK) {
        // Write the client file as a fork/backup
        const ext = path.extname(safeRelativePath);
        const nameWithoutExt = safeRelativePath.slice(0, safeRelativePath.length - ext.length);
        const forkPath = path.join(this.vaultPath, `${nameWithoutExt}.client${ext}`);
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

    // Stage changes in git
    await this.git.add('.');
    const status = await this.git.status();

    let newCommitHash = await this.getHeadCommitHash();

    if (status.files.length > 0) {
      const commitMessage = dto.message || `sync: client update (${filesModifiedCount} files)`;
      const commitResult = await this.git.commit(commitMessage);
      newCommitHash = commitResult.commit || (await this.getHeadCommitHash());

      this.events$.next({
        type: 'commit_created',
        commit: newCommitHash,
        timestamp: new Date().toISOString(),
        message: commitMessage,
      });

      this.logger.log(`Committed ${status.files.length} changes. New HEAD: ${newCommitHash}`);
    }

    return {
      success: true,
      newCommit: newCommitHash,
      filesChanged: filesModifiedCount,
      message: 'Changes successfully committed to repository.',
    };
  }

  /**
   * Pulls server changes. Returns either incremental changes since `sinceCommit`,
   * or a full snapshot of the vault.
   */
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
        // Verify that sinceCommit exists in history
        await this.git.catFile(['-e', `${dto.sinceCommit}^{commit}`]);
        isIncremental = true;
      } catch {
        this.logger.warn(`sinceCommit "${dto.sinceCommit}" not found in git history. Falling back to full sync.`);
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

        const isDeleted = statusLetter.startsWith('D');
        let content = '';

        if (!isDeleted) {
          const fullPath = path.join(this.vaultPath, filePath);
          if (fsSync.existsSync(fullPath)) {
            content = await fs.readFile(fullPath, 'utf-8');
          }
        }

        changedFiles.push({
          path: filePath,
          content,
          deleted: isDeleted,
        });
      }

      return {
        commit: headCommit,
        files: changedFiles,
        isFullSync: false,
      };
    }

    // Full sync: return all tracked files
    const allFilePaths = await this.listAllVaultFiles();
    const files: FileItemDto[] = [];

    for (const relPath of allFilePaths) {
      const fullPath = path.join(this.vaultPath, relPath);
      const content = await fs.readFile(fullPath, 'utf-8');
      files.push({
        path: relPath,
        content,
        deleted: false,
      });
    }

    return {
      commit: headCommit,
      files,
      isFullSync: true,
    };
  }

  /**
   * Computes diff and identifies conflicts between client local changes and server HEAD.
   *
   * CONFLICT DETECTION ALGORITHM:
   * -------------------------------------------------------------
   * 1. If baseCommit equals server HEAD:
   *    All local changes are clean additions/modifications (no conflicts).
   * 2. If baseCommit !== server HEAD:
   *    Fetch all files changed on the server between `baseCommit` and `HEAD`.
   *    If any client modified file matches a server changed file, inspect whether contents differ:
   *    - If contents differ: status = 'conflict', populate conflictInfo with both versions.
   *    - If contents are identical: status = 'unmodified'.
   */
  async diff(dto: SyncDiffRequestDto): Promise<SyncDiffResponseDto> {
    const serverCommit = await this.getHeadCommitHash();
    const diffItems: FileDiffItemDto[] = [];
    let hasConflicts = false;

    const serverModifiedFiles = new Set<string>();

    if (dto.baseCommit && dto.baseCommit !== serverCommit) {
      try {
        const diffSummary = await this.git.diffSummary([dto.baseCommit, 'HEAD']);
        for (const file of diffSummary.files) {
          serverModifiedFiles.add(file.file);
        }
      } catch (err) {
        this.logger.warn(`Could not compute git diffSummary against baseCommit ${dto.baseCommit}: ${err.message}`);
      }
    }

    for (const localFile of dto.localChanges || []) {
      const safePath = this.sanitizeRelativePath(localFile.path);
      const serverFullPath = path.join(this.vaultPath, safePath);
      const serverFileExists = fsSync.existsSync(serverFullPath);
      const serverContent = serverFileExists ? await fs.readFile(serverFullPath, 'utf-8') : '';

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
          });
          continue;
        }
      }

      if (!serverFileExists && !localFile.deleted) {
        diffItems.push({
          path: safePath,
          status: 'added',
        });
      } else if (localFile.deleted && serverFileExists) {
        diffItems.push({
          path: safePath,
          status: 'deleted',
        });
      } else if (localFile.content !== serverContent) {
        diffItems.push({
          path: safePath,
          status: 'modified',
        });
      }
    }

    return {
      serverCommit,
      baseCommit: dto.baseCommit,
      files: diffItems,
      hasConflicts,
      totalChanges: diffItems.length,
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

  private async listAllVaultFiles(currentDir = this.vaultPath, relativePrefix = ''): Promise<string[]> {
    const results: string[] = [];
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === '.git') continue;

      const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.listAllVaultFiles(fullPath, relPath);
        results.push(...subFiles);
      } else if (entry.isFile()) {
        results.push(relPath);
      }
    }

    return results;
  }

  private sanitizeRelativePath(filePath: string): string {
    const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    return normalized.replace(/^[/\\]+/, '');
  }
}
