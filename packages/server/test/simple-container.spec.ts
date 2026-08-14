import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as os from 'os';
import { SimpleContainer } from './simple-container';
import { ConflictStrategy } from '@workspace/shared';

describe('SimpleContainer', () => {
  let tempDir: string;
  let container: SimpleContainer;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'simple-container-test-'));
    container = new SimpleContainer('test-simple', 'Test Simple Vault', tempDir, 'Test Description');
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('should initialize and create starter Welcome note with metadata', async () => {
    await container.initialize();

    const welcomePath = path.join(tempDir, 'Welcome.md');
    expect(fsSync.existsSync(welcomePath)).toBe(true);

    const fileItem = await container.readFile('Welcome.md');
    expect(fileItem.path).toBe('Welcome.md');
    expect(fileItem.content).toContain('Welcome to Test Simple Vault');
    expect(fileItem.metadata?.tags).toContain('#welcome');
    expect(fileItem.metadata?.tags).toContain('#obsidian');
  });

  it('should return container summary with accurate file count and modified time', async () => {
    await container.initialize();
    await container.writeFile('Notes/daily.md', '# Daily Note\n#daily #planning\nToday was productive.');

    const summary = await container.getSummary();
    expect(summary.id).toBe('test-simple');
    expect(summary.name).toBe('Test Simple Vault');
    expect(summary.type).toBe('simple');
    expect(summary.isGit).toBe(false);
    expect(summary.totalFiles).toBe(2);
    expect(summary.lastModified).toBeDefined();
    expect(summary.totalSizeBytes).toBeGreaterThan(0);
  });

  it('should build hierarchical tree structure', async () => {
    await container.initialize();
    await container.writeFile('Projects/Alpha/spec.md', '# Alpha Spec\n#project/alpha');
    await container.writeFile('Projects/Beta/spec.md', '# Beta Spec\n#project/beta');

    const tree = await container.getTree();
    expect(tree.type).toBe('folder');
    expect(tree.children).toBeDefined();

    const projectsFolder = tree.children?.find((c) => c.name === 'Projects');
    expect(projectsFolder).toBeDefined();
    expect(projectsFolder?.type).toBe('folder');
    expect(projectsFolder?.children?.length).toBe(2);
  });

  it('should support CRUD operations on files', async () => {
    await container.initialize();

    // Create / Write
    await container.writeFile('Guides/setup.md', '# Setup Guide\nFollow steps 1, 2, 3.');
    let file = await container.readFile('Guides/setup.md');
    expect(file.content).toContain('Setup Guide');
    expect(file.metadata?.headings).toContain('Setup Guide');

    // List all
    const allFiles = await container.listAllFiles();
    expect(allFiles.some((f) => f.path === 'Guides/setup.md')).toBe(true);

    // Delete
    await container.deleteFile('Guides/setup.md');
    await expect(container.readFile('Guides/setup.md')).rejects.toThrow();
  });

  it('should support folder operations and renaming', async () => {
    await container.initialize();

    await container.createFolder('Archive/2026');
    expect(fsSync.existsSync(path.join(tempDir, 'Archive/2026'))).toBe(true);

    await container.writeFile('Archive/2026/old.md', 'Old archive note');
    await container.renamePath('Archive/2026/old.md', 'Archive/2026/renamed.md');

    const renamedFile = await container.readFile('Archive/2026/renamed.md');
    expect(renamedFile.content).toBe('Old archive note');

    await container.deleteFolder('Archive');
    expect(fsSync.existsSync(path.join(tempDir, 'Archive'))).toBe(false);
  });

  it('should compute diff against local client changes', async () => {
    await container.initialize();
    await container.writeFile('note1.md', 'Content 1');
    await container.writeFile('note2.md', 'Original Content 2 #tag1');

    const diffResult = await container.diff({
      localChanges: [
        { path: 'note2.md', content: 'Modified Content 2 #tag1 #updated' },
        { path: 'new-note.md', content: '# Brand New Note\n#fresh' },
        { path: 'note1.md', content: '', deleted: true },
      ],
    });

    expect(diffResult.totalChanges).toBe(3);

    const modDiff = diffResult.files.find((f) => f.path === 'note2.md');
    expect(modDiff?.status).toBe('modified');

    const addDiff = diffResult.files.find((f) => f.path === 'new-note.md');
    expect(addDiff?.status).toBe('added');

    const delDiff = diffResult.files.find((f) => f.path === 'note1.md');
    expect(delDiff?.status).toBe('deleted');

    expect(diffResult.allDiscoveredTags).toContain('#tag1');
    expect(diffResult.allDiscoveredTags).toContain('#updated');
    expect(diffResult.allDiscoveredTags).toContain('#fresh');
  });

  it('should handle push with conflict strategies and updates', async () => {
    await container.initialize();
    await container.writeFile('conflict.md', 'Server Content');

    const pushResult = await container.push({
      files: [
        { path: 'conflict.md', content: 'Client Content' },
        { path: 'new.md', content: '# New Note' },
      ],
      resolutions: {
        'conflict.md': ConflictStrategy.CREATE_BACKUP_FORK,
      },
    });

    expect(pushResult.success).toBe(true);
    expect(pushResult.filesChanged).toBe(2);

    // Original should remain unchanged
    const original = await container.readFile('conflict.md');
    expect(original.content).toBe('Server Content');

    // Fork should be created
    const fork = await container.readFile('conflict.client.md');
    expect(fork.content).toBe('Client Content');

    // New note should be created
    const newNote = await container.readFile('new.md');
    expect(newNote.content).toBe('# New Note');
  });

  it('should pull full snapshot and incremental changes', async () => {
    await container.initialize();
    await container.writeFile('doc1.md', 'Doc 1');

    // Full pull
    const fullPull = await container.pull({});
    expect(fullPull.isFullSync).toBe(true);
    expect(fullPull.files.length).toBe(2); // Welcome.md + doc1.md

    // Pull specific paths
    const pathPull = await container.pull({ paths: ['doc1.md'] });
    expect(pathPull.isFullSync).toBe(false);
    expect(pathPull.files.length).toBe(1);
    expect(pathPull.files[0].path).toBe('doc1.md');
  });
});
