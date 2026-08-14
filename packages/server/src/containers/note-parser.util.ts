import { ParsedNoteMetadataDto } from '@workspace/shared';

/**
 * Utility for parsing Markdown frontmatter, tags, headings, and statistics.
 */
export class NoteParserUtil {
  /**
   * Parses markdown content and extracts rich note metadata.
   */
  public static parse(content: string, defaultTitle = 'Untitled'): ParsedNoteMetadataDto {
    const frontmatter = this.extractFrontmatter(content);
    const bodyContent = this.stripFrontmatter(content);

    const frontmatterTags = this.extractFrontmatterTags(frontmatter);
    const inlineTags = this.extractInlineTags(bodyContent);

    // Combine and deduplicate tags
    const allTags = Array.from(new Set([...frontmatterTags, ...inlineTags])).filter(Boolean);

    const headings = this.extractHeadings(bodyContent);
    const title = this.extractTitle(bodyContent, frontmatter, defaultTitle);

    const characterCount = content.length;
    const wordCount = this.calculateWordCount(bodyContent);

    return {
      tags: allTags,
      frontmatter,
      title,
      headings,
      wordCount,
      characterCount,
    };
  }

  /**
   * Extracts YAML frontmatter as a key-value record.
   */
  private static extractFrontmatter(content: string): Record<string, any> {
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) return {};

    const yamlBlock = frontmatterMatch[1];
    const result: Record<string, any> = {};

    const lines = yamlBlock.split(/\r?\n/);
    let currentKey: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Check for key: value
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0 && !trimmed.startsWith('-')) {
        const key = trimmed.slice(0, colonIndex).trim();
        let value = trimmed.slice(colonIndex + 1).trim();

        // Check if list in brackets [a, b, c]
        if (value.startsWith('[') && value.endsWith(']')) {
          const items = value
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
          result[key] = items;
          currentKey = null;
        } else if (value === '') {
          // Multiline array follows
          result[key] = [];
          currentKey = key;
        } else {
          // Strip quotes
          value = value.replace(/^['"]|['"]$/g, '');
          result[key] = value;
          currentKey = null;
        }
      } else if (trimmed.startsWith('-') && currentKey) {
        // List item in YAML
        const item = trimmed.slice(1).trim().replace(/^['"]|['"]$/g, '');
        if (Array.isArray(result[currentKey])) {
          result[currentKey].push(item);
        }
      }
    }

    return result;
  }

  /**
   * Strips YAML frontmatter from markdown body.
   */
  private static stripFrontmatter(content: string): string {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n)?/, '');
  }

  /**
   * Extracts tags from parsed frontmatter object.
   */
  private static extractFrontmatterTags(frontmatter: Record<string, any>): string[] {
    const rawTags = frontmatter.tags || frontmatter.tag;
    if (!rawTags) return [];

    if (Array.isArray(rawTags)) {
      return rawTags.map((t) => (t.startsWith('#') ? t : `#${t}`));
    }
    if (typeof rawTags === 'string') {
      return rawTags
        .split(/[, ]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));
    }
    return [];
  }

  /**
   * Extracts inline `#tag` patterns from markdown body.
   * Ignores Markdown headings (`# Heading`), hex codes, and URL fragments.
   */
  private static extractInlineTags(body: string): string[] {
    // Matches #tag, #nested/tag, #tag-name, #tag_name
    // Negative lookbehind or boundary check so '# ' or '### ' headings are not matched
    const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-\/]+)(?=\s|$|[.,;:!?])/g;
    const tags: string[] = [];

    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(body)) !== null) {
      const tagContent = match[1];
      // Skip pure numeric hashes or hex-like colors without alpha
      if (!/^\d+$/.test(tagContent)) {
        tags.push(`#${tagContent}`);
      }
    }

    return tags;
  }

  /**
   * Extracts Markdown headings (# H1, ## H2, etc.).
   */
  private static extractHeadings(body: string): string[] {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const headings: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(body)) !== null) {
      headings.push(match[1].trim());
    }

    return headings;
  }

  /**
   * Extracts note title (frontmatter title > first H1 heading > default).
   */
  private static extractTitle(body: string, frontmatter: Record<string, any>, defaultTitle: string): string {
    if (frontmatter.title && typeof frontmatter.title === 'string') {
      return frontmatter.title;
    }

    const firstH1Match = body.match(/^#\s+(.+)$/m);
    if (firstH1Match) {
      return firstH1Match[1].trim();
    }

    return defaultTitle;
  }

  /**
   * Calculates word count for markdown body content.
   */
  private static calculateWordCount(body: string): number {
    const textOnly = body
      .replace(/```[\s\S]*?```/g, '') // code blocks
      .replace(/`[^`]*`/g, '') // inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/[#*_~>]/g, '') // formatting
      .trim();

    if (!textOnly) return 0;
    return textOnly.split(/\s+/).filter(Boolean).length;
  }
}
