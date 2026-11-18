import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '../components/Button';
import { CONTACT } from '../content';
import { LineReveal } from '../motion/LineReveal';
import { Reveal, RevealGroup, RevealItem } from '../motion/Reveal';
import { EASE } from '../motion/variants';

type Status = 'idle' | 'sending' | 'success' | 'error';

/** Submissions go to /api/contact (Vercel function → Resend → contact@prodigy-technology.com). */
export function Contact({ onPrivacy }: { onPrivacy: () => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [consent, setConsent] = useState(false);
  const loadedAt = useRef(Date.now());

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
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative py-20 md:py-28" aria-labelledby="contact-title">
      <div className="wrap grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <LineReveal
            id="contact-title"
            lines={[CONTACT.title]}
            className="whitespace-nowrap text-[clamp(44px,5.4vw,80px)] font-normal leading-[1] tracking-[-0.025em]"
          />
          <Reveal as="p" delay={0.1} className="mt-8 max-w-sm text-[17px] leading-relaxed text-muted">
            {CONTACT.intro}
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-col gap-3">
            {CONTACT.emails.map((e) => (
              <a
                key={e}
                href={`mailto:${e}`}
                className="w-fit break-all text-[15px] text-ink/80 underline decoration-line-strong underline-offset-[6px] transition-colors hover:text-ink hover:decoration-accent"
              >
                {e}
              </a>
            ))}
          </Reveal>
        </div>

        <div className="rounded-xl border border-line-strong bg-[#0d1a2e]/95 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-8 md:p-10 lg:col-span-7 lg:col-start-6">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="flex min-h-[420px] flex-col items-start justify-center gap-6"
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
                <RevealGroup className="grid gap-x-5 gap-y-5 sm:grid-cols-2" step={0.07}>
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

                {status === 'error' && (
                  <p role="alert" className="mt-6 text-[14px] text-muted">
                    {CONTACT.error}
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
    'block w-full resize-none rounded-md border border-line-strong bg-[rgba(8,17,31,0.85)] px-4 py-3 text-[16px] text-ink outline-none transition-colors hover:border-[#41608c] focus:border-accent focus:bg-[#08111f]';
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-medium text-muted">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={5} required={required} maxLength={2000} className={base} />
      ) : (
        <input id={id} name={name} type={type} required={required} autoComplete={autoComplete} maxLength={200} className={base} />
      )}
    </div>
  );
}
