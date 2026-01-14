export function generateGoogleCalendarLink(event: {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  timeZone?: string; // Optional timezone
}) {
  const formatDate = (dateString: string, zone?: string) => {
    const iso = new Date(dateString).toISOString();
    if (zone) {
      // For specific timezone, return floating time (remove Z)
      return iso.replace(/-|:|\.\d\d\d|Z/g, "");
    }
    // For UTC (default), keep Z format (but handled by replace logic below normally covers 'Z' handling if different?) 
    // Actually the previous code did: .replace(/-|:|\.\d\d\d/g, "") which leaves the Z if it's there?
    // Let's check typical ISO: 2023-01-01T12:00:00.000Z
    // Old regex replaced -, :, .ddd
    // Result: 20230101T120000Z
    // So yes, we want to keep Z for standard behavior, and REMOVE Z for ctz behavior.
    return iso.replace(/-|:|\.\d\d\d/g, "");
  };

  const start = formatDate(event.startTime, event.timeZone).replace("Z", event.timeZone ? "" : "Z");
  const end = formatDate(event.endTime, event.timeZone).replace("Z", event.timeZone ? "" : "Z");

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
