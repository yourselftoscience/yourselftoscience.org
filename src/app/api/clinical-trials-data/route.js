import { NextResponse } from 'next/server';
import { resources } from '@/data/resources';

// Force this route to be evaluated in the Node.js runtime
export const runtime = 'nodejs';
// Opt out of caching for this dynamic route
export const dynamic = 'force-dynamic';

export function GET() {
  try {
    const clinicalTrialsResources = resources.filter(
      (resource) => resource.dataTypes && resource.dataTypes.includes('Clinical trials')
    );
    const totalResourcesCount = resources.length;

    return NextResponse.json({
      resources: clinicalTrialsResources,
      totalResourcesCount: totalResourcesCount,
    });
  } catch (error) {
    console.error('Error fetching clinical trials data:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 