import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailure, setPaymentFailure] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async () => {
    try {
      setLoading(true);
      setPaymentSuccess(false);
      setPaymentFailure(false);

      const response = await axios.post('/api/create-order', {
        amount: 49900,
        currency: 'INR',
        receipt: 'order_rcpt_' + Date.now(),
        notes: {
          productName: 'Premium Subscription',
          customerEmail: 'customer@example.com'
        }
      });

      const { data: order } = response;
      setLoading(false);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Your Company',
        description: 'Premium Subscription',
        image: 'https://your-company-logo.png',
        order_id: order.orderId,
        handler: function (response) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9876543210'
        },
        notes: {
          address: 'Customer Address'
        },
        theme: {
          color: '#3395ff'
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', handlePaymentFailure);
      razorpay.open();

    } catch (error) {
      setLoading(false);
      handlePaymentFailure({ error: { description: error.message } });
    }
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);

    try {
      const verificationResponse = await axios.post('/api/verify-payment', {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      });

      const { data } = verificationResponse;

      setLoading(false);

      if (data.success) {
        setPaymentId(response.razorpay_payment_id);
        setOrderId(response.razorpay_order_id);
        setPaymentSuccess(true);
        setPaymentFailure(false);
      } else {
        handlePaymentFailure({ error: { description: 'Payment verification failed' } });
      }
    } catch (error) {
      setLoading(false);
      handlePaymentFailure({ error: { description: 'Error verifying payment: ' + error.message } });
    }
  };

  const handlePaymentFailure = (response) => {
    setErrorMessage('Payment failed: ' + response.error.description);
    setPaymentFailure(true);
    setPaymentSuccess(false);
    setLoading(false);
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="text-center mb-4">Razorpay Payment Demo</h1>

        <div className="product-card">
          <div className="row">
            <div className="col-md-8">
              <h3>Premium Subscription</h3>
              <p>Get access to all premium features for one year</p>
              <ul>
                <li>Unlimited access to all content</li>
                <li>Priority customer support</li>
                <li>Ad-free experience</li>
                <li>Exclusive member-only features</li>
              </ul>
            </div>
            <div className="col-md-4 text-center">
              <h4>₹499.00</h4>
              <button
                onClick={handlePayment}
                className="payment-btn mt-3"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loader">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Processing your payment...</p>
          </div>
        )}

        {paymentSuccess && (
          <div className="status-section success">
            <h4>Payment Successful! ✅</h4>
            <p>Your transaction has been completed successfully.</p>
            <p><strong>Transaction ID:</strong> {paymentId}</p>
            <p><strong>Order ID:</strong> {orderId}</p>
          </div>
        )}

        {paymentFailure && (
          <div className="status-section failure">
            <h4>Payment Failed ❌</h4>
            <p>We couldn't process your payment. Please try again or contact support.</p>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
