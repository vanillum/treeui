import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileTree } from '../file-tree';

// Mock data for testing
const mockData = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      { id: '2', name: 'components', type: 'folder', children: [] },
      { id: '3', name: 'app.tsx', type: 'file' }
    ]
  },
  { id: '4', name: 'package.json', type: 'file' }
];

describe('FileTree Component', () => {
  it('renders the file tree with correct items', () => {
    render(
      <FileTree 
        data={mockData}
        searchQuery=""
        selectedIds={[]}
        expanded={[]}
        onExpandedChange={() => {}}
        onSelectionChange={() => {}}
      />
    );
    
    // Check if folder and files are rendered
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('expands folders when clicked', () => {
    const handleExpandedChange = jest.fn();
    
    render(
      <FileTree 
        data={mockData}
        searchQuery=""
        selectedIds={[]}
        expanded={[]}
        onExpandedChange={handleExpandedChange}
        onSelectionChange={() => {}}
      />
    );
    
    // Click on the folder
    fireEvent.click(screen.getByText('src'));
    
    // Check if onExpandedChange was called with the folder id
    expect(handleExpandedChange).toHaveBeenCalledWith(['1']);
  });

  it('selects items when clicked', () => {
    const handleSelectionChange = jest.fn();
    
    render(
      <FileTree 
        data={mockData}
        searchQuery=""
        selectedIds={[]}
        expanded={[]}
        onExpandedChange={() => {}}
        onSelectionChange={handleSelectionChange}
      />
    );
    
    // Click on a file
    fireEvent.click(screen.getByText('package.json'));
    
    // Check if onSelectionChange was called with the file
    expect(handleSelectionChange).toHaveBeenCalledWith([expect.objectContaining({ id: '4' })]);
  });

  it('filters items based on search query', () => {
    render(
      <FileTree 
        data={mockData}
        searchQuery="package"
        selectedIds={[]}
        expanded={[]}
        onExpandedChange={() => {}}
        onSelectionChange={() => {}}
      />
    );
    
    // Check if only matching items are visible
    expect(screen.getByText('package.json')).toBeInTheDocument();
    expect(screen.queryByText('src')).not.toBeInTheDocument();
  });
}); 