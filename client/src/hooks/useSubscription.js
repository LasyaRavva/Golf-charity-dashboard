import { useState } from 'react';

export function useSubscription() {
  const [subscription, setSubscription] = useState({
    tier: 'Monthly Member',
    active: true,
    renewalDate: '2026-06-01',
  });

  return { subscription, setSubscription };
}
