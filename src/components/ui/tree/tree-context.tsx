"use client"

import * as React from "react"
import { TreeNode } from "@/types/tree"

interface TreeContextValue {
  expanded: string[]
  setExpanded: React.Dispatch<React.SetStateAction<string[]>>
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  onNodeSelect?: (node: TreeNode) => void
}

const TreeContext = React.createContext<TreeContextValue | undefined>(undefined)

interface TreeProviderProps {
  children: React.ReactNode
  onNodeSelect?: (node: TreeNode) => void
}

export function TreeProvider({ children, onNodeSelect }: TreeProviderProps) {
  const [expanded, setExpanded] = React.useState<string[]>([])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  return (
    <TreeContext.Provider
      value={{
        expanded,
        setExpanded,
        selectedIds,
        setSelectedIds,
        onNodeSelect,
      }}
    >
      {children}
    </TreeContext.Provider>
  )
}

export function useTree() {
  const context = React.useContext(TreeContext)
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider")
  }
  return context
}

export { TreeContext, type TreeContextValue } 