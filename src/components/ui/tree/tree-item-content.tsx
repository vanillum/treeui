"use client"

import * as React from "react"
import { File, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { TreeNode } from "@/types/tree"
import { useTree } from "./tree-context"

interface TreeItemContentProps extends React.ComponentPropsWithoutRef<"div"> {
  node: TreeNode
  searchQuery?: string
}

export default function TreeItemContent({ node, searchQuery }: TreeItemContentProps) {
  const renderHighlightedText = (text: string) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'i'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery?.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div
      className={cn("flex items-center gap-2 flex-1")}
    >
      <TreeItemIcon type={node.type} />
      <span className="truncate">{renderHighlightedText(node.name)}</span>
    </div>
  )
}

function TreeItemIcon({ type }: { type: string }) {
  if (type === 'folder') {
    return <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
  } else if (type === 'file') {
    return <File className="h-4 w-4 shrink-0 text-muted-foreground" />
  } else {
    return null
  }
} 