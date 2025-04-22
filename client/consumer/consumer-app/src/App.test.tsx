import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react'; // Import React for JSX

describe('App component', () => {
  it('renders loading state when no quote is provided', () => {
    render(<App />);
    // Check for loading text or a placeholder element
    // Using findBy queries might be better if loading involves async operations,
    // but for synchronous rendering, getByText is fine.
    expect(screen.getByText(/loading quote.../i)).toBeInTheDocument();
  });

  it('renders the quote and author when provided', () => {
    const mockQuote = {
      text: 'The only true wisdom is in knowing you know nothing.',
      author: 'Socrates'
    };
    render(<App quote={mockQuote} />);

    // Check if the quote text is present
    expect(screen.getByText(`"${mockQuote.text}"`)).toBeInTheDocument();

    // Check if the author is present
    expect(screen.getByText(`- ${mockQuote.author}`)).toBeInTheDocument();

    // Check that the loading text is NOT present
    expect(screen.queryByText(/loading quote.../i)).not.toBeInTheDocument();
  });

   it('renders "Unknown Author" when author is null or missing', () => {
    const mockQuote = {
      text: 'This is a quote.',
      author: '' // or null or undefined
    };
    render(<App quote={mockQuote} />);

    expect(screen.getByText(`- Unknown Author`)).toBeInTheDocument();
  });

});
