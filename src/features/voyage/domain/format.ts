export function formatKm(km: number): string {
  if (km >= 1e9) return `${(km / 1e9).toFixed(2)} billion km`;
  if (km >= 1e6) return `${(km / 1e6).toFixed(1)} million km`;
  return `${Math.round(km).toLocaleString('en-US')} km`;
}

export function formatAu(au: number): string {
  return `${au < 10 ? au.toFixed(2) : au.toFixed(1)} AU`;
}

export function formatLightTime(minutes: number): string {
  if (minutes < 60) return `${minutes.toFixed(1)} light-min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${String(m).padStart(2, '0')}m light-time`;
}

export function formatMissionDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** A span of mission time: "6 yr 2 mo", "4 mo", "12 days". */
export function formatSpan(days: number): string {
  if (days < 1) return 'under a day';
  if (days < 45) return `${Math.round(days)} days`;
  const months = Math.round(days / 30.44);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${months} mo`;
  return rest ? `${years} yr ${rest} mo` : `${years} yr`;
}
