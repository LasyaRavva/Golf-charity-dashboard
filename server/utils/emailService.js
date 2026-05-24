const nodemailer = require('nodemailer')

const hasEmailCredentials = () => Boolean(
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_FROM
)

const buildTransportConfig = () => {
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  }

  return {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
}

let transporter = null

const getTransporter = () => {
  if (!hasEmailCredentials()) {
    throw new Error('Email transport is not configured. Set EMAIL_USER, EMAIL_PASS, and EMAIL_FROM.')
  }

  if (!transporter) {
    transporter = nodemailer.createTransport(buildTransportConfig())
  }

  return transporter
}

const verifyEmailTransport = async () => {
  if (!hasEmailCredentials()) {
    console.warn('Email disabled: EMAIL_USER, EMAIL_PASS, or EMAIL_FROM is missing.')
    return false
  }

  try {
    await getTransporter().verify()
    console.log('Email transport verified successfully.')
    return true
  } catch (err) {
    console.error('Email transport verification failed:', err.message)
    return false
  }
}

// ─── BASE TEMPLATE ───
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .header { background: #1a1a26; padding: 30px; text-align: center; }
    .header h1 { color: #6c63ff; margin: 0; font-size: 1.5rem; }
    .header p { color: #888; margin: 6px 0 0; font-size: 0.85rem; }
    .body { padding: 30px; color: #333; line-height: 1.7; }
    .body h2 { color: #1a1a26; }
    .highlight { background: #f0eeff; border-left: 4px solid #6c63ff; padding: 12px 16px; border-radius: 6px; margin: 16px 0; }
    .btn { display: inline-block; background: #6c63ff; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 0.8rem; color: #999; border-top: 1px solid #eee; }
    .numbers { display: flex; gap: 8px; margin: 12px 0; }
    .num-ball { background: #6c63ff; color: #fff; width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; }
    .green { color: #43e8b0; font-weight: bold; }
    .red { color: #ff6b6b; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⛳ Golf Charity Platform</h1>
      <p>Play. Win. Give Back.</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>Golf Charity Platform · You're receiving this because you have an account with us.</p>
    </div>
  </div>
</body>
</html>
`

// ─── SEND EMAIL HELPER ───
const sendEmail = async ({ to, subject, html, strict = false }) => {
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    })
    console.log(`Email sent to ${to}: ${subject}`)
    return true
  } catch (err) {
    console.error(`Email failed to ${to}:`, err.message)
    if (strict) throw err
    return false
  }
}

// ─── EMAIL TYPES ───

// 1. Welcome email after signup
const sendWelcomeEmail = async (user) => {
  const html = baseTemplate(`
    <h2>Welcome, ${user.name}! 👋</h2>
    <p>You've successfully created your Golf Charity Platform account. Here's what you can do next:</p>
    <div class="highlight">
      <strong>1.</strong> Subscribe to a plan to start participating in monthly draws<br/>
      <strong>2.</strong> Enter your latest golf scores<br/>
      <strong>3.</strong> Choose a charity to support with your subscription
    </div>
    <a href="${process.env.CLIENT_URL}/subscribe" class="btn">Subscribe Now</a>
    <p style="margin-top: 24px;">Good luck on the course! 🏌️</p>
  `)

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Golf Charity Platform 🏌️',
    html
  })
}

const sendPasswordResetEmail = async (user, resetLink) => {
  const html = baseTemplate(`
    <h2>Reset your password</h2>
    <p>Hi ${user.name || 'there'}, we received a request to reset your password.</p>
    <div class="highlight">
      This reset link will expire in <strong>1 hour</strong>.
    </div>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <p style="margin-top: 24px;">
      If you did not request this, you can ignore this email and your password will stay unchanged.
    </p>
  `)

  await sendEmail({
    to: user.email,
    subject: 'Reset your Golf Charity Platform password',
    html
  })
}

const sendPasswordResetOtpEmail = async (user, code) => {
  const html = baseTemplate(`
    <h2>Your password reset code</h2>
    <p>Hi ${user.name || 'there'}, use the one-time code below to reset your password.</p>
    <div class="highlight">
      <strong style="font-size: 1.8rem; letter-spacing: 6px;">${code}</strong><br/>
      This code expires in <strong>15 minutes</strong>.
    </div>
    <p>If you did not request this, you can ignore this email.</p>
  `)

  await sendEmail({
    to: user.email,
    subject: 'Your Golf Charity Platform reset code',
    html,
    strict: true
  })
}

// 2. Subscription confirmed
const sendSubscriptionEmail = async (user, plan, renewalDate) => {
  const html = baseTemplate(`
    <h2>Subscription Confirmed ✅</h2>
    <p>Hi ${user.name}, your subscription is now active.</p>
    <div class="highlight">
      <strong>Plan:</strong> ${plan === 'yearly' ? 'Yearly' : 'Monthly'}<br/>
      <strong>Renewal Date:</strong> ${new Date(renewalDate).toLocaleDateString()}<br/>
      <strong>Status:</strong> <span class="green">Active</span>
    </div>
    <p>You're now eligible to enter monthly draws. Make sure to enter your golf scores before each draw!</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard</a>
  `)

  await sendEmail({
    to: user.email,
    subject: 'Your Subscription is Active ✅',
    html
  })
}

// 3. Draw results published
const sendDrawResultsEmail = async (user, draw, userScores, matchCount) => {
  const numbersHtml = draw.draw_numbers
    .map(n => `<span class="num-ball">${n}</span>`)
    .join(' ')

  const resultMessage = matchCount >= 3
    ? `<p class="green">🎉 Congratulations! You matched ${matchCount} numbers!</p>`
    : `<p>You matched <strong>${matchCount}</strong> numbers this month. Better luck next time!</p>`

  const html = baseTemplate(`
    <h2>Draw Results — ${draw.month} 🎯</h2>
    <p>Hi ${user.name}, the monthly draw results are in!</p>
    <p><strong>Winning Numbers:</strong></p>
    <div class="numbers">${numbersHtml}</div>
    <div class="highlight">
      <strong>Your Scores:</strong> ${userScores.join(', ')}<br/>
      <strong>Matches:</strong> ${matchCount}
    </div>
    ${resultMessage}
    ${matchCount >= 3 ? `
      <p>Please log in to upload your proof and claim your prize.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Claim Prize</a>
    ` : `
      <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Enter Scores for Next Draw</a>
    `}
  `)

  await sendEmail({
    to: user.email,
    subject: `Draw Results for ${draw.month} — ${matchCount >= 3 ? '🎉 You Won!' : 'See your results'}`,
    html
  })
}

// 4. Winner verification approved
const sendVerificationApprovedEmail = async (user, winner) => {
  const html = baseTemplate(`
    <h2>Verification Approved 🎉</h2>
    <p>Hi ${user.name}, great news! Your winning submission has been approved.</p>
    <div class="highlight">
      <strong>Match Tier:</strong> ${winner.match_tier}-Number Match<br/>
      <strong>Prize Amount:</strong> <span class="green">£${winner.prize_amount?.toFixed(2)}</span><br/>
      <strong>Status:</strong> Payment Pending
    </div>
    <p>Your payment will be processed shortly. We'll notify you once it's done.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View Dashboard</a>
  `)

  await sendEmail({
    to: user.email,
    subject: 'Your Win Has Been Verified ✅',
    html
  })
}

// 5. Winner verification rejected
const sendVerificationRejectedEmail = async (user) => {
  const html = baseTemplate(`
    <h2>Verification Update</h2>
    <p>Hi ${user.name}, unfortunately your winning submission could not be verified.</p>
    <div class="highlight">
      <span class="red">Your submission was rejected.</span><br/>
      This may be because the proof provided did not match the required format.
    </div>
    <p>If you believe this is an error, please contact our support team.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard</a>
  `)

  await sendEmail({
    to: user.email,
    subject: 'Verification Update — Action Required',
    html
  })
}

// 6. Payout completed
const sendPayoutEmail = async (user, winner) => {
  const html = baseTemplate(`
    <h2>Payment Sent 💸</h2>
    <p>Hi ${user.name}, your prize payment has been processed!</p>
    <div class="highlight">
      <strong>Match Tier:</strong> ${winner.match_tier}-Number Match<br/>
      <strong>Amount Paid:</strong> <span class="green">£${winner.prize_amount?.toFixed(2)}</span><br/>
      <strong>Status:</strong> <span class="green">Paid ✅</span>
    </div>
    <p>Thank you for playing and supporting charity. See you in the next draw!</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View Dashboard</a>
  `)

  await sendEmail({
    to: user.email,
    subject: '💸 Your Prize Payment Has Been Sent!',
    html
  })
}

// 7. Subscription renewal reminder
const sendRenewalReminderEmail = async (user, renewalDate) => {
  const html = baseTemplate(`
    <h2>Subscription Renewal Reminder 🔔</h2>
    <p>Hi ${user.name}, your subscription renews in <strong>3 days</strong>.</p>
    <div class="highlight">
      <strong>Renewal Date:</strong> ${new Date(renewalDate).toLocaleDateString()}<br/>
      <strong>Status:</strong> <span class="green">Active</span>
    </div>
    <p>Make sure your payment details are up to date so you don't miss the next draw!</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Manage Subscription</a>
  `)

  await sendEmail({
    to: user.email,
    subject: '🔔 Your Subscription Renews in 3 Days',
    html
  })
}

// 8. Subscription cancelled
const sendCancellationEmail = async (user) => {
  const html = baseTemplate(`
    <h2>Subscription Cancelled</h2>
    <p>Hi ${user.name}, your subscription has been cancelled.</p>
    <div class="highlight">
      <strong>Status:</strong> <span class="red">Cancelled</span><br/>
      You will retain access until the end of your current billing period.
    </div>
    <p>We're sorry to see you go. You can resubscribe at any time.</p>
    <a href="${process.env.CLIENT_URL}/subscribe" class="btn">Resubscribe</a>
  `)

  await sendEmail({
    to: user.email,
    subject: 'Your Subscription Has Been Cancelled',
    html
  })
}

module.exports = {
  verifyEmailTransport,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetOtpEmail,
  sendSubscriptionEmail,
  sendDrawResultsEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendPayoutEmail,
  sendRenewalReminderEmail,
  sendCancellationEmail
}
