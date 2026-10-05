export const ROUTE_PATHS: Record<string, string> = {
  dashboard: '/dashboard',
  upload: '/documents/upload',
  processing: '/documents/:documentId/processing',
  records: '/records',
  detail: '/records/:recordId',
  validation: '/validation',
  verification: '/verification',
  gis: '/gis',
  learning: '/ai-learning',
  audit: '/audit-logs',
  api: '/api-integration',
};

export function readRouteFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const legacy = new URLSearchParams(window.location.search);
  if (path === '/' && legacy.has('tab')) {
    return { tab: legacy.get('tab') || 'dashboard', documentId: legacy.get('doc'), recordId: legacy.get('record') };
  }
  if (path === '/documents/upload') return { tab: 'upload', documentId: null, recordId: null };
  const processing = path.match(/^\/documents\/([^/]+)\/processing$/);
  if (processing) return { tab: 'processing', documentId: decodeURIComponent(processing[1]), recordId: null };
  const detail = path.match(/^\/records\/([^/]+)$/);
  if (detail) return { tab: 'detail', documentId: null, recordId: decodeURIComponent(detail[1]) };
  const validation = path.match(/^\/validation\/([^/]+)$/);
  if (validation) return { tab: 'validation', documentId: null, recordId: decodeURIComponent(validation[1]) };
  const route = Object.entries(ROUTE_PATHS).find(([tab, routePath]) => routePath === path && tab !== 'processing' && tab !== 'detail');
  return { tab: route?.[0] || 'dashboard', documentId: null, recordId: null };
}

export function routeUrl(tab: string, contextId?: string) {
  const id = contextId ? encodeURIComponent(contextId) : '';
  const path = tab === 'processing' ? (id ? `/documents/${id}/processing` : '/documents/upload')
    : tab === 'detail' ? (id ? `/records/${id}` : '/records')
    : tab === 'validation' && id ? `/validation/${id}` : ROUTE_PATHS[tab] || '/dashboard';
  return new URLSearchParams(window.location.search).get('demo') === '1' ? `${path}?demo=1` : path;
}
