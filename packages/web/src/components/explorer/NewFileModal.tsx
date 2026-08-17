import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FileText } from 'lucide-react';

interface NewFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFile: (path: string, initialContent?: string) => Promise<void>;
}

export const NewFileModal: React.FC<NewFileModalProps> = ({
  open,
  onOpenChange,
  onCreateFile,
}) => {
  const [filePath, setFilePath] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePath.trim()) {
      setError('Please specify a valid file path.');
      return;
    }

    // Ensure .md extension
    let normalized = filePath.trim();
    if (!normalized.endsWith('.md')) {
      normalized += '.md';
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onCreateFile(
        normalized,
        initialContent || `# ${normalized.replace(/\.md$/, '')}\n\n`
      );
      setFilePath('');
      setInitialContent('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Note"
      description="Enter the relative path inside the container (e.g. daily/2026-08-19.md)"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            File Path (.md)
          </label>
          <div className="relative">
            <FileText className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="e.g. notes/my-new-note.md"
              autoFocus
              className="w-full pl-9 pr-3 py-2 bg-bg-input rounded-lg border border-border-subtle text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Initial Content (Optional)
          </label>
          <textarea
            value={initialContent}
            onChange={(e) => setInitialContent(e.target.value)}
            rows={4}
            placeholder="---&#10;tags: [ideas, drafts]&#10;---&#10;# Title..."
            className="w-full p-3 bg-bg-input rounded-lg border border-border-subtle text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors font-mono resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Create Note
          </Button>
        </div>
      </form>
    </Modal>
  );
};
