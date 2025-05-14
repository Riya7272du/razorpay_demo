import express from 'express';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Razorpay Webhook raw body
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Other routes JSON body parser
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/razorpay-demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Mongoose Schemas
const orderSchema = new mongoose.Schema({
    razorpayOrderId: String,
    amount: Number,
    currency: String,
    status: String,
    createdAt: { type: Date, default: Date.now },
});

const paymentSchema = new mongoose.Schema({
    orderId: String,
    paymentId: String,
    signature: String,
    status: String,
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// Routes

// Create Order
app.post('/api/create-order', async (req, res) => {
    const { amount, currency, receipt, notes } = req.body;
    try {
        const options = { amount: amount * 100, currency, receipt, notes };
        const order = await razorpay.orders.create(options);

        const newOrder = new Order({
            razorpayOrderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
        });
        await newOrder.save();

        res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Verify Payment
app.post('/api/verify-payment', async (req, res) => {
    const { orderId, paymentId, signature } = req.body;

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    if (expectedSignature === signature) {
        const payment = new Payment({
            orderId,
            paymentId,
            signature,
            status: 'verified',
        });
        await payment.save();

        await Order.findOneAndUpdate({ razorpayOrderId: orderId }, { status: 'paid' });

        res.json({ success: true, message: 'Payment verified successfully' });
    } else {
        res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
});

// Webhook Handler
app.post('/api/webhook', async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(req.body);
    const digest = shasum.digest('hex');

    if (digest === signature) {
        const payload = JSON.parse(req.body);
        console.log('Webhook event received:', payload.event);

        await processWebhookEvent(payload);

        res.status(200).send('Webhook processed successfully');
    } else {
        console.error('Invalid webhook signature');
        res.status(400).send('Invalid webhook signature');
    }
});

async function processWebhookEvent(payload) {
    const event = payload.event;

    switch (event) {
        case 'payment.authorized':
            console.log('Payment authorized:', payload.payload.payment.entity.id);
            break;
        case 'payment.captured':
            console.log('Payment captured:', payload.payload.payment.entity.id);
            break;
        case 'payment.failed':
            console.log('Payment failed:', payload.payload.payment.entity.id);
            break;
        case 'refund.processed':
            console.log('Refund processed:', payload.payload.refund.entity.id);
            break;
        default:
            console.log('Unhandled event type:', event);
    }
}

// Error Middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
