'use client';

import { useState, useEffect, useRef } from 'react';
import { FileTree } from '@/components/ui/file-tree/file-tree';
import { SearchInput } from '@/components/ui/file-tree/search-input';
import { TreeNode, FileTreeContextMenuActions } from '@/types/tree';
import { cn } from '@/lib/utils';
import { PreviewPanel } from '@/components/preview-panel';
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DragEndEvent } from '@dnd-kit/core';

const demoData: TreeNode[] = [
  {
    id: '1',
    name: 'app',
    type: 'folder',
    children: [
      { 
        id: '2', 
        name: 'layout.tsx', 
        type: 'file',
        content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
      },
      { 
        id: '3', 
        name: 'page.tsx', 
        type: 'file',
        content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome to Next.js</h1>
    </main>
  )
}`
      },
      {
        id: '4',
        name: 'blog',
        type: 'folder',
        children: [
          { id: '5', name: 'page.tsx', type: 'file' },
          { id: '6', name: 'layout.tsx', type: 'file' },
          {
            id: '7',
            name: '[slug]',
            type: 'folder',
            children: [
              { id: '8', name: 'page.tsx', type: 'file' },
              { id: '9', name: 'loading.tsx', type: 'file' },
            ]
          }
        ]
      },
      {
        id: '10',
        name: 'dashboard',
        type: 'folder',
        children: [
          { id: '11', name: 'page.tsx', type: 'file' },
          { id: '12', name: 'loading.tsx', type: 'file' },
          {
            id: '13',
            name: 'settings',
            type: 'folder',
            children: [
              { id: '14', name: 'page.tsx', type: 'file' },
              { id: '15', name: 'layout.tsx', type: 'file' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: '16',
    name: 'components',
    type: 'folder',
    children: [
      {
        id: '17',
        name: 'ui',
        type: 'folder',
        children: [
          { id: '18', name: 'button.tsx', type: 'file' },
          { id: '19', name: 'card.tsx', type: 'file' },
          { id: '20', name: 'dialog.tsx', type: 'file' },
          { id: '21', name: 'input.tsx', type: 'file' },
          {
            id: '22',
            name: 'file-tree',
            type: 'folder',
            children: [
              { id: '23', name: 'file-tree.tsx', type: 'file' },
              { id: '24', name: 'tree-item.tsx', type: 'file' }
            ]
          }
        ]
      },
      {
        id: '25',
        name: 'shared',
        type: 'folder',
        children: [
          { id: '26', name: 'header.tsx', type: 'file' },
          { id: '27', name: 'footer.tsx', type: 'file' },
          { id: '28', name: 'sidebar.tsx', type: 'file' }
        ]
      }
    ]
  },
  {
    id: '29',
    name: 'lib',
    type: 'folder',
    children: [
      { id: '30', name: 'utils.ts', type: 'file' },
      { id: '31', name: 'hooks.ts', type: 'file' },
      { id: '32', name: 'constants.ts', type: 'file' },
      { id: '33', name: 'types.ts', type: 'file' }
    ]
  },
  {
    id: '34',
    name: 'styles',
    type: 'folder',
    children: [
      { id: '35', name: 'globals.css', type: 'file' },
      { id: '36', name: 'variables.css', type: 'file' }
    ]
  },
  { id: '37', name: 'package.json', type: 'file' },
  { id: '38', name: 'tsconfig.json', type: 'file' },
  { id: '39', name: 'tailwind.config.ts', type: 'file' },
  { id: '40', name: '.env', type: 'file' }
];

export default function Page() {
  const [data, setData] = useState(demoData);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clipboardNode, setClipboardNode] = useState<{ node: TreeNode; operation: 'copy' | 'cut' } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const fileTreeRef = useRef<HTMLDivElement>(null);

  const selectedFile = data.find(node => selectedIds.includes(node.id)) || null;

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Helper function to update node in tree
  const updateNodeInTree = (nodes: TreeNode[], nodeId: string, updateFn: (node: TreeNode) => TreeNode): TreeNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return updateFn(node);
      }
      if (node.children) {
        return {
          ...node,
          children: updateNodeInTree(node.children, nodeId, updateFn)
        };
      }
      return node;
    });
  };

  // Helper function to delete node from tree
  const deleteNodeFromTree = (nodes: TreeNode[], nodeId: string): TreeNode[] => {
    return nodes.filter(node => {
      if (node.id === nodeId) return false;
      if (node.children) {
        node.children = deleteNodeFromTree(node.children, nodeId);
      }
      return true;
    });
  };

  // Helper function to find parent node
  const findParentNode = (nodes: TreeNode[], nodeId: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.children?.some(child => child.id === nodeId)) {
        return node;
      }
      if (node.children) {
        const parent = findParentNode(node.children, nodeId);
        if (parent) return parent;
      }
    }
    return null;
  };

  // Helper function to find node by ID
  const findNodeById = (nodes: TreeNode[], nodeId: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (node.children) {
        const found = findNodeById(node.children, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle drag end for drag and drop operations
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeNode = findNodeById(data, active.id as string);
      const overNode = findNodeById(data, over.id as string);
      
      if (activeNode && overNode) {
        // If dropping onto a folder, move the node into that folder
        if (overNode.type === 'folder') {
          // Find parent of active node
          const parentNode = findParentNode(data, active.id as string);
          
          if (parentNode) {
            // Remove from current parent
            const updatedData = updateNodeInTree(data, parentNode.id, node => ({
              ...node,
              children: node.children?.filter(child => child.id !== active.id) || []
            }));
            
            // Add to new parent
            const finalData = updateNodeInTree(updatedData, over.id as string, node => ({
              ...node,
              children: [...(node.children || []), activeNode]
            }));
            
            setData(finalData);
            showFeedback(`Moved ${activeNode.name} to ${overNode.name}`);
            
            // Auto-expand the target folder
            if (!expanded.includes(over.id as string)) {
              setExpanded([...expanded, over.id as string]);
            }
          }
        }
      }
    }
  };

  const contextMenuActions: FileTreeContextMenuActions = {
    onNewFile: (parentNode: TreeNode) => {
      const newFile: TreeNode = {
        id: `new-file-${Date.now()}`,
        name: 'new-file.tsx',
        type: 'file',
        isRenaming: true
      };
      
      setData(prevData => 
        updateNodeInTree(prevData, parentNode.id, node => ({
          ...node,
          children: [...(node.children || []), newFile]
        }))
      );
      
      setSelectedIds([newFile.id]);
    },

    onNewFolder: (parentNode: TreeNode) => {
      const newFolder: TreeNode = {
        id: `new-folder-${Date.now()}`,
        name: 'new-folder',
        type: 'folder',
        children: [],
        isRenaming: true
      };
      
      setData(prevData => 
        updateNodeInTree(prevData, parentNode.id, node => ({
          ...node,
          children: [...(node.children || []), newFolder]
        }))
      );
      
      setSelectedIds([newFolder.id]);
    },

    onCopy: (node: TreeNode) => {
      setClipboardNode({ node, operation: 'copy' });
      showFeedback(`${node.name} copied to clipboard`);
    },

    onCut: (node: TreeNode) => {
      setClipboardNode({ node, operation: 'cut' });
      showFeedback(`${node.name} cut to clipboard`);
    },

    onPaste: (targetNode: TreeNode) => {
      if (!clipboardNode) return;
      
      const { node: sourceNode, operation } = clipboardNode;
      
      // Create a copy of the node with a new ID
      const nodeCopy: TreeNode = {
        ...sourceNode,
        id: `${sourceNode.id}-copy-${Date.now()}`
      };

      // Add the node to the target folder
      setData(prevData => 
        updateNodeInTree(prevData, targetNode.id, node => ({
          ...node,
          children: [...(node.children || []), nodeCopy]
        }))
      );

      // If this was a cut operation, remove the original node
      if (operation === 'cut') {
        setData(prevData => deleteNodeFromTree(prevData, sourceNode.id));
        setClipboardNode(null);
      }

      showFeedback(`${sourceNode.name} pasted to ${targetNode.name}`);
    },

    onDelete: (node: TreeNode) => {
      setData(prevData => deleteNodeFromTree(prevData, node.id));
      showFeedback(`${node.name} deleted`, 'success');
      
      // Clear selection if deleted node was selected
      if (selectedIds.includes(node.id)) {
        setSelectedIds([]);
      }
    },

    onRename: (node: TreeNode, newName: string) => {
      if (newName === node.name) {
        // If the name hasn't changed, just set the node to renaming mode
        setData(prevData => 
          updateNodeInTree(prevData, node.id, node => ({
            ...node,
            isRenaming: true
          }))
        );
        return;
      }
      
      if (!newName.trim()) return;
      
      setData(prevData => 
        updateNodeInTree(prevData, node.id, node => ({
          ...node,
          name: newName,
          isRenaming: false
        }))
      );
      
      showFeedback(`Renamed to ${newName}`);
    },

    onOpen: (node: TreeNode) => {
      // For now, just select the node
      setSelectedIds([node.id]);
      showFeedback(`Opened ${node.name}`);
    },
  };

  // Add a keyboard event listener to handle Enter key for renaming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter' && selectedIds.length === 1) {
        e.preventDefault();
        
        // Find the selected node
        const selectedNode = findNodeById(data, selectedIds[0]);
        if (selectedNode) {
          // Set the node to renaming mode
          setData(prevData => 
            updateNodeInTree(prevData, selectedNode.id, node => ({
              ...node,
              isRenaming: true
            }))
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, data, setData, updateNodeInTree]);

  // Helper function to count search results
  const countSearchResults = (nodes: TreeNode[], query: string): number => {
    if (!query) return 0;
    
    return nodes.reduce((count, node) => {
      let matches = 0;
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        matches += 1;
      }
      
      if (node.children) {
        matches += countSearchResults(node.children, query);
      }
      
      return count + matches;
    }, 0);
  };

  // Update search results count when query changes
  useEffect(() => {
    // Skip feedback if search is cleared
    if (!searchQuery) {
      setSearchResults(null);
      return;
    }
    
    // Count results
    const count = countSearchResults(data, searchQuery);
    setSearchResults(count);
    
    // Don't show any feedback for search results to avoid interrupting typing
  }, [searchQuery, data]);

  // Separate effect for handling expanded state when search is cleared
  useEffect(() => {
    if (searchQuery === '') {
      // Only reset expanded state when explicitly clearing search
      setExpanded([]);
    }
  }, [searchQuery]);

  return (
    <div className="flex flex-col size-full min-h-screen">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">File Tree Demo</h1>
        <ThemeSwitcher />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-[300px] border-r flex flex-col" ref={fileTreeRef}>
          <SearchInput
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              // Clear selection when search changes
              if (value !== searchQuery) {
                setSelectedIds([]);
              }
            }}
            placeholder="Search files and folders..."
          />
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-0 overflow-auto file-tree-container">
              <FileTree 
                data={data}
                searchQuery={searchQuery} // Use the regular search query since debouncing is handled in SearchInput
                selectedIds={selectedIds}
                expanded={expanded}
                onExpandedChange={setExpanded}
                onSelectionChange={(nodes) => {
                  setSelectedIds(nodes.map(n => n.id));
                }}
                contextMenuActions={contextMenuActions}
                clipboardNode={clipboardNode}
                onDragEnd={handleDragEnd}
              />
              
              {/* No results message */}
              {searchQuery && searchResults === 0 && (
                <div className="p-4 text-sm text-muted-foreground italic">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>

        {/* Preview Panel */}
        <PreviewPanel 
          selectedFile={selectedFile}
          content={selectedFile?.content}
        />

        {/* Feedback Toast */}
        {feedback && (
          <div
            className={cn(
              "fixed bottom-4 left-4 right-4 p-2 text-sm text-white rounded-sm transition-opacity",
              feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            )}
          >
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
} 