import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tree } from '../tree'

const mockData = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        children: [
          {
            id: '3',
            name: 'tree.tsx',
            type: 'file'
          }
        ]
      }
    ]
  }
]

describe('Tree', () => {
  it('renders tree nodes correctly', () => {
    render(<Tree data={mockData} />)
    expect(screen.getByText('src')).toBeInTheDocument()
  })

  it('expands/collapses folders on click', async () => {
    render(<Tree data={mockData} />)
    const folder = screen.getByText('src')
    
    await userEvent.click(folder)
    expect(screen.getByText('components')).toBeInTheDocument()
    
    await userEvent.click(folder)
    expect(screen.queryByText('components')).not.toBeInTheDocument()
  })

  it('handles selection correctly', () => {
    const onSelect = jest.fn()
    render(<Tree data={mockData} onNodeSelect={onSelect} />)
    
    fireEvent.click(screen.getByText('src'))
    expect(onSelect).toHaveBeenCalledWith(mockData[0])
  })

  it('handles keyboard navigation', () => {
    const onSelect = jest.fn()
    render(<Tree data={mockData} onNodeSelect={onSelect} />)
    
    const folder = screen.getByText('src')
    folder.focus()
    
    fireEvent.keyDown(folder, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(mockData[0])
    
    fireEvent.keyDown(folder, { key: 'ArrowRight' })
    expect(screen.getByText('components')).toBeInTheDocument()
  })

  it('handles context menu actions', async () => {
    const onDelete = jest.fn()
    const onRename = jest.fn()
    
    render(
      <Tree 
        data={mockData} 
        contextMenuActions={{
          onDelete,
          onRename: (node, newName) => onRename(node, newName)
        }}
      />
    )
    
    const folder = screen.getByText('src')
    await userEvent.contextMenu(folder)
    
    await userEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith(mockData[0])
  })

  it('handles search highlighting', () => {
    render(<Tree data={mockData} searchQuery="src" />)
    const highlight = screen.getByText('src')
    expect(highlight).toHaveClass('bg-yellow-200')
  })
}) 