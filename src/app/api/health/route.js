import { json, loadResources, logInternalError, options } from '@/lib/agentApi';
export const dynamic = 'force-dynamic';

export function OPTIONS() { return options(); }

export async function GET() {
  const started = Date.now();
  try {
    const resources = await loadResources();
    return json({
      status: 'ok',
      service: 'yourself-to-science-agent-api',
      version: '1.1.0',
      datasetReachable: true,
      resourceCount: resources.length,
      responseTimeMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    logInternalError('health check failed', error);
    return json({
      status: 'degraded',
      service: 'yourself-to-science-agent-api',
      version: '1.1.0',
      datasetReachable: false,
      error: 'dataset_unavailable',
      timestamp: new Date().toISOString(),
    }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
