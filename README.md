# Razorpay Integration with React and Node.js

This repository contains a complete Razorpay payment gateway integration using React frontend and Node.js backend.

## Project Structure

```
razorpay-integration/
│
├── frontend/                # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── ...
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   ├── index.js       # Entry point
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── server/                # Node.js backend
│   ├── server.js          # Express server
│   ├── package.json
│   └── ...
│
└── README.md
```

## Prerequisites

1. Node.js and npm installed
2. MongoDB installed and running
3. Razorpay account (Test/Live)
4. Your Razorpay Key ID and Secret Key

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/razorpay-integration.git
cd razorpay-integration
```

### 2. Setup environment variables
Create a `.env` file in the server directory:

```
MONGODB_URI=mongodb://localhost:27017/razorpay-demo
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PORT=5000
```

Create a `.env` file in the client directory:

```
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Install backend dependencies
```bash
cd server
npm install
```

### 4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Start the backend server
```bash
cd server
npm start
# or for development
npm run dev
```

### 2. Start the frontend development server
```bash
cd ../frontend
npm start
```

## Integrating with Your Existing React App

1. **Install the required dependencies:**
```bash
npm install axios
```

2. **Load the Razorpay script** in your `index.js` or a separate utility file:
```javascript
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

3. **Create a Payment Component** that interfaces with your backend and Razorpay:
```javascript
// See App.js in the client directory for a complete implementation
```

## Testing

For testing payments in Razorpay test mode, use the following test credentials:

- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3-digit number
- **OTP**: 1234

## Going Live

Before going live:

1. Complete the Razorpay KYC process
2. Switch from test to live API keys
3. Ensure your website uses HTTPS
4. Set up proper webhook handling with retries
5. Implement proper error handling and logging

## Features

- Create Razorpay orders
- Process payments via Razorpay checkout
- Verify payment signatures
- Handle Razorpay webhooks
- Store orders and payments in MongoDB
- Responsive React UI

## API Endpoints

### Orders
- `POST /api/create-order` - Create a new Razorpay order
- `GET /api/orders` - Get all orders

### Payments
- `POST /api/verify-payment` - Verify a payment signature
- `GET /api/payments/:paymentId` - Get payment details by ID

### Webhooks
- `POST /api/webhook` - Handle Razorpay webhook events

## Best Practices

1. **Security**
   - Never expose your Key Secret on the frontend
   - Always verify signatures on your backend
   - Use HTTPS for all communications

2. **User Experience**
   - Display a loader while payment is processing
   - Handle all possible payment outcomes gracefully
   - Provide clear feedback on payment status

3. **Reliability**
   - Implement idempotency to prevent duplicate transactions
   - Use database transactions when updating order status
   - Implement webhook retries for failed notifications
