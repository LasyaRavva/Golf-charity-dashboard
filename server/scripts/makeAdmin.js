require('dotenv').config()

const bcrypt = require('bcryptjs')
const supabase = require('../config/supabase')

const [, , email, password, ...nameParts] = process.argv
const name = nameParts.join(' ').trim() || 'Admin User'

if (!email) {
  console.error('Usage: npm run make-admin -- <email> [password] [name]')
  process.exit(1)
}

const main = async () => {
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('email', email)
    .maybeSingle()

  if (fetchError) throw fetchError

  if (existingUser) {
    const updates = { role: 'admin' }

    if (password) {
      updates.password = await bcrypt.hash(password, 10)
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', existingUser.id)
      .select('id, name, email, role')
      .single()

    if (updateError) throw updateError

    console.log(`Updated user ${updatedUser.email} to admin.`)
    if (password) console.log('Password was reset to the provided test password.')
    return
  }

  if (!password) {
    console.error('User does not exist. Provide a password to create a new admin user.')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    }])
    .select('id, name, email, role')
    .single()

  if (insertError) throw insertError

  console.log(`Created admin user ${newUser.email}.`)
}

main().catch(err => {
  console.error('Failed to create or promote admin user:', err.message)
  process.exit(1)
})
