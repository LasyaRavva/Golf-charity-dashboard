const SubscriptionCard = ({ subscription }) => {
  if (!subscription) return (
    <div className="dashboard-card">
      <h3>Subscription</h3>
      <p>No active subscription.</p>
      <a href="/subscribe" className="btn-primary">Subscribe Now</a>
    </div>
  )

  const renewalDate = new Date(subscription.renewal_date).toLocaleDateString()
  const statusColor = {
    active: '#43e8b0',
    cancelled: '#ff6b6b',
    lapsed: '#ffaa00',
    inactive: '#888'
  }

  return (
    <div className="dashboard-card">
      <h3>Subscription</h3>
      <div className="sub-status">
        <span
          className="status-dot"
          style={{ background: statusColor[subscription.status] }}
        />
        <span style={{ color: statusColor[subscription.status], fontWeight: 600 }}>
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </span>
      </div>
      <div className="sub-details">
        <div className="sub-row">
          <span>Plan</span>
          <strong>{subscription.plan === 'yearly' ? 'Yearly' : 'Monthly'}</strong>
        </div>
        <div className="sub-row">
          <span>Renewal Date</span>
          <strong>{renewalDate}</strong>
        </div>
      </div>
      {subscription.status === 'active' && (
        <button className="btn-danger-outline">Cancel Subscription</button>
      )}
    </div>
  )
}

export default SubscriptionCard