"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TreeNode } from "@/types/tree"

const TreeRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
TreeRoot.displayName = "TreeRoot"

const TreeItemGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("ml-3", className)} {...props} />
))
TreeItemGroup.displayName = "TreeItemGroup"

interface TreeItemTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  expanded: boolean
  type: "file" | "folder"
}

const TreeItemTrigger = React.forwardRef<HTMLButtonElement, TreeItemTriggerProps>(
  ({ className, expanded, type, ...props }, ref) => {
    if (type === "file") return null

    return (
      <button
        ref={ref}
        className={cn(
          "h-4 w-4 shrink-0 mr-1 rounded-sm hover:bg-accent/50 transition-transform",
          expanded && "transform rotate-90",
          className
        )}
        {...props}
      >
        <ChevronRight className="h-3 w-3" />
      </button>
    )
  }
)
TreeItemTrigger.displayName = "TreeItemTrigger"

interface TreeItemContentProps extends React.ComponentPropsWithoutRef<"div"> {
  node: TreeNode
}

const TreeItemContent = React.forwardRef<HTMLDivElement, TreeItemContentProps>(
  ({ className, node, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 flex-1", className)}
      {...props}
    >
      <TreeItemIcon type={node.type} />
      <span className="truncate">{node.name}</span>
    </div>
  )
)
TreeItemContent.displayName = "TreeItemContent"

export { TreeRoot, TreeItemGroup, TreeItemTrigger, TreeItemContent } 