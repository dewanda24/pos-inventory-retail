import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PublicCatalogView } from './views/PublicCatalogView';
import './index.css';

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/katalog' ? <PublicCatalogView /> : <App />}
  </StrictMode>,
);
