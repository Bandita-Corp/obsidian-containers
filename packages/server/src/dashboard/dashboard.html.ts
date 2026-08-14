export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Obsidian Containers Hub & Explorer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #0a0e17;
      --bg-surface: #111827;
      --bg-card: #162032;
      --bg-card-hover: #1c2942;
      --bg-input: #0e1524;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: #8b5cf6;
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --text-muted: #6b7280;
      --accent-purple: #8b5cf6;
      --accent-purple-glow: rgba(139, 92, 246, 0.25);
      --accent-emerald: #10b981;
      --accent-emerald-glow: rgba(16, 185, 129, 0.2);
      --accent-amber: #f59e0b;
      --accent-rose: #ef4444;
      --accent-cyan: #06b6d4;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
      --shadow-card: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      --shadow-glow: 0 0 20px rgba(139, 92, 246, 0.2);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-base);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.06) 0%, transparent 40%);
      background-attachment: fixed;
    }

    /* Top Navbar */
    header {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .nav-container {
      max-width: 1380px;
      margin: 0 auto;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
      font-size: 20px;
    }

    .brand-text h1 {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 40%, #c4b5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text p {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--accent-emerald);
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent-emerald);
      box-shadow: 0 0 8px var(--accent-emerald);
    }

    .status-dot.offline {
      background: var(--accent-rose);
      box-shadow: 0 0 8px var(--accent-rose);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #9333ea, #6d28d9);
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--bg-card);
      color: var(--text-primary);
      border-color: var(--border-subtle);
    }

    .btn-secondary:hover {
      background: var(--bg-card-hover);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.12);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.3);
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
      color: #fee2e2;
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 0.78rem;
    }

    /* Main Container */
    main {
      flex: 1;
      max-width: 1380px;
      width: 100%;
      margin: 0 auto;
      padding: 28px 24px 48px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Hero / Metrics Strip */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--border-subtle);
      transition: background 0.2s ease;
    }

    .metric-card.purple::before { background: var(--accent-purple); }
    .metric-card.emerald::before { background: var(--accent-emerald); }
    .metric-card.cyan::before { background: var(--accent-cyan); }
    .metric-card.amber::before { background: var(--accent-amber); }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-card);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .metric-label {
      font-size: 0.78rem;
      color: var(--text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-val {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* Controls Bar */
    .controls-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 14px 18px;
    }

    .search-box {
      flex: 1;
      min-width: 240px;
      position: relative;
    }

    .search-box input {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 9px 14px 9px 38px;
      color: var(--text-primary);
      font-size: 0.88rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-box input:focus {
      border-color: var(--accent-purple);
      box-shadow: 0 0 0 3px var(--accent-purple-glow);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 14px;
    }

    .filter-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-input);
      padding: 4px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }

    .filter-tab {
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.15s ease;
      background: transparent;
      border: none;
    }

    .filter-tab:hover {
      color: var(--text-primary);
    }

    .filter-tab.active {
      background: var(--bg-card);
      color: var(--text-primary);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      font-weight: 600;
    }

    /* Container Grid */
    .container-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    .container-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      box-shadow: var(--shadow-card);
    }

    .container-card:hover {
      border-color: var(--accent-purple);
      transform: translateY(-3px);
      box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.5), 0 0 20px var(--accent-purple-glow);
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .card-title-group h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 3px;
    }

    .card-id {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 9px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .badge-git {
      background: rgba(139, 92, 246, 0.16);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.35);
    }

    .badge-simple {
      background: rgba(16, 185, 129, 0.16);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    .card-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.45;
      min-height: 38px;
    }

    .card-meta-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      background: rgba(0, 0, 0, 0.25);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .card-meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta-key {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .meta-val {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: auto;
      padding-top: 6px;
    }

    /* Explorer View / Drawer */
    .explorer-drawer {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      display: none;
      flex-direction: column;
      animation: fadeIn 0.25s ease;
    }

    .explorer-drawer.open {
      display: flex;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .drawer-header {
      padding: 16px 22px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .drawer-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .drawer-title h2 {
      font-size: 1.15rem;
      font-weight: 700;
    }

    .drawer-body {
      display: grid;
      grid-template-columns: 340px 1fr;
      min-height: 480px;
    }

    @media (max-width: 860px) {
      .drawer-body {
        grid-template-columns: 1fr;
      }
    }

    .drawer-sidebar {
      border-right: 1px solid var(--border-subtle);
      background: var(--bg-base);
      display: flex;
      flex-direction: column;
    }

    .sidebar-search {
      padding: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .sidebar-search input {
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 7px 10px;
      color: var(--text-primary);
      font-size: 0.82rem;
      outline: none;
    }

    .file-tree-container {
      flex: 1;
      overflow-y: auto;
      max-height: 520px;
      padding: 8px;
    }

    .file-tree-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 0.82rem;
      transition: all 0.15s ease;
      margin-bottom: 3px;
    }

    .file-tree-item:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .file-tree-item.active {
      background: rgba(139, 92, 246, 0.18);
      color: #ffffff;
      font-weight: 600;
      border-left: 3px solid var(--accent-purple);
    }

    .file-item-left {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
    }

    .file-item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-words-tag {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .drawer-preview {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
    }

    .preview-header {
      padding: 12px 18px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: var(--bg-card);
    }

    .preview-path {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent-purple);
    }

    .preview-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag-pill {
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 12px;
      background: rgba(139, 92, 246, 0.15);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.25);
    }

    .editor-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px;
    }

    .editor-wrap textarea {
      flex: 1;
      width: 100%;
      min-height: 380px;
      background: var(--bg-base);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 0.88rem;
      line-height: 1.6;
      padding: 14px;
      resize: none;
      outline: none;
    }

    .editor-wrap textarea:focus {
      border-color: var(--accent-purple);
    }

    /* Modal Styling */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
    }

    .modal-backdrop.open {
      display: flex;
    }

    .modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      max-width: 520px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      animation: modalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalSlide {
      from { transform: translateY(20px) scale(0.97); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .modal-header {
      padding: 18px 22px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 {
      font-size: 1.15rem;
      font-weight: 700;
    }

    .modal-body {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 9px 12px;
      color: var(--text-primary);
      font-size: 0.88rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      border-color: var(--accent-purple);
      box-shadow: 0 0 0 3px var(--accent-purple-glow);
    }

    .form-help {
      font-size: 0.74rem;
      color: var(--text-muted);
    }

    .type-radios {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .type-card {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 12px;
      background: var(--bg-input);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .type-card:hover {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .type-card.selected {
      border-color: var(--accent-purple);
      background: rgba(139, 92, 246, 0.1);
    }

    .type-card-title {
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .type-card-desc {
      font-size: 0.72rem;
      color: var(--text-secondary);
    }

    .modal-footer {
      padding: 16px 22px;
      background: var(--bg-card);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    /* Toast System */
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 200;
      pointer-events: none;
    }

    .toast {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px 18px;
      color: var(--text-primary);
      font-size: 0.85rem;
      font-weight: 500;
      box-shadow: var(--shadow-card);
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      animation: toastIn 0.25s ease;
      max-width: 360px;
    }

    .toast.success { border-left: 4px solid var(--accent-emerald); }
    .toast.error { border-left: 4px solid var(--accent-rose); }
    .toast.info { border-left: 4px solid var(--accent-purple); }

    @keyframes toastIn {
      from { transform: translateY(16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>

  <!-- Top Navbar -->
  <header>
    <div class="nav-container">
      <a href="#" class="brand" onclick="location.reload(); return false;">
        <div class="brand-icon">📦</div>
        <div class="brand-text">
          <h1>Obsidian Containers Hub</h1>
          <p>Multi-Container Vault Explorer & Management</p>
        </div>
      </a>

      <div class="nav-actions">
        <div class="status-pill" id="server-status">
          <span class="status-dot"></span>
          <span>Online</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="app.refreshAll()">
          🔄 Refresh
        </button>
        <button class="btn btn-primary btn-sm" onclick="app.openCreateModal()">
          ➕ New Container
        </button>
      </div>
    </div>
  </header>

  <!-- Main View -->
  <main>

    <!-- Metrics Cards -->
    <div class="metrics-grid">
      <div class="metric-card purple">
        <div class="metric-label">Total Containers</div>
        <div class="metric-val" id="metric-total-containers">0</div>
      </div>
      <div class="metric-card cyan">
        <div class="metric-label">Git-Backed Vaults</div>
        <div class="metric-val" id="metric-git-containers">0</div>
      </div>
      <div class="metric-card emerald">
        <div class="metric-label">Simple Vaults</div>
        <div class="metric-val" id="metric-simple-containers">0</div>
      </div>
      <div class="metric-card amber">
        <div class="metric-label">Total Tracked Notes</div>
        <div class="metric-val" id="metric-total-files">0</div>
      </div>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" placeholder="Search containers by name, id or notes..." oninput="app.filterContainers()">
      </div>

      <div class="filter-tabs">
        <button class="filter-tab active" data-filter="all" onclick="app.setFilter('all', this)">All</button>
        <button class="filter-tab" data-filter="git" onclick="app.setFilter('git', this)">⚡ Git Vaults</button>
        <button class="filter-tab" data-filter="simple" onclick="app.setFilter('simple', this)">📁 Simple Vaults</button>
      </div>
    </div>

    <!-- Active Explorer Section (Drawer) -->
    <section class="explorer-drawer" id="explorer-drawer">
      <div class="drawer-header">
        <div class="drawer-title">
          <span id="drawer-type-badge" class="badge"></span>
          <h2 id="drawer-container-name">Container Name</h2>
          <span id="drawer-container-id" class="card-id">id</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" onclick="app.openCreateFileModal()">➕ New Note</button>
          <button class="btn btn-secondary btn-sm" onclick="app.closeExplorer()">✕ Close Explorer</button>
        </div>
      </div>
      <div class="drawer-body">
        <div class="drawer-sidebar">
          <div class="sidebar-search">
            <input type="text" id="file-search-input" placeholder="Filter notes in vault..." oninput="app.filterFiles()">
          </div>
          <div class="file-tree-container" id="file-tree-list">
            <!-- Files loaded dynamically -->
          </div>
        </div>
        <div class="drawer-preview">
          <div class="preview-header">
            <span class="preview-path" id="preview-file-path">Select a file to inspect or edit</span>
            <div class="preview-meta" id="preview-tags"></div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" id="btn-save-file" style="display: none;" onclick="app.saveActiveFile()">💾 Save</button>
              <button class="btn btn-danger btn-sm" id="btn-delete-file" style="display: none;" onclick="app.deleteActiveFile()">🗑️ Delete</button>
            </div>
          </div>
          <div class="editor-wrap">
            <textarea id="file-editor" placeholder="Click any note from the left to view or edit markdown contents..."></textarea>
          </div>
        </div>
      </div>
    </section>

    <!-- Container Grid -->
    <div class="container-grid" id="container-grid">
      <!-- Loaded dynamically -->
    </div>

  </main>

  <!-- Create Container Modal -->
  <div class="modal-backdrop" id="create-modal">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Container</h3>
        <button class="btn btn-secondary btn-sm" onclick="app.closeCreateModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Container Display Name</label>
          <input type="text" id="new-container-name" placeholder="e.g. Work Projects" oninput="app.autoSlugId(this.value)">
        </div>
        <div class="form-group">
          <label>Container Identifier (Slug)</label>
          <input type="text" id="new-container-id" placeholder="work-projects">
          <span class="form-help">Unique lowercase slug used for backend storage and URLs.</span>
        </div>
        <div class="form-group">
          <label>Storage & Versioning Type</label>
          <div class="type-radios">
            <div class="type-card selected" id="type-card-git" onclick="app.selectType('git')">
              <div class="type-card-title">⚡ Git Container</div>
              <div class="type-card-desc">Git history, branchless commit tracking, and diff calculation.</div>
            </div>
            <div class="type-card" id="type-card-simple" onclick="app.selectType('simple')">
              <div class="type-card-title">📁 Simple FS</div>
              <div class="type-card-desc">Direct filesystem storage, fast and lightweight.</div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Description (Optional)</label>
          <input type="text" id="new-container-desc" placeholder="Notes for team projects and research...">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeCreateModal()">Cancel</button>
        <button class="btn btn-primary" id="btn-submit-container" onclick="app.submitCreateContainer()">Create Container</button>
      </div>
    </div>
  </div>

  <!-- Create Note Modal -->
  <div class="modal-backdrop" id="create-note-modal">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Note</h3>
        <button class="btn btn-secondary btn-sm" onclick="app.closeCreateNoteModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Note Path / File Name</label>
          <input type="text" id="new-note-path" placeholder="daily/2026-08-20.md">
          <span class="form-help">Relative path inside the container.</span>
        </div>
        <div class="form-group">
          <label>Initial Content (Optional)</label>
          <textarea id="new-note-content" rows="6" placeholder="# Title\n\n---\ntags:\n  - project\n---\n\nInitial note content..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeCreateNoteModal()">Cancel</button>
        <button class="btn btn-primary" id="btn-submit-note" onclick="app.submitCreateNote()">Create Note</button>
      </div>
    </div>
  </div>

  <!-- Confirm Delete Modal -->
  <div class="modal-backdrop" id="confirm-modal">
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="confirm-title">Confirm Deletion</h3>
        <button class="btn btn-secondary btn-sm" onclick="app.closeConfirmModal()">✕</button>
      </div>
      <div class="modal-body">
        <p id="confirm-message" style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;"></p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="app.closeConfirmModal()">Cancel</button>
        <button class="btn btn-danger" id="btn-confirm-action">Confirm Delete</button>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div class="toast-container" id="toast-container"></div>

  <script>
    class App {
      constructor() {
        this.containers = [];
        this.activeFilter = 'all';
        this.activeContainer = null;
        this.activeFiles = [];
        this.activeFilePath = null;
        this.selectedNewType = 'git';
        this.init();
      }

      async init() {
        await this.refreshAll();
      }

      async refreshAll() {
        try {
          const res = await fetch('/containers');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          this.containers = await res.json();
          this.updateMetrics();
          this.renderContainers();
          this.setOnline(true);
        } catch (err) {
          console.error(err);
          this.setOnline(false);
          this.showToast('Failed to connect to backend containers API', 'error');
        }
      }

      setOnline(online) {
        const el = document.getElementById('server-status');
        if (online) {
          el.innerHTML = '<span class="status-dot"></span><span>Online</span>';
          el.style.color = 'var(--accent-emerald)';
        } else {
          el.innerHTML = '<span class="status-dot offline"></span><span>Offline</span>';
          el.style.color = 'var(--accent-rose)';
        }
      }

      updateMetrics() {
        const total = this.containers.length;
        const git = this.containers.filter(c => c.type === 'git').length;
        const simple = this.containers.filter(c => c.type === 'simple').length;
        let totalFiles = 0;
        this.containers.forEach(c => totalFiles += (c.totalFiles || 0));

        document.getElementById('metric-total-containers').textContent = total;
        document.getElementById('metric-git-containers').textContent = git;
        document.getElementById('metric-simple-containers').textContent = simple;
        document.getElementById('metric-total-files').textContent = totalFiles;
      }

      setFilter(filter, el) {
        this.activeFilter = filter;
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
        this.renderContainers();
      }

      filterContainers() {
        this.renderContainers();
      }

      renderContainers() {
        const grid = document.getElementById('container-grid');
        const query = document.getElementById('search-input').value.toLowerCase().trim();

        const filtered = this.containers.filter(c => {
          const matchesType = this.activeFilter === 'all' || c.type === this.activeFilter;
          const matchesSearch = !query || 
            c.name.toLowerCase().includes(query) || 
            c.id.toLowerCase().includes(query) ||
            (c.description && c.description.toLowerCase().includes(query));
          return matchesType && matchesSearch;
        });

        if (filtered.length === 0) {
          grid.innerHTML = \`
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
              <div style="font-size: 3rem; margin-bottom: 12px;">📂</div>
              <h3>No matching containers found</h3>
              <p style="font-size: 0.85rem; margin-top: 6px;">Create a new container or adjust your search filter.</p>
            </div>
          \`;
          return;
        }

        grid.innerHTML = filtered.map(c => {
          const isGit = c.type === 'git';
          const badgeClass = isGit ? 'badge-git' : 'badge-simple';
          const badgeText = isGit ? '⚡ GIT VAULT' : '📁 SIMPLE FS';
          const commitText = isGit ? (c.currentCommit ? c.currentCommit.slice(0, 7) : 'init') : 'direct fs';

          return \`
            <div class="container-card" id="card-\${c.id}">
              <div class="card-top">
                <div class="card-title-group">
                  <h3>\${this.escapeHtml(c.name)}</h3>
                  <span class="card-id">\${this.escapeHtml(c.id)}</span>
                </div>
                <span class="badge \${badgeClass}">\${badgeText}</span>
              </div>

              <p class="card-desc">\${this.escapeHtml(c.description || 'No description provided.')}</p>

              <div class="card-meta-list">
                <div class="card-meta-item">
                  <span class="meta-key">Notes</span>
                  <span class="meta-val">📝 \${c.totalFiles || 0} files</span>
                </div>
                <div class="card-meta-item">
                  <span class="meta-key">\${isGit ? 'HEAD Commit' : 'Engine'}</span>
                  <span class="meta-val">\${commitText}</span>
                </div>
              </div>

              <div class="card-actions">
                <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="app.exploreContainer('\${c.id}')">
                  📂 Explore Notes
                </button>
                <button class="btn btn-secondary btn-sm" onclick="app.openCreateFileForContainer('\${c.id}')" title="Add note to this container">
                  ➕ Note
                </button>
                <button class="btn btn-danger btn-sm" onclick="app.promptDeleteContainer('\${c.id}', '\${this.escapeHtml(c.name)}')" title="Delete Container">
                  🗑️
                </button>
              </div>
            </div>
          \`;
        }).join('');
      }

      async exploreContainer(containerId) {
        const container = this.containers.find(c => c.id === containerId);
        if (!container) return;

        this.activeContainer = container;
        const drawer = document.getElementById('explorer-drawer');
        drawer.classList.add('open');

        // Scroll to drawer
        drawer.scrollIntoView({ behavior: 'smooth' });

        document.getElementById('drawer-container-name').textContent = container.name;
        document.getElementById('drawer-container-id').textContent = container.id;
        const badge = document.getElementById('drawer-type-badge');
        badge.className = 'badge ' + (container.type === 'git' ? 'badge-git' : 'badge-simple');
        badge.textContent = container.type === 'git' ? '⚡ GIT' : '📁 SIMPLE';

        // Fetch files
        try {
          const res = await fetch(\`/containers/\${containerId}/files\`);
          this.activeFiles = await res.json();
          this.renderFileTree();
          if (this.activeFiles.length > 0) {
            this.loadFile(this.activeFiles[0].path);
          } else {
            this.clearEditor();
          }
        } catch (err) {
          this.showToast('Failed to load container files: ' + err.message, 'error');
        }
      }

      closeExplorer() {
        document.getElementById('explorer-drawer').classList.remove('open');
        this.activeContainer = null;
        this.activeFilePath = null;
      }

      filterFiles() {
        this.renderFileTree();
      }

      renderFileTree() {
        const list = document.getElementById('file-tree-list');
        const query = document.getElementById('file-search-input').value.toLowerCase().trim();

        const filtered = this.activeFiles.filter(f => {
          return !query || f.path.toLowerCase().includes(query) || (f.metadata?.title && f.metadata.title.toLowerCase().includes(query));
        });

        if (filtered.length === 0) {
          list.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No notes in this container.</div>';
          return;
        }

        list.innerHTML = filtered.map(f => {
          const isActive = f.path === this.activeFilePath ? 'active' : '';
          const name = f.metadata?.title || f.path;
          const words = f.metadata?.wordCount ? f.metadata.wordCount + 'w' : '';

          return \`
            <div class="file-tree-item \${isActive}" onclick="app.loadFile('\${this.escapeHtml(f.path)}')">
              <div class="file-item-left">
                <span>📄</span>
                <span class="file-item-name" title="\${this.escapeHtml(f.path)}">\${this.escapeHtml(name)}</span>
              </div>
              <span class="file-words-tag">\${words}</span>
            </div>
          \`;
        }).join('');
      }

      async loadFile(filePath) {
        if (!this.activeContainer) return;
        this.activeFilePath = filePath;
        this.renderFileTree();

        document.getElementById('preview-file-path').textContent = filePath;
        document.getElementById('btn-save-file').style.display = 'inline-flex';
        document.getElementById('btn-delete-file').style.display = 'inline-flex';

        try {
          const res = await fetch(\`/containers/\${this.activeContainer.id}/file?path=\${encodeURIComponent(filePath)}\`);
          const data = await res.json();
          document.getElementById('file-editor').value = data.content || '';

          // Render tags
          const tagsEl = document.getElementById('preview-tags');
          if (data.metadata?.tags && data.metadata.tags.length > 0) {
            tagsEl.innerHTML = data.metadata.tags.map(t => \`<span class="tag-pill">#\${this.escapeHtml(t.replace(/^#/, ''))}</span>\`).join('');
          } else {
            tagsEl.innerHTML = '';
          }
        } catch (err) {
          this.showToast('Failed to read file: ' + err.message, 'error');
        }
      }

      clearEditor() {
        this.activeFilePath = null;
        document.getElementById('preview-file-path').textContent = 'No file selected';
        document.getElementById('preview-tags').innerHTML = '';
        document.getElementById('file-editor').value = '';
        document.getElementById('btn-save-file').style.display = 'none';
        document.getElementById('btn-delete-file').style.display = 'none';
      }

      async saveActiveFile() {
        if (!this.activeContainer || !this.activeFilePath) return;
        const content = document.getElementById('file-editor').value;
        const btn = document.getElementById('btn-save-file');
        btn.disabled = true;
        btn.textContent = 'Saving...';

        try {
          const res = await fetch(\`/containers/\${this.activeContainer.id}/file\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: this.activeFilePath, content })
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          this.showToast('Saved file "' + this.activeFilePath + '"', 'success');
          await this.exploreContainer(this.activeContainer.id);
        } catch (err) {
          this.showToast('Failed to save file: ' + err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = '💾 Save';
        }
      }

      promptDeleteContainer(id, name) {
        this.openConfirmModal(
          'Delete Container "' + name + '"?',
          'Are you sure you want to delete container "' + id + '"? This will unregister the container from the storage registry.',
          async () => {
            try {
              const res = await fetch(\`/containers/\${id}\`, { method: 'DELETE' });
              if (!res.ok) throw new Error('HTTP ' + res.status);
              this.showToast('Container deleted successfully', 'success');
              if (this.activeContainer?.id === id) this.closeExplorer();
              await this.refreshAll();
            } catch (err) {
              this.showToast('Failed to delete container: ' + err.message, 'error');
            }
          }
        );
      }

      deleteActiveFile() {
        if (!this.activeContainer || !this.activeFilePath) return;
        const path = this.activeFilePath;
        this.openConfirmModal(
          'Delete Note "' + path + '"?',
          'Are you sure you want to delete this note from container "' + this.activeContainer.name + '"?',
          async () => {
            try {
              const res = await fetch(\`/containers/\${this.activeContainer.id}/file?path=\${encodeURIComponent(path)}\`, { method: 'DELETE' });
              if (!res.ok) throw new Error('HTTP ' + res.status);
              this.showToast('Note deleted successfully', 'success');
              await this.exploreContainer(this.activeContainer.id);
            } catch (err) {
              this.showToast('Failed to delete note: ' + err.message, 'error');
            }
          }
        );
      }

      // Modals
      openCreateModal() {
        document.getElementById('new-container-name').value = '';
        document.getElementById('new-container-id').value = '';
        document.getElementById('new-container-desc').value = '';
        this.selectType('git');
        document.getElementById('create-modal').classList.add('open');
      }

      closeCreateModal() {
        document.getElementById('create-modal').classList.remove('open');
      }

      selectType(type) {
        this.selectedNewType = type;
        document.getElementById('type-card-git').classList.toggle('selected', type === 'git');
        document.getElementById('type-card-simple').classList.toggle('selected', type === 'simple');
      }

      autoSlugId(name) {
        const idInput = document.getElementById('new-container-id');
        idInput.value = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
      }

      async submitCreateContainer() {
        const name = document.getElementById('new-container-name').value.trim();
        const id = document.getElementById('new-container-id').value.trim();
        const desc = document.getElementById('new-container-desc').value.trim();

        if (!name) {
          this.showToast('Please enter a container name', 'error');
          return;
        }

        const btn = document.getElementById('btn-submit-container');
        btn.disabled = true;
        btn.textContent = 'Creating...';

        try {
          const res = await fetch('/containers/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              id: id || undefined,
              type: this.selectedNewType,
              description: desc || undefined,
            })
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || 'HTTP ' + res.status);
          }

          const created = await res.json();
          this.showToast('Container "' + created.name + '" registered!', 'success');
          this.closeCreateModal();
          await this.refreshAll();
        } catch (err) {
          this.showToast('Failed to create container: ' + err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Create Container';
        }
      }

      openCreateFileModal() {
        if (!this.activeContainer) return;
        document.getElementById('new-note-path').value = '';
        document.getElementById('new-note-content').value = '';
        document.getElementById('create-note-modal').classList.add('open');
      }

      openCreateFileForContainer(containerId) {
        this.exploreContainer(containerId).then(() => {
          this.openCreateFileModal();
        });
      }

      closeCreateNoteModal() {
        document.getElementById('create-note-modal').classList.remove('open');
      }

      async submitCreateNote() {
        if (!this.activeContainer) return;
        let path = document.getElementById('new-note-path').value.trim();
        const content = document.getElementById('new-note-content').value;

        if (!path) {
          this.showToast('Please specify a note path', 'error');
          return;
        }
        if (!path.endsWith('.md') && !path.includes('.')) {
          path += '.md';
        }

        const btn = document.getElementById('btn-submit-note');
        btn.disabled = true;
        btn.textContent = 'Creating...';

        try {
          const res = await fetch(\`/containers/\${this.activeContainer.id}/file\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path,
              content: content || ('# ' + path.replace(/\\.md$/i, '') + '\\n\\nCreated via Containers Hub\\n')
            })
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          this.showToast('Note created successfully', 'success');
          this.closeCreateNoteModal();
          await this.exploreContainer(this.activeContainer.id);
          this.loadFile(path);
        } catch (err) {
          this.showToast('Failed to create note: ' + err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Create Note';
        }
      }

      openConfirmModal(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        const confirmBtn = document.getElementById('btn-confirm-action');

        confirmBtn.onclick = async () => {
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Processing...';
          try {
            await onConfirm();
            this.closeConfirmModal();
          } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Delete';
          }
        };

        document.getElementById('confirm-modal').classList.add('open');
      }

      closeConfirmModal() {
        document.getElementById('confirm-modal').classList.remove('open');
      }

      showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
        toast.innerHTML = '<span>' + icon + '</span><span>' + this.escapeHtml(message) + '</span>';
        container.appendChild(toast);

        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(10px)';
          toast.style.transition = 'all 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }, 3500);
      }

      escapeHtml(str) {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }
    }

    const app = new App();
  </script>
</body>
</html>`;
}
