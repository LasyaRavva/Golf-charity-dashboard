const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const supabase = require('../config/supabase')
const {
  sendSubscriptionEmail,
  sendCancellationEmail
} = require('../utils/emailService')

const PLAN_AMOUNTS = {
  monthly: 9.99,
  yearly: 99.99
}

const createSubscriptionDonation = async ({ userId, plan, stripeInvoiceId = null }) => {
  const { data: user } = await supabase
    .from('users')
    .select('charity_id, charity_percentage')
    .eq('id', userId)
    .single()

  if (!user?.charity_id) return

  const planAmount = PLAN_AMOUNTS[plan]
  const percentage = Math.max(10, Number(user.charity_percentage || 10))
  const amount = parseFloat(((planAmount * percentage) / 100).toFixed(2))

  if (stripeInvoiceId) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: existingDonation } = await supabase
      .from('donations')
      .select('id')
      .eq('type', 'subscription')
      .eq('user_id', userId)
      .eq('charity_id', user.charity_id)
      .eq('amount', amount)
      .gte('created_at', todayStart.toISOString())
      .maybeSingle()

    if (existingDonation) return
  }

  await supabase
    .from('donations')
      .insert([{
      user_id: userId,
      charity_id: user.charity_id,
      amount,
      type: 'subscription'
    }])
}

// CREATE CHECKOUT SESSION
const createCheckoutSession = async (req, res) => {
  const { plan } = req.body // 'monthly' | 'yearly'
  const userId = req.user.id

  try {
    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()

    // Get or create Stripe customer
    let customerId
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId }
      })
      customerId = customer.id
    }

    const priceId = plan === 'yearly'
      ? process.env.YEARLY_PRICE_ID
      : process.env.MONTHLY_PRICE_ID

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe?payment=cancelled`,
      metadata: { userId, plan }
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET SUBSCRIPTION STATUS
const getSubscription = async (req, res) => {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .single()

    if (!subscription)
      return res.json({ subscription: null })

    res.json({ subscription })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// CANCEL SUBSCRIPTION
const cancelSubscription = async (req, res) => {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', req.user.id)
      .single()

    if (!subscription?.stripe_subscription_id)
      return res.status(404).json({ message: 'No active subscription found' })

    await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    )

    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', req.user.id)

    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', req.user.id)
      .single()

    await sendCancellationEmail(user)

    res.json({ message: 'Subscription cancelled successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// STRIPE WEBHOOK
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` })
  }

  const session = event.data.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const userId = session.metadata.userId
      const plan = session.metadata.plan
      const customerId = session.customer
      const subscriptionId = session.subscription

      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
      const renewalDate = new Date(stripeSubscription.current_period_end * 1000)

      // Upsert subscription
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        start_date: new Date().toISOString(),
        renewal_date: renewalDate.toISOString(),
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId
      }, { onConflict: 'user_id' })

      const { data: user } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single()

      await sendSubscriptionEmail(user, plan, renewalDate)
      await createSubscriptionDonation({
        userId,
        plan,
        stripeInvoiceId: session.invoice || null
      })

      break
    }

    case 'invoice.payment_succeeded': {
      const subscriptionId = session.subscription
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
      const renewalDate = new Date(stripeSubscription.current_period_end * 1000)

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id, plan')
        .eq('stripe_subscription_id', subscriptionId)
        .single()

      await supabase
        .from('subscriptions')
        .update({ status: 'active', renewal_date: renewalDate.toISOString() })
        .eq('stripe_subscription_id', subscriptionId)

      if (session.billing_reason !== 'subscription_create' && subscription?.user_id) {
        await createSubscriptionDonation({
          userId: subscription.user_id,
          plan: subscription.plan,
          stripeInvoiceId: session.id
        })
      }

      break
    }

    case 'invoice.payment_failed': {
      await supabase
        .from('subscriptions')
        .update({ status: 'lapsed' })
        .eq('stripe_subscription_id', session.subscription)

      break
    }

    case 'customer.subscription.deleted': {
      await supabase
        .from('subscriptions')
        .update({ status: 'inactive' })
        .eq('stripe_subscription_id', session.id)

      break
    }
  }

  res.json({ received: true })
}

module.exports = {
  createCheckoutSession,
  getSubscription,
  cancelSubscription,
  handleWebhook
}
