export function generateGoogleCalendarLink(event: {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  timeZone?: string; // Optional timezone
}) {
  const formatDate = (dateString: string, zone?: string) => {
    const date = new Date(dateString);

    if (zone) {
      // Convert UTC to local time in the specified timezone using Intl.DateTimeFormat
      // Google Calendar expects local wall-clock time when ctz parameter is used
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(date);
      const get = (type: string) => parts.find(p => p.type === type)?.value || '00';
      return `${get('year')}${get('month')}${get('day')}T${get('hour')}${get('minute')}${get('second')}`;
    }

    // For UTC (no timezone), use ISO format with Z suffix
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const start = formatDate(event.startTime, event.timeZone);
  const end = formatDate(event.endTime, event.timeZone);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", event.title);
  url.searchParams.append("details", event.description);
  url.searchParams.append("location", event.location);
  url.searchParams.append("dates", `${start}/${end}`);
  
  if (event.timeZone) {
    url.searchParams.append("ctz", event.timeZone);
  }

  return url.toString();
}
