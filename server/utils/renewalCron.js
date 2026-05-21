const cron = require('node-cron')
const supabase = require('../config/supabase')
const { sendRenewalReminderEmail } = require('./emailService')

// Runs every day at 9am
const startRenewalCron = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running renewal reminder check...')

    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    const dateStr = threeDaysFromNow.toISOString().split('T')[0]

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id, renewal_date, users(name, email)')
      .eq('status', 'active')
      .eq('renewal_date', dateStr)

    for (const sub of subscriptions || []) {
      await sendRenewalReminderEmail(sub.users, sub.renewal_date)
    }
  })
}

module.exports = startRenewalCron