import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AppProviders } from './components/providers/AppProviders';
import { Cursor } from './components/primitives/Cursor/Cursor';
import { ScrollProgress } from './components/primitives/ScrollProgress/ScrollProgress';
import { SettingsTrigger } from './components/settings/SettingsTrigger/SettingsTrigger';
import { SettingsPanel } from './components/settings/SettingsPanel/SettingsPanel';
import { Intro } from './components/sections/Intro/Intro';
import { Header } from './components/sections/Header/Header';
import { Hero } from './components/sections/Hero/Hero';
import { MarqueeBand } from './components/sections/MarqueeBand/MarqueeBand';
import { About } from './components/sections/About/About';
import { Expertise } from './components/sections/Expertise/Expertise';
import { Experience } from './components/sections/Experience/Experience';
import { Projects } from './components/sections/Projects/Projects';
import { Skills } from './components/sections/Skills/Skills';
import { Closing } from './components/sections/Closing/Closing';
import { content } from './data/content';

function App() {
  const [introDone, setIntroDone] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }, []);

  useEffect(() => {
    if (!introDone) return;
    ScrollTrigger.refresh();
    mainRef.current?.focus({ preventScroll: true });
  }, [introDone]);

  return (
    <AppProviders>
      <Cursor />
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      <div inert={introDone ? undefined : true}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <ScrollProgress sections={content.nav} />
        <main id="main" ref={mainRef} tabIndex={-1}>
          <Hero started={introDone} />
          <MarqueeBand />
          <About />
          <Expertise />
          <Experience />
          <Projects />
          <Skills />
          <Closing />
        </main>
      </div>
      {introDone && (
        <>
          <SettingsTrigger />
          <SettingsPanel />
        </>
      )}
    </AppProviders>
  );
}

export default App;
