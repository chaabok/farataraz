export async function logUserActivity(
  action: 'PRINT' | 'EXPORT_EXCEL' | 'EXPORT_WORD' | 'EXPORT_PDF' | 'UPLOAD' | 'OTHER',
  entityName: string,
  description?: string
) {
  try {
    let token = '';
    // Look for cookie or localStorage
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || '';
      if (!token) {
        const match = document.cookie.match(new RegExp('(^| )jwt=([^;]+)'));
        if (match) token = match[2];
      }

      // We make the API call without blocking the UI
      fetch('/api/activity-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action,
          entityName,
          description,
          url: window.location.href,
        })
      }).catch(() => {});
    }
  } catch (error) {
    // Silently continue since logging shouldn't crash the app
  }
}
