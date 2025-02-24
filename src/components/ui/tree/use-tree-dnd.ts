import { useState } from 'react'
import { DragEndEvent, useDndMonitor } from '@dnd-kit/core'
import { TreeNode } from '@/types/tree'

export function useTreeDnd() {
  const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null)

  useDndMonitor({
    onDragStart(event) {
      setDraggedNode(event.active.data.current as TreeNode)
    },
    onDragEnd(event: DragEndEvent) {
      const { active, over } = event
      
      if (!over) return
      
      const draggedNode = active.data.current as TreeNode
      const targetNode = over.data.current as TreeNode
      
      // Handle drop logic here
      if (targetNode.type === 'folder') {
        // Move node to new folder
      }
      
      setDraggedNode(null)
    }
  })

  return {
    draggedNode
  }
} 