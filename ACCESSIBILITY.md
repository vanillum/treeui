# Accessibility Guide for React File Tree

This document outlines the accessibility features of the React File Tree component and provides guidance for maintaining and improving accessibility.

## Current Accessibility Features

### Keyboard Navigation

- **Arrow Keys**: Navigate up and down through the file tree
- **Enter/Space**: Select a file or toggle folder expansion
- **Tab**: Move focus to interactive elements
- **Escape**: Close context menus or cancel operations
- **Ctrl+F/Cmd+F**: Focus the search input

### Screen Reader Support

- Appropriate ARIA roles and attributes are used throughout the component
- Meaningful labels and descriptions for interactive elements
- Announcements for state changes (e.g., folder expansion, selection)

### Focus Management

- Visible focus indicators for all interactive elements
- Focus is properly trapped in modal dialogs
- Focus is returned to appropriate elements after operations

### Color and Contrast

- All text meets WCAG 2.1 AA contrast requirements
- Interactive elements have sufficient contrast
- Visual information is not conveyed by color alone

## Accessibility Testing

We use the following tools and methods to test accessibility:

1. **Automated Testing**:
   - Jest and Testing Library for component testing
   - Storybook a11y addon for catching common issues

2. **Manual Testing**:
   - Keyboard navigation testing
   - Screen reader testing with NVDA, JAWS, and VoiceOver
   - High contrast mode testing

## Accessibility Checklist for Contributors

When contributing to this project, please ensure your changes meet these accessibility requirements:

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical and follows the visual layout
- [ ] ARIA attributes are used appropriately
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Component works with screen readers
- [ ] No content flashes or rapidly changes
- [ ] Error messages are clear and accessible

## Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/) 