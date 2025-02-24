"use client"

import { TreeNode } from "@/types/tree"
import { TestTreeItem } from "./test-tree-item"
import { useEffect, useRef, useState } from "react"
import { useTree } from "./ui/tree/tree-context"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface TestTreeProps {
  data: TreeNode[]
  onNewFile?: (parentNode: TreeNode) => void
  onNewFolder?: (parentNode: TreeNode) => void
  onCopy?: (node: TreeNode) => void
  onCut?: (node: TreeNode) => void
  onPaste?: (targetNode: TreeNode) => void
  onDelete?: (node: TreeNode) => void
  onRename?: (node: TreeNode, newName: string) => void
  onOpen?: (node: TreeNode) => void
}

export function TestTree({ 
  data,
  onNewFile,
  onNewFolder,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onRename,
  onOpen
}: TestTreeProps) {
  const { expanded, setExpanded, selectedIds, setSelectedIds } = useTree()
  const treeRef = useRef<HTMLDivElement>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);

  // Helper functions for navigation
  const navigateUp = () => {
    const nodeElements = document.querySelectorAll('[data-node-id]');
    if (!nodeElements.length || !selectedIds.length) return;
    
    const selectedElement = document.querySelector(`[data-node-id="${selectedIds[0]}"]`);
    if (!selectedElement) return;
    
    const elementsArray = Array.from(nodeElements);
    const currentIndex = elementsArray.indexOf(selectedElement as Element);
    
    if (currentIndex > 0) {
      const prevElement = elementsArray[currentIndex - 1];
      const prevId = prevElement.getAttribute('data-node-id');
      if (prevId) {
        setSelectedIds([prevId]);
        prevElement.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const navigateDown = () => {
    const nodeElements = document.querySelectorAll('[data-node-id]');
    if (!nodeElements.length || !selectedIds.length) return;
    
    const selectedElement = document.querySelector(`[data-node-id="${selectedIds[0]}"]`);
    if (!selectedElement) return;
    
    const elementsArray = Array.from(nodeElements);
    const currentIndex = elementsArray.indexOf(selectedElement as Element);
    
    if (currentIndex < elementsArray.length - 1) {
      const nextElement = elementsArray[currentIndex + 1];
      const nextId = nextElement.getAttribute('data-node-id');
      if (nextId) {
        setSelectedIds([nextId]);
        nextElement.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const expandFolder = () => {
    if (!selectedIds.length) return;
    
    const findNode = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === selectedIds[0]) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const selectedNode = findNode(data);
    if (selectedNode?.type === 'folder' && !expanded.includes(selectedNode.id)) {
      setExpanded(prev => [...prev, selectedNode.id]);
    }
  };

  const collapseFolder = () => {
    if (!selectedIds.length) return;
    
    const findNode = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === selectedIds[0]) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const selectedNode = findNode(data);
    if (selectedNode?.type === 'folder' && expanded.includes(selectedNode.id)) {
      setExpanded(prev => prev.filter(id => id !== selectedNode.id));
    }
  };

  return (
    <>
      {/* Debug info and navigation controls */}
      <div className="text-xs p-1 bg-muted text-muted-foreground">
        <div>
          Focus: {hasFocus ? 'Yes' : 'No'} | Last key: {lastKey || 'None'} | 
          Selected: {selectedIds.join(', ')}
        </div>
        <div className="flex gap-2 mt-1">
          <button 
            className="p-1 bg-accent rounded hover:bg-accent/80"
            onClick={navigateUp}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button 
            className="p-1 bg-accent rounded hover:bg-accent/80"
            onClick={navigateDown}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button 
            className="p-1 bg-accent rounded hover:bg-accent/80"
            onClick={expandFolder}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button 
            className="p-1 bg-accent rounded hover:bg-accent/80"
            onClick={collapseFolder}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div 
        ref={treeRef}
        className={`select-none border-2 ${hasFocus ? 'border-primary' : 'border-transparent'} p-1`}
        tabIndex={0}
        onFocus={() => {
          setHasFocus(true);
          // If no item is selected, select the first one
          if (selectedIds.length === 0 && data.length > 0) {
            setSelectedIds([data[0].id]);
          }
        }}
        onBlur={() => {
          setHasFocus(false);
        }}
        onClick={() => {
          // Ensure the tree container gets focus when clicked
          treeRef.current?.focus();
        }}
      >
        {data.map((node) => (
          <TestTreeItem
            key={node.id}
            node={node}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            onCopy={onCopy}
            onCut={onCut}
            onPaste={onPaste}
            onDelete={onDelete}
            onRename={onRename}
            onOpen={onOpen}
          />
        ))}
      </div>
    </>
  );
} 