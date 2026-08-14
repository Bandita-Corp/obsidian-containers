import {
  ItemView,
  WorkspaceLeaf,
  Notice,
  setIcon,
  TFile,
} from 'obsidian';
import { SyncApiClient } from '../services/api-client';
import { WorkspaceSyncPluginSettings } from '../types';
import { CreateContainerModal } from './create-container-modal';
import { CreateFileModal } from './create-file-modal';
import { ConfirmModal } from './confirm-modal';
import { SyncModal } from './sync-modal';
import {
  ContainerSummaryDto,
  FolderTreeNode,
  FileItemDto,
} from '@workspace/shared';

export const VIEW_TYPE_CONTAINER_EXPLORER = 'container-explorer-view';

export class ContainerExplorerView extends ItemView {
  private apiClient: SyncApiClient;
  private settings: WorkspaceSyncPluginSettings;
  private onSaveSettings: () => Promise<void>;

  private containers: ContainerSummaryDto[] = [];
  private selectedContainerId: string | null = null;
  private containerTrees: Map<string, FolderTreeNode> = new Map();
  private containerFiles: Map<string, FileItemDto[]> = new Map();

  private isLoading = false;
  private isOnline = true;
  private searchQuery = '';
  private selectedTag: string | null = null;
  private expandedFolders: Set<string> = new Set();
  private expandedContainers: Set<string> = new Set();

  constructor(
    leaf: WorkspaceLeaf,
    apiClient: SyncApiClient,
    settings: WorkspaceSyncPluginSettings,
    onSaveSettings: () => Promise<void>
  ) {
    super(leaf);
    this.apiClient = apiClient;
    this.settings = settings;
    this.onSaveSettings = onSaveSettings;
  }

  getViewType(): string {
    return VIEW_TYPE_CONTAINER_EXPLORER;
  }

  getDisplayText(): string {
    return 'Containers Explorer';
  }

  getIcon(): string {
    return 'boxes';
  }

  async onOpen() {
    this.containerEl.addClass('custom-container-explorer-view');
    await this.refreshAll();
  }

  async onClose() {
    this.containerEl.empty();
  }

  /**
   * Refreshes all containers and tree structures from backend.
   */
  async refreshAll() {
    this.isLoading = true;
    this.render();

    try {
      this.containers = await this.apiClient.listContainers();
      this.isOnline = true;

      // Select active or first container if none selected
      if (!this.selectedContainerId) {
        this.selectedContainerId = this.settings.activeContainerId || this.containers[0]?.id || null;
      }
      if (this.selectedContainerId) {
        this.expandedContainers.add(this.selectedContainerId);
      }

      // Fetch trees and files for all containers
      await Promise.all(
        this.containers.map(async (c) => {
          try {
            const [tree, files] = await Promise.all([
              this.apiClient.getContainerTree(c.id).catch(() => null),
              this.apiClient.listContainerFiles(c.id).catch(() => []),
            ]);
            if (tree) this.containerTrees.set(c.id, tree);
            if (files) this.containerFiles.set(c.id, files);
          } catch {
            // Ignore single container fail
          }
        })
      );
    } catch (err: any) {
      this.isOnline = false;
      this.containers = [];
      new Notice(`Cannot connect to Container Server: ${err.message || err}`);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private render() {
    const { containerEl } = this;
    containerEl.empty();

    // 1. Header & Controls
    this.renderHeader(containerEl);

    // 2. Search & Tag Filter Bar
    this.renderSearchAndFilters(containerEl);

    // 3. Main Container List & File Tree
    const mainListEl = containerEl.createDiv({ cls: 'custom-explorer-main-scroll' });

    if (this.isLoading && this.containers.length === 0) {
      const loadingBox = mainListEl.createDiv({ cls: 'custom-explorer-loading' });
      loadingBox.createDiv({ cls: 'custom-sync-spinner' });
      loadingBox.createEl('p', { text: 'Loading containers...' });
      return;
    }

    if (!this.isOnline) {
      const offlineBox = mainListEl.createDiv({ cls: 'custom-explorer-empty' });
      const icon = offlineBox.createDiv({ cls: 'custom-empty-icon' });
      setIcon(icon, 'wifi-off');
      offlineBox.createEl('h4', { text: 'Server Offline' });
      offlineBox.createEl('p', {
        text: `Unable to connect to ${this.settings.serverUrl}. Make sure the server is running.`,
      });
      const retryBtn = offlineBox.createEl('button', { text: 'Retry Connection', cls: 'mod-cta' });
      retryBtn.onclick = () => this.refreshAll();
      return;
    }

    if (this.containers.length === 0) {
      const emptyBox = mainListEl.createDiv({ cls: 'custom-explorer-empty' });
      const icon = emptyBox.createDiv({ cls: 'custom-empty-icon' });
      setIcon(icon, 'box');
      emptyBox.createEl('h4', { text: 'No Containers Found' });
      emptyBox.createEl('p', { text: 'Create your first container to start organizing markdown notes.' });
      const createBtn = emptyBox.createEl('button', { text: '➕ Create Container', cls: 'mod-cta' });
      createBtn.onclick = () => this.openCreateContainerModal();
      return;
    }

    // Render each container
    for (const container of this.containers) {
      this.renderContainerCard(mainListEl, container);
    }

    // 4. Footer Quick Summary Bar
    this.renderFooterStats(containerEl);
  }

  private renderHeader(parent: HTMLElement) {
    const header = parent.createDiv({ cls: 'custom-explorer-header' });

    // Left title + online badge
    const left = header.createDiv({ cls: 'custom-explorer-header-left' });
    const title = left.createEl('h3', { text: 'Containers' });
    const statusDot = left.createSpan({
      cls: `custom-status-dot ${this.isOnline ? 'online' : 'offline'}`,
    });
    statusDot.title = this.isOnline ? 'Server Connected' : 'Server Offline';

    // Right Action Buttons
    const actions = header.createDiv({ cls: 'custom-explorer-header-actions' });

    // ➕ New Container
    const addContainerBtn = actions.createEl('button', {
      cls: 'custom-icon-btn',
      attr: { 'aria-label': 'Create New Container' },
    });
    setIcon(addContainerBtn, 'folder-plus');
    addContainerBtn.onclick = () => this.openCreateContainerModal();

    // 📄 New Note
    const addFileBtn = actions.createEl('button', {
      cls: 'custom-icon-btn',
      attr: { 'aria-label': 'Create New Note in Container' },
    });
    setIcon(addFileBtn, 'file-plus');
    addFileBtn.onclick = () => this.openCreateFileModal();

    // ⚡ Sync Hub
    const syncBtn = actions.createEl('button', {
      cls: 'custom-icon-btn highlight',
      attr: { 'aria-label': 'Open Sync Hub & Changes' },
    });
    setIcon(syncBtn, 'zap');
    syncBtn.onclick = () => {
      new SyncModal(
        this.app,
        this.apiClient,
        this.settings,
        () => this.onSaveSettings()
      ).open();
    };

    // 🔄 Refresh
    const refreshBtn = actions.createEl('button', {
      cls: 'custom-icon-btn',
      attr: { 'aria-label': 'Refresh Containers' },
    });
    setIcon(refreshBtn, 'refresh-cw');
    refreshBtn.onclick = () => this.refreshAll();
  }

  private renderSearchAndFilters(parent: HTMLElement) {
    const searchContainer = parent.createDiv({ cls: 'custom-explorer-search-wrap' });

    // Input wrapper
    const inputWrap = searchContainer.createDiv({ cls: 'custom-search-input-wrap' });
    const searchIcon = inputWrap.createSpan({ cls: 'custom-search-icon' });
    setIcon(searchIcon, 'search');

    const searchInput = inputWrap.createEl('input', {
      type: 'text',
      placeholder: 'Filter notes, containers, tags...',
      value: this.searchQuery,
      cls: 'custom-search-input',
    });

    if (this.searchQuery) {
      const clearBtn = inputWrap.createEl('button', { cls: 'custom-search-clear' });
      setIcon(clearBtn, 'x');
      clearBtn.onclick = () => {
        this.searchQuery = '';
        this.render();
      };
    }

    searchInput.oninput = (e: Event) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.render();
    };

    // Extract all unique tags across containers
    const allTags = new Set<string>();
    for (const files of this.containerFiles.values()) {
      for (const f of files) {
        if (f.metadata?.tags) {
          f.metadata.tags.forEach((t) => allTags.add(t));
        }
      }
    }

    if (allTags.size > 0) {
      const tagScroll = searchContainer.createDiv({ cls: 'custom-tag-filter-scroll' });

      // "All" tag pill
      const allPill = tagScroll.createSpan({
        cls: `custom-tag-chip ${!this.selectedTag ? 'active' : ''}`,
        text: 'All Tags',
      });
      allPill.onclick = () => {
        this.selectedTag = null;
        this.render();
      };

      for (const tag of Array.from(allTags).slice(0, 10)) {
        const cleanTag = tag.replace(/^#/, '');
        const tagPill = tagScroll.createSpan({
          cls: `custom-tag-chip ${this.selectedTag === cleanTag ? 'active' : ''}`,
          text: `#${cleanTag}`,
        });
        tagPill.onclick = () => {
          this.selectedTag = this.selectedTag === cleanTag ? null : cleanTag;
          this.render();
        };
      }
    }
  }

  private renderContainerCard(parent: HTMLElement, container: ContainerSummaryDto) {
    const isActive = container.id === this.settings.activeContainerId;
    const isExpanded = this.expandedContainers.has(container.id);

    const card = parent.createDiv({
      cls: `custom-container-card ${isActive ? 'is-active' : ''} ${isExpanded ? 'is-expanded' : ''}`,
    });

    // 1. Container Header Row
    const headerRow = card.createDiv({ cls: 'custom-card-header-row' });

    // Expand Arrow + Title
    const titleGroup = headerRow.createDiv({ cls: 'custom-card-title-group' });
    const arrowIcon = titleGroup.createSpan({ cls: 'custom-card-arrow' });
    setIcon(arrowIcon, isExpanded ? 'chevron-down' : 'chevron-right');

    titleGroup.onclick = (e) => {
      // Toggle expand
      if (this.expandedContainers.has(container.id)) {
        this.expandedContainers.delete(container.id);
      } else {
        this.expandedContainers.add(container.id);
      }
      this.render();
    };

    const typeBadge = titleGroup.createSpan({
      cls: `custom-type-badge ${container.type}`,
      text: container.type === 'git' ? '⚡ GIT' : '📁 SIMPLE',
    });

    const nameEl = titleGroup.createSpan({ cls: 'custom-card-name', text: container.name });

    if (isActive) {
      const activeBadge = titleGroup.createSpan({ cls: 'custom-active-badge', text: 'ACTIVE' });
    }

    // Header Right Actions
    const actionGroup = headerRow.createDiv({ cls: 'custom-card-actions' });

    // Activate Button
    if (!isActive) {
      const activateBtn = actionGroup.createEl('button', {
        cls: 'custom-icon-btn',
        attr: { 'aria-label': 'Set as Active Container' },
      });
      setIcon(activateBtn, 'check');
      activateBtn.onclick = async (e) => {
        e.stopPropagation();
        this.settings.activeContainerId = container.id;
        await this.onSaveSettings();
        new Notice(`"${container.name}" is now the active container.`);
        this.render();
      };
    }

    // ➕ Add File to this container
    const addFileBtn = actionGroup.createEl('button', {
      cls: 'custom-icon-btn',
      attr: { 'aria-label': 'Add Note to this Container' },
    });
    setIcon(addFileBtn, 'file-plus');
    addFileBtn.onclick = (e) => {
      e.stopPropagation();
      this.openCreateFileModal(container.id);
    };

    // 🗑️ Delete Container
    const deleteBtn = actionGroup.createEl('button', {
      cls: 'custom-icon-btn danger',
      attr: { 'aria-label': 'Delete Container' },
    });
    setIcon(deleteBtn, 'trash-2');
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.confirmDeleteContainer(container);
    };

    // 2. Container Sub-metadata Row
    const metaRow = card.createDiv({ cls: 'custom-card-meta-row' });
    const filesCount = this.containerFiles.get(container.id)?.length ?? container.totalFiles;
    metaRow.createSpan({ cls: 'custom-meta-item', text: `📝 ${filesCount} notes` });

    if (container.type === 'git') {
      const commit = container.currentCommit ? container.currentCommit.slice(0, 7) : 'init';
      metaRow.createSpan({ cls: 'custom-meta-item commit', text: `HEAD: ${commit}` });
    }

    if (container.description) {
      metaRow.createSpan({ cls: 'custom-meta-desc', text: container.description });
    }

    // 3. Container Files / Tree (if expanded)
    if (isExpanded) {
      const body = card.createDiv({ cls: 'custom-card-body' });
      this.renderContainerFiles(body, container);
    }
  }

  private renderContainerFiles(parent: HTMLElement, container: ContainerSummaryDto) {
    const files = this.containerFiles.get(container.id) || [];

    // Filter files by search query and tag
    const filteredFiles = files.filter((f) => {
      const matchesSearch =
        !this.searchQuery ||
        f.path.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (f.metadata?.title && f.metadata.title.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesTag =
        !this.selectedTag ||
        (f.metadata?.tags &&
          f.metadata.tags.some((t) => t.toLowerCase().includes(this.selectedTag!.toLowerCase())));

      return matchesSearch && matchesTag;
    });

    if (filteredFiles.length === 0) {
      const emptyNoteBox = parent.createDiv({ cls: 'custom-files-empty' });
      emptyNoteBox.createEl('span', {
        text: this.searchQuery || this.selectedTag ? 'No matching notes.' : 'No notes in this container.',
      });
      const newNoteLink = emptyNoteBox.createEl('a', { text: 'Create note ➕' });
      newNoteLink.onclick = () => this.openCreateFileModal(container.id);
      return;
    }

    const treeContainer = parent.createDiv({ cls: 'custom-files-tree-list' });

    for (const file of filteredFiles) {
      this.renderFileRow(treeContainer, container, file);
    }
  }

  private renderFileRow(parent: HTMLElement, container: ContainerSummaryDto, file: FileItemDto) {
    const row = parent.createDiv({ cls: 'custom-file-row' });

    // File icon
    const fileIcon = row.createSpan({ cls: 'custom-file-icon' });
    setIcon(fileIcon, 'file-text');

    // Title / Path & Tags
    const info = row.createDiv({ cls: 'custom-file-info' });
    const titleRow = info.createDiv({ cls: 'custom-file-name-row' });

    const displayName = file.metadata?.title || file.path;
    const nameSpan = titleRow.createSpan({
      cls: 'custom-file-name',
      text: displayName,
    });
    nameSpan.title = file.path;

    // Word count
    if (file.metadata?.wordCount) {
      titleRow.createSpan({
        cls: 'custom-file-words',
        text: `${file.metadata.wordCount}w`,
      });
    }

    // Tags
    if (file.metadata?.tags && file.metadata.tags.length > 0) {
      const tagWrap = info.createDiv({ cls: 'custom-file-tags' });
      for (const tag of file.metadata.tags.slice(0, 3)) {
        tagWrap.createSpan({ cls: 'custom-tag-tiny', text: `#${tag.replace(/^#/, '')}` });
      }
      if (file.metadata.tags.length > 3) {
        tagWrap.createSpan({
          cls: 'custom-tag-tiny more',
          text: `+${file.metadata.tags.length - 3}`,
        });
      }
    }

    // Row Click to Open Note
    row.onclick = (e) => {
      if ((e.target as HTMLElement).closest('.custom-file-actions')) return;
      this.openNoteInObsidian(container, file);
    };

    // Actions
    const actions = row.createDiv({ cls: 'custom-file-actions' });

    // Open Note Action
    const openBtn = actions.createEl('button', {
      cls: 'custom-mini-btn',
      attr: { 'aria-label': 'Open in Obsidian' },
    });
    setIcon(openBtn, 'external-link');
    openBtn.onclick = (e) => {
      e.stopPropagation();
      this.openNoteInObsidian(container, file);
    };

    // Delete Note Action
    const deleteBtn = actions.createEl('button', {
      cls: 'custom-mini-btn danger',
      attr: { 'aria-label': 'Delete Note' },
    });
    setIcon(deleteBtn, 'trash');
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.confirmDeleteFile(container, file);
    };
  }

  private renderFooterStats(parent: HTMLElement) {
    const footer = parent.createDiv({ cls: 'custom-explorer-footer' });

    const totalContainers = this.containers.length;
    let totalNotes = 0;
    for (const files of this.containerFiles.values()) {
      totalNotes += files.length;
    }

    footer.createSpan({
      cls: 'custom-footer-stat',
      text: `${totalContainers} ${totalContainers === 1 ? 'Container' : 'Containers'}`,
    });
    footer.createSpan({ cls: 'custom-footer-bullet', text: '•' });
    footer.createSpan({
      cls: 'custom-footer-stat',
      text: `${totalNotes} Notes`,
    });
    footer.createSpan({ cls: 'custom-footer-bullet', text: '•' });
    footer.createSpan({
      cls: 'custom-footer-stat status',
      text: this.isOnline ? 'Online' : 'Offline',
    });
  }

  // --- Actions & Helpers ---

  private async openNoteInObsidian(container: ContainerSummaryDto, file: FileItemDto) {
    try {
      // 1. Fetch latest content if needed
      let content = file.content;
      if (!content) {
        const remote = await this.apiClient.getContainerFile(container.id, file.path);
        content = remote.content;
      }

      // 2. Check if file exists in Obsidian vault
      const existingFile = this.app.vault.getAbstractFileByPath(file.path);
      let targetTFile: TFile;

      if (existingFile instanceof TFile) {
        // Update content if different
        const currentContent = await this.app.vault.read(existingFile);
        if (currentContent !== content) {
          await this.app.vault.modify(existingFile, content);
        }
        targetTFile = existingFile;
      } else {
        // Ensure parent directories exist
        const parts = file.path.split('/');
        if (parts.length > 1) {
          const folderPath = parts.slice(0, -1).join('/');
          if (!this.app.vault.getAbstractFileByPath(folderPath)) {
            await this.app.vault.createFolder(folderPath).catch(() => {});
          }
        }
        targetTFile = await this.app.vault.create(file.path, content);
      }

      // 3. Open leaf in active editor
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(targetTFile);
      new Notice(`Opened "${file.path}"`);
    } catch (err: any) {
      new Notice(`Failed to open note: ${err.message || err}`);
    }
  }

  private openCreateContainerModal() {
    new CreateContainerModal(this.app, this.apiClient, async (created) => {
      this.selectedContainerId = created.id;
      this.expandedContainers.add(created.id);
      await this.refreshAll();
    }).open();
  }

  private openCreateFileModal(containerId?: string) {
    new CreateFileModal(
      this.app,
      this.apiClient,
      this.containers,
      containerId || this.settings.activeContainerId || (this.containers[0]?.id ?? ''),
      async (targetId, filePath) => {
        this.expandedContainers.add(targetId);
        await this.refreshAll();
      }
    ).open();
  }

  private confirmDeleteContainer(container: ContainerSummaryDto) {
    new ConfirmModal(this.app, {
      title: `Delete Container "${container.name}"?`,
      message: `Are you sure you want to delete container "${container.id}" (${container.type.toUpperCase()})? This will unregister the container from the backend hub.`,
      confirmText: 'Delete Container',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await this.apiClient.deleteContainer(container.id);
          new Notice(`Container "${container.name}" deleted.`);

          if (this.settings.activeContainerId === container.id) {
            this.settings.activeContainerId = '';
            await this.onSaveSettings();
          }

          await this.refreshAll();
        } catch (err: any) {
          new Notice(`Failed to delete container: ${err.message || err}`);
        }
      },
    }).open();
  }

  private confirmDeleteFile(container: ContainerSummaryDto, file: FileItemDto) {
    new ConfirmModal(this.app, {
      title: `Delete Note "${file.path}"?`,
      message: `Are you sure you want to delete this note from container "${container.name}"?`,
      confirmText: 'Delete Note',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await this.apiClient.deleteContainerFile(container.id, file.path);
          new Notice(`Deleted "${file.path}".`);
          await this.refreshAll();
        } catch (err: any) {
          new Notice(`Failed to delete note: ${err.message || err}`);
        }
      },
    }).open();
  }
}
