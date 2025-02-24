# React File Tree Component

A high-quality, accessible, and customizable file tree component for React applications. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📁 Intuitive file and folder navigation
- 🔍 Fast file search with keyboard shortcuts
- 🖱️ Context menu with common file operations
- ✏️ Rename, create, delete, copy, and paste operations
- 🔄 Drag and drop functionality
- 🎨 Customizable themes (light/dark mode)
- ⌨️ Full keyboard navigation support
- ♿ Accessible design

## Installation

```bash
npm install react-file-tree-component
# or
yarn add react-file-tree-component
```

## Quick Start

```tsx
import { FileTree } from 'react-file-tree-component';

const data = [
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

function App() {
  return (
    <div className="h-screen">
      <FileTree 
        data={data}
        onSelectionChange={(nodes) => console.log('Selected:', nodes)}
      />
    </div>
  );
}
```

## Documentation

For full documentation, visit [our documentation site](https://example.com/docs).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name] 