export function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(timestamp).toLocaleDateString();
}

export const getDaysUntil = (date) => {
  if (!date) return null;

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diff = target - now;
  const daysUntil = Math.round(diff / (1000 * 60 * 60 * 24));

  if (daysUntil <= 0) return "Releasing today";
  if (daysUntil === 1) return "1 day left";
  return `${daysUntil} days left`;
};
