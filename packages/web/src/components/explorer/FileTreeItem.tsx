import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Trash2,
  Clock,
} from 'lucide-react';
import { FolderTreeNode } from '@workspace/shared';
import clsx from 'clsx';

interface FileTreeItemProps {
  node: FolderTreeNode;
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onOpenFileHistory?: (path: string) => void;
  level?: number;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  activeFilePath,
  onSelectFile,
  onDeleteFile,
  onOpenFileHistory,
  level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';
  const isSelected = !isFolder && activeFilePath === node.path;

  if (isFolder) {
    return (
      <div className="select-none">
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${Math.max(level * 12 + 8, 8)}px` }}
          className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer group transition-colors"
        >
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-brand-purple" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-brand-purple/70" />
          )}
          <span className="font-medium truncate">{node.name}</span>
          {node.children && (
            <span className="text-[10px] text-gray-500 font-mono ml-auto mr-1">
              {node.children.length}
            </span>
          )}
        </div>

        {isOpen && node.children && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                activeFilePath={activeFilePath}
                onSelectFile={onSelectFile}
                onDeleteFile={onDeleteFile}
                onOpenFileHistory={onOpenFileHistory}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectFile(node.path)}
      style={{ paddingLeft: `${Math.max(level * 12 + 8, 8)}px` }}
      className={clsx(
        'flex items-center justify-between py-1.5 px-2 rounded-lg text-xs cursor-pointer group transition-all',
        isSelected
          ? 'bg-purple-500/20 text-white font-medium shadow-sm border-l-2 border-brand-purple'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      )}
    >
      <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-2">
        <FileText
          className={clsx(
            'w-3.5 h-3.5 shrink-0',
            isSelected ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'
          )}
        />
        <span className="truncate">{node.name}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onOpenFileHistory && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenFileHistory(node.path);
            }}
            title="View File Version History"
            className="p-1 rounded text-gray-400 hover:text-amber-400 hover:bg-white/5"
          >
            <Clock className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${node.name}"?`)) {
              onDeleteFile(node.path);
            }
          }}
          title="Delete File"
          className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
