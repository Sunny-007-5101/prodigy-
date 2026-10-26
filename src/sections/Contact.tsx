import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { SectionLabel } from '../components/Bits';
import { CONTACT, SITE } from '../content';
import { LineReveal } from '../motion/LineReveal';
import { Reveal, RevealGroup, RevealItem } from '../motion/Reveal';
import { EASE } from '../motion/variants';

type Status = 'idle' | 'sending' | 'success' | 'error';
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export function Contact({ onPrivacy }: { onPrivacy: () => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [consent, setConsent] = useState(false);
  const loadedAt = useRef(Date.now());
  const token = useRef('');
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>();

  // Cloudflare Turnstile (only if a site key is configured). "interaction-only"
  // keeps it invisible for almost everyone.
  useEffect(() => {
    if (!SITE_KEY || !widget.current) return;
    const render = () => {
      if (!window.turnstile || !widget.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        theme: 'dark',
        callback: (t: string) => (token.current = t),
      });
    };
    if (window.turnstile) return render();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          organization: fd.get('organization'),
          email: fd.get('email'),
          message: fd.get('message'),
          website: fd.get('website'), // honeypot
          elapsed: Date.now() - loadedAt.current,
          token: token.current,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('success');
    } catch {
      setStatus('error');
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    }
  };

  return (
    <section id="contact" className="relative py-20 md:py-28" aria-labelledby="contact-title">
      <div className="wrap grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionLabel index={4} text={CONTACT.label} />
          <LineReveal
            id="contact-title"
            lines={[CONTACT.title]}
            className="mt-8 whitespace-nowrap text-[clamp(44px,5.4vw,80px)] font-normal leading-[1] tracking-[-0.025em]"
          />
          <Reveal as="p" delay={0.1} className="mt-8 max-w-sm text-[17px] leading-relaxed text-muted">
            {CONTACT.intro}
          </Reveal>
          <Reveal delay={0.2} className="mt-10">
            <a href={`mailto:${SITE.email}`} className="font-mono text-[13px] tracking-[0.04em] text-ink/80 underline decoration-line-strong underline-offset-[6px] transition-colors hover:text-ink hover:decoration-accent">
              {SITE.email}
            </a>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="flex min-h-[420px] flex-col items-start justify-center gap-6 border-t border-line pt-10"
                role="status"
              >
                <span className="relative flex h-3 w-3">
                  <span className="absolute inset-0 rounded-full bg-accent" style={{ animation: 'ping-ring 2s var(--ease) infinite' }} />
                  <span className="relative h-3 w-3 rounded-full bg-accent" />
                </span>
                <p className="text-[clamp(26px,2.8vw,38px)] font-normal leading-tight tracking-[-0.02em]">{CONTACT.success}</p>
              </motion.div>
            ) : (
              <motion.form key="form" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }} onSubmit={submit} noValidate={false}>
                <RevealGroup className="grid gap-x-8 gap-y-2 sm:grid-cols-2" step={0.07}>
                  <RevealItem>
                    <Field name="name" label={CONTACT.fields.name} autoComplete="name" required />
                  </RevealItem>
                  <RevealItem>
                    <Field name="organization" label={CONTACT.fields.organization} autoComplete="organization" />
                  </RevealItem>
                  <RevealItem className="sm:col-span-2">
                    <Field name="email" type="email" label={CONTACT.fields.email} autoComplete="email" required />
                  </RevealItem>
                  <RevealItem className="sm:col-span-2">
                    <Field name="message" label={CONTACT.fields.message} textarea required />
                  </RevealItem>
                </RevealGroup>

                {/* honeypot: hidden from people, irresistible to bots */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <Reveal className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-start gap-3 text-[14px] text-muted">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className={`mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center border transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                        consent ? 'border-accent bg-accent' : 'border-line-strong'
                      }`}
                      aria-hidden="true"
                    >
                      {consent && <span className="h-1.5 w-1.5 bg-bg" />}
                    </span>
                    <span>
                      {CONTACT.consent}{' '}
                      <button type="button" onClick={onPrivacy} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                        {CONTACT.consentLink}
                      </button>
                    </span>
                  </label>
                  <Button type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? CONTACT.sending : CONTACT.send}
                  </Button>
                </Reveal>
                <div ref={widget} className="mt-4" />

                {status === 'error' && (
                  <p role="alert" className="mt-6 text-[14px] text-muted">
                    {CONTACT.error}{' '}
                    <a className="text-ink underline underline-offset-4" href={`mailto:${SITE.email}`}>
                      {SITE.email}
                    </a>
                    .
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = 'text',
  textarea,
  required,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = `f-${name}`;
  const base =
    'peer block w-full resize-none border-0 border-b border-line bg-transparent px-0 pb-3 pt-2 text-[17px] text-ink placeholder-transparent outline-none transition-colors focus:border-line-strong';
  return (
    <div className="relative pt-6">
      <label htmlFor={id} className="label block">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={4} required={required} maxLength={2000} className={base} />
      ) : (
        <input id={id} name={name} type={type} required={required} autoComplete={autoComplete} maxLength={200} className={base} />
      )}
      {/* focus line draws left → right */}
      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[var(--ease)] peer-focus:scale-x-100" />
    </div>
  );
}
