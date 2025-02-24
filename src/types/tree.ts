import { DragEndEvent } from '@dnd-kit/core';

export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  content?: string;
  isRenaming?: boolean;
  isExpanded?: boolean;
  isDragging?: boolean;
}

export interface FileTypeIcon {
  icon: React.ComponentType;
  color?: string;
}

export interface ContextMenuAction {
  label: string;
  action: (node: TreeNode) => void;
  icon?: React.ComponentType;
  shortcut?: string;
  disabled?: (node: TreeNode) => boolean;
}

export interface FileTreeContextMenuActions {
  onNewFile: (parentNode: TreeNode) => void;
  onNewFolder: (parentNode: TreeNode) => void;
  onCopy: (node: TreeNode) => void;
  onCut: (node: TreeNode) => void;
  onPaste: (targetNode: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  onRename: (node: TreeNode, newName: string) => void;
  onOpen: (node: TreeNode) => void;
}

export interface FileTreeProps {
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

export interface TreeItemProps {
  node: TreeNode;
  level: number;
  data?: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  isSelected?: boolean;
  searchQuery?: string;
  highlightMatches?: boolean;
  multiSelect?: boolean;
  selectedIds?: string[];
  expanded?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  onSelectionChange?: (nodes: TreeNode[]) => void;
  contextMenuActions?: FileTreeContextMenuActions;
  clipboardNode?: { node: TreeNode; operation: 'copy' | 'cut' } | null;
  isDropTarget?: boolean;
} 