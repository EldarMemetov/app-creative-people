// app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
  const cookie = req.headers.get('cookie') || '';

  const backendRes = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      cookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const bodyText = await backendRes.text();
  let json = null;
  try {
    json = JSON.parse(bodyText);
  } catch (e) {}

  const res = json
    ? NextResponse.json(json, { status: backendRes.status })
    : new NextResponse(bodyText, { status: backendRes.status });

  const setCookieHeader = backendRes.headers.get('set-cookie');
  if (setCookieHeader) {
    res.headers.set('set-cookie', setCookieHeader);
  }

  return res;
}
