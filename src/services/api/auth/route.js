import { NextResponse } from 'next/server';

export async function POST(req) {
  const BACKEND_URL =
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: 'Backend URL not configured' },
      { status: 500 }
    );
  }

  const backendUrl = `${BACKEND_URL.replace(/\/$/, '')}/auth/refresh`;
  const cookie = req.headers.get('cookie') || '';

  try {
    const backendOrigin = new URL(backendUrl).origin;
    const host = req.headers.get('host');
    if (
      backendOrigin === `https://${host}` ||
      backendOrigin === `http://${host}`
    ) {
      return NextResponse.json(
        { message: 'Bad backend config: proxy backend points to same origin' },
        { status: 500 }
      );
    }
  } catch (e) {}

  const backendRes = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      cookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const contentType = backendRes.headers.get('content-type') || '';
  const setCookieHeader = backendRes.headers.get('set-cookie');

  if (contentType.includes('application/json')) {
    const json = await backendRes.json();
    const res = NextResponse.json(json, { status: backendRes.status });
    if (setCookieHeader) res.headers.set('set-cookie', setCookieHeader);
    return res;
  } else {
    const text = await backendRes.text();

    console.warn(
      '[proxy] non-json response from backend:',
      backendUrl,
      backendRes.status,
      text.slice(0, 500)
    );

    const res = new NextResponse(text, { status: backendRes.status });
    if (setCookieHeader) res.headers.set('set-cookie', setCookieHeader);
    return res;
  }
}
