import { App, Modal, Setting, Notice } from 'obsidian';
import { SyncApiClient } from '../services/api-client';
import { ContainerSummaryDto } from '@workspace/shared';

export class CreateFileModal extends Modal {
  private apiClient: SyncApiClient;
  private containers: ContainerSummaryDto[];
  private targetContainerId: string;
  private onSuccess: (containerId: string, filePath: string) => void;

  private filePath = '';
  private initialContent = '';

  constructor(
    app: App,
    apiClient: SyncApiClient,
    containers: ContainerSummaryDto[],
    initialContainerId: string,
    onSuccess: (containerId: string, filePath: string) => void
  ) {
    super(app);
    this.apiClient = apiClient;
    this.containers = containers;
    this.targetContainerId = initialContainerId || (containers[0]?.id ?? '');
    this.onSuccess = onSuccess;
  }

  onOpen() {
    this.modalEl.addClass('custom-file-create-modal');
    this.render();
  }

  onClose() {
    this.contentEl.empty();
  }

  private render() {
    const { contentEl } = this;
    contentEl.empty();

    const header = contentEl.createDiv({ cls: 'custom-modal-header' });
    header.createEl('h2', { text: 'Create New Note in Container' });
    header.createEl('p', {
      cls: 'custom-modal-subtitle',
      text: 'Add a new Markdown file to the selected container storage.',
    });

    // Container dropdown (if multiple containers)
    if (this.containers.length > 1) {
      new Setting(contentEl)
        .setName('Target Container')
        .setDesc('Container where this note will be created')
        .addDropdown((dropdown) => {
          for (const c of this.containers) {
            dropdown.addOption(c.id, `${c.name} (${c.type.toUpperCase()})`);
          }
          dropdown.setValue(this.targetContainerId);
          dropdown.onChange((val) => {
            this.targetContainerId = val;
          });
        });
    }

    // Note File Path input
    new Setting(contentEl)
      .setName('Note Path / Name')
      .setDesc('Relative path within container (e.g. "meeting-notes.md" or "projects/roadmap.md")')
      .addText((text) => {
        text.setPlaceholder('daily/today.md').onChange((val) => {
          this.filePath = val;
        });
      });

    // Initial Content Textarea
    new Setting(contentEl)
      .setName('Initial Content (Optional)')
      .setDesc('Markdown text or frontmatter to prefill')
      .addTextArea((ta) => {
        ta.setPlaceholder('# Title\n\nWrite your note content here...')
          .setValue(this.initialContent)
          .onChange((val) => {
            this.initialContent = val;
          });
        ta.inputEl.rows = 6;
        ta.inputEl.style.width = '100%';
        ta.inputEl.style.fontFamily = 'monospace';
      });

    // Footer actions
    const footer = contentEl.createDiv({ cls: 'custom-modal-footer' });
    const cancelBtn = footer.createEl('button', { text: 'Cancel', cls: 'mod-cancel' });
    cancelBtn.onclick = () => this.close();

    const submitBtn = footer.createEl('button', {
      text: 'Create Note',
      cls: 'mod-cta',
    });

    submitBtn.onclick = async () => {
      let path = this.filePath.trim();
      if (!path) {
        new Notice('Please specify a note path/filename.');
        return;
      }
      if (!path.endsWith('.md') && !path.includes('.')) {
        path = `${path}.md`;
      }

      submitBtn.disabled = true;
      submitBtn.setText('Creating...');

      try {
        const defaultContent =
          this.initialContent.trim() ||
          `# ${path.replace(/\.md$/i, '').split('/').pop()}\n\nCreated on ${new Date().toISOString().slice(0, 10)}\n`;

        await this.apiClient.saveContainerFile(this.targetContainerId, path, defaultContent);
        new Notice(`Note "${path}" created successfully!`);
        this.onSuccess(this.targetContainerId, path);
        this.close();
      } catch (err: any) {
        new Notice(`Failed to create note: ${err.message || err}`);
        submitBtn.disabled = false;
        submitBtn.setText('Create Note');
      }
    };
  }
}
