import { useEffect, useState } from 'react';

const METER_BARS = [34, 58, 22, 72, 46, 88, 30, 64, 40, 78, 26, 52, 36, 68];

const SCENES = [
  { id: 'hero', index: '00', label: 'Intro' },
  { id: 'about', index: '01', label: 'About' },
  { id: 'skills', index: '02', label: 'Stack' },
  { id: 'background', index: '03', label: 'Journey' },
  { id: 'projects', index: '04', label: 'Work' },
  { id: 'contact', index: '05', label: 'Contact' },
];

export default function SceneRail({ progress = 0 }) {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const marker = window.innerHeight * 0.42;
      let current = SCENES[0].id;

      for (const scene of SCENES) {
        const section = document.getElementById(scene.id);
        if (section && section.getBoundingClientRect().top <= marker) {
          current = scene.id;
        }
      }

      setActive((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.dataset.scene = active;
    return () => {
      delete document.body.dataset.scene;
    };
  }, [active]);

  const activeScene = SCENES.find((scene) => scene.id === active) ?? SCENES[0];

  return (
    <>
      <nav
        className="scene-rail"
        aria-label="Page scenes"
        style={{ '--rail-progress': `${Math.min(progress, 100)}%` }}
      >
        <span className="scene-rail__track" aria-hidden="true">
          <span className="scene-rail__fill" />
        </span>
        <ol className="scene-rail__list">
          {SCENES.map((scene) => {
            const isActive = active === scene.id;
            return (
              <li key={scene.id}>
                <a
                  href={`#${scene.id}`}
                  className={`scene-rail__link${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'location' : undefined}
                  aria-label={`Go to ${scene.label} section`}
                >
                  <span className="scene-rail__index">{scene.index}</span>
                  <span className="scene-rail__label">{scene.label}</span>
                  <span className="scene-rail__dot" />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div
        className={`scene-hud${active === 'contact' ? ' scene-hud--quiet' : ''}`}
        aria-hidden="true"
      >
        <div className="scene-hud__index-wrap">
          <span className="scene-hud__index" key={activeScene.id}>
            {activeScene.index}
          </span>
        </div>
        <div className="scene-hud__side">
          <span className="scene-hud__label">{activeScene.label}</span>
          <span className="scene-hud__progress">
            {String(Math.round(progress)).padStart(2, '0')}
            <i>%</i>
          </span>
          <div className="scene-hud__meter">
            {METER_BARS.map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
