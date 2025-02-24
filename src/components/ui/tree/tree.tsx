"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TreeContext, TreeContextValue } from "./tree-context"
import { TreeItem } from "./tree-item"
import { TreeNode } from "@/types/tree"

export interface TreeProps extends React.ComponentPropsWithoutRef<"div"> {
  data: TreeNode[]
  defaultExpanded?: string[]
  onNodeSelect?: (node: TreeNode) => void
  className?: string
}

const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  ({ className, data, defaultExpanded = [], onNodeSelect, ...props }, ref) => {
    const [expanded, setExpanded] = React.useState<string[]>(defaultExpanded)

    const contextValue = React.useMemo<TreeContextValue>(
      () => ({
        expanded,
        setExpanded,
        onNodeSelect,
      }),
      [expanded, onNodeSelect]
    )

    return (
      <TreeContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "w-full select-none",
            className
          )}
          {...props}
        >
          <TreeRoot>
            {data.map((node) => (
              <TreeItem key={node.id} node={node} />
            ))}
          </TreeRoot>
        </div>
      </TreeContext.Provider>
    )
  }
)
Tree.displayName = "Tree"

export { Tree } 