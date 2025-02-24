"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { TreeNode } from "@/types/tree"
import { useTree } from "./tree-context"
import { TreeItemTrigger } from "./tree-item-trigger"
import TreeItemContent from "./tree-item-content"
import { TreeItemGroup } from "./tree-components"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu"

const treeItemVariants = cva(
  "flex items-center py-1 px-2 relative select-none outline-none", {
  variants: {
    variant: {
      default: "hover:bg-accent",
      selected: "bg-accent",
    },
    size: {
      default: "h-8",
      sm: "h-7",
      lg: "h-9",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface TreeItemProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof treeItemVariants> {
  node: TreeNode
  level?: number
  contextMenuActions?: {
    onNewFile?: (node: TreeNode) => void
    onNewFolder?: (node: TreeNode) => void
    onCopy?: (node: TreeNode) => void
    onCut?: (node: TreeNode) => void
    onPaste?: (node: TreeNode) => void
    onDelete?: (node: TreeNode) => void
    onRename?: (node: TreeNode, newName: string) => void
    onOpen?: (node: TreeNode) => void
  }
  clipboardNode?: { node: TreeNode; operation: 'copy' | 'cut' } | null
  searchQuery?: string
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  ({ className, node, level = 0, variant, size, contextMenuActions, clipboardNode, searchQuery, ...props }, ref) => {
    const { expanded, setExpanded, selectedIds, setSelectedIds, onNodeSelect } = useTree()
    const isExpanded = expanded.includes(node.id)
    const isSelected = selectedIds.includes(node.id)
    const itemRef = React.useRef<HTMLDivElement>(null)

    const handleSelect = () => {
      setSelectedIds([node.id])
      onNodeSelect?.(node)
    }

    const handleExpand = () => {
      if (node.type === "folder") {
        setExpanded(prev =>
          isExpanded ? prev.filter(id => id !== node.id) : [...prev, node.id]
        )
      }
    }

    return (
      <li className="relative">
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              ref={itemRef}
              data-node-id={node.id}
              className={cn(
                treeItemVariants({ variant: isSelected ? "selected" : "default", size }),
                "w-full text-left cursor-default flex items-center",
                "hover:outline-none hover:ring-2 hover:ring-accent hover:bg-accent rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-accent focus:bg-accent rounded-md",
                className
              )}
              style={{ paddingLeft: `${(level + 1) * 12}px` }}
              onClick={(e) => {
                e.stopPropagation()
                handleSelect()
              }}
              role="treeitem"
              aria-expanded={node.type === 'folder' ? isExpanded : undefined}
            >
              <TreeItemTrigger
                expanded={isExpanded}
                type={node.type}
                onClick={(e) => {
                  e.stopPropagation()
                  handleExpand()
                }}
              />
              <TreeItemContent node={node} searchQuery={searchQuery} />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => console.log('Test click on:', node.name)}>
              Test Item for {node.name}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isExpanded && node.children && (
          <div ref={ref} {...props}>
            <TreeItemGroup>
              {node.children.map((child) => (
                <TreeItem
                  key={child.id}
                  node={child}
                  level={level + 1}
                  variant={variant}
                  size={size}
                  contextMenuActions={contextMenuActions}
                  clipboardNode={clipboardNode}
                  searchQuery={searchQuery}
                />
              ))}
            </TreeItemGroup>
          </div>
        )}
      </li>
    )
  }
)

TreeItem.displayName = "TreeItem"

export { TreeItem } 