import {NextResponse} from 'next/server';
import {saveEnquiry,validateEnquiry} from '@/lib/enquiry';
import {services} from '@/lib/content';

const windowMs = 10 * 60 * 1000;
const maxPerWindow = 5;
const maxBodyLength = 20000;
// Per server instance, so this slows a repeat sender rather than guaranteeing a hard limit.
const recent = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  for (const [key, times] of recent) if (times.every(time => now - time > windowMs)) recent.delete(key);
  const times = (recent.get(ip) ?? []).filter(time => now - time <= windowMs);
  if (times.length >= maxPerWindow) return true;
  recent.set(ip, [...times, now]);
  return false;
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === (request.headers.get('x-forwarded-host') ?? request.headers.get('host')); } catch { return false; }
}

const failure = (error: string, status: number) => NextResponse.json({error}, {status});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure('This request was not allowed.', 403);
  const raw = await request.text();
  if (raw.length > maxBodyLength) return failure('This enquiry is too long.', 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return failure('This enquiry could not be read.', 400); }
  // Bots fill the hidden field, so they get a normal response and nothing is saved.
  if (body && typeof body === 'object' && (body as Record<string, unknown>).fax) return NextResponse.json({ok: true});
  const result = validateEnquiry(body, services.map(service => service.short));
  if (!result.ok) return failure(result.error, 400);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return failure('Too many enquiries were sent. Please try again later.', 429);
  const saved = await saveEnquiry({
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  }, result.enquiry);
  if (saved !== 'saved') return failure('Your enquiry could not be sent.', 503);
  return NextResponse.json({ok: true});
}
