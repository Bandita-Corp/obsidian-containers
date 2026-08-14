import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { SyncApiClient } from './services/api-client';
import { SyncModal } from './ui/sync-modal';
import {
  ContainerExplorerView,
  VIEW_TYPE_CONTAINER_EXPLORER,
} from './ui/container-explorer-view';
import { CreateContainerModal } from './ui/create-container-modal';
import { CreateFileModal } from './ui/create-file-modal';
import { WorkspaceSyncPluginSettings, DEFAULT_SETTINGS } from './types';

export default class WorkspaceSyncPlugin extends Plugin {
  settings: WorkspaceSyncPluginSettings;
  apiClient: SyncApiClient;

  async onload() {
    await this.loadSettings();

    this.apiClient = new SyncApiClient(() => this.settings.serverUrl);

    // 1. Register Container Explorer View in Sidebar
    this.registerView(
      VIEW_TYPE_CONTAINER_EXPLORER,
      (leaf) =>
        new ContainerExplorerView(
          leaf,
          this.apiClient,
          this.settings,
          () => this.saveSettings()
        )
    );

    // 2. Add Ribbon Icons to left sidebar
    const explorerRibbonIconEl = this.addRibbonIcon(
      'boxes',
      'Open Containers Explorer',
      () => {
        this.activateExplorerView();
      }
    );
    explorerRibbonIconEl.addClass('custom-workspace-explorer-ribbon-btn');

    const syncRibbonIconEl = this.addRibbonIcon(
      'zap',
      'Container Hub & Sync',
      () => {
        this.openSyncModal();
      }
    );
    syncRibbonIconEl.addClass('custom-workspace-sync-ribbon-btn');

    // 3. Register Commands in Obsidian Command Palette
    this.addCommand({
      id: 'open-container-explorer',
      name: 'Open Containers Explorer Sidebar',
      callback: () => {
        this.activateExplorerView();
      },
    });

    this.addCommand({
      id: 'create-new-container',
      name: 'Create New Container (Git / Simple)',
      callback: () => {
        new CreateContainerModal(this.app, this.apiClient, async (created) => {
          this.settings.activeContainerId = created.id;
          await this.saveSettings();
          await this.activateExplorerView();
        }).open();
      },
    });

    this.addCommand({
      id: 'create-note-in-container',
      name: 'Create New Note in Container',
      callback: async () => {
        try {
          const containers = await this.apiClient.listContainers();
          if (containers.length === 0) {
            new CreateContainerModal(this.app, this.apiClient, () => {}).open();
            return;
          }
          new CreateFileModal(
            this.app,
            this.apiClient,
            containers,
            this.settings.activeContainerId || containers[0].id,
            () => {}
          ).open();
        } catch {
          this.openSyncModal();
        }
      },
    });

    this.addCommand({
      id: 'open-container-sync-frame',
      name: 'Open Container Hub & Changes Frame',
      callback: () => {
        this.openSyncModal();
      },
    });

    this.addCommand({
      id: 'quick-pull-container-changes',
      name: 'Quick Pull Changes from Active Container',
      callback: async () => {
        this.openSyncModal();
      },
    });

    // 4. Register Plugin Settings Tab
    this.addSettingTab(new WorkspaceSyncSettingTab(this.app, this));

    console.log('Obsidian Container Hub & Explorer Plugin loaded successfully.');
  }

  onunload() {
    console.log('Obsidian Container Hub Plugin unloaded.');
  }

  async activateExplorerView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_CONTAINER_EXPLORER);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeftLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_CONTAINER_EXPLORER,
          active: true,
        });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  openSyncModal() {
    new SyncModal(
      this.app,
      this.apiClient,
      this.settings,
      () => this.saveSettings()
    ).open();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class WorkspaceSyncSettingTab extends PluginSettingTab {
  plugin: WorkspaceSyncPlugin;

  constructor(app: App, plugin: WorkspaceSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Obsidian Container Hub & Sync Settings' });

    new Setting(containerEl)
      .setName('Container Server URL')
      .setDesc('Address of the NestJS container synchronization backend.')
      .addText((text) =>
        text
          .setPlaceholder('http://localhost:3000')
          .setValue(this.plugin.settings.serverUrl)
          .onChange(async (value) => {
            this.plugin.settings.serverUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Active Container ID')
      .setDesc('Identifier of the active container (e.g. "main-git-vault" or "simple-notes").')
      .addText((text) =>
        text
          .setPlaceholder('main-git-vault')
          .setValue(this.plugin.settings.activeContainerId)
          .onChange(async (value) => {
            this.plugin.settings.activeContainerId = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Last Synced Commit')
      .setDesc('The Git commit hash tracked by this vault instance for the active Git container.')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.lastSyncedCommit || 'None')
          .setDisabled(true)
      );

    new Setting(containerEl)
      .setName('Auto-Parse Note Tags')
      .setDesc('Automatically extract YAML tags and inline #tags for displayed change cards.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoParseTags)
          .onChange(async (value) => {
            this.plugin.settings.autoParseTags = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
