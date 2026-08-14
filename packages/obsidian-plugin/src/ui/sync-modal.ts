import { App, Modal, Notice } from 'obsidian';
import { SyncApiClient } from '../services/api-client';
import { ClientNoteParser } from '../services/note-parser';
import { WorkspaceSyncPluginSettings } from '../types';
import {
  FileDiffItemDto,
  ContainerSummaryDto,
  ContainerChangesResponseDto,
  FolderTreeNode,
  FileItemDto,
} from '@workspace/shared';

export class SyncModal extends Modal {
  private apiClient: SyncApiClient;
  private settings: WorkspaceSyncPluginSettings;
  private onSaveSettings: () => Promise<void>;

  private availableContainers: ContainerSummaryDto[] = [];
  private activeContainer: ContainerSummaryDto | null = null;
  private changesData: ContainerChangesResponseDto | null = null;
  private simpleTreeData: FolderTreeNode | null = null;
  private simpleFilesList: FileItemDto[] = [];

  private isLoading = false;
  private selectedTagFilter: string | null = null;
  private expandedDiffs = new Set<string>();

  constructor(
    app: App,
    apiClient: SyncApiClient,
    settings: WorkspaceSyncPluginSettings,
    onSaveSettings: () => Promise<void>
  ) {
    super(app);
    this.apiClient = apiClient;
    this.settings = settings;
    this.onSaveSettings = onSaveSettings;
  }

  async onOpen() {
    this.modalEl.addClass('custom-sync-modal-frame');
    await this.loadContainersAndSync();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  /**
   * Fetches container list and synchronizes state with the selected container.
   */
  async loadContainersAndSync() {
    this.isLoading = true;
    this.render();

    try {
      // 1. Fetch available containers
      this.availableContainers = await this.apiClient.listContainers();

      // Find active container
      let current = this.availableContainers.find(
        (c) => c.id === this.settings.activeContainerId
      );
      if (!current && this.availableContainers.length > 0) {
        current = this.availableContainers[0];
        this.settings.activeContainerId = current.id;
        await this.onSaveSettings();
      }
      this.activeContainer = current || null;

      // 2. Fetch container-specific state
      if (this.activeContainer) {
        if (this.activeContainer.type === 'git') {
          await this.refreshGitChanges();
        } else {
          await this.refreshSimpleFiles();
        }
      }
    } catch (error) {
      new Notice(`Failed to connect to container server: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  async refreshGitChanges() {
    if (!this.activeContainer) return;
    try {
      this.changesData = await this.apiClient.getChangesSinceSync(
        this.activeContainer.id,
        this.settings.lastSyncedCommit || undefined
      );
    } catch (error) {
      new Notice(`Failed to fetch Git changes: ${error.message}`);
      this.changesData = null;
    }
  }

  async refreshSimpleFiles() {
    if (!this.activeContainer) return;
    try {
      this.simpleTreeData = await this.apiClient.getContainerTree(this.activeContainer.id);
      this.simpleFilesList = await this.apiClient.listContainerFiles(this.activeContainer.id);

      // Compute local diff against simple container
      const markdownFiles = this.app.vault.getMarkdownFiles();
      const localFiles: FileItemDto[] = [];
      for (const file of markdownFiles) {
        const content = await this.app.vault.read(file);
        const metadata = ClientNoteParser.parse(content, file.basename);
        localFiles.push({
          path: file.path,
          content,
          metadata,
        });
      }

      const diffResult = await this.apiClient.getContainerDiff(this.activeContainer.id, {
        baseCommit: this.settings.lastSyncedCommit || undefined,
        localChanges: localFiles,
      });

      const discoveredTags = new Set<string>();
      for (const f of this.simpleFilesList) {
        if (f.metadata?.tags) {
          f.metadata.tags.forEach((t) => discoveredTags.add(t));
        }
      }
      if (diffResult.allDiscoveredTags) {
        diffResult.allDiscoveredTags.forEach((t) => discoveredTags.add(t));
      }

      this.changesData = {
        containerId: this.activeContainer.id,
        containerType: 'simple',
        serverCommit: diffResult.serverCommit,
        baseCommit: diffResult.baseCommit,
        files: diffResult.files,
        allDiscoveredTags: Array.from(discoveredTags),
        totalChanges: diffResult.totalChanges,
        hasConflicts: diffResult.hasConflicts,
      };
    } catch (error) {
      new Notice(`Failed to fetch Simple container data: ${error.message}`);
      this.simpleTreeData = null;
      this.simpleFilesList = [];
      this.changesData = null;
    }
  }

  private render() {
    const { contentEl } = this;
    contentEl.empty();

    // 1. Header Frame
    this.renderHeader(contentEl);

    if (this.isLoading) {
      const loader = contentEl.createDiv({ cls: 'custom-sync-loading-state' });
      loader.createDiv({ cls: 'custom-sync-spinner' });
      loader.createEl('p', { text: 'Inspecting container & calculating changes...' });
      return;
    }

    if (!this.activeContainer) {
      const emptyState = contentEl.createDiv({ cls: 'custom-sync-empty-state' });
      emptyState.createEl('h3', { text: 'No Container Connected' });
      emptyState.createEl('p', { text: 'Ensure the backend server is running and containers are registered.' });
      return;
    }

    // 2. Overview Metrics Strip
    this.renderMetricsStrip(contentEl);

    // 3. Discovered Tags Filter Bar
    this.renderTagFilters(contentEl);

    // 4. File Cards / Changes View
    const contentFrame = contentEl.createDiv({ cls: 'custom-sync-main-frame' });
    if (this.changesData && this.changesData.files.length > 0) {
      this.renderChangesList(contentFrame);
    } else if (this.activeContainer.type === 'simple') {
      this.renderSimpleFilesList(contentFrame);
    } else {
      this.renderChangesList(contentFrame);
    }

    // 5. Actions Hub Footer
    this.renderFooterActions(contentEl);
  }

  private renderHeader(container: HTMLElement) {
    const header = container.createDiv({ cls: 'custom-sync-frame-header' });

    // Left: Title & Container selector
    const leftCol = header.createDiv({ cls: 'custom-sync-header-left' });
    const titleRow = leftCol.createDiv({ cls: 'custom-sync-title-row' });
    titleRow.createEl('h2', { text: 'Obsidian Container Hub' });

    if (this.activeContainer) {
      titleRow.createSpan({
        cls: `custom-container-badge ${this.activeContainer.type}`,
        text: this.activeContainer.type === 'git' ? '⚡ GIT CONTAINER' : '📁 SIMPLE CONTAINER',
      });
    }

    // Container Selector Dropdown
    if (this.availableContainers.length > 0) {
      const selectorRow = leftCol.createDiv({ cls: 'custom-sync-selector-row' });
      selectorRow.createSpan({ cls: 'custom-sync-selector-label', text: 'Active Container:' });

      const select = selectorRow.createEl('select', { cls: 'dropdown custom-container-select' });
      for (const c of this.availableContainers) {
        const option = select.createEl('option', {
          value: c.id,
          text: `${c.name} (${c.type.toUpperCase()})`,
        });
        if (c.id === this.activeContainer?.id) {
          option.selected = true;
        }
      }

      select.onchange = async () => {
        this.settings.activeContainerId = select.value;
        this.selectedTagFilter = null;
        await this.onSaveSettings();
        await this.loadContainersAndSync();
      };
    }

    // Right: Status Badges
    const rightCol = header.createDiv({ cls: 'custom-sync-header-right' });
    const statusPill = rightCol.createDiv({ cls: 'custom-sync-status-pill connected' });
    statusPill.createSpan({ cls: 'status-dot' });
    statusPill.createSpan({ text: 'Online' });

    if (this.activeContainer?.type === 'git') {
      const commitPill = rightCol.createDiv({ cls: 'custom-sync-commit-pill' });
      const currentCommit = this.changesData?.serverCommit || this.activeContainer.currentCommit || 'initial';
      commitPill.setText(`HEAD: ${currentCommit.slice(0, 7)}`);
      commitPill.title = `Full commit: ${currentCommit}`;
    } else if (this.activeContainer?.type === 'simple') {
      const modePill = rightCol.createDiv({ cls: 'custom-sync-commit-pill' });
      modePill.setText('Direct FS');
      modePill.title = 'Stateless direct filesystem storage';
    }
  }

  private renderMetricsStrip(container: HTMLElement) {
    const strip = container.createDiv({ cls: 'custom-sync-metrics-strip' });

    if (this.activeContainer?.type === 'git' && this.changesData) {
      const addedCount = this.changesData.files.filter((f) => f.status === 'added').length;
      const modifiedCount = this.changesData.files.filter((f) => f.status === 'modified').length;
      const deletedCount = this.changesData.files.filter((f) => f.status === 'deleted').length;
      const tagCount = this.changesData.allDiscoveredTags.length;

      this.createMetricCard(strip, 'Changes', `${this.changesData.totalChanges}`, 'var(--text-accent)');
      this.createMetricCard(strip, 'Added', `+${addedCount}`, '#2ecc71');
      this.createMetricCard(strip, 'Modified', `~${modifiedCount}`, '#f1c40f');
      this.createMetricCard(strip, 'Deleted', `-${deletedCount}`, '#e74c3c');
      this.createMetricCard(strip, 'Tags Extracted', `${tagCount}`, '#9b59b6');
    } else {
      const totalFiles = this.simpleFilesList.length;
      const allTags = new Set<string>();
      let totalWords = 0;

      for (const f of this.simpleFilesList) {
        if (f.metadata) {
          f.metadata.tags.forEach((t) => allTags.add(t));
          totalWords += f.metadata.wordCount || 0;
        }
      }

      const diffCount = this.changesData?.totalChanges || 0;

      this.createMetricCard(strip, 'Total Notes', `${totalFiles}`, 'var(--text-accent)');
      this.createMetricCard(strip, 'Local Diff', `${diffCount}`, diffCount > 0 ? '#f1c40f' : '#2ecc71');
      this.createMetricCard(strip, 'Tags Discovered', `${allTags.size}`, '#9b59b6');
      this.createMetricCard(strip, 'Total Words', `${totalWords.toLocaleString()}`, '#3498db');
    }
  }

  private createMetricCard(container: HTMLElement, label: string, value: string, color: string) {
    const card = container.createDiv({ cls: 'custom-metric-card' });
    const valEl = card.createSpan({ cls: 'custom-metric-value', text: value });
    valEl.style.color = color;
    card.createSpan({ cls: 'custom-metric-label', text: label });
  }

  private renderTagFilters(container: HTMLElement) {
    const allTags: string[] = [];

    if (this.changesData?.allDiscoveredTags && this.changesData.allDiscoveredTags.length > 0) {
      allTags.push(...this.changesData.allDiscoveredTags);
    } else if (this.simpleFilesList.length > 0) {
      const tagSet = new Set<string>();
      for (const file of this.simpleFilesList) {
        if (file.metadata?.tags) {
          file.metadata.tags.forEach((t) => tagSet.add(t));
        }
      }
      allTags.push(...Array.from(tagSet));
    }

    if (allTags.length === 0) return;

    const tagFilterBar = container.createDiv({ cls: 'custom-sync-tag-bar' });
    tagFilterBar.createSpan({ cls: 'custom-sync-tag-bar-title', text: '🏷️ Filter by Tag:' });

    // "All" chip
    const allChip = tagFilterBar.createSpan({
      cls: `custom-tag-chip ${!this.selectedTagFilter ? 'active' : ''}`,
      text: '#all',
    });
    allChip.onclick = () => {
      this.selectedTagFilter = null;
      this.render();
    };

    // Unique tags
    for (const tag of Array.from(new Set(allTags)).slice(0, 15)) {
      const isSelected = this.selectedTagFilter === tag;
      const chip = tagFilterBar.createSpan({
        cls: `custom-tag-chip ${isSelected ? 'active' : ''}`,
        text: tag,
      });
      chip.onclick = () => {
        this.selectedTagFilter = isSelected ? null : tag;
        this.render();
      };
    }
  }

  private renderChangesList(container: HTMLElement) {
    if (!this.changesData || this.changesData.files.length === 0) {
      const empty = container.createDiv({ cls: 'custom-sync-empty-state' });
      empty.createDiv({ cls: 'custom-sync-empty-icon', text: '✨' });
      empty.createEl('h4', { text: 'Vault is in sync' });
      empty.createEl('p', { text: 'No pending local modifications or remote updates detected.' });
      return;
    }

    const filteredFiles = this.selectedTagFilter
      ? this.changesData.files.filter((f) => f.metadata?.tags?.includes(this.selectedTagFilter!))
      : this.changesData.files;

    if (filteredFiles.length === 0) {
      const empty = container.createDiv({ cls: 'custom-sync-empty-state' });
      empty.createEl('p', { text: `No changed files found matching tag ${this.selectedTagFilter}` });
      return;
    }

    const listEl = container.createDiv({ cls: 'custom-sync-cards-container' });

    for (const file of filteredFiles) {
      this.renderFileCard(listEl, file);
    }
  }

  private renderSimpleFilesList(container: HTMLElement) {
    if (this.simpleFilesList.length === 0) {
      const empty = container.createDiv({ cls: 'custom-sync-empty-state' });
      empty.createEl('h4', { text: 'Container is empty' });
      empty.createEl('p', { text: 'No files found in this Simple Container.' });
      return;
    }

    const filteredFiles = this.selectedTagFilter
      ? this.simpleFilesList.filter((f) => f.metadata?.tags?.includes(this.selectedTagFilter!))
      : this.simpleFilesList;

    const listEl = container.createDiv({ cls: 'custom-sync-cards-container' });

    for (const file of filteredFiles) {
      const diffItem: FileDiffItemDto = {
        path: file.path,
        status: 'unmodified',
        metadata: file.metadata,
      };
      this.renderFileCard(listEl, diffItem);
    }
  }

  private renderFileCard(container: HTMLElement, file: FileDiffItemDto) {
    const card = container.createDiv({ cls: `custom-file-card ${file.status}` });

    // Top row: Status Tag & Path & Words
    const topRow = card.createDiv({ cls: 'custom-file-card-top' });

    const leftInfo = topRow.createDiv({ cls: 'custom-file-card-path-group' });
    leftInfo.createSpan({
      cls: `custom-sync-tag ${file.status}`,
      text: file.status.toUpperCase(),
    });

    const pathSpan = leftInfo.createSpan({ cls: 'custom-file-card-path', text: file.path });
    if (file.metadata?.title && file.metadata.title !== file.path) {
      leftInfo.createSpan({ cls: 'custom-file-card-title', text: `— ${file.metadata.title}` });
    }

    const rightMeta = topRow.createDiv({ cls: 'custom-file-card-meta' });
    if (file.metadata?.wordCount) {
      rightMeta.createSpan({
        cls: 'custom-file-card-words',
        text: `📝 ${file.metadata.wordCount} words`,
      });
    }

    // Extracted tags row
    if (file.metadata?.tags && file.metadata.tags.length > 0) {
      const tagsRow = card.createDiv({ cls: 'custom-file-card-tags' });
      for (const tag of file.metadata.tags) {
        tagsRow.createSpan({ cls: 'custom-mini-tag', text: tag });
      }
    }

    // Headings summary
    if (file.metadata?.headings && file.metadata.headings.length > 0) {
      const headingsRow = card.createDiv({ cls: 'custom-file-card-headings' });
      headingsRow.createSpan({ cls: 'custom-heading-label', text: 'Sections:' });
      headingsRow.createSpan({
        cls: 'custom-heading-list',
        text: file.metadata.headings.slice(0, 3).join(' • ') + (file.metadata.headings.length > 3 ? ' ...' : ''),
      });
    }

    // Expandable Diff Preview (for modified files)
    if (file.patch) {
      const isExpanded = this.expandedDiffs.has(file.path);
      const diffToggle = card.createDiv({ cls: 'custom-diff-toggle' });
      diffToggle.createSpan({
        cls: 'custom-diff-toggle-btn',
        text: isExpanded ? '▲ Hide Diff' : '▼ Inspect Diff Preview',
      });
      diffToggle.onclick = () => {
        if (isExpanded) {
          this.expandedDiffs.delete(file.path);
        } else {
          this.expandedDiffs.add(file.path);
        }
        this.render();
      };

      if (isExpanded) {
        const patchBlock = card.createEl('pre', { cls: 'custom-diff-patch-view' });
        patchBlock.setText(file.patch);
      }
    }
  }

  private renderFooterActions(container: HTMLElement) {
    const footer = container.createDiv({ cls: 'custom-sync-frame-footer' });

    const leftActions = footer.createDiv({ cls: 'custom-footer-left' });
    const refreshBtn = leftActions.createEl('button', { text: '🔄 Refresh' });
    refreshBtn.onclick = () => this.loadContainersAndSync();

    const rightActions = footer.createDiv({ cls: 'custom-footer-right' });

    const pullBtn = rightActions.createEl('button', {
      text: this.activeContainer?.type === 'git' ? '⬇️ Pull Changes' : '⬇️ Pull from Container',
    });
    pullBtn.onclick = () => this.handlePull();

    const pushBtn = rightActions.createEl('button', {
      text: this.activeContainer?.type === 'git' ? '⬆️ Push Changes' : '⬆️ Push to Container',
      cls: 'mod-cta',
    });
    pushBtn.onclick = () => this.handlePush();
  }

  private async handlePush() {
    if (!this.activeContainer) return;
    try {
      new Notice(`Pushing changes to ${this.activeContainer.name}...`);
      const markdownFiles = this.app.vault.getMarkdownFiles();
      const filesToPush: FileItemDto[] = [];

      for (const file of markdownFiles) {
        const content = await this.app.vault.read(file);
        const metadata = ClientNoteParser.parse(content, file.basename);
        filesToPush.push({
          path: file.path,
          content,
          metadata,
        });
      }

      const result = await this.apiClient.pushContainerChanges(this.activeContainer.id, {
        baseCommit: this.settings.lastSyncedCommit || undefined,
        files: filesToPush,
        message: `Sync from Obsidian client at ${new Date().toISOString()}`,
      });

      if (result.success) {
        this.settings.lastSyncedCommit = result.newCommit;
        await this.onSaveSettings();
        const shortCommit = result.newCommit.length > 7 ? result.newCommit.slice(0, 7) : result.newCommit;
        new Notice(`Push Successful! Revision: ${shortCommit}`);
        await this.loadContainersAndSync();
      }
    } catch (error) {
      new Notice(`Push failed: ${error.message}`);
    }
  }

  private async handlePull() {
    if (!this.activeContainer) return;
    try {
      new Notice(`Pulling updates from ${this.activeContainer.name}...`);
      const result = await this.apiClient.pullContainerChanges(this.activeContainer.id, {
        sinceCommit: this.settings.lastSyncedCommit || undefined,
      });

      for (const file of result.files) {
        const abstractFile = this.app.vault.getAbstractFileByPath(file.path);

        if (file.deleted) {
          if (abstractFile) {
            await this.app.vault.delete(abstractFile);
          }
        } else {
          if (abstractFile) {
            await this.app.vault.modify(abstractFile as any, file.content);
          } else {
            const folderPath = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';
            if (folderPath && !this.app.vault.getAbstractFileByPath(folderPath)) {
              await this.app.vault.createFolder(folderPath);
            }
            await this.app.vault.create(file.path, file.content);
          }
        }
      }

      this.settings.lastSyncedCommit = result.commit;
      await this.onSaveSettings();
      const shortCommit = result.commit.length > 7 ? result.commit.slice(0, 7) : result.commit;
      new Notice(`Pull successful! Updated to revision ${shortCommit}`);
      await this.loadContainersAndSync();
    } catch (error) {
      new Notice(`Pull failed: ${error.message}`);
    }
  }
}
