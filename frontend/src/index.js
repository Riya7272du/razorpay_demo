import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Load Razorpay SDK
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize the app
const initializeApp = async () => {
  const isRazorpayLoaded = await loadRazorpay();

  if (!isRazorpayLoaded) {
    alert('Razorpay SDK failed to load. Check your internet connection.');
    return;
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

initializeApp();