"use client"

import * as React from "react"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@/components/ui/context-menu"
import { TreeNode } from "@/types/tree"
import { useTree } from "./ui/tree/tree-context"
import { cn } from "@/lib/utils"
import { 
  ChevronDown, 
  ChevronRight, 
  File, 
  FilePlus,
  FolderPlus,
  Copy,
  Scissors,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TestTreeItemProps {
  node: TreeNode
  level?: number
  onNewFile?: (parentNode: TreeNode) => void
  onNewFolder?: (parentNode: TreeNode) => void
  onCopy?: (node: TreeNode) => void
  onCut?: (node: TreeNode) => void
  onPaste?: (targetNode: TreeNode) => void
  onDelete?: (node: TreeNode) => void
  onRename?: (node: TreeNode, newName: string) => void
  onOpen?: (node: TreeNode) => void
}

export function TestTreeItem({ 
  node, 
  level = 0,
  onNewFile,
  onNewFolder,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onRename,
  onOpen,
}: TestTreeItemProps) {
  const { expanded, setExpanded, selectedIds, setSelectedIds, onNodeSelect } = useTree()
  const isExpanded = expanded.includes(node.id)
  const isSelected = selectedIds.includes(node.id)
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => {
    setSelectedIds([node.id])
    onNodeSelect?.(node)
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (node.type === "folder") {
      setExpanded(prev =>
        isExpanded ? prev.filter(id => id !== node.id) : [...prev, node.id]
      )
    }
  }

  const handleRename = () => {
    setIsRenaming(true);
    setEditedName(node.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRenameSubmit = () => {
    if (editedName.trim() && editedName !== node.name) {
      onRename?.(node, editedName);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setEditedName(node.name);
    }
  };

  // Helper to find the next/previous selectable node
  const findNextSelectableNode = (direction: 'up' | 'down'): string | null => {
    const allNodes = document.querySelectorAll('[data-node-id]');
    const nodeArray = Array.from(allNodes);
    const currentIndex = nodeArray.findIndex(
      el => el.getAttribute('data-node-id') === node.id
    );

    if (currentIndex === -1) return null;

    const targetIndex = direction === 'down' 
      ? currentIndex + 1 
      : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < nodeArray.length) {
      return nodeArray[targetIndex].getAttribute('data-node-id') || null;
    }

    return null;
  };

  // Update keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if this node is selected
      if (!isSelected) return;

      // Prevent handling if we're renaming
      if (isRenaming) return;

      // Handle shortcuts
      if (e.key === 'F2') {
        e.preventDefault();
        handleRename();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete?.(node);
      } else if (e.metaKey || e.ctrlKey) { // Command/Ctrl shortcuts
        switch (e.key) {
          case 'c':
            e.preventDefault();
            onCopy?.(node);
            break;
          case 'x':
            e.preventDefault();
            onCut?.(node);
            break;
          case 'v':
            e.preventDefault();
            if (node.type === 'folder') {
              onPaste?.(node);
            }
            break;
          case 'n':
            e.preventDefault();
            if (node.type === 'folder') {
              if (e.shiftKey) {
                onNewFolder?.(node);
              } else {
                onNewFile?.(node);
              }
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isRenaming, node, onCopy, onCut, onPaste, onDelete, onNewFile, onNewFolder]);

  // Create array of guide lines based on level
  const guides = Array(level).fill(0).map((_, i) => (
    <div
      key={i}
      className="absolute w-[1px] h-full bg-border opacity-20"
      style={{ 
        left: `${(i * 12) + 17}px`,
        backgroundColor: 'rgb(64, 64, 64)'
      }}
    />
  ))

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div 
            layout
            data-node-id={node.id}
            className={cn(
              "flex h-6 w-full items-center relative pl-[10px]",
              isSelected ? "bg-accent" : "hover:bg-accent",
            )}
            onClick={(e) => {
              e.preventDefault(); // Prevent default focus behavior
              handleSelect();
            }}
            title={`${node.name}\n${node.type === 'folder' ? 'Folder' : 'File'} in workspace`}
          >
            {guides}
            <div 
              className="flex items-center"
              style={{ paddingLeft: `${level * 12}px` }}
            >
              {node.type === 'folder' && (
                <div className="w-4 h-4 flex items-center justify-center">
                  <motion.button
                    type="button"
                    onClick={handleExpand}
                    className="h-3 w-3 shrink-0 text-muted-foreground hover:text-foreground"
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </motion.button>
                </div>
              )}
              <div className="flex items-center gap-1.5 pl-1">
                {node.type === 'file' && (
                  <File className="h-4 w-4 text-muted-foreground" />
                )}
                <AnimatePresence mode="wait">
                  {isRenaming ? (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1"
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleRenameKeyDown}
                        className={cn(
                          "bg-transparent w-[calc(100%-8px)]",
                          "text-sm", // Match the text size
                          "px-1 -ml-1",
                          "border border-input focus:border-ring",
                          "rounded-sm",
                          "outline-none",
                          "transition-colors duration-200"
                        )}
                      />
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm text-foreground"
                    >
                      {node.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {node.type === 'folder' && (
            <>
              <ContextMenuItem onClick={() => onNewFile?.(node)}>
                <FilePlus className="mr-2 h-4 w-4" />
                New File
                <ContextMenuShortcut>⌘N</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onNewFolder?.(node)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
                <ContextMenuShortcut>⌘⇧N</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          
          <ContextMenuItem onClick={() => onCopy?.(node)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => onCut?.(node)}>
            <Scissors className="mr-2 h-4 w-4" />
            Cut
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>
          
          {node.type === 'folder' && (
            <ContextMenuItem onClick={() => onPaste?.(node)}>
              <Copy className="mr-2 h-4 w-4" />
              Paste
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>
          )}
          
          <ContextMenuSeparator />
          
          <ContextMenuItem onClick={handleRename}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => onDelete?.(node)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>

          {node.type === 'file' && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onOpen?.(node)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
                <ContextMenuShortcut>↵</ContextMenuShortcut>
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <AnimatePresence>
        {isExpanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {node.children.map((child) => (
              <TestTreeItem
                key={child.id}
                node={child}
                level={level + 1}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 