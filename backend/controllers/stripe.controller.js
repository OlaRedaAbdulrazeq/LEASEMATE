const stripe = require('../config/stripe');
const User = require('../models/user.model');
const plans = require('../config/plans');
const Subscription = require('../models/subscription.model');
const { onlineUsers } = require('../socket');
const Unit = require('../models/unit.model');

// Create Checkout Session for Subscription (direct, no Connect)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planName } = req.body; // planName: 'basic', 'standard', 'premium'
    const user = await User.findById(req.user.id);
    const plan = plans[planName];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: `${process.env.CLIENT_URL}/dashboard/stripe/success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/stripe/cancel`,
      metadata: {
        userId: user._id.toString(),
        planName: planName,
      },
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Session Error:', error.message);
    res.status(500).json({ message: 'Unable to create Stripe Checkout session' });
  }
};

// Handle Stripe Webhook (mark user as subscribed and set plan info)
exports.handleWebhook = async (req, res) => {
  console.log('Stripe webhook received!');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Stripe event type:', event.type);
    console.log('Stripe event body:', JSON.stringify(event.data.object));
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const planName = session.metadata?.planName;
    const subscriptionId = session.subscription;
    const plan = plans[planName];
    try {
      if (userId && subscriptionId && plan) {
        // Mark previous subscriptions as expired
        await Subscription.updateMany({ landlordId: userId, status: 'active' }, { status: 'expired' });
        // Set start and end date (1 month duration)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        // Create new subscription record
        await Subscription.create({
          landlordId: userId,
          planName,
          stripeSubscriptionId: subscriptionId,
          status: 'active',
          startDate,
          endDate,
          unitLimit: plan.unitLimit,
        });
        // Update user
        await User.findByIdAndUpdate(userId, {
          isSubscribed: true,
          subscriptionId,
          subscriptionPlan: planName,
          planUnitLimit: plan.unitLimit,
          planExpiresAt: endDate,
        });
        console.log(`✅ User ${userId} marked as subscribed to ${planName} with sub ID ${subscriptionId}`);
        // Emit websocket event to user
        if (global.io) {
          global.io.to(userId).emit('subscriptionUpdated', { isSubscribed: true });
        }
      }
    } catch (err) {
      console.error('Failed to update user subscription info:', err.message);
    }
  }

  res.status(200).send({ received: true });
};

// Refund a specific subscription if all its units are not booked
exports.refundSpecificSubscription = async (req, res) => {
  const { subscriptionId } = req.body;
  const user = await User.findById(req.user.id);
  console.log('Refund request:', { subscriptionId, userId: user._id });
  const sub = await Subscription.findOne({ _id: subscriptionId, landlordId: user._id, status: 'active', refunded: false });
  console.log('Found subscription:', sub);
  if (!sub) return res.status(400).json({ msg: 'لا يوجد اشتراك نشط قابل للاسترداد' });

  const units = await Unit.find({ subscriptionId: sub._id });
  const anyBooked = units.some(unit => unit.status === 'booked');
  if (anyBooked) return res.status(400).json({ msg: 'لا يمكن استرداد الاشتراك إذا كانت هناك وحدات محجوزة.' });

  // Stripe refund logic with defensive checks
  try {
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    if (!stripeSub.latest_invoice) {
      return res.status(400).json({ msg: 'لا يوجد فاتورة دفع لهذا الاشتراك.' });
    }
    const invoice = await stripe.invoices.retrieve(stripeSub.latest_invoice);
    if (!invoice.payment_intent) {
      return res.status(400).json({ msg: 'لا يوجد عملية دفع لهذا الاشتراك.' });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
    await stripe.refunds.create({ payment_intent: paymentIntent.id });
  } catch (err) {
    console.error('Stripe refund error:', err);
    return res.status(500).json({ msg: 'حدث خطأ أثناء معالجة الاسترداد من Stripe.' });
  }

  sub.status = 'refunded';
  sub.refunded = true;
  await sub.save();

  // Disable notification
  await require('../models/notification.model').updateMany({
    userId: user._id,
    type: 'REFUND_ELIGIBLE',
    'meta.subscriptionId': sub._id,
    disabled: false
  }, { disabled: true });

  res.json({ msg: 'تم استرداد الاشتراك بنجاح.' });
};
