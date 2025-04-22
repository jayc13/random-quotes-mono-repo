import React from 'react';
import ReactDOMServer from 'react-dom/server';
// import { StaticRouter } from 'react-router-dom/server'; // Keep if router needed
import App from './App';

// Define structure for quote data (adjust if API returns different structure)
interface QuoteData {
  text: string;
  author: string;
}

interface RenderResult {
  html: string;
}

// Update render function signature to accept quoteData
export function render(url: string, context: any, quoteData: QuoteData | null): RenderResult {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      {/* Pass the fetched quote data as a prop to App */}
      <App quote={quoteData ?? undefined} />
    </React.StrictMode>
  );
  return { html };
}
