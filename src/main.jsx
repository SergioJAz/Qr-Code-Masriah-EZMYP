import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { pageContent } from './content/pageContent.js';
import './styles/globals.css';

// Applied before the first paint so a right-to-left page never flashes
// left-to-right on a slow phone connection.
document.documentElement.lang = pageContent.lang || 'en';
document.documentElement.dir = pageContent.dir || 'ltr';
if (pageContent.title) document.title = pageContent.title;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
