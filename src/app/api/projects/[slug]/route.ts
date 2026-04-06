// src/app/api/projects/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@/lib/api/actions/projects';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const project = await getProjectBySlug(slug);

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(project, {
    headers: {
      // Tell the browser to cache this for 1 hour too
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
