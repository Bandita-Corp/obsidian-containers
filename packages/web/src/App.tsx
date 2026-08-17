import { useState, useEffect } from 'react';
import {
  useContainersList,
  useContainerSummary,
  useContainerTree,
  useContainerFile,
  useSaveFile,
  useDeleteFile,
  useRegisterContainer,
} from './api/useContainers';
import { useSyncEvents } from './api/useSyncEvents';
import { Navbar } from './components/navbar/Navbar';
import { ExplorerTree } from './components/explorer/ExplorerTree';
import { MarkdownEditor } from './components/editor/MarkdownEditor';
import { TimeMachineView } from './components/time-machine/TimeMachineView';
import { NewContainerModal } from './components/explorer/NewContainerModal';
import { NewFileModal } from './components/explorer/NewFileModal';
import { FileVersionModal } from './components/time-machine/FileVersionModal';
import { FileText, Clock } from 'lucide-react';
import { Button } from './components/common/Button';

export function App() {
  const { data: containers = [], isLoading: isLoadingContainers } = useContainersList();
  const [activeContainerId, setActiveContainerId] = useState<string | null>(null);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'editor' | 'timemachine'>('editor');

  // Modals state
  const [isNewContainerOpen, setIsNewContainerOpen] = useState(false);
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [fileHistoryModal, setFileHistoryModal] = useState<{
    open: boolean;
    filePath: string;
    commitHash: string;
  }>({
    open: false,
    filePath: '',
    commitHash: '',
  });

  // Auto-select first container when loaded
  useEffect(() => {
    if (containers.length > 0 && !activeContainerId) {
      setActiveContainerId(containers[0].id);
    }
  }, [containers, activeContainerId]);

  // Active container data
  const { data: activeContainer } = useContainerSummary(activeContainerId);
  const { data: tree, isLoading: isLoadingTree } = useContainerTree(activeContainerId);
  const { data: activeFile } = useContainerFile(activeContainerId, activeFilePath);

  // Mutations
  const saveFileMutation = useSaveFile(activeContainerId);
  const deleteFileMutation = useDeleteFile(activeContainerId);
  const registerContainerMutation = useRegisterContainer();

  // Real-time SSE Sync events listener
  const { status: sseStatus } = useSyncEvents(activeContainerId);

  // Auto-select first file if none selected and tree is loaded
  useEffect(() => {
    if (tree && (!activeFilePath || !tree.children?.some(c => c.path === activeFilePath))) {
      // Find first file in tree
      function findFirstFile(node: any): string | null {
        if (node.type === 'file') return node.path;
        if (node.children) {
          for (const child of node.children) {
            const found = findFirstFile(child);
            if (found) return found;
          }
        }
        return null;
      }
      const firstFile = findFirstFile(tree);
      if (firstFile) {
        setActiveFilePath(firstFile);
      }
    }
  }, [tree, activeFilePath]);

  const handleSaveNote = async (content: string) => {
    if (!activeFilePath) return;
    await saveFileMutation.mutateAsync({ path: activeFilePath, content });
  };

  const handleDeleteNote = async (path: string) => {
    await deleteFileMutation.mutateAsync(path);
    if (activeFilePath === path) {
      setActiveFilePath(null);
    }
  };

  const handleCreateFile = async (path: string, initialContent?: string) => {
    if (!activeContainerId) return;
    await saveFileMutation.mutateAsync({
      path,
      content: initialContent || `# ${path}\n\n`,
    });
    setActiveFilePath(path);
  };

  return (
    <div className="h-screen flex flex-col bg-bg-base text-gray-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar
        containers={containers}
        activeContainerId={activeContainerId}
        onSelectContainer={(id) => {
          setActiveContainerId(id);
          setActiveFilePath(null);
        }}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenNewContainerModal={() => setIsNewContainerOpen(true)}
        sseStatus={sseStatus}
        isSyncing={saveFileMutation.isPending}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: File Explorer Tree */}
        <div className="w-64 sm:w-72 shrink-0 h-full">
          <ExplorerTree
            tree={tree}
            activeFilePath={activeFilePath}
            onSelectFile={(path) => {
              setActiveFilePath(path);
              setActiveView('editor');
            }}
            onDeleteFile={handleDeleteNote}
            onOpenFileHistory={(path) => {
              if (activeContainer?.currentCommit) {
                setFileHistoryModal({
                  open: true,
                  filePath: path,
                  commitHash: activeContainer.currentCommit,
                });
              } else {
                setActiveView('timemachine');
              }
            }}
            onOpenNewFileModal={() => setIsNewFileOpen(true)}
            isLoading={isLoadingTree || isLoadingContainers}
          />
        </div>

        {/* Center Workspace */}
        <main className="flex-1 h-full overflow-hidden flex flex-col bg-bg-base">
          {activeView === 'timemachine' && activeContainerId ? (
            <TimeMachineView
              containerId={activeContainerId}
              containerName={activeContainer?.name || 'Container'}
            />
          ) : activeFile ? (
            <MarkdownEditor
              key={activeFile.path}
              file={activeFile}
              onSave={handleSaveNote}
              onOpenFileHistory={(path) => {
                if (activeContainer?.currentCommit) {
                  setFileHistoryModal({
                    open: true,
                    filePath: path,
                    commitHash: activeContainer.currentCommit,
                  });
                } else {
                  setActiveView('timemachine');
                }
              }}
              isSaving={saveFileMutation.isPending}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 select-none">
              <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center mb-4 shadow-card">
                <FileText className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="text-base font-semibold text-gray-200 mb-1">
                No Note Selected
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mb-4">
                Select a note from the file tree on the left, or create a new one to begin editing with Obsidian formatting.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsNewFileOpen(true)}
                >
                  Create New Note
                </Button>
                {activeContainerId && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveView('timemachine')}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Time Machine</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NewContainerModal
        open={isNewContainerOpen}
        onOpenChange={setIsNewContainerOpen}
        onCreateContainer={async (data) => {
          const created = await registerContainerMutation.mutateAsync(data);
          setActiveContainerId(created.id);
        }}
      />

      <NewFileModal
        open={isNewFileOpen}
        onOpenChange={setIsNewFileOpen}
        onCreateFile={handleCreateFile}
      />

      {fileHistoryModal.open && activeContainerId && (
        <FileVersionModal
          open={fileHistoryModal.open}
          onOpenChange={(open) =>
            setFileHistoryModal((prev) => ({ ...prev, open }))
          }
          containerId={activeContainerId}
          filePath={fileHistoryModal.filePath}
          commitHash={fileHistoryModal.commitHash}
        />
      )}
    </div>
  );
}
