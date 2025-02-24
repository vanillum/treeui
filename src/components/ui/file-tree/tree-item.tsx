'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, File, Folder, FolderOpen, GripVertical } from 'lucide-react';
import { TreeNode, TreeItemProps } from '@/types/tree';
import { cn } from '@/lib/utils';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileTree } from './file-tree';

export function TreeItem({
  node,
  level,
  data,
  onSelect,
  isSelected,
  searchQuery,
  highlightMatches,
  multiSelect,
  selectedIds,
  expanded = [],
  onExpandedChange,
  onSelectionChange,
  contextMenuActions,
  clipboardNode,
  isDropTarget = false,
}: TreeItemProps) {
  const [isRenaming, setIsRenaming] = useState(node.isRenaming || false);
  const [newName, setNewName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isExpanded = expanded.includes(node.id);
  
  // Set up sortable (draggable) functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  // Handle renaming
  useEffect(() => {
    if (node.isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    setIsRenaming(node.isRenaming || false);
  }, [node.isRenaming]);

  // Search functionality
  const matchesSearch = React.useMemo(() => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Check if current node matches
    if (node.name.toLowerCase().includes(query)) return true;
    
    // Check if any children match
    if (node.children) {
      return node.children.some(child => 
        child.name.toLowerCase().includes(query) ||
        (child.children?.some(grandChild => 
          grandChild.name.toLowerCase().includes(query)
        ))
      );
    }
    
    return false;
  }, [node, searchQuery]);

  // Auto-expand parent folders when their children match search
  React.useEffect(() => {
    if (searchQuery && matchesSearch && node.type === 'folder' && !isExpanded) {
      onExpandedChange?.([...expanded, node.id]);
    }
  }, [searchQuery, matchesSearch, node.type, expanded, onExpandedChange, node.id, isExpanded]);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      const newExpanded = isExpanded
        ? expanded.filter(id => id !== node.id)
        : [...expanded, node.id];
      onExpandedChange?.(newExpanded);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (multiSelect && selectedIds) {
      if (e.shiftKey && selectedIds.length) {
        // Shift+click for range selection would go here
        // For simplicity, we'll just select the current node
        onSelectionChange?.([node]);
      } else if (e.metaKey || e.ctrlKey) {
        // Toggle selection
        const newSelection = selectedIds.includes(node.id)
          ? selectedIds.filter(id => id !== node.id)
          : [...selectedIds, node.id];
        
        // Convert IDs back to nodes
        const selectedNodes = newSelection.map(id => {
          const findNode = (nodes: TreeNode[] = []): TreeNode | undefined => {
            for (const n of nodes) {
              if (n.id === id) return n;
              if (n.children) {
                const found = findNode(n.children);
                if (found) return found;
              }
            }
            return undefined;
          };
          
          return findNode(data || []) as TreeNode;
        }).filter(Boolean);
        
        onSelectionChange?.(selectedNodes);
      } else {
        // Single selection
        onSelectionChange?.([node]);
      }
    } else {
      onSelect?.(node);
      onSelectionChange?.([node]);
    }
  };

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== node.name) {
      contextMenuActions?.onRename(node, newName);
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setNewName(node.name);
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  // Don't render if doesn't match search
  if (!matchesSearch && searchQuery) {
    return null;
  }

  // Context menu items
  const renderContextMenu = () => {
    if (!contextMenuActions) return null;

    return (
      <ContextMenuContent className="w-64">
        {node.type === 'folder' && (
          <>
            <ContextMenuItem 
              onClick={() => contextMenuActions.onNewFile(node)}
            >
              New File
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => contextMenuActions.onNewFolder(node)}
            >
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem 
          onClick={() => contextMenuActions.onCopy(node)}
        >
          Copy
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => contextMenuActions.onCut(node)}
        >
          Cut
        </ContextMenuItem>
        {node.type === 'folder' && clipboardNode && (
          <ContextMenuItem 
            onClick={() => contextMenuActions.onPaste(node)}
          >
            Paste
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => {
            setIsRenaming(true);
            setTimeout(() => {
              inputRef.current?.focus();
              inputRef.current?.select();
            }, 100);
          }}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => contextMenuActions.onDelete(node)}
          className="text-red-500 focus:text-red-500"
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    );
  };

  return (
    <div className="file-tree-node" ref={setNodeRef} style={style}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "file-tree-item flex items-center py-1 px-2 rounded-sm cursor-pointer text-sm group",
              isSelected 
                ? "bg-accent text-accent-foreground" 
                : "hover:bg-accent/30 transition-colors duration-150",
              isDropTarget && node.type === 'folder' && "outline outline-2 outline-primary bg-accent/20"
            )}
            style={{ paddingLeft: `${(level * 12) + 4}px` }}
            onClick={handleClick}
            data-node-id={node.id}
            data-node-type={node.type}
            data-selected={isSelected}
            data-drop-target={isDropTarget && node.type === 'folder'}
          >
            {/* Drag handle */}
            <div 
              className="h-4 w-4 shrink-0 mr-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            
            {node.type === 'folder' && (
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 mr-1 text-muted-foreground transition-transform",
                  isExpanded && "transform rotate-90"
                )}
                onClick={handleToggleExpand}
              />
            )}
            {node.type === 'folder' ? (
              isExpanded ? (
                <FolderOpen className={cn("h-4 w-4 shrink-0 mr-1 text-blue-500", isDropTarget && "text-primary")} />
              ) : (
                <Folder className={cn("h-4 w-4 shrink-0 mr-1 text-blue-500", isDropTarget && "text-primary")} />
              )
            ) : (
              <File className="h-4 w-4 shrink-0 mr-1 text-gray-500" />
            )}
            
            {isRenaming ? (
              <motion.input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-background border border-input px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>
        </ContextMenuTrigger>
        {renderContextMenu()}
      </ContextMenu>

      {node.type === 'folder' && node.children && (isExpanded || searchQuery) && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="pl-4">
                {node.children.map(child => (
                  <TreeItem
                    key={child.id}
                    node={child}
                    level={level + 1}
                    data={data}
                    onSelect={onSelect}
                    isSelected={selectedIds?.includes(child.id)}
                    searchQuery={searchQuery}
                    highlightMatches={highlightMatches}
                    multiSelect={multiSelect}
                    selectedIds={selectedIds}
                    expanded={expanded}
                    onExpandedChange={onExpandedChange}
                    onSelectionChange={onSelectionChange}
                    contextMenuActions={contextMenuActions}
                    clipboardNode={clipboardNode}
                    isDropTarget={child.id === node.id && isDropTarget}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
} 