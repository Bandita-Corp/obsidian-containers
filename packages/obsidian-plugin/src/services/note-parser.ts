import { ParsedNoteMetadataDto } from '@workspace/shared';

/**
 * Client-side note parser for Obsidian notes.
 * Extracts tags, frontmatter, headings, and note metrics.
 */
export class ClientNoteParser {
  /**
   * Parses markdown content into structured metadata.
   */
  public static parse(content: string, defaultTitle = 'Untitled'): ParsedNoteMetadataDto {
    const frontmatter = this.extractFrontmatter(content);
    const body = this.stripFrontmatter(content);

    const frontmatterTags = this.extractFrontmatterTags(frontmatter);
    const inlineTags = this.extractInlineTags(body);

    const allTags = Array.from(new Set([...frontmatterTags, ...inlineTags])).filter(Boolean);
    const headings = this.extractHeadings(body);
    const title = this.extractTitle(body, frontmatter, defaultTitle);

    return {
      tags: allTags,
      frontmatter,
      title,
      headings,
      wordCount: this.calculateWordCount(body),
      characterCount: content.length,
    };
  }

  private static extractFrontmatter(content: string): Record<string, any> {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};

    const yaml = match[1];
    const result: Record<string, any> = {};
    const lines = yaml.split(/\r?\n/);
    let currentKey: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0 && !trimmed.startsWith('-')) {
        const key = trimmed.slice(0, colonIndex).trim();
        let value = trimmed.slice(colonIndex + 1).trim();

        if (value.startsWith('[') && value.endsWith(']')) {
          result[key] = value
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
          currentKey = null;
        } else if (value === '') {
          result[key] = [];
          currentKey = key;
        } else {
          result[key] = value.replace(/^['"]|['"]$/g, '');
          currentKey = null;
        }
      } else if (trimmed.startsWith('-') && currentKey) {
        const item = trimmed.slice(1).trim().replace(/^['"]|['"]$/g, '');
        if (Array.isArray(result[currentKey])) {
          result[currentKey].push(item);
        }
      }
    }

    return result;
  }

  private static stripFrontmatter(content: string): string {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n)?/, '');
  }

  private static extractFrontmatterTags(frontmatter: Record<string, any>): string[] {
    const raw = frontmatter.tags || frontmatter.tag;
    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw.map((t) => (t.startsWith('#') ? t : `#${t}`));
    }
    if (typeof raw === 'string') {
      return raw
        .split(/[, ]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));
    }
    return [];
  }

  private static extractInlineTags(body: string): string[] {
    const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-\/]+)(?=\s|$|[.,;:!?])/g;
    const tags: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(body)) !== null) {
      const tag = match[1];
      if (!/^\d+$/.test(tag)) {
        tags.push(`#${tag}`);
      }
    }

    return tags;
  }

  private static extractHeadings(body: string): string[] {
    const regex = /^#{1,6}\s+(.+)$/gm;
    const headings: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(body)) !== null) {
      headings.push(match[1].trim());
    }

    return headings;
  }

  private static extractTitle(body: string, frontmatter: Record<string, any>, fallback: string): string {
    if (frontmatter.title && typeof frontmatter.title === 'string') {
      return frontmatter.title;
    }
    const h1 = body.match(/^#\s+(.+)$/m);
    return h1 ? h1[1].trim() : fallback;
  }

  private static calculateWordCount(body: string): number {
    const cleaned = body
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>]/g, '')
      .trim();

    return cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
  }
}
