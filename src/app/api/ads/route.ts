import { NextResponse } from 'next/server';
import { adInventory } from '@/lib/adSystem/config';
import { adEngine } from '@/lib/adSystem/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position') || 'inline';
  const category = searchParams.get('category') || 'general';
  const index = parseInt(searchParams.get('index') || '0');

  // Use engine to select ad
  const ad = adEngine.selectAd(position, category, 1000, index);

  if (!ad) {
    return NextResponse.json({ error: 'No ad available' }, { status: 404 });
  }

  return NextResponse.json(ad);
}
