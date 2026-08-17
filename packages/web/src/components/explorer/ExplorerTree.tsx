import { useState, useMemo } from 'react';
import { Search, Plus, FileText, Hash, X, FolderTree } from 'lucide-react';
import { FolderTreeNode } from '@workspace/shared';
import { FileTreeItem } from './FileTreeItem';
import { Button } from '../common/Button';

interface ExplorerTreeProps {
  tree: FolderTreeNode | null | undefined;
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onOpenFileHistory?: (path: string) => void;
  onOpenNewFileModal: () => void;
  isLoading?: boolean;
}

export const ExplorerTree: React.FC<ExplorerTreeProps> = ({
  tree,
  activeFilePath,
  onSelectFile,
  onDeleteFile,
  onOpenFileHistory,
  onOpenNewFileModal,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Flatten all files for quick search and tag aggregation
  const allFiles = useMemo(() => {
    if (!tree) return [];
    const files: FolderTreeNode[] = [];

    function traverse(node: FolderTreeNode) {
      if (node.type === 'file') {
        files.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    }

    traverse(tree);
    return files;
  }, [tree]);

  // Aggregate all discovered tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allFiles.forEach((file) => {
      if (file.metadata?.tags) {
        file.metadata.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [allFiles]);

  // Filtered files when searching or filtering by tag
  const filteredFiles = useMemo(() => {
    if (!searchQuery && !selectedTag) return null;

    return allFiles.filter((file) => {
      const matchesSearch = searchQuery
        ? file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesTag = selectedTag
        ? file.metadata?.tags?.includes(selectedTag)
        : true;

      return matchesSearch && matchesTag;
    });
  }, [allFiles, searchQuery, selectedTag]);

  return (
    <div className="h-full flex flex-col bg-bg-surface/50 border-r border-border-subtle select-none">
      {/* Header & New File Action */}
      <div className="p-3 border-b border-border-subtle flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
          <FolderTree className="w-3.5 h-3.5 text-brand-purple" />
          <span>Files</span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewFileModal}
          className="text-xs py-1 px-2 h-7"
        >
          <Plus className="w-3 h-3 text-brand-purple" />
          <span>Note</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b border-border-subtle">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files by name..."
            className="w-full pl-8 pr-7 py-1.5 bg-bg-input rounded-lg border border-border-subtle text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tag Pills Filter */}
      {allTags.length > 0 && (
        <div className="p-2 border-b border-border-subtle flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
              selectedTag === null
                ? 'bg-purple-500/20 text-purple-300 font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded-full whitespace-nowrap font-mono transition-colors flex items-center gap-0.5 ${
                selectedTag === tag
                  ? 'bg-brand-purple text-white font-semibold'
                  : 'bg-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Hash className="w-2.5 h-2.5 opacity-70" />
              <span>{tag.replace(/^#/, '')}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-xs">
            <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mb-2" />
            <span>Loading tree...</span>
          </div>
        ) : filteredFiles ? (
          // Render search / tag results
          <div>
            <div className="text-[11px] text-gray-500 px-2 py-1 mb-1 font-mono">
              Found {filteredFiles.length} note{filteredFiles.length === 1 ? '' : 's'}
            </div>
            {filteredFiles.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-6">
                No matching notes found.
              </div>
            ) : (
              filteredFiles.map((file) => (
                <FileTreeItem
                  key={file.path}
                  node={file}
                  activeFilePath={activeFilePath}
                  onSelectFile={onSelectFile}
                  onDeleteFile={onDeleteFile}
                  onOpenFileHistory={onOpenFileHistory}
                />
              ))
            )}
          </div>
        ) : tree && tree.children && tree.children.length > 0 ? (
          tree.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              activeFilePath={activeFilePath}
              onSelectFile={onSelectFile}
              onDeleteFile={onDeleteFile}
              onOpenFileHistory={onOpenFileHistory}
            />
          ))
        ) : (
          <div className="text-center py-10 px-4 text-xs text-gray-500">
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
            <p>No notes in this container yet.</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenNewFileModal}
              className="mt-3 text-xs mx-auto"
            >
              <Plus className="w-3 h-3 text-brand-purple" />
              Create First Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
