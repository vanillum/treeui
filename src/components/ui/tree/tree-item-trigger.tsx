"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TreeNode } from "@/types/tree"
import { useTree } from "./tree-context"

interface TreeItemTriggerProps {
  expanded?: boolean
  type: "file" | "folder"
  onClick: (e: React.MouseEvent) => void
}

export function TreeItemTrigger({ expanded, type, onClick }: TreeItemTriggerProps) {
  return (
    <div className="flex items-center">
      {type === 'folder' && (
        <button
          type="button"
          className={cn(
            "h-4 w-4 rounded-sm hover:bg-muted",
            "flex items-center justify-center",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2",
            "transition-transform duration-200",
            expanded && "transform rotate-90"
          )}
          onClick={onClick}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
      {type === 'file' && <div className="w-4" />}
    </div>
  )
} 