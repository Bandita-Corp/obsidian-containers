import { App, Modal, Setting, Notice } from 'obsidian';
import { SyncApiClient } from '../services/api-client';
import { ContainerType, ContainerSummaryDto } from '@workspace/shared';

export class CreateContainerModal extends Modal {
  private apiClient: SyncApiClient;
  private onSuccess: (created: ContainerSummaryDto) => void;

  private name = '';
  private customId = '';
  private type: ContainerType = 'git';
  private description = '';
  private rootPath = '';

  constructor(
    app: App,
    apiClient: SyncApiClient,
    onSuccess: (created: ContainerSummaryDto) => void
  ) {
    super(app);
    this.apiClient = apiClient;
    this.onSuccess = onSuccess;
  }

  onOpen() {
    this.modalEl.addClass('custom-container-create-modal');
    this.render();
  }

  onClose() {
    this.contentEl.empty();
  }

  private render() {
    const { contentEl } = this;
    contentEl.empty();

    // Header
    const header = contentEl.createDiv({ cls: 'custom-modal-header' });
    header.createEl('h2', { text: 'Create New Container' });
    header.createEl('p', {
      cls: 'custom-modal-subtitle',
      text: 'Register a new storage container for markdown notes with optional Git versioning.',
    });

    // Name input
    let idSettingInput: HTMLInputElement | null = null;
    new Setting(contentEl)
      .setName('Container Name')
      .setDesc('Human-friendly display name (e.g. "Research Vault", "Daily Notes")')
      .addText((text) => {
        text.setPlaceholder('My Notes Vault').onChange((val) => {
          this.name = val;
          if (!this.customId || this.customId === this.slugify(this.name.slice(0, -1))) {
            const autoSlug = this.slugify(val);
            if (idSettingInput) {
              idSettingInput.value = autoSlug;
              this.customId = autoSlug;
            }
          }
        });
      });

    // ID input
    new Setting(contentEl)
      .setName('Container ID (Slug)')
      .setDesc('Unique identifier used in API URLs and storage folder names')
      .addText((text) => {
        idSettingInput = text.inputEl;
        text.setPlaceholder('my-notes-vault').onChange((val) => {
          this.customId = this.slugify(val);
        });
      });

    // Container Type selector
    new Setting(contentEl)
      .setName('Container Type')
      .setDesc('Choose storage and synchronization engine')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('git', '⚡ Git Container (Version-controlled with commit history)')
          .addOption('simple', '📁 Simple Container (Direct filesystem storage)')
          .setValue(this.type)
          .onChange((val) => {
            this.type = val as ContainerType;
          });
      });

    // Description input
    new Setting(contentEl)
      .setName('Description (Optional)')
      .setDesc('Short summary of what this container stores')
      .addText((text) => {
        text.setPlaceholder('Container for project documentation').onChange((val) => {
          this.description = val;
        });
      });

    // Custom Root Path (Optional)
    new Setting(contentEl)
      .setName('Custom Storage Path (Optional)')
      .setDesc('Leave blank to use default data directory')
      .addText((text) => {
        text.setPlaceholder('(Default: auto-allocated in backend data/vaults/)').onChange((val) => {
          this.rootPath = val;
        });
      });

    // Action buttons
    const footer = contentEl.createDiv({ cls: 'custom-modal-footer' });
    const cancelBtn = footer.createEl('button', { text: 'Cancel', cls: 'mod-cancel' });
    cancelBtn.onclick = () => this.close();

    const submitBtn = footer.createEl('button', {
      text: 'Create Container',
      cls: 'mod-cta',
    });

    submitBtn.onclick = async () => {
      if (!this.name.trim()) {
        new Notice('Please enter a container name.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.setText('Creating...');

      try {
        const payload = {
          name: this.name.trim(),
          id: this.customId ? this.customId.trim() : undefined,
          type: this.type,
          description: this.description.trim() || undefined,
          rootPath: this.rootPath.trim() || undefined,
        };

        const created = await this.apiClient.registerContainer(payload);
        new Notice(`Container "${created.name}" created successfully!`);
        this.onSuccess(created);
        this.close();
      } catch (err: any) {
        new Notice(`Error creating container: ${err.message || err}`);
        submitBtn.disabled = false;
        submitBtn.setText('Create Container');
      }
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');
  }
}
