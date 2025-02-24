import { TreeNode } from "@/types/tree"

export function findNodeById(id: string, nodes: TreeNode[]): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(id, node.children)
      if (found) return found
    }
  }
  return null
}

export function getAllNodes(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = []
  nodes.forEach(node => {
    result.push(node)
    if (node.children) {
      result.push(...getAllNodes(node.children))
    }
  })
  return result
}

export function getNodesFromIds(ids: string[], nodes: TreeNode[]): TreeNode[] {
  const allNodes = getAllNodes(nodes)
  return allNodes.filter(node => ids.includes(node.id))
}

export function getNodesBetween(startNode: TreeNode, endNode: TreeNode, nodes: TreeNode[]): TreeNode[] {
  const allNodes = getAllNodes(nodes)
  const startIndex = allNodes.findIndex(n => n.id === startNode.id)
  const endIndex = allNodes.findIndex(n => n.id === endNode.id)
  
  if (startIndex === -1 || endIndex === -1) return []
  
  const start = Math.min(startIndex, endIndex)
  const end = Math.max(startIndex, endIndex)
  
  return allNodes.slice(start, end + 1)
} 