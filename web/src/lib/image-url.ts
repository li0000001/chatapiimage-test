export function normalizeBrowserImageUrl(url: string) {
  if (typeof window === "undefined" || !url) {
    return url;
  }

  try {
    const parsedUrl = new URL(url, window.location.href);
    if (
      window.location.protocol === "https:" &&
      parsedUrl.protocol === "http:" &&
      parsedUrl.host === window.location.host
    ) {
      parsedUrl.protocol = "https:";
    }
    return parsedUrl.toString();
  } catch {
    return url;
  }
}
