import { Injectable, Logger, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import {
  ContainerConfigDto,
  ContainerSummaryDto,
  RegisterContainerRequestDto,
  FolderTreeNode,
} from '@workspace/shared';
import { IContainer } from './container.interface';
import { SimpleContainer } from './simple-container';
import { GitContainer } from './git-container';

@Injectable()
export class ContainerManagerService implements OnModuleInit {
  private readonly logger = new Logger(ContainerManagerService.name);
  private readonly containers = new Map<string, IContainer>();
  private readonly baseStorageDir: string;
  private readonly registryConfigPath: string;

  constructor() {
    this.baseStorageDir = process.env.CONTAINER_STORAGE_DIR || path.resolve(process.cwd(), 'data');
    this.registryConfigPath = path.join(this.baseStorageDir, 'containers.json');
  }

  async onModuleInit(): Promise<void> {
    await this.initializeRegistry();
  }

  /**
   * Initializes storage directories and loads or seeds registered containers.
   */
  public async initializeRegistry(): Promise<void> {
    try {
      if (!fsSync.existsSync(this.baseStorageDir)) {
        await fs.mkdir(this.baseStorageDir, { recursive: true });
      }

      let configs: ContainerConfigDto[] = [];

      if (fsSync.existsSync(this.registryConfigPath)) {
        try {
          const raw = await fs.readFile(this.registryConfigPath, 'utf-8');
          configs = JSON.parse(raw);
        } catch (err) {
          this.logger.warn(`Could not parse ${this.registryConfigPath}, re-seeding default containers.`);
        }
      }

      // If empty, seed default containers
      if (!configs || configs.length === 0) {
        configs = [
          {
            id: 'main-git-vault',
            name: 'Main Git Vault',
            type: 'git',
            description: 'Primary version-controlled Obsidian container with Git history and diff engine.',
            rootPath: path.join(this.baseStorageDir, 'vaults', 'main-git-vault'),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'simple-notes',
            name: 'Simple Notes Vault',
            type: 'simple',
            description: 'Stateless, lightweight container for fast file tree loading and note parsing.',
            rootPath: path.join(this.baseStorageDir, 'vaults', 'simple-notes'),
            createdAt: new Date().toISOString(),
          },
        ];
        await this.saveConfigs(configs);
      }

      // Instantiate and initialize each container
      for (const config of configs) {
        await this.instantiateAndRegister(config);
      }

      this.logger.log(`Initialized ${this.containers.size} containers successfully.`);
    } catch (error) {
      this.logger.error('Failed to initialize container registry', error);
    }
  }

  /**
   * Returns a list of summaries for all registered containers.
   */
  async listContainers(): Promise<ContainerSummaryDto[]> {
    const summaries: ContainerSummaryDto[] = [];
    for (const container of this.containers.values()) {
      try {
        const summary = await container.getSummary();
        summaries.push(summary);
      } catch (err) {
        this.logger.error(`Error loading summary for container ${container.id}`, err);
      }
    }
    return summaries;
  }

  /**
   * Retrieves a container instance by ID.
   */
  getContainer(id: string): IContainer {
    const container = this.containers.get(id);
    if (!container) {
      throw new NotFoundException(`Container with ID "${id}" not found.`);
    }
    return container;
  }

  /**
   * Retrieves a GitContainer instance by ID or throws if not a git container.
   */
  getGitContainer(id: string): GitContainer {
    const container = this.getContainer(id);
    if (container.type !== 'git' || !(container instanceof GitContainer)) {
      throw new BadRequestException(`Container "${id}" is of type "${container.type}", not "git".`);
    }
    return container;
  }

  /**
   * Registers a new container dynamically (Simple or Git).
   */
  async registerContainer(dto: RegisterContainerRequestDto): Promise<ContainerSummaryDto> {
    const id = (dto.id || dto.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')).trim();

    if (this.containers.has(id)) {
      throw new BadRequestException(`Container with ID "${id}" already exists.`);
    }

    const rootPath = dto.rootPath || path.join(this.baseStorageDir, 'vaults', id);
    const config: ContainerConfigDto = {
      id,
      name: dto.name,
      type: dto.type,
      description: dto.description,
      rootPath,
      createdAt: new Date().toISOString(),
    };

    const container = await this.instantiateAndRegister(config);

    // Persist to registry
    const currentConfigs = await this.loadConfigs();
    currentConfigs.push(config);
    await this.saveConfigs(currentConfigs);

    return container.getSummary();
  }

  /**
   * Deletes a registered container from memory and config.
   */
  async deleteContainer(id: string): Promise<boolean> {
    if (!this.containers.has(id)) {
      throw new NotFoundException(`Container "${id}" not found.`);
    }

    this.containers.delete(id);
    const currentConfigs = await this.loadConfigs();
    const updated = currentConfigs.filter((c) => c.id !== id);
    await this.saveConfigs(updated);

    return true;
  }

  /**
   * Gets hierarchical folder and file tree for a container.
   */
  async getContainerTree(id: string): Promise<FolderTreeNode> {
    const container = this.getContainer(id);
    return container.getTree();
  }

  private async instantiateAndRegister(config: ContainerConfigDto): Promise<IContainer> {
    let instance: IContainer;

    if (config.type === 'git') {
      instance = new GitContainer(config.id, config.name, config.rootPath || path.join(this.baseStorageDir, 'vaults', config.id), config.description);
    } else {
      instance = new SimpleContainer(config.id, config.name, config.rootPath || path.join(this.baseStorageDir, 'vaults', config.id), config.description);
    }

    await instance.initialize();
    this.containers.set(config.id, instance);
    return instance;
  }

  private async loadConfigs(): Promise<ContainerConfigDto[]> {
    if (!fsSync.existsSync(this.registryConfigPath)) return [];
    try {
      const raw = await fs.readFile(this.registryConfigPath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private async saveConfigs(configs: ContainerConfigDto[]): Promise<void> {
    await fs.writeFile(this.registryConfigPath, JSON.stringify(configs, null, 2), 'utf-8');
  }
}
