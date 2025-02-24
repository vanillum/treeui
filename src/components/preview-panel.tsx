'use client';

import React, { useEffect, useState } from 'react';
import { TreeNode } from '@/types/tree';
import { createHighlighter, type BundledHighlighterOptions, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki/bundle/web';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  selectedFile: TreeNode | null;
  content?: string;
}

const getFileLanguage = (filename: string): BundledLanguage | undefined => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'html':
      return 'html';
    default:
      return undefined;
  }
};

const isImageFile = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '');
};

export function PreviewPanel({ selectedFile, content }: PreviewPanelProps) {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string>('');

  useEffect(() => {
    const loadHighlighter = async () => {
      try {
        const hl = await createHighlighter({
          themes: ['github-light'],
          langs: ['typescript', 'javascript', 'css', 'json', 'markdown', 'html']
        } as BundledHighlighterOptions<BundledLanguage, BundledTheme>);
        setHighlighter(hl);
      } catch (error) {
        console.error('Failed to load highlighter:', error);
      }
    };
    loadHighlighter();
  }, []);

  useEffect(() => {
    if (highlighter && selectedFile?.type === 'file' && content) {
      const language = getFileLanguage(selectedFile.name);
      try {
        const highlighted = highlighter.codeToHtml(content, {
          lang: language || 'plaintext',
          theme: 'github-light'
        });
        setHighlightedCode(highlighted);
      } catch (error) {
        console.error('Failed to highlight code:', error);
        setHighlightedCode(`<pre>${content}</pre>`);
      }
    }
  }, [highlighter, selectedFile, content]);

  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a file to view its contents
      </div>
    );
  }

  if (selectedFile.type === 'folder') {
    return (
      <div className="flex-1 p-4 text-gray-400 font-mono text-sm flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-semibold mb-2">{selectedFile.name}</h3>
          <p>{selectedFile.children?.length || 0} items</p>
        </div>
      </div>
    );
  }

  // Handle image files
  if (isImageFile(selectedFile.name)) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-bpb-2 mb-4">
          <h2 className="text-sm font-semibold">{selectedFile.name}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <img 
            src={content} // In a real app, this would be a proper URL
            alt={selectedFile.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <h2 className="text-lg font-semibold mb-4">{selectedFile.name}</h2>
      <pre className="p-4 bg-muted rounded-md">
        <code>{selectedFile.content || content || 'No content available'}</code>
      </pre>
    </div>
  );
} 