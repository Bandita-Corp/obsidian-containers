import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { RotateCcw, GitCommit, User, Check } from 'lucide-react';
import { useFileVersion, useRestoreFileVersion } from '../../api/useTimeMachine';
import { MarkdownPreview } from '../editor/MarkdownPreview';
import { formatDistanceToNow } from 'date-fns';

interface FileVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  containerId: string;
  filePath: string;
  commitHash: string;
}

export const FileVersionModal: React.FC<FileVersionModalProps> = ({
  open,
  onOpenChange,
  containerId,
  filePath,
  commitHash,
}) => {
  const { data: version, isLoading } = useFileVersion(
    open ? containerId : null,
    open ? filePath : null,
    open ? commitHash : null
  );

  const restoreMutation = useRestoreFileVersion(containerId);
  const [restored, setRestored] = useState(false);

  const handleRestore = async () => {
    if (!confirm(`Are you sure you want to revert "${filePath}" to commit ${commitHash.substring(0, 7)}?`)) {
      return;
    }

    try {
      await restoreMutation.mutateAsync({
        path: filePath,
        commitHash,
        message: `Time Machine: Reverted "${filePath}" to version ${commitHash.substring(0, 7)}`,
      });
      setRestored(true);
      setTimeout(() => {
        setRestored(false);
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Historical Note Snapshot"
      description={`Viewing "${filePath}" at commit ${commitHash.substring(0, 7)}`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Header Metadata */}
        {version && (
          <div className="p-3 bg-bg-card rounded-lg border border-border-subtle flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                <GitCommit className="w-3.5 h-3.5 text-brand-purple" />
                {version.shortHash}
              </span>
              <span className="flex items-center gap-1 text-gray-300 font-medium">
                <User className="w-3.5 h-3.5 text-gray-500" />
                {version.author}
              </span>
              <span className="text-gray-400 text-xs font-mono">
                {version.message}
              </span>
            </div>

            <div className="text-gray-500 font-mono text-[11px] shrink-0">
              {version.date &&
                formatDistanceToNow(new Date(version.date), {
                  addSuffix: true,
                })}
            </div>
          </div>
        )}

        {/* Note Content Preview */}
        <div className="h-96 rounded-xl border border-border-subtle bg-bg-base overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs gap-2">
              <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              <span>Loading historical note version...</span>
            </div>
          ) : (
            <MarkdownPreview content={version?.content || ''} />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div className="text-xs text-gray-500 font-mono">
            {version?.metadata?.wordCount
              ? `${version.metadata.wordCount} words`
              : ''}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRestore}
              isLoading={restoreMutation.isPending}
              disabled={restored}
            >
              {restored ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restored!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore This Version</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
