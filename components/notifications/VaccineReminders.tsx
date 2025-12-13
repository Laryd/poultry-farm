'use client';

import { useEffect, useState } from 'react';

export default function VaccineReminders() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);

      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          setPermission(perm);
        });
      }

      if (Notification.permission === 'granted') {
        checkOverdueVaccinations();

        const interval = setInterval(() => {
          checkOverdueVaccinations();
        }, 4 * 60 * 60 * 1000);

        return () => clearInterval(interval);
      }
    }
  }, []);

  const checkOverdueVaccinations = async () => {
    try {
      const response = await fetch('/api/vaccinations');
      const data = await response.json();

      if (data.success) {
        const overdueVaccinations = data.data.filter(
          (vac: any) => vac.status === 'overdue'
        );

        if (overdueVaccinations.length > 0 && Notification.permission === 'granted') {
          new Notification('Vaccination Reminder', {
            body: `You have ${overdueVaccinations.length} overdue vaccination${
              overdueVaccinations.length > 1 ? 's' : ''
            }`,
            icon: '/favicon.ico',
          });
        }
      }
    } catch (error) {
      console.error('Failed to check vaccinations:', error);
    }
  };

  return null;
}
