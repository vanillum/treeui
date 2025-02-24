import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileTree } from './file-tree';
import { TreeNode } from '@/types/tree';

const meta: Meta<typeof FileTree> = {
  title: 'Components/FileTree',
  component: FileTree,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileTree>;

const demoData: TreeNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      { id: '2', name: 'components', type: 'folder', children: [] },
      { id: '3', name: 'app.tsx', type: 'file' }
    ]
  },
  {
    id: '4',
    name: 'public',
    type: 'folder',
    children: [
      { id: '5', name: 'images', type: 'folder', children: [
        { id: '6', name: 'logo.png', type: 'file' }
      ] }
    ]
  },
  { id: '7', name: 'package.json', type: 'file' },
  { id: '8', name: 'tsconfig.json', type: 'file' }
];

export const Default: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [expanded, setExpanded] = useState<string[]>([]);
    
    return (
      <div style={{ width: '300px', height: '400px', border: '1px solid #ccc' }}>
        <FileTree 
          data={demoData}
          searchQuery=""
          selectedIds={selectedIds}
          expanded={expanded}
          onExpandedChange={setExpanded}
          onSelectionChange={(nodes) => setSelectedIds(nodes.map(n => n.id))}
        />
      </div>
    );
  }
};

export const WithSearch: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [expanded, setExpanded] = useState<string[]>(['1', '4', '5']);
    
    return (
      <div style={{ width: '300px', height: '400px', border: '1px solid #ccc' }}>
        <FileTree 
          data={demoData}
          searchQuery="json"
          selectedIds={selectedIds}
          expanded={expanded}
          onExpandedChange={setExpanded}
          onSelectionChange={(nodes) => setSelectedIds(nodes.map(n => n.id))}
        />
      </div>
    );
  }
};

export const WithSelection: Story = {
  render: () => {
    const [selectedIds, setSelectedIds] = useState<string[]>(['3']);
    const [expanded, setExpanded] = useState<string[]>(['1']);
    
    return (
      <div style={{ width: '300px', height: '400px', border: '1px solid #ccc' }}>
        <FileTree 
          data={demoData}
          searchQuery=""
          selectedIds={selectedIds}
          expanded={expanded}
          onExpandedChange={setExpanded}
          onSelectionChange={(nodes) => setSelectedIds(nodes.map(n => n.id))}
        />
      </div>
    );
  }
}; 