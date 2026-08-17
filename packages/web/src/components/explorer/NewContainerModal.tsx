import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FolderGit2, GitBranch, HardDrive } from 'lucide-react';
import { RegisterContainerRequestDto, ContainerType } from '@workspace/shared';

interface NewContainerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateContainer: (data: RegisterContainerRequestDto) => Promise<void>;
}

export const NewContainerModal: React.FC<NewContainerModalProps> = ({
  open,
  onOpenChange,
  onCreateContainer,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ContainerType>('git');
  const [description, setDescription] = useState('');
  const [rootPath, setRootPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a container name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onCreateContainer({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        rootPath: rootPath.trim() || undefined,
      });
      setName('');
      setDescription('');
      setRootPath('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create container');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Container"
      description="Register an isolated Markdown vault container."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Container Name
          </label>
          <div className="relative">
            <FolderGit2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Personal Wiki, Work Notes, RFCs"
              autoFocus
              className="w-full pl-9 pr-3 py-2 bg-bg-input rounded-lg border border-border-subtle text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Container Storage Engine
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setType('git')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                type === 'git'
                  ? 'bg-purple-500/15 border-brand-purple text-white shadow-glow'
                  : 'bg-bg-input border-border-subtle text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-xs mb-1">
                <GitBranch className="w-4 h-4 text-brand-purple" />
                <span>Git-Backed (Recommended)</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Full Time Machine, commit history, diffs, and conflict resolution.
              </p>
            </div>

            <div
              onClick={() => setType('simple')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                type === 'simple'
                  ? 'bg-purple-500/15 border-brand-purple text-white shadow-glow'
                  : 'bg-bg-input border-border-subtle text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-xs mb-1">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>Simple Filesystem</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Direct filesystem sync with hash checks and no git overhead.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this container's purpose..."
            className="w-full px-3 py-2 bg-bg-input rounded-lg border border-border-subtle text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Custom Root Path (Optional)
          </label>
          <input
            type="text"
            value={rootPath}
            onChange={(e) => setRootPath(e.target.value)}
            placeholder="Leave empty for default server storage directory"
            className="w-full px-3 py-2 bg-bg-input rounded-lg border border-border-subtle text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors font-mono"
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
            Register Container
          </Button>
        </div>
      </form>
    </Modal>
  );
};
