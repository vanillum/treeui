import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchInput } from '../search-input';

describe('SearchInput Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with placeholder text', () => {
    render(
      <SearchInput 
        value="" 
        onChange={() => {}} 
        placeholder="Test placeholder" 
      />
    );
    
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    render(
      <SearchInput 
        value="test value" 
        onChange={() => {}} 
      />
    );
    
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
  });

  it('calls onChange after debounce when typing', () => {
    const handleChange = jest.fn();
    
    render(
      <SearchInput 
        value="" 
        onChange={handleChange} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // onChange should not be called immediately due to debounce
    expect(handleChange).not.toHaveBeenCalled();
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Now onChange should be called
    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('clears the input when clear button is clicked', () => {
    const handleChange = jest.fn();
    
    render(
      <SearchInput 
        value="test value" 
        onChange={handleChange} 
      />
    );
    
    // Clear button should be visible
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
    
    // Click the clear button
    fireEvent.click(clearButton);
    
    // onChange should be called with empty string
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('focuses the input when container is clicked', () => {
    render(
      <SearchInput 
        value="" 
        onChange={() => {}} 
      />
    );
    
    const container = screen.getByRole('textbox').parentElement;
    const input = screen.getByRole('textbox');
    
    // Click the container
    fireEvent.click(container!);
    
    // Input should be focused
    expect(document.activeElement).toBe(input);
  });
}); 