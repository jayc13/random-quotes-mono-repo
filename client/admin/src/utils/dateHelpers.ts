export function formatExpirationDate(dateString: string): string {
  const expiresDate = new Date(dateString);
  const now = new Date();
  const diffTime = expiresDate.getTime() - now.getTime();

  // If already expired
  if (diffTime < 0) {
    return "Expired";
  }

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }
  return `In ${diffDays} days`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}
