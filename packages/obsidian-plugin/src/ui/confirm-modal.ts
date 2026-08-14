import { App, Modal } from 'obsidian';

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

export class ConfirmModal extends Modal {
  private options: ConfirmModalOptions;

  constructor(app: App, options: ConfirmModalOptions) {
    super(app);
    this.options = options;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass('custom-confirm-modal');

    contentEl.createEl('h3', { text: this.options.title, cls: 'custom-confirm-title' });
    contentEl.createEl('p', { text: this.options.message, cls: 'custom-confirm-message' });

    const btnContainer = contentEl.createDiv({ cls: 'custom-confirm-buttons' });

    const cancelBtn = btnContainer.createEl('button', {
      text: this.options.cancelText || 'Cancel',
      cls: 'mod-cancel',
    });
    cancelBtn.onclick = () => this.close();

    const confirmBtn = btnContainer.createEl('button', {
      text: this.options.confirmText || 'Confirm',
      cls: this.options.isDestructive ? 'mod-warning' : 'mod-cta',
    });
    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true;
      confirmBtn.setText('Processing...');
      try {
        await this.options.onConfirm();
        this.close();
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.setText(this.options.confirmText || 'Confirm');
      }
    };
  }

  onClose() {
    this.contentEl.empty();
  }
}
