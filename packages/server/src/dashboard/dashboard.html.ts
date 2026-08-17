export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Obsidian Containers Hub & Workspace</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #0a0e17;
      --bg-surface: #111827;
      --bg-card: #162032;
      --bg-card-hover: #1c2942;
      --bg-input: #0e1524;
      --bg-active: rgba(139, 92, 246, 0.16);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: #8b5cf6;
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --text-muted: #6b7280;
      --accent-purple: #8b5cf6;
      --accent-purple-hover: #7c3aed;
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
      background: rgba(17, 24, 39, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .nav-container {
      max-width: 1520px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
      font-size: 18px;
    }

    .brand-text h1 {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 40%, #c4b5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text p {
      font-size: 0.72rem;
      color: var(--text-secondary);
    }

    .nav-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-muted);
      border-left: 1px solid var(--border-subtle);
      padding-left: 16px;
    }

    .nav-breadcrumb a {
      color: var(--text-secondary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.15s;
    }

    .nav-breadcrumb a:hover {
      color: var(--text-primary);
    }

    .nav-breadcrumb-current {
      color: var(--text-primary);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 5px 12px;
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
      gap: 7px;
      padding: 7px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
      text-decoration: none;
      white-space: nowrap;
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

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
    }

    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-primary);
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 0.76rem;
    }

    .btn-icon {
      padding: 6px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    /* Page Views (Hub vs Separated Explorer) */
    .view-page {
      display: none;
      flex: 1;
      width: 100%;
    }

    .view-page.active {
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* HUB VIEW */
    .hub-container {
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      padding: 28px 24px 48px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Metrics Strip */
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
      font-size: 0.76rem;
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
      font-size: 0.74rem;
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

    /* SEPARATED EXPLORER VIEW */
    .explorer-page-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 61px);
      overflow: hidden;
    }

    .explorer-subnav {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-shrink: 0;
    }

    .explorer-subnav-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .container-switch-select {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }

    .container-switch-select:focus {
      border-color: var(--accent-purple);
    }

    .explorer-subnav-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .explorer-workspace-split {
      flex: 1;
      display: grid;
      grid-template-columns: 320px 1fr;
      height: 100%;
      overflow: hidden;
    }

    @media (max-width: 900px) {
      .explorer-workspace-split {
        grid-template-columns: 260px 1fr;
      }
    }

    /* Explorer Sidebar (Left Pane) */
    .explorer-sidebar {
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .sidebar-actions-bar {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-card);
    }

    .inline-note-creator {
      display: none;
      flex-direction: column;
      gap: 8px;
      background: var(--bg-input);
      border: 1px solid var(--accent-purple);
      border-radius: var(--radius-sm);
      padding: 10px;
      animation: fadeIn 0.15s ease;
    }

    .inline-note-creator.open {
      display: flex;
    }

    .inline-note-creator input {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 7px 10px;
      color: var(--text-primary);
      font-size: 0.82rem;
      font-family: var(--font-mono);
      outline: none;
    }

    .inline-note-creator input:focus {
      border-color: var(--accent-purple);
    }

    .inline-template-select {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 5px 8px;
      color: var(--text-secondary);
      font-size: 0.76rem;
      outline: none;
    }

    .inline-note-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }

    .sidebar-search-wrap {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-subtle);
      position: relative;
    }

    .sidebar-search-wrap input {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 7px 10px 7px 30px;
      color: var(--text-primary);
      font-size: 0.8rem;
      outline: none;
    }

    .sidebar-search-wrap input:focus {
      border-color: var(--accent-purple);
    }

    .sidebar-search-wrap .search-icon {
      position: absolute;
      left: 22px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: var(--text-muted);
    }

    .sidebar-file-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 3px;
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
      position: relative;
    }

    .file-tree-item:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .file-tree-item.active {
      background: var(--bg-active);
      color: #ffffff;
      font-weight: 600;
      border-left: 3px solid var(--accent-purple);
    }

    .file-item-left {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      flex: 1;
    }

    .file-item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-item-meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .file-words-tag {
      font-size: 0.7rem;
      color: var(--text-muted);
      background: rgba(0, 0, 0, 0.25);
      padding: 1px 5px;
      border-radius: 4px;
    }

    .file-delete-hover-btn {
      opacity: 0;
      transition: opacity 0.15s ease;
      color: #fca5a5;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 11px;
    }

    .file-tree-item:hover .file-delete-hover-btn {
      opacity: 1;
    }

    .file-delete-hover-btn:hover {
      background: rgba(239, 68, 68, 0.2);
    }

    .sidebar-empty {
      padding: 32px 16px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.82rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    /* Explorer Workspace (Right Pane) */
    .explorer-workspace {
      background: var(--bg-base);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .workspace-header {
      padding: 10px 20px;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-shrink: 0;
    }

    .workspace-path-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .workspace-path {
      font-family: var(--font-mono);
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--accent-purple);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dirty-pill {
      display: none;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--accent-amber);
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 2px 7px;
      border-radius: 10px;
    }

    .dirty-pill.show {
      display: inline-flex;
    }

    .workspace-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stat-badge {
      font-size: 0.72rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 8px;
      border-radius: 4px;
      font-family: var(--font-mono);
    }

    .tag-pill {
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 12px;
      background: rgba(139, 92, 246, 0.15);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.25);
    }

    .view-mode-tabs {
      display: flex;
      align-items: center;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 2px;
    }

    .view-mode-btn {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.76rem;
      font-weight: 500;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }

    .view-mode-btn.active {
      background: var(--bg-card);
      color: var(--text-primary);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      font-weight: 600;
    }

    /* Markdown Formatting Toolbar */
    .editor-toolbar {
      padding: 6px 16px;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-card);
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .tool-btn {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 4px;
      padding: 4px 8px;
      color: var(--text-secondary);
      font-size: 0.76rem;
      font-family: var(--font-mono);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .tool-btn:hover {
      background: var(--bg-surface);
      color: var(--text-primary);
      border-color: var(--border-subtle);
    }

    .tool-divider {
      width: 1px;
      height: 16px;
      background: var(--border-subtle);
      margin: 0 4px;
    }

    /* Editor and Preview Workspace Body */
    .workspace-body {
      flex: 1;
      display: flex;
      height: calc(100% - 88px);
      overflow: hidden;
    }

    .editor-pane, .preview-pane {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .editor-pane {
      background: var(--bg-base);
    }

    .preview-pane {
      background: var(--bg-surface);
      border-left: 1px solid var(--border-subtle);
      padding: 24px 32px;
      color: var(--text-primary);
      line-height: 1.7;
    }

    /* Hide / Show based on view modes */
    .mode-edit .editor-pane { display: flex; width: 100%; }
    .mode-edit .preview-pane { display: none; }

    .mode-preview .editor-pane { display: none; }
    .mode-preview .preview-pane { display: block; border-left: none; width: 100%; }

    .mode-split .editor-pane { display: flex; width: 50%; }
    .mode-split .preview-pane { display: block; width: 50%; }

    .main-textarea {
      flex: 1;
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 0.88rem;
      line-height: 1.65;
      padding: 20px;
      resize: none;
      outline: none;
      tab-size: 2;
    }

    /* Preview Typography (Rich Markdown) */
    .preview-pane h1, .preview-pane h2, .preview-pane h3, .preview-pane h4 {
      color: #ffffff;
      margin-top: 1.3em;
      margin-bottom: 0.6em;
      font-weight: 700;
      line-height: 1.3;
    }

    .preview-pane h1:first-child { margin-top: 0; }
    .preview-pane h1 { font-size: 1.75rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; }
    .preview-pane h2 { font-size: 1.35rem; color: #c4b5fd; }
    .preview-pane h3 { font-size: 1.15rem; color: #a78bfa; }
    .preview-pane p { margin-bottom: 1em; color: #d1d5db; }
    .preview-pane ul, .preview-pane ol { margin-bottom: 1em; padding-left: 24px; color: #d1d5db; }
    .preview-pane li { margin-bottom: 0.35em; }

    .preview-pane code {
      font-family: var(--font-mono);
      font-size: 0.85em;
      background: rgba(139, 92, 246, 0.14);
      color: #ddd6fe;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .preview-pane pre {
      background: #090d16;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      overflow-x: auto;
      margin: 1em 0;
    }

    .preview-pane pre code {
      background: transparent;
      padding: 0;
      color: #e2e8f0;
      display: block;
    }

    .preview-pane blockquote {
      border-left: 4px solid var(--accent-purple);
      padding: 8px 16px;
      background: rgba(139, 92, 246, 0.06);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      color: var(--text-secondary);
      margin: 1.2em 0;
    }

    .preview-pane table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
    }

    .preview-pane th, .preview-pane td {
      border: 1px solid var(--border-subtle);
      padding: 8px 12px;
      text-align: left;
      font-size: 0.88rem;
    }

    .preview-pane th {
      background: var(--bg-card);
      font-weight: 600;
    }

    .preview-pane tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02);
    }

    .preview-pane input[type="checkbox"] {
      margin-right: 8px;
      accent-color: var(--accent-purple);
      cursor: pointer;
    }

    .empty-workspace-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      gap: 14px;
      padding: 40px;
      text-align: center;
    }

    .empty-workspace-state .empty-icon {
      font-size: 3.5rem;
      opacity: 0.7;
    }

    /* Common Modal System */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .modal-backdrop.open {
      display: flex;
      opacity: 1;
    }

    .modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      max-width: 520px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      overflow: hidden;
      transform: translateY(16px) scale(0.97);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-backdrop.open .modal-card {
      transform: translateY(0) scale(1);
    }

    .modal-header {
      padding: 16px 20px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .modal-body {
      padding: 20px;
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
      font-size: 0.78rem;
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
      background: rgba(139, 92, 246, 0.12);
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
      padding: 14px 20px;
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
      max-width: 380px;
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
      <div class="nav-left">
        <a href="/" class="brand" onclick="app.navigateToHub(event)">
          <div class="brand-icon">📦</div>
          <div class="brand-text">
            <h1>Obsidian Containers</h1>
            <p>Vaults & Storage Hub</p>
          </div>
        </a>

        <!-- Dynamic Breadcrumb -->
        <div class="nav-breadcrumb" id="nav-breadcrumb" style="display: none;">
          <span>/</span>
          <a href="/" onclick="app.navigateToHub(event)">Vaults Hub</a>
          <span>/</span>
          <span class="nav-breadcrumb-current" id="breadcrumb-container-name">Workspace</span>
        </div>
      </div>

      <div class="nav-actions">
        <div class="status-pill" id="server-status">
          <span class="status-dot"></span>
          <span>Online</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-global-refresh" onclick="app.refreshAll()">
          🔄 Refresh
        </button>
        <button class="btn btn-primary btn-sm" id="btn-new-container" onclick="app.createContainerModal.open()">
          ➕ New Container
        </button>
      </div>
    </div>
  </header>

  <!-- PAGE 1: CONTAINERS HUB VIEW -->
  <main id="view-hub" class="view-page active">
    <div class="hub-container">
      
      <!-- Metrics Strip -->
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
          <div class="metric-label">Simple FS Vaults</div>
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
          <input type="text" id="search-input" placeholder="Search containers by name, id or description..." oninput="app.filterContainers()">
        </div>

        <div class="filter-tabs">
          <button class="filter-tab active" data-filter="all" onclick="app.setFilter('all', this)">All</button>
          <button class="filter-tab" data-filter="git" onclick="app.setFilter('git', this)">⚡ Git Vaults</button>
          <button class="filter-tab" data-filter="simple" onclick="app.setFilter('simple', this)">📁 Simple Vaults</button>
        </div>
      </div>

      <!-- Container Grid -->
      <div class="container-grid" id="container-grid">
        <!-- Loaded dynamically -->
      </div>
    </div>
  </main>

  <!-- PAGE 2: SEPARATED EXPLORER & WORKSPACE VIEW -->
  <div id="view-explorer" class="view-page explorer-page-view">
    
    <!-- Subnavigation / Context Header -->
    <div class="explorer-subnav">
      <div class="explorer-subnav-left">
        <button class="btn btn-secondary btn-sm" onclick="app.navigateToHub(event)">
          ← All Vaults
        </button>

        <span style="color: var(--border-subtle); font-size: 1.2rem;">|</span>

        <!-- Container Switcher -->
        <select id="explorer-container-select" class="container-switch-select" onchange="app.switchContainerFromSelect(this.value)">
          <!-- Populated dynamically -->
        </select>

        <span id="explorer-container-badge" class="badge"></span>
        <span id="explorer-container-id" class="card-id"></span>
      </div>

      <div class="explorer-subnav-right">
        <span id="explorer-commit-info" class="card-id" style="font-size: 0.72rem;"></span>
        <button class="btn btn-secondary btn-sm" onclick="app.refreshCurrentContainerFiles()" title="Reload files in container">
          🔄 Reload Files
        </button>
      </div>
    </div>

    <!-- Two-Sided Split Workspace -->
    <div class="explorer-workspace-split">
      
      <!-- Left Pane: File Tree & Inline Note Creator -->
      <aside class="explorer-sidebar">
        <div class="sidebar-actions-bar">
          <button class="btn btn-primary btn-sm" id="btn-toggle-inline-create" style="width: 100%;" onclick="app.toggleInlineNoteCreator()">
            ➕ New Note
          </button>

          <!-- Inline Note Creation Box -->
          <div class="inline-note-creator" id="inline-note-creator">
            <input type="text" id="inline-note-path" placeholder="e.g. daily/today.md" onkeydown="if(event.key==='Enter') app.submitInlineNote();">
            <select id="inline-note-template" class="inline-template-select">
              <option value="blank">Template: Blank Note</option>
              <option value="daily">Template: Daily Note</option>
              <option value="meeting">Template: Meeting Minutes</option>
              <option value="project">Template: Project Wiki</option>
            </select>
            <div class="inline-note-buttons">
              <button class="btn btn-ghost btn-sm" onclick="app.toggleInlineNoteCreator(false)">Cancel</button>
              <button class="btn btn-primary btn-sm" id="btn-submit-inline-note" onclick="app.submitInlineNote()">Create</button>
            </div>
          </div>
        </div>

        <div class="sidebar-search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="file-search-input" placeholder="Filter notes in vault..." oninput="app.filterFiles()">
        </div>

        <div class="sidebar-file-list" id="sidebar-file-list">
          <!-- Files rendered dynamically -->
        </div>
      </aside>

      <!-- Right Pane: Markdown Text Editor & Live Preview -->
      <section class="explorer-workspace mode-split" id="workspace-mode-container">
        
        <!-- Workspace Top Header -->
        <div class="workspace-header">
          <div class="workspace-path-bar">
            <span>📄</span>
            <span class="workspace-path" id="workspace-file-path">Select a note to inspect or edit</span>
            <span class="dirty-pill" id="dirty-indicator">● Unsaved</span>
          </div>

          <div class="workspace-meta">
            <div id="workspace-tags" style="display: flex; gap: 6px;"></div>
            <span class="stat-badge" id="stat-words" style="display: none;">0 words</span>
            <span class="stat-badge" id="stat-chars" style="display: none;">0 chars</span>

            <!-- Mode Switcher -->
            <div class="view-mode-tabs" id="view-mode-tabs" style="display: none;">
              <button class="view-mode-btn" data-mode="edit" onclick="app.setViewMode('edit')">✏️ Edit</button>
              <button class="view-mode-btn active" data-mode="split" onclick="app.setViewMode('split')">🌓 Split</button>
              <button class="view-mode-btn" data-mode="preview" onclick="app.setViewMode('preview')">👁️ Preview</button>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm" id="btn-save-note" style="display: none;" onclick="app.saveActiveFile()">
                💾 Save Note
              </button>
              <button class="btn btn-danger btn-sm" id="btn-delete-note" style="display: none;" onclick="app.promptDeleteActiveNote()">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Markdown Formatting Bar (Edit/Split modes) -->
        <div class="editor-toolbar" id="editor-toolbar" style="display: none;">
          <button class="tool-btn" onclick="app.insertMarkdown('**', '**')" title="Bold">B</button>
          <button class="tool-btn" onclick="app.insertMarkdown('*', '*')" title="Italic">I</button>
          <div class="tool-divider"></div>
          <button class="tool-btn" onclick="app.insertMarkdown('# ', '')">H1</button>
          <button class="tool-btn" onclick="app.insertMarkdown('## ', '')">H2</button>
          <button class="tool-btn" onclick="app.insertMarkdown('### ', '')">H3</button>
          <div class="tool-divider"></div>
          <button class="tool-btn" onclick="app.insertMarkdown('- ', '')">List</button>
          <button class="tool-btn" onclick="app.insertMarkdown('- [ ] ', '')">Task</button>
          <button class="tool-btn" onclick="app.insertInlineCode()" title="Inline Code">Code</button>
          <button class="tool-btn" onclick="app.insertCodeBlock()" title="Code Block">Block</button>
          <button class="tool-btn" onclick="app.insertMarkdown('> ', '')">Quote</button>
          <button class="tool-btn" onclick="app.insertMarkdown('| Header 1 | Header 2 |\\n| --- | --- |\\n| Cell 1 | Cell 2 |\\n', '')">Table</button>
          <button class="tool-btn" onclick="app.insertMarkdown('[Link Title](', ')')">Link</button>
          <div class="tool-divider"></div>
          <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: auto; font-family: var(--font-mono);">
            Shortcut: <kbd style="background: rgba(255,255,255,0.08); padding: 1px 4px; border-radius: 3px;">Ctrl+S</kbd> to save
          </span>
        </div>

        <!-- Workspace Body (Editor & Preview Panes) -->
        <div class="workspace-body" id="workspace-body">
          <div class="empty-workspace-state" id="empty-workspace-state">
            <div class="empty-icon">📝</div>
            <h3>No Note Selected</h3>
            <p>Select a note from the left sidebar or click <strong>➕ New Note</strong> to start writing.</p>
          </div>

          <div class="editor-pane" id="editor-pane" style="display: none;">
            <textarea 
              id="file-editor-textarea" 
              class="main-textarea" 
              placeholder="Type your markdown note content here..."
              oninput="app.onEditorInput()"
              onkeydown="app.onEditorKeyDown(event)"
            ></textarea>
          </div>

          <div class="preview-pane" id="preview-pane" style="display: none;">
            <!-- Rendered Markdown HTML -->
          </div>
        </div>

      </section>

    </div>
  </div>

  <!-- ================= COMMON MODALS ================= -->

  <!-- 1. Create Container Modal -->
  <div class="modal-backdrop" id="modal-create-container">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Container</h3>
        <button class="btn btn-ghost btn-sm modal-close-btn">✕</button>
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
            <div class="type-card selected" id="type-card-git" onclick="app.selectNewContainerType('git')">
              <div class="type-card-title">⚡ Git Container</div>
              <div class="type-card-desc">Git history, branchless commit tracking, and diff calculation.</div>
            </div>
            <div class="type-card" id="type-card-simple" onclick="app.selectNewContainerType('simple')">
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
        <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="btn-submit-container" onclick="app.submitCreateContainer()">Create Container</button>
      </div>
    </div>
  </div>

  <!-- 2. Universal Confirm Modal (Reused for note and container deletion) -->
  <div class="modal-backdrop" id="modal-confirm">
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="confirm-modal-title">Confirm Action</h3>
        <button class="btn btn-ghost btn-sm modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        <p id="confirm-modal-message" style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;"></p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
        <button class="btn btn-danger" id="btn-confirm-action">Confirm</button>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div class="toast-container" id="toast-container"></div>

  <!-- APPLICATION LOGIC & COMMON MODAL SCRIPT -->
  <script>
    /**
     * CommonModal Component
     * Encapsulates common modal behaviors:
     * - Global Escape key dismissal
     * - Backdrop click dismissal
     * - Close / Cancel button event binding
     * - Focus management & animated transitions
     */
    class CommonModal {
      static activeStack = [];

      constructor(modalId, options = {}) {
        this.backdrop = document.getElementById(modalId);
        this.card = this.backdrop ? this.backdrop.querySelector('.modal-card') : null;
        this.options = options;
        this.isOpen = false;
        this.initEvents();
      }

      initEvents() {
        if (!this.backdrop) return;

        // Backdrop click to close
        this.backdrop.addEventListener('click', (e) => {
          if (e.target === this.backdrop) {
            this.close();
          }
        });

        // Bind close and cancel buttons
        const closeBtns = this.backdrop.querySelectorAll('.modal-close-btn, .modal-cancel-btn');
        closeBtns.forEach((btn) => {
          btn.addEventListener('click', () => this.close());
        });
      }

      open() {
        if (!this.backdrop) return;
        this.backdrop.classList.add('open');
        this.isOpen = true;
        CommonModal.activeStack.push(this);

        if (this.options.onOpen) {
          this.options.onOpen();
        }

        // Focus first text input if available
        const firstInput = this.backdrop.querySelector('input[type="text"], textarea');
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 50);
        }
      }

      close() {
        if (!this.backdrop || !this.isOpen) return;
        this.backdrop.classList.remove('open');
        this.isOpen = false;

        const idx = CommonModal.activeStack.indexOf(this);
        if (idx !== -1) {
          CommonModal.activeStack.splice(idx, 1);
        }

        if (this.options.onClose) {
          this.options.onClose();
        }
      }

      static closeTopmost() {
        if (CommonModal.activeStack.length > 0) {
          const top = CommonModal.activeStack[CommonModal.activeStack.length - 1];
          top.close();
          return true;
        }
        return false;
      }
    }

    // Global Keydown Handler for Escape Key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        const closed = CommonModal.closeTopmost();
        if (!closed) {
          // If inline note creator is open in explorer, close it on ESC
          const inlineCreator = document.getElementById('inline-note-creator');
          if (inlineCreator && inlineCreator.classList.contains('open')) {
            inlineCreator.classList.remove('open');
            const btn = document.getElementById('btn-toggle-inline-create');
            if (btn) btn.style.display = 'inline-flex';
          }
        }
      }
    });

    /**
     * Main Single Page Application Controller
     */
    class App {
      constructor() {
        this.containers = [];
        this.activeFilter = 'all';
        this.activeContainer = null;
        this.activeFiles = [];
        this.activeFilePath = null;
        this.activeFileOriginalContent = '';
        this.selectedNewType = 'git';
        this.currentViewMode = 'split'; // 'edit' | 'split' | 'preview'
        this.currentView = 'hub'; // 'hub' | 'explorer'

        // Modals initialized via CommonModal
        this.createContainerModal = new CommonModal('modal-create-container', {
          onOpen: () => {
            document.getElementById('new-container-name').value = '';
            document.getElementById('new-container-id').value = '';
            document.getElementById('new-container-desc').value = '';
            this.selectNewContainerType('git');
          }
        });

        this.confirmModal = new CommonModal('modal-confirm');

        this.init();
      }

      async init() {
        this.initGlobalShortcuts();
        await this.refreshAll();
        this.handleInitialRoute();

        // Listen to browser Back/Forward navigation
        window.addEventListener('popstate', () => {
          this.handleInitialRoute();
        });
      }

      initGlobalShortcuts() {
        window.addEventListener('keydown', (e) => {
          // Ctrl+S or Cmd+S to save active file
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            if (this.currentView === 'explorer' && this.activeFilePath) {
              e.preventDefault();
              this.saveActiveFile();
            }
          }
        });
      }

      handleInitialRoute() {
        const params = new URLSearchParams(window.location.search);
        const containerParam = params.get('container');
        const pathname = window.location.pathname;

        if (pathname.includes('/explorer') || containerParam || window.location.hash.startsWith('#/explorer')) {
          const targetId = containerParam || window.location.hash.split('/explorer/')[1]?.split('?')[0];
          if (targetId) {
            this.openExplorer(targetId, false);
          } else if (this.containers.length > 0) {
            this.openExplorer(this.containers[0].id, false);
          } else {
            this.navigateToHub(null, false);
          }
        } else {
          this.navigateToHub(null, false);
        }
      }

      async refreshAll() {
        const refreshBtn = document.getElementById('btn-global-refresh');
        if (refreshBtn) refreshBtn.disabled = true;

        try {
          const res = await fetch('/containers');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          this.containers = await res.json();
          this.updateMetrics();
          this.renderContainers();
          this.populateContainerSelect();
          this.setOnline(true);

          if (this.currentView === 'explorer' && this.activeContainer) {
            const updated = this.containers.find((c) => c.id === this.activeContainer.id);
            if (updated) {
              this.activeContainer = updated;
              await this.loadContainerFiles(updated.id);
            }
          }
        } catch (err) {
          console.error(err);
          this.setOnline(false);
          this.showToast('Failed to connect to backend containers API', 'error');
        } finally {
          if (refreshBtn) refreshBtn.disabled = false;
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
        const git = this.containers.filter((c) => c.type === 'git').length;
        const simple = this.containers.filter((c) => c.type === 'simple').length;
        let totalFiles = 0;
        this.containers.forEach((c) => totalFiles += (c.totalFiles || 0));

        document.getElementById('metric-total-containers').textContent = total;
        document.getElementById('metric-git-containers').textContent = git;
        document.getElementById('metric-simple-containers').textContent = simple;
        document.getElementById('metric-total-files').textContent = totalFiles;
      }

      // --- ROUTING & VIEW SWITCHING ---

      navigateToHub(e, pushState = true) {
        if (e) e.preventDefault();
        this.currentView = 'hub';

        document.getElementById('view-hub').classList.add('active');
        document.getElementById('view-explorer').classList.remove('active');
        document.getElementById('nav-breadcrumb').style.display = 'none';

        if (pushState) {
          window.history.pushState({}, '', '/');
        }
      }

      async openExplorer(containerId, pushState = true) {
        const container = this.containers.find((c) => c.id === containerId);
        if (!container) {
          if (this.containers.length === 0) return;
          this.showToast('Container "' + containerId + '" not found', 'error');
          this.navigateToHub(null, true);
          return;
        }

        this.currentView = 'explorer';
        this.activeContainer = container;

        document.getElementById('view-hub').classList.remove('active');
        document.getElementById('view-explorer').classList.add('active');

        // Update Breadcrumb & Subnav
        const breadcrumb = document.getElementById('nav-breadcrumb');
        breadcrumb.style.display = 'flex';
        document.getElementById('breadcrumb-container-name').textContent = container.name;

        const select = document.getElementById('explorer-container-select');
        if (select) select.value = container.id;

        const badge = document.getElementById('explorer-container-badge');
        badge.className = 'badge ' + (container.type === 'git' ? 'badge-git' : 'badge-simple');
        badge.textContent = container.type === 'git' ? '⚡ GIT VAULT' : '📁 SIMPLE FS';

        document.getElementById('explorer-container-id').textContent = container.id;
        document.getElementById('explorer-commit-info').textContent = 
          container.type === 'git' ? ('HEAD: ' + (container.currentCommit ? container.currentCommit.slice(0, 7) : 'init')) : 'Engine: Direct FS';

        if (pushState) {
          window.history.pushState({ containerId }, '', '/explorer?container=' + encodeURIComponent(container.id));
        }

        // Close any open inline note creator
        this.toggleInlineNoteCreator(false);

        await this.loadContainerFiles(container.id);
      }

      switchContainerFromSelect(containerId) {
        if (containerId) {
          this.openExplorer(containerId, true);
        }
      }

      populateContainerSelect() {
        const select = document.getElementById('explorer-container-select');
        if (!select) return;
        select.innerHTML = this.containers.map((c) => {
          return '<option value="' + this.escapeHtml(c.id) + '">' + this.escapeHtml(c.name) + ' (' + c.type.toUpperCase() + ')</option>';
        }).join('');
        if (this.activeContainer) {
          select.value = this.activeContainer.id;
        }
      }

      // --- HUB CONTAINER GRID & FILTERING ---

      setFilter(filter, el) {
        this.activeFilter = filter;
        document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
        if (el) el.classList.add('active');
        this.renderContainers();
      }

      filterContainers() {
        this.renderContainers();
      }

      renderContainers() {
        const grid = document.getElementById('container-grid');
        const query = document.getElementById('search-input').value.toLowerCase().trim();

        const filtered = this.containers.filter((c) => {
          const matchesType = this.activeFilter === 'all' || c.type === this.activeFilter;
          const matchesSearch = !query || 
            c.name.toLowerCase().includes(query) || 
            c.id.toLowerCase().includes(query) ||
            (c.description && c.description.toLowerCase().includes(query));
          return matchesType && matchesSearch;
        });

        if (filtered.length === 0) {
          grid.innerHTML = 
            '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">' +
              '<div style="font-size: 3rem; margin-bottom: 12px;">📂</div>' +
              '<h3>No matching containers found</h3>' +
              '<p style="font-size: 0.85rem; margin-top: 6px;">Create a new container or adjust your search filter.</p>' +
            '</div>';
          return;
        }

        grid.innerHTML = filtered.map((c) => {
          const isGit = c.type === 'git';
          const badgeClass = isGit ? 'badge-git' : 'badge-simple';
          const badgeText = isGit ? '⚡ GIT VAULT' : '📁 SIMPLE FS';
          const commitText = isGit ? (c.currentCommit ? c.currentCommit.slice(0, 7) : 'init') : 'direct fs';

          return (
            '<div class="container-card" id="card-' + this.escapeHtml(c.id) + '">' +
              '<div class="card-top">' +
                '<div class="card-title-group">' +
                  '<h3>' + this.escapeHtml(c.name) + '</h3>' +
                  '<span class="card-id">' + this.escapeHtml(c.id) + '</span>' +
                '</div>' +
                '<span class="badge ' + badgeClass + '">' + badgeText + '</span>' +
              '</div>' +
              '<p class="card-desc">' + this.escapeHtml(c.description || 'No description provided.') + '</p>' +
              '<div class="card-meta-list">' +
                '<div class="card-meta-item">' +
                  '<span class="meta-key">Notes</span>' +
                  '<span class="meta-val">📝 ' + (c.totalFiles || 0) + ' files</span>' +
                '</div>' +
                '<div class="card-meta-item">' +
                  '<span class="meta-key">' + (isGit ? 'HEAD Commit' : 'Engine') + '</span>' +
                  '<span class="meta-val">' + commitText + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="card-actions">' +
                '<button class="btn btn-primary btn-sm" style="flex: 1;" onclick="app.openExplorer(\'' + this.escapeHtml(c.id) + '\')">' +
                  '📂 Explore Notes' +
                '</button>' +
                '<button class="btn btn-danger btn-sm" onclick="app.promptDeleteContainer(\'' + this.escapeHtml(c.id) + '\', \'' + this.escapeHtml(c.name) + '\')" title="Delete Container">' +
                  '🗑️' +
                '</button>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }

      // --- EXPLORER SIDEBAR & FILE MANAGEMENT ---

      async loadContainerFiles(containerId) {
        try {
          const res = await fetch('/containers/' + encodeURIComponent(containerId) + '/files');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          this.activeFiles = await res.json();
          this.renderSidebarFiles();

          if (this.activeFiles.length > 0) {
            // If current file is still in list, reload it; otherwise load first file
            const currentExists = this.activeFiles.some((f) => f.path === this.activeFilePath);
            if (currentExists) {
              this.loadFile(this.activeFilePath);
            } else {
              this.loadFile(this.activeFiles[0].path);
            }
          } else {
            this.clearWorkspace();
          }
        } catch (err) {
          this.showToast('Failed to load vault files: ' + err.message, 'error');
        }
      }

      async refreshCurrentContainerFiles() {
        if (!this.activeContainer) return;
        await this.loadContainerFiles(this.activeContainer.id);
        this.showToast('Vault files refreshed', 'info');
      }

      filterFiles() {
        this.renderSidebarFiles();
      }

      renderSidebarFiles() {
        const list = document.getElementById('sidebar-file-list');
        const query = document.getElementById('file-search-input').value.toLowerCase().trim();

        const filtered = this.activeFiles.filter((f) => {
          return !query || 
            f.path.toLowerCase().includes(query) || 
            (f.metadata && f.metadata.title && f.metadata.title.toLowerCase().includes(query)) ||
            (f.metadata && f.metadata.tags && f.metadata.tags.some((t) => t.toLowerCase().includes(query)));
        });

        if (filtered.length === 0) {
          list.innerHTML = 
            '<div class="sidebar-empty">' +
              '<span style="font-size: 1.8rem;">📄</span>' +
              '<span>No notes match filter</span>' +
              '<button class="btn btn-secondary btn-sm" onclick="app.toggleInlineNoteCreator(true)">➕ Create Note</button>' +
            '</div>';
          return;
        }

        list.innerHTML = filtered.map((f) => {
          const isActive = f.path === this.activeFilePath ? 'active' : '';
          const name = (f.metadata && f.metadata.title) ? f.metadata.title : f.path;
          const words = (f.metadata && f.metadata.wordCount) ? f.metadata.wordCount + 'w' : '';

          return (
            '<div class="file-tree-item ' + isActive + '" onclick="app.loadFile(\'' + this.escapeHtml(f.path) + '\')">' +
              '<div class="file-item-left">' +
                '<span>📄</span>' +
                '<span class="file-item-name" title="' + this.escapeHtml(f.path) + '">' + this.escapeHtml(name) + '</span>' +
              '</div>' +
              '<div class="file-item-meta">' +
                (words ? '<span class="file-words-tag">' + words + '</span>' : '') +
                '<button class="file-delete-hover-btn" onclick="event.stopPropagation(); app.promptDeleteFile(\'' + this.escapeHtml(f.path) + '\')" title="Delete Note">' +
                  '🗑️' +
                '</button>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }

      // --- INLINE NOTE CREATION (REPLACED MODAL) ---

      toggleInlineNoteCreator(forceState) {
        const creator = document.getElementById('inline-note-creator');
        const btn = document.getElementById('btn-toggle-inline-create');
        const willOpen = forceState !== undefined ? forceState : !creator.classList.contains('open');

        if (willOpen) {
          creator.classList.add('open');
          btn.style.display = 'none';
          const input = document.getElementById('inline-note-path');
          const dateStr = new Date().toISOString().slice(0, 10);
          input.value = 'notes/' + dateStr + '.md';
          input.focus();
          input.select();
        } else {
          creator.classList.remove('open');
          btn.style.display = 'inline-flex';
        }
      }

      async submitInlineNote() {
        if (!this.activeContainer) return;
        let path = document.getElementById('inline-note-path').value.trim();
        const template = document.getElementById('inline-note-template').value;

        if (!path) {
          this.showToast('Please specify a note path/filename', 'error');
          return;
        }

        if (!path.endsWith('.md') && !path.includes('.')) {
          path += '.md';
        }

        let defaultContent = '';
        const titleName = path.replace(/\\.md$/i, '').split('/').pop();
        const dateNow = new Date().toISOString().slice(0, 10);

        if (template === 'daily') {
          defaultContent = '# Daily Note: ' + dateNow + '\\n\\n---\\ntags:\\n  - daily\\n  - journal\\n---\\n\\n## 🎯 Today\\'s Goals\\n- [ ] Focus item 1\\n- [ ] Task 2\\n\\n## 📝 Notes & Insights\\n\\n## ⚡ Quick Log\\n';
        } else if (template === 'meeting') {
          defaultContent = '# Meeting: ' + titleName + '\\n\\n**Date:** ' + dateNow + '\\n**Attendees:** Team\\n\\n## 📋 Agenda\\n1. Overview\\n2. Discussion\\n\\n## 💡 Key Takeaways\\n\\n## 🚀 Action Items\\n- [ ] ';
        } else if (template === 'project') {
          defaultContent = '# Project: ' + titleName + '\\n\\n---\\ntags:\\n  - project\\n  - roadmap\\n---\\n\\n## 📌 Overview\\n\\n## 🎯 Objectives\\n- [ ] Milestone 1\\n\\n## 📚 Architecture & Tech\\n';
        } else {
          defaultContent = '# ' + titleName + '\\n\\nCreated on ' + dateNow + '\\n\\nStart typing here...\\n';
        }

        const submitBtn = document.getElementById('btn-submit-inline-note');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        try {
          const res = await fetch('/containers/' + encodeURIComponent(this.activeContainer.id) + '/file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, content: defaultContent })
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || 'HTTP ' + res.status);
          }

          this.showToast('Note "' + path + '" created!', 'success');
          this.toggleInlineNoteCreator(false);
          await this.loadContainerFiles(this.activeContainer.id);
          await this.loadFile(path);
        } catch (err) {
          this.showToast('Failed to create note: ' + err.message, 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create';
        }
      }

      // --- WORKSPACE EDITOR & PREVIEW ---

      async loadFile(filePath) {
        if (!this.activeContainer) return;
        this.activeFilePath = filePath;
        this.renderSidebarFiles();

        document.getElementById('empty-workspace-state').style.display = 'none';
        document.getElementById('editor-pane').style.display = 'flex';
        document.getElementById('preview-pane').style.display = 'block';
        document.getElementById('editor-toolbar').style.display = 'flex';
        document.getElementById('view-mode-tabs').style.display = 'flex';
        document.getElementById('btn-save-note').style.display = 'inline-flex';
        document.getElementById('btn-delete-note').style.display = 'inline-flex';
        document.getElementById('stat-words').style.display = 'inline-flex';
        document.getElementById('stat-chars').style.display = 'inline-flex';

        document.getElementById('workspace-file-path').textContent = filePath;

        try {
          const res = await fetch('/containers/' + encodeURIComponent(this.activeContainer.id) + '/file?path=' + encodeURIComponent(filePath));
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          
          const content = data.content || '';
          this.activeFileOriginalContent = content;
          document.getElementById('file-editor-textarea').value = content;
          this.updateDirtyState();
          this.updateEditorStats();
          this.renderMarkdownPreview(content);

          // Tags
          const tagsEl = document.getElementById('workspace-tags');
          if (data.metadata && data.metadata.tags && data.metadata.tags.length > 0) {
            tagsEl.innerHTML = data.metadata.tags.map((t) => '<span class="tag-pill">#' + this.escapeHtml(t.replace(/^#/, '')) + '</span>').join('');
          } else {
            tagsEl.innerHTML = '';
          }
        } catch (err) {
          this.showToast('Failed to read note: ' + err.message, 'error');
        }
      }

      clearWorkspace() {
        this.activeFilePath = null;
        this.activeFileOriginalContent = '';
        document.getElementById('empty-workspace-state').style.display = 'flex';
        document.getElementById('editor-pane').style.display = 'none';
        document.getElementById('preview-pane').style.display = 'none';
        document.getElementById('editor-toolbar').style.display = 'none';
        document.getElementById('view-mode-tabs').style.display = 'none';
        document.getElementById('btn-save-note').style.display = 'none';
        document.getElementById('btn-delete-note').style.display = 'none';
        document.getElementById('stat-words').style.display = 'none';
        document.getElementById('stat-chars').style.display = 'none';
        document.getElementById('workspace-tags').innerHTML = '';
        document.getElementById('dirty-indicator').classList.remove('show');
        document.getElementById('workspace-file-path').textContent = 'Select a note to inspect or edit';
      }

      onEditorInput() {
        this.updateDirtyState();
        this.updateEditorStats();
        const content = document.getElementById('file-editor-textarea').value;
        this.renderMarkdownPreview(content);
      }

      onEditorKeyDown(e) {
        // Tab indentation support
        if (e.key === 'Tab') {
          e.preventDefault();
          const ta = e.target;
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          ta.value = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
          ta.selectionStart = ta.selectionEnd = start + 2;
          this.onEditorInput();
        }
      }

      updateDirtyState() {
        const current = document.getElementById('file-editor-textarea').value;
        const isDirty = current !== this.activeFileOriginalContent;
        const indicator = document.getElementById('dirty-indicator');
        if (isDirty) {
          indicator.classList.add('show');
        } else {
          indicator.classList.remove('show');
        }
      }

      updateEditorStats() {
        const text = document.getElementById('file-editor-textarea').value || '';
        const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
        const chars = text.length;
        document.getElementById('stat-words').textContent = words + ' words';
        document.getElementById('stat-chars').textContent = chars + ' chars';
      }

      setViewMode(mode) {
        this.currentViewMode = mode;
        const container = document.getElementById('workspace-mode-container');
        container.className = 'explorer-workspace mode-' + mode;

        document.querySelectorAll('.view-mode-btn').forEach((btn) => {
          btn.classList.toggle('active', btn.dataset.mode === mode);
        });
      }

      insertMarkdown(before, after) {
        const ta = document.getElementById('file-editor-textarea');
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = ta.value.substring(start, end);
        const replacement = before + (selected || 'text') + after;
        ta.value = ta.value.substring(0, start) + replacement + ta.value.substring(end);
        ta.focus();
        ta.selectionStart = start + before.length;
        ta.selectionEnd = start + before.length + (selected ? selected.length : 4);
        this.onEditorInput();
      }

      insertInlineCode() {
        const tick = String.fromCharCode(96);
        this.insertMarkdown(tick, tick);
      }

      insertCodeBlock() {
        const ticks = String.fromCharCode(96, 96, 96);
        this.insertMarkdown(ticks + '\\n', '\\n' + ticks);
      }

      renderMarkdownPreview(md) {
        const preview = document.getElementById('preview-pane');
        if (!preview) return;

        if (!md || !md.trim()) {
          preview.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No content to preview.</p>';
          return;
        }

        // Lightweight, fast and rich Markdown Renderer
        let html = this.escapeHtml(md);

        // Code Blocks with syntax highlight styling
        const codeBlockRegex = new RegExp(String.fromCharCode(96, 96, 96) + '([a-zA-Z0-9_-]*)\\n([\\s\\S]*?)' + String.fromCharCode(96, 96, 96), 'g');
        html = html.replace(codeBlockRegex, (match, lang, code) => {
          return '<pre><code class="language-' + lang + '">' + code.trim() + '</code></pre>';
        });

        // Inline Code
        const inlineCodeRegex = new RegExp(String.fromCharCode(96) + '([^' + String.fromCharCode(96) + ']+)' + String.fromCharCode(96), 'g');
        html = html.replace(inlineCodeRegex, '<code>$1</code>');

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Blockquotes
        html = html.replace(/^\\> (.*$)/gim, '<blockquote>$1</blockquote>');

        // Task List Checkboxes
        html = html.replace(/^- \\[x\\] (.*$)/gim, '<div style="display:flex;align-items:center;"><input type="checkbox" checked disabled> <span>$1</span></div>');
        html = html.replace(/^- \\[ \\] (.*$)/gim, '<div style="display:flex;align-items:center;"><input type="checkbox" disabled> <span>$1</span></div>');

        // Bullet Lists
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>[\\s\\S]*?<\\/li>)/g, '<ul>$1</ul>');

        // Bold & Italic
        html = html.replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong>$1</strong>');
        html = html.replace(/\\*([^\\*]+)\\*/g, '<em>$1</em>');

        // Links
        html = html.replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/g, '<a href="$2" target="_blank" style="color: var(--accent-purple); text-decoration: underline;">$1</a>');

        // Paragraphs & Line Breaks
        const paragraphs = html.split(/\\n\\n+/);
        html = paragraphs.map((p) => {
          if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || p.startsWith('<ul>') || p.startsWith('<div')) {
            return p;
          }
          return '<p>' + p.replace(/\\n/g, '<br>') + '</p>';
        }).join('');

        preview.innerHTML = html;
      }

      async saveActiveFile() {
        if (!this.activeContainer || !this.activeFilePath) return;
        const content = document.getElementById('file-editor-textarea').value;
        const btn = document.getElementById('btn-save-note');
        btn.disabled = true;
        btn.textContent = 'Saving...';

        try {
          const res = await fetch('/containers/' + encodeURIComponent(this.activeContainer.id) + '/file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: this.activeFilePath, content })
          });

          if (!res.ok) throw new Error('HTTP ' + res.status);
          this.activeFileOriginalContent = content;
          this.updateDirtyState();
          this.showToast('Saved note "' + this.activeFilePath + '"', 'success');

          // Refresh metadata in sidebar
          const listRes = await fetch('/containers/' + encodeURIComponent(this.activeContainer.id) + '/files');
          if (listRes.ok) {
            this.activeFiles = await listRes.json();
            this.renderSidebarFiles();
          }
        } catch (err) {
          this.showToast('Failed to save note: ' + err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = '💾 Save Note';
        }
      }

      promptDeleteActiveNote() {
        if (!this.activeFilePath) return;
        this.promptDeleteFile(this.activeFilePath);
      }

      promptDeleteFile(filePath) {
        if (!this.activeContainer) return;
        this.openConfirmDialog(
          'Delete Note "' + filePath + '"?',
          'Are you sure you want to delete this note from container "' + this.activeContainer.name + '"? This action will remove the note file.',
          async () => {
            try {
              const res = await fetch('/containers/' + encodeURIComponent(this.activeContainer.id) + '/file?path=' + encodeURIComponent(filePath), {
                method: 'DELETE'
              });
              if (!res.ok) throw new Error('HTTP ' + res.status);
              this.showToast('Note deleted successfully', 'success');
              if (this.activeFilePath === filePath) {
                this.clearWorkspace();
              }
              await this.loadContainerFiles(this.activeContainer.id);
            } catch (err) {
              this.showToast('Failed to delete note: ' + err.message, 'error');
            }
          }
        );
      }

      // --- CONTAINER REGISTRATION & DELETION (COMMON MODAL) ---

      selectNewContainerType(type) {
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
          this.showToast('Container "' + created.name + '" created successfully!', 'success');
          this.createContainerModal.close();
          await this.refreshAll();
          this.openExplorer(created.id, true);
        } catch (err) {
          this.showToast('Failed to create container: ' + err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Create Container';
        }
      }

      promptDeleteContainer(id, name) {
        this.openConfirmDialog(
          'Delete Container "' + name + '"?',
          'Are you sure you want to delete container "' + id + '"? This will unregister the container from storage.',
          async () => {
            try {
              const res = await fetch('/containers/' + encodeURIComponent(id), { method: 'DELETE' });
              if (!res.ok) throw new Error('HTTP ' + res.status);
              this.showToast('Container deleted successfully', 'success');
              if (this.activeContainer && this.activeContainer.id === id) {
                this.navigateToHub();
              }
              await this.refreshAll();
            } catch (err) {
              this.showToast('Failed to delete container: ' + err.message, 'error');
            }
          }
        );
      }

      openConfirmDialog(title, message, onConfirm) {
        document.getElementById('confirm-modal-title').textContent = title;
        document.getElementById('confirm-modal-message').textContent = message;
        const confirmBtn = document.getElementById('btn-confirm-action');

        confirmBtn.onclick = async () => {
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Processing...';
          try {
            await onConfirm();
            this.confirmModal.close();
          } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm';
          }
        };

        this.confirmModal.open();
      }

      // --- TOASTS & UTILS ---

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
