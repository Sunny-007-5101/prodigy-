// Vercel Serverless Function: POST /api/contact
// Validates, filters spam, and emails the submission to the company inbox via Resend.
// Env: RESEND_API_KEY, CONTACT_TO, CONTACT_FROM, TURNSTILE_SECRET_KEY (optional)

type Body = {
  name?: string;
  organization?: string;
  email?: string;
  message?: string;
  website?: string; // honeypot
  elapsed?: number;
  token?: string;
};

// Best-effort in-memory rate limit (per warm instance): 5 / hour / IP
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const body: Body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

  // Spam checks. Bots get a fake success so they don't retry.
  if (body.website) return res.status(200).json({ ok: true });
  if (typeof body.elapsed === 'number' && body.elapsed < 3000) return res.status(200).json({ ok: true });
  if (limited(ip)) return res.status(429).json({ ok: false });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: body.token || '', remoteip: ip }),
    });
    const v = (await r.json()) as { success?: boolean };
    if (!v.success) return res.status(400).json({ ok: false });
  }

  const name = clean(body.name, 200);
  const organization = clean(body.organization, 200);
  const email = clean(body.email, 200);
  const message = clean(body.message, 2000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || 'Prodigy Website <onboarding@resend.dev>';
  if (!key || !to) return res.status(500).json({ ok: false, error: 'Email is not configured' });

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <h2 style="margin:0 0 16px">New inquiry — prodigy website</h2>
      <p><b>Name:</b> ${esc(name)}<br/><b>Organization:</b> ${esc(organization || '—')}<br/><b>Email:</b> ${esc(email)}</p>
      <p style="white-space:pre-wrap;border-left:3px solid #3dd8ff;padding-left:12px">${esc(message)}</p>
    </div>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New inquiry from ${name}${organization ? ` (${organization})` : ''}`,
      html,
      text: `Name: ${name}\nOrganization: ${organization || '—'}\nEmail: ${email}\n\n${message}`,
    }),
  });
  if (!r.ok) return res.status(502).json({ ok: false });
  return res.status(200).json({ ok: true });
}
