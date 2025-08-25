// analyticsService.ts
// Service for National Disaster Platform Analytics API

export async function getDashboardStatistics(token: string) {
  const res = await fetch('/api/admin/analytics/statistics', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}

export async function getTimeline(token: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/admin/analytics/timeline${query ? '?' + query : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}

export async function getZonesOverlap(token: string) {
  const res = await fetch('/api/admin/analytics/zones-overlap', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}

export async function getResourceSummary(token: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/admin/analytics/resource-summary${query ? '?' + query : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}
