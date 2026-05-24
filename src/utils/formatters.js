export function formatCurrency(amount, currency = 'INR') {
  const symbols = { USD: '$', INR: '₹', EUR: '€' };
  const locales = { USD: 'en-US', INR: 'en-IN', EUR: 'de-DE' };
  
  try {
    return new Intl.NumberFormat(locales[currency] || 'en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${symbols[currency] || '₹'}${amount.toLocaleString()}`;
  }
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function getMonthYear(dateStr) {
  return new Date(dateStr).toISOString().slice(0, 7);
}

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text, maxLength = 30) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getDaysRemaining(deadline) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}
