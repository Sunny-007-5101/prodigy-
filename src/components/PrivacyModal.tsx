import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { SITE } from '../content';
import { lockScroll } from '../lib/scroll';
import { EASE } from '../motion/variants';

/**
 * Privacy policy as a modal (per the brief: not a separate page).
 * DRAFT TEXT — replace with the client's approved policy.
 */
export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    lockScroll(true);
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>('button')?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        // keep focus inside the dialog
        const f = panel.current.querySelectorAll<HTMLElement>('button, a[href]');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(4,10,20,0.7)] backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="ticks relative flex max-h-[85vh] w-full max-w-2xl flex-col border border-line bg-surface"
            data-lenis-prevent
          >
            <span className="tick-b pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 id="privacy-title" className="label text-ink">[ Privacy Policy ]</h2>
              <button type="button" onClick={onClose} className="label px-2 py-1 hover:text-ink" aria-label="Close privacy policy">
                Close ✕
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6 text-[15px] leading-relaxed text-muted [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-ink [&_p]:mb-3">
              <p>Last updated: {SITE.year}.</p>
              <h3>What we collect</h3>
              <p>When you use the contact form we collect the details you provide: your name, organization, email address and message.</p>
              <h3>How we use it</h3>
              <p>We use this information only to respond to your inquiry. We do not sell it or share it with third parties for marketing.</p>
              <h3>Where it is stored</h3>
              <p>Submissions are delivered to our company mailbox through an email delivery provider and kept only as long as needed to handle your inquiry.</p>
              <h3>Cookies and tracking</h3>
              <p>This website does not use tracking or advertising cookies.</p>
              <h3>Your rights</h3>
              <p>
                You may ask us to access, correct or delete your information at any time by writing to{' '}
                <a className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
                .
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
