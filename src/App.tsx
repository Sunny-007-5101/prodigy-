import { useCallback, useState } from 'react';
import { CircuitDivider } from './components/CircuitDivider';
import { Header } from './components/Header';
import { PrivacyModal } from './components/PrivacyModal';
import { ScrollRail } from './components/ScrollRail';
import { NAV } from './content';
import { useActiveSection, useSmoothScroll } from './lib/scroll';
import { About } from './sections/About';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { Solve } from './sections/Solve';
import { Team } from './sections/Team';

const IDS = NAV.map((n) => n.id);

export default function App() {
  useSmoothScroll();
  const active = useActiveSection(IDS);
  const [privacy, setPrivacy] = useState(false);
  const openPrivacy = useCallback(() => setPrivacy(true), []);
  const closePrivacy = useCallback(() => setPrivacy(false), []);

  return (
    <>
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header active={active} />
      <ScrollRail active={active} />
      <main>
        <Hero />
        <About />
        <CircuitDivider variant="a" />
        <Solve />
        <CircuitDivider variant="b" />
        <Team />
        <CircuitDivider variant="a" />
        <Contact onPrivacy={openPrivacy} />
      </main>
      <Footer onPrivacy={openPrivacy} />
      <PrivacyModal open={privacy} onClose={closePrivacy} />
    </>
  );
}
