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
import {
  FilePlus,
  FolderPlus,
  Trash2,
  Copy,
  Scissors,
  Clipboard,
  ExternalLink,
  Edit,
} from "lucide-react"
import { TreeNode } from "@/types/tree"

interface TreeContextMenuProps {
  node: TreeNode
  children: React.ReactNode
  onNewFile?: (node: TreeNode) => void
  onNewFolder?: (node: TreeNode) => void
  onCopy?: (node: TreeNode) => void
  onCut?: (node: TreeNode) => void
  onPaste?: (node: TreeNode) => void
  onDelete?: (node: TreeNode) => void
  onRename?: (node: TreeNode, newName: string) => void
  onOpen?: (node: TreeNode) => void
  clipboardNode?: { node: TreeNode; operation: 'copy' | 'cut' } | null
}

export function TreeContextMenu({
  node,
  children,
  onNewFile,
  onNewFolder,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onRename,
  onOpen,
  clipboardNode,
}: TreeContextMenuProps) {
  const [debug, setDebug] = React.useState<string[]>([])

  React.useEffect(() => {
    console.log('TreeContextMenu mounted for:', node.name)
    return () => console.log('TreeContextMenu unmounted for:', node.name)
  }, [node.name])

  return (
    <>
      <ContextMenu onOpenChange={(open) => {
        console.log('Context menu state changed:', open, 'for node:', node.name)
        setDebug(prev => [...prev, `Menu ${open ? 'opened' : 'closed'} for ${node.name}`])
      }}>
        <ContextMenuTrigger asChild>
          <div className="relative border border-transparent hover:border-blue-500">
            {children}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="!bg-purple-500">
          {node.type === 'folder' && (
            <>
              <ContextMenuItem onSelect={() => onNewFile?.(node)}>
                <FilePlus className="mr-2 h-4 w-4" />
                New File
                <ContextMenuShortcut>⌘N</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => onNewFolder?.(node)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
                <ContextMenuShortcut>⇧⌘N</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onSelect={() => onRename?.(node, node.name)}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onDelete?.(node)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => onCopy?.(node)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onCut?.(node)}>
            <Scissors className="mr-2 h-4 w-4" />
            Cut
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>
          {node.type === 'folder' && (
            <ContextMenuItem onSelect={() => onPaste?.(node)} disabled={!clipboardNode}>
              <Clipboard className="mr-2 h-4 w-4" />
              Paste
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>
          )}
          {node.type === 'file' && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => onOpen?.(node)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
                <ContextMenuShortcut>⌘↵</ContextMenuShortcut>
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Debug overlay */}
      <div className="fixed bottom-4 right-4 bg-black/50 text-white p-2 text-xs rounded-md">
        {debug.slice(-5).map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </>
  )
} 