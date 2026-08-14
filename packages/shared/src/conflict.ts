/**
 * Conflict Resolution Strategies and Types
 *
 * CONFLICT HANDLING ARCHITECTURE:
 * -------------------------------------------------------------
 * When both client and server have modified the same Markdown file
 * since the last common base commit (3-way merge scenario):
 *
 * 1. Base State Tracking:
 *    - The client retains the commit hash (`lastSyncedCommit`) representing the server state
 *      it last synchronized with.
 *    - When querying `/sync/diff` or invoking `/sync/push`, the client sends `baseCommit`.
 *
 * 2. Conflict Detection:
 *    - The server checks whether `serverHeadCommit === baseCommit`.
 *    - If `serverHeadCommit !== baseCommit`, the server inspects the files modified in git
 *      between `baseCommit` and `serverHeadCommit`.
 *    - If an incoming file from the client was ALSO modified in that commit range, a CONFLICT
 *      is flagged (`status: 'conflict'`).
 *    - If modified files are disjoint (non-overlapping), the server performs a fast-forward / auto-merge.
 *
 * 3. Resolution Strategies available to the user in the Obsidian Plugin UI:
 *    - `CLIENT_WINS`: Force-push client content, creating a new commit that overwrites remote changes.
 *    - `SERVER_WINS`: Discard client local changes for this file, pulling and saving the remote content.
 *    - `CREATE_BACKUP_FORK`: Keep both versions by saving the remote version as `filename.remote.md`
 *      or local as `filename.local.md`, allowing manual markdown review in Obsidian.
 *    - `MANUAL_MERGE`: Future extension supporting 3-way in-editor diff view (like Git merge markers).
 */

export enum ConflictStrategy {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  CREATE_BACKUP_FORK = 'create_backup_fork',
  MANUAL_MERGE = 'manual_merge'
}

export interface ConflictResolutionOption {
  strategy: ConflictStrategy;
  description: string;
}

export interface FileConflictInfo {
  filePath: string;
  clientContent: string;
  serverContent: string;
  baseCommit: string;
  serverCommit: string;
  diffSummary?: string;
}
