// lib/utils/notifications.ts
type Notification = {
  section: string;
  timestamp: number;
  clientIds: Set<string>;
};

const notifications: Notification[] = [];

export function addNotification(section: string) {
  notifications.push({
    section,
    timestamp: Date.now(),
    clientIds: new Set(),
  });

  // Clean up after 30 seconds
  setTimeout(() => {
    notifications.shift(); // Remove oldest
  }, 30000);

  console.log(`📬 Notification added: ${section}`);
}

export function getPendingNotifications(clientId: string): string[] {
  const sections: string[] = [];

  notifications.forEach((notif) => {
    if (!notif.clientIds.has(clientId)) {
      sections.push(notif.section);
      notif.clientIds.add(clientId);
    }
  });

  return [...new Set(sections)];
}
