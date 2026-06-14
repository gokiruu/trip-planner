import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

Amplify.configure(outputs);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
