export function generateGoogleCalendarLink(event: {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const start = formatDate(event.startTime);
  const end = formatDate(event.endTime);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", event.title);
  url.searchParams.append("details", event.description);
  url.searchParams.append("location", event.location);
  url.searchParams.append("dates", `${start}/${end}`);

  return url.toString();
}
