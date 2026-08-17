import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  // Strip YAML frontmatter before rendering body preview
  const bodyContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n)?/, '');

  return (
    <div className="h-full overflow-y-auto p-6 markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Render Obsidian callouts styled blockquotes
          blockquote: ({ node, children, ...props }) => {
            return (
              <blockquote className="my-3 pl-4 border-l-4 border-purple-500 bg-purple-500/5 py-2 px-3 rounded-r-lg text-gray-300" {...props}>
                {children}
              </blockquote>
            );
          },
          // Custom checkbox formatting for task lists
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="rounded border-gray-600 text-purple-600 focus:ring-0 mr-2 accent-brand-purple cursor-default"
                />
              );
            }
            return <input type={type} {...props} />;
          },
          // Format inline code
          code: ({ className, children, ...props }) => {
            return (
              <code className="bg-bg-input px-1.5 py-0.5 rounded text-purple-300 font-mono text-xs border border-border-subtle" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {bodyContent || '*Empty note*'}
      </ReactMarkdown>
    </div>
  );
};
