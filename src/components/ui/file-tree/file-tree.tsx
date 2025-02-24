'use client';

import React, { useEffect, useRef } from 'react';
import { TreeNode, FileTreeContextMenuActions } from '@/types/tree';
import { TreeItem } from './tree-item';
import { cn } from '@/lib/utils';
import { TreeProvider } from '../tree/tree-context';
import { TestTreeItem } from "@/components/test-tree-item"
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface FileTreeProps {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  className?: string;
  searchQuery?: string;
  selectedIds?: string[];
  expanded?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  onSelectionChange?: (nodes: TreeNode[]) => void;
  contextMenuActions?: FileTreeContextMenuActions;
  clipboardNode?: { node: TreeNode; operation: 'copy' | 'cut' } | null;
  level?: number;
  onDragEnd?: (event: DragEndEvent) => void;
}

export function FileTree({
  data,
  onSelect,
  className,
  searchQuery = '',
  selectedIds = [],
  expanded = [],
  onExpandedChange,
  onSelectionChange,
  contextMenuActions,
  clipboardNode,
  level = 0,
  onDragEnd,
}: FileTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require a drag of at least 8px to start
      },
    })
  );
  
  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    
    // Helper function to check if a node or any of its children match the search query
    const nodeMatches = (node: TreeNode): boolean => {
      const nameMatches = node.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // If this node matches, return true immediately
      if (nameMatches) return true;
      
      // Check children recursively
      if (node.children) {
        return node.children.some(child => nodeMatches(child));
      }
      
      return false;
    };
    
    // Create a deep copy of the tree with only matching nodes and their parents
    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter(node => nodeMatches(node))
        .map(node => {
          if (!node.children) return node;
          
          return {
            ...node,
            children: filterTree(node.children)
          };
        });
    };
    
    return filterTree(data);
  }, [data, searchQuery]);

  // Expand all folders when searching
  React.useEffect(() => {
    // Only expand folders when search query changes from empty to non-empty
    if (searchQuery && onExpandedChange) {
      // Get all folder IDs from filtered data
      const folderIds: string[] = [];
      
      const collectFolderIds = (nodes: TreeNode[]) => {
        for (const node of nodes) {
          if (node.type === 'folder') {
            folderIds.push(node.id);
            if (node.children) {
              collectFolderIds(node.children);
            }
          }
        }
      };
      
      collectFolderIds(filteredData);
      
      // Only update if we have folders to expand
      if (folderIds.length > 0) {
        onExpandedChange(folderIds);
      }
    }
  }, [searchQuery, filteredData, onExpandedChange]);

  // Find all nodes in the tree (flattened)
  const getAllNodes = React.useCallback((nodes: TreeNode[]): TreeNode[] => {
    return nodes.reduce((acc: TreeNode[], node) => {
      acc.push(node);
      if (node.children && (expanded.includes(node.id) || searchQuery)) {
        acc.push(...getAllNodes(node.children));
      }
      return acc;
    }, []);
  }, [expanded, searchQuery]);

  // Memoize allNodes to prevent unnecessary recalculations
  const allNodes = React.useMemo(() => {
    return searchQuery ? getAllNodes(filteredData) : getAllNodes(data);
  }, [data, filteredData, getAllNodes, searchQuery]);

  // Find node by ID
  const findNodeById = (nodeId: string): TreeNode | undefined => {
    const findNode = (nodes: TreeNode[]): TreeNode | undefined => {
      for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    return findNode(data);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an input field or the container doesn't have focus
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        !containerRef.current?.contains(document.activeElement)
      ) {
        return;
      }

      // Get the currently selected node
      const currentNodeId = selectedIds[0];
      if (!currentNodeId) return;

      const currentNodeIndex = allNodes.findIndex(node => node.id === currentNodeId);
      if (currentNodeIndex === -1) return;

      const currentNode = allNodes[currentNodeIndex];

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          if (currentNodeIndex > 0) {
            const prevNode = allNodes[currentNodeIndex - 1];
            onSelectionChange?.([prevNode]);
          }
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          if (currentNodeIndex < allNodes.length - 1) {
            const nextNode = allNodes[currentNodeIndex + 1];
            onSelectionChange?.([nextNode]);
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (currentNode.type === 'folder' && !expanded.includes(currentNode.id)) {
            onExpandedChange?.([...expanded, currentNode.id]);
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (currentNode.type === 'folder' && expanded.includes(currentNode.id)) {
            onExpandedChange?.(expanded.filter((id: string) => id !== currentNode.id));
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          // Start renaming the selected node
          const selectedNode = findNodeById(currentNodeId);
          if (selectedNode && contextMenuActions) {
            // Set the node to renaming mode by updating it in the tree
            const updatedNode = { ...selectedNode, isRenaming: true };
            // We need to notify the parent component to update the node
            contextMenuActions.onRename(selectedNode, selectedNode.name);
          }
          break;
        }
      }
    };

    // Add event listener to the container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      
      // Make the container focusable
      container.tabIndex = 0;
      
      // Focus the container if it's not already focused
      if (!container.contains(document.activeElement)) {
        container.focus();
      }
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [allNodes, selectedIds, expanded, onSelectionChange, onExpandedChange, contextMenuActions, data]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (over) {
      const overNode = findNodeById(over.id as string);
      if (overNode && overNode.type === 'folder') {
        setOverId(over.id as string);
      } else {
        setOverId(null);
      }
    } else {
      setOverId(null);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeNode = findNodeById(active.id as string);
      const overNode = findNodeById(over.id as string);
      
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
            
            // Call custom onDragEnd if provided
            if (onDragEnd) {
              onDragEnd(event);
            }
          }
        }
      }
    }
    
    setActiveId(null);
    setOverId(null);
  };

  // Find parent node
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

  // Update node in tree
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

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <TreeProvider onNodeSelect={(node) => onSelectionChange?.([node])}>
        <div 
          ref={containerRef}
          className={cn("file-tree w-full px-1 pb-16", className)}
          tabIndex={0}
        >
          <SortableContext 
            items={filteredData.map(node => node.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredData.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                level={level}
                data={data}
                onSelect={onSelect}
                isSelected={selectedIds.includes(node.id)}
                searchQuery={searchQuery}
                selectedIds={selectedIds}
                expanded={expanded}
                onExpandedChange={onExpandedChange}
                onSelectionChange={onSelectionChange}
                contextMenuActions={contextMenuActions}
                clipboardNode={clipboardNode}
                isDropTarget={node.id === overId}
              />
            ))}
          </SortableContext>
        </div>
        
        {/* Drag overlay for visual feedback during drag */}
        <DragOverlay>
          {activeId ? (
            <div className="opacity-70 bg-background border border-border rounded-sm p-1 shadow-md">
              {findNodeById(activeId)?.name}
            </div>
          ) : null}
        </DragOverlay>
      </TreeProvider>
    </DndContext>
  );
} 