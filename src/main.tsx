import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register Service Worker immediately for complete offline play & asset caching
registerSW({immediate: true});

createRoot(document.getElementById('root')!).render(<App />);

