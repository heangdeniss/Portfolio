import { useEffect, useRef, useState } from 'react';
import {
  CanvasTexture,
  DoubleSide,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  NoColorSpace,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';
import { gsap, ScrollTrigger } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import useMediaQuery from '../hooks/useMediaQuery';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import MagneticButton from './MagneticButton';
import IsometricPipeline3D from './IsometricPipeline3D';
import { projectVertexShader, projectFragmentShader } from '../lib/shaders/project';

const PLANE_WIDTH = 4.2;
const PLANE_HEIGHT = 2.8;
const PLANE_SPACING = 4.55;

const pad = (value) => String(value).padStart(2, '0');

/**
 * Emotion-style project showcase.
 *
 * Desktop: the stage pins and scroll progress moves three textured
 * PlaneGeometry meshes (32x32 segments) through the camera. Lenis velocity
 * bends the vertex shader; pointer hover drives liquid UV + RGB split.
 *
 * Mobile / reduced motion: no pin and no WebGL. The same metadata and image
 * set renders as a swipeable, button-navigable editorial card.
 */
export default function WebGLProjectShowcase({
  projects,
  onOpenDossier,
  onOpenImage,
}) {
  const { quality, velocityRef, lenisRef, introComplete } = useExperience();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 900px)');
  const hasFinePointer = useMediaQuery('(pointer: fine)');

  const webglEnabled = isDesktop && hasFinePointer && !prefersReducedMotion;

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [readyKey, setReadyKey] = useState(null);

  const sceneKey = webglEnabled ? quality : 'off';
  const webglReady = webglEnabled && readyKey === sceneKey;

  const pinRef = useRef(null);
  const stageRef = useRef(null);
  const railFillRef = useRef(null);
  const mediaRef = useRef(null);
  const canvasHostRef = useRef(null);
  const metaRef = useRef(null);
  const thumbsRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const showcaseProgressRef = useRef(0);
  const activeIndexRef = useRef(0);
  const planeApiRef = useRef(null);
  const mouseRef = useRef(new Vector2(0.5, 0.5));
  const hoverRef = useRef(0);
  const mediaQuickRef = useRef(null);
  const dragRef = useRef({ down: false, startX: 0, startY: 0, moved: false });
  const thumbDragRef = useRef({ down: false, startX: 0, scrollLeft: 0 });

  const activeProject = projects[activeIndex];
  const activeImage = activeProject.images[imageIndex] ?? activeProject.images[0];
  const total = projects.length;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  /* ---------------------------------------------------------------- *
   * Three.js scene
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!webglEnabled) {
      return undefined;
    }

    const host = canvasHostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new WebGLRenderer({
        antialias: quality === 'high',
        alpha: true,
        powerPreference: 'high-performance',
        depth: true,
        stencil: false,
      });
    } catch {
      return undefined;
    }

    const canvas = renderer.domElement;
    canvas.className = 'showcase__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const group = new Group();
    scene.add(group);

    const geometry = new PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 32, 32);
    const textureCache = new Map();
    const pendingTextures = new Map();
    let disposed = false;

    const planes = projects.map((project, index) => {
      const material = new ShaderMaterial({
        vertexShader: projectVertexShader,
        fragmentShader: projectFragmentShader,
        uniforms: {
          uTexture: { value: null },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uOpacity: { value: 0 },
          uActive: { value: index === 0 ? 1 : 0 },
          uTextureAspect: { value: 1.6 },
          uPlaneAspect: { value: PLANE_WIDTH / PLANE_HEIGHT },
          uScrollVelocity: { value: 0 },
          uMouse: { value: new Vector2(0.5, 0.5) },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: DoubleSide,
      });

      const mesh = new Mesh(geometry, material);
      mesh.position.x = index * PLANE_SPACING;
      mesh.renderOrder = index;
      mesh.visible = false;
      group.add(mesh);
      return mesh;
    });

    const loadTexture = (url) => {
      if (textureCache.has(url)) return Promise.resolve(textureCache.get(url));
      if (pendingTextures.has(url)) return pendingTextures.get(url);

      const promise = new Promise((resolve) => {
        const image = new Image();
        image.decoding = 'async';

        image.onload = () => {
          if (disposed) {
            resolve(null);
            return;
          }

          const maxSize = quality === 'high' ? 1800 : 1200;
          const scale = Math.min(
            1,
            maxSize / Math.max(image.naturalWidth || 1, image.naturalHeight || 1),
          );

          const bitmap = document.createElement('canvas');
          bitmap.width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
          bitmap.height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));

          const context = bitmap.getContext('2d');
          context.drawImage(image, 0, 0, bitmap.width, bitmap.height);

          const texture = new CanvasTexture(bitmap);
          texture.colorSpace = NoColorSpace;
          texture.minFilter = LinearMipmapLinearFilter;
          texture.magFilter = LinearFilter;
          texture.generateMipmaps = true;
          texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          texture.userData.aspect =
            (image.naturalWidth || 1) / (image.naturalHeight || 1);

          textureCache.set(url, texture);
          pendingTextures.delete(url);
          resolve(texture);
        };

        image.onerror = () => {
          pendingTextures.delete(url);
          resolve(null);
        };

        image.src = url;
      });

      pendingTextures.set(url, promise);
      return promise;
    };

    const setTexture = async (index, url) => {
      const mesh = planes[index];
      if (!mesh) return;

      const texture = await loadTexture(url);
      if (!texture || disposed) return;

      const uniforms = mesh.material.uniforms;
      if (uniforms.uTexture.value === texture) {
        mesh.visible = true;
        return;
      }

      uniforms.uTexture.value = texture;
      uniforms.uTextureAspect.value = texture.userData.aspect || 1.6;
      mesh.visible = true;
    };

    planeApiRef.current = { setTexture };

    Promise.all(
      projects.map((project, index) => setTexture(index, project.images[0])),
    ).then(() => {
      if (!disposed) setReadyKey(sceneKey);
    });

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.5 : 1);

      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      const fov = MathUtils.degToRad(camera.fov);
      camera.position.z = MathUtils.clamp(
        6.0 / (2 * Math.tan(fov / 2) * camera.aspect),
        4.8,
        9,
      );
      camera.updateProjectionMatrix();
    };

    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(host);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let rafId = 0;
    let lastFrame = 0;
    let lastTime = performance.now();

    const render = (now) => {
      rafId = requestAnimationFrame(render);

      if (document.hidden || !visible) {
        lastTime = now;
        return;
      }

      if (quality === 'low' && now - lastFrame < 32) return;
      lastFrame = now;

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const progress = showcaseProgressRef.current;
      const targetX = -progress * PLANE_SPACING * (total - 1);
      group.position.x += (targetX - group.position.x) * 0.075;

      for (let index = 0; index < planes.length; index += 1) {
        const mesh = planes[index];
        const uniforms = mesh.material.uniforms;
        const distance = Math.abs(progress * (total - 1) - index);
        const active = Math.max(0, 1 - distance);

        uniforms.uActive.value += (active - uniforms.uActive.value) * 0.08;
        uniforms.uTime.value += delta;

        const targetOpacity = mesh.visible ? 0.26 + active * 0.74 : 0;
        uniforms.uOpacity.value += (targetOpacity - uniforms.uOpacity.value) * 0.075;

        const targetHover =
          hoverRef.current && index === activeIndexRef.current ? 1 : 0;
        uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.09;
        uniforms.uMouse.value.lerp(mouseRef.current, 0.12);
        uniforms.uScrollVelocity.value +=
          (velocityRef.current - uniforms.uScrollVelocity.value) * 0.08;
      }

      renderer.render(scene, camera);
    };

    resize();
    rafId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      resizeObserver.disconnect();
      planeApiRef.current = null;

      textureCache.forEach((texture) => texture.dispose());
      textureCache.clear();
      pendingTextures.clear();

      geometry.dispose();
      planes.forEach((mesh) => mesh.material.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [webglEnabled, quality, sceneKey, projects, total, velocityRef]);

  /* ---------------------------------------------------------------- *
   * Texture swap when the active project / thumbnail changes
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!webglEnabled) return;
    planeApiRef.current?.setTexture(activeIndex, activeImage);
  }, [activeIndex, activeImage, webglEnabled]);

  /* ---------------------------------------------------------------- *
   * Pinned scroll choreography
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isDesktop || prefersReducedMotion || !introComplete) return undefined;

    const stage = stageRef.current;
    const pin = pinRef.current;
    if (!stage || !pin) return undefined;

    const context = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: () => `+=${(total - 1) * window.innerHeight * 1.1}`,
        pin: stage,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          showcaseProgressRef.current = self.progress;

          // Write the progress straight to the 2px rail instead of a custom
          // property on the whole stage, which would recalculate its subtree.
          const rail = railFillRef.current;
          if (rail) rail.style.transform = `scaleX(${self.progress.toFixed(4)})`;

          const next = Math.round(self.progress * (total - 1));
          if (next !== activeIndexRef.current) {
            activeIndexRef.current = next;
            setActiveIndex(next);
            setImageIndex(0);
          }
        },
      });

      scrollTriggerRef.current = trigger;
    }, pin);

    ScrollTrigger.refresh();

    return () => {
      scrollTriggerRef.current = null;
      context.revert();
    };
  }, [isDesktop, prefersReducedMotion, introComplete, total]);

  /* Mobile / reduced-motion progress fallback */
  useEffect(() => {
    if (isDesktop && !prefersReducedMotion && introComplete) return;

    const progress = total > 1 ? activeIndex / (total - 1) : 0;
    showcaseProgressRef.current = progress;
    const rail = railFillRef.current;
    if (rail) rail.style.transform = `scaleX(${progress.toFixed(4)})`;
  }, [activeIndex, isDesktop, prefersReducedMotion, introComplete, total]);

  /* Metadata crossfade */
  useEffect(() => {
    const meta = metaRef.current;
    if (!meta) return undefined;

    if (prefersReducedMotion) return undefined;

    const items = meta.querySelectorAll('[data-meta]');
    const context = gsap.context(() => {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.045,
          overwrite: true,
        },
      );
    }, meta);

    return () => context.revert();
  }, [activeIndex, prefersReducedMotion]);

  /* Media frame 3D depth quickTo */
  useEffect(() => {
    const media = mediaRef.current;
    if (!media || prefersReducedMotion || !hasFinePointer) {
      mediaQuickRef.current = null;
      return undefined;
    }

    gsap.set(media, { transformPerspective: 1100, transformStyle: 'preserve-3d' });
    mediaQuickRef.current = {
      rotateX: gsap.quickTo(media, 'rotateX', { duration: 0.45, ease: 'power3.out' }),
      rotateY: gsap.quickTo(media, 'rotateY', { duration: 0.45, ease: 'power3.out' }),
      x: gsap.quickTo(media, 'x', { duration: 0.45, ease: 'power3.out' }),
      y: gsap.quickTo(media, 'y', { duration: 0.45, ease: 'power3.out' }),
    };

    return () => {
      mediaQuickRef.current = null;
      gsap.set(media, { clearProps: 'transform' });
    };
  }, [prefersReducedMotion, hasFinePointer]);

  /* ---------------------------------------------------------------- *
   * Navigation
   * ---------------------------------------------------------------- */
  const goTo = (nextIndex) => {
    const clamped = Math.max(0, Math.min(total - 1, nextIndex));
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
    setImageIndex(0);

    const trigger = scrollTriggerRef.current;
    if (trigger && isDesktop) {
      const targetScroll =
        trigger.start + (clamped / Math.max(total - 1, 1)) * (trigger.end - trigger.start);
      const lenis = lenisRef.current;

      if (lenis) {
        lenis.scrollTo(targetScroll, { duration: 1.1 });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  };

  const step = (direction) => goTo(activeIndex + direction);

  /* ---------------------------------------------------------------- *
   * Pointer / drag interactions
   * ---------------------------------------------------------------- */
  const onMediaPointerMove = (event) => {
    const rect = mediaRef.current?.getBoundingClientRect();
    if (rect) {
      const nx = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const ny = (event.clientY - rect.top) / Math.max(rect.height, 1);
      mouseRef.current.set(nx, ny);
      mediaRef.current?.style.setProperty('--media-spot-x', `${(nx * 100).toFixed(1)}%`);
      mediaRef.current?.style.setProperty('--media-spot-y', `${(ny * 100).toFixed(1)}%`);

      const quick = mediaQuickRef.current;
      if (quick) {
        const dx = nx - 0.5;
        const dy = ny - 0.5;
        quick.rotateY(dx * 5.2);
        quick.rotateX(-dy * 4.2);
        quick.x(dx * 6);
        quick.y(dy * 5);
      }
    }
    hoverRef.current = 1;

    if (!dragRef.current.down) return;

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      dragRef.current.moved = true;
    }

    if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY)) {
      dragRef.current.down = false;
      step(deltaX < 0 ? 1 : -1);
    }
  };

  const onMediaPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = {
      down: true,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };

  const onMediaPointerUp = () => {
    dragRef.current.down = false;
  };

  const onMediaPointerLeave = () => {
    hoverRef.current = 0;
    dragRef.current.down = false;
    const quick = mediaQuickRef.current;
    if (quick) {
      quick.rotateX(0);
      quick.rotateY(0);
      quick.x(0);
      quick.y(0);
    }
  };

  const onMediaClick = () => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    onOpenImage?.({ src: activeImage, alt: activeProject.title });
  };

  const onThumbPointerDown = (event) => {
    const strip = thumbsRef.current;
    if (!strip) return;
    thumbDragRef.current = {
      down: true,
      startX: event.clientX,
      scrollLeft: strip.scrollLeft,
    };
  };

  const onThumbPointerMove = (event) => {
    const strip = thumbsRef.current;
    if (!strip || !thumbDragRef.current.down) return;
    strip.scrollLeft =
      thumbDragRef.current.scrollLeft - (event.clientX - thumbDragRef.current.startX);
  };

  const onThumbPointerUp = () => {
    thumbDragRef.current.down = false;
  };

  return (
    <div ref={pinRef} className="showcase__pin">
      <div
        ref={stageRef}
        className={`showcase__stage${webglReady ? ' is-webgl-ready' : ''}`}
      >
        <div className="showcase__stage-grid">
          <div className="showcase__media-col">
            <div
              ref={mediaRef}
              className="showcase__media"
              data-cursor="View"
              onPointerMove={onMediaPointerMove}
              onPointerDown={onMediaPointerDown}
              onPointerUp={onMediaPointerUp}
              onPointerCancel={onMediaPointerUp}
              onPointerLeave={onMediaPointerLeave}
              onClick={onMediaClick}
              role="button"
              tabIndex={0}
              aria-label={`Open ${activeProject.title} visual in full screen`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenImage?.({ src: activeImage, alt: activeProject.title });
                }
              }}
            >
              <div ref={canvasHostRef} className="showcase__canvas-host" />

              {!webglReady && (
                <img
                  key={`${activeProject.id}-${imageIndex}`}
                  src={activeImage}
                  alt={`${activeProject.title} — visual ${imageIndex + 1}`}
                  className="showcase__fallback-img"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              )}

              <span className="showcase__media-vignette" aria-hidden="true" />
              <span className="showcase__media-grain" aria-hidden="true" />

              <div className="showcase__counter" aria-live="polite">
                <span className="showcase__counter-label">Showing Project</span>
                <span className="showcase__counter-value" key={activeIndex}>
                  {pad(activeIndex + 1)}
                </span>
                <span className="showcase__counter-total">/ {pad(total)}</span>
              </div>

              <span className="showcase__media-index" aria-hidden="true">
                {pad(activeIndex + 1)} — {pad(total)}
              </span>

              <div className="showcase__media-nav">
                <button
                  type="button"
                  className="showcase__media-arrow"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  disabled={activeIndex === 0}
                  aria-label="Previous project"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 12H5M11 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="showcase__media-arrow"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                  disabled={activeIndex === total - 1}
                  aria-label="Next project"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>

              <div className="showcase__rail" aria-hidden="true">
                <span ref={railFillRef} className="showcase__rail-fill" />
              </div>
            </div>
          </div>

          <div className="showcase__meta-col">
            <div ref={metaRef} className="showcase__meta">
              <div className="showcase__meta-top" data-meta>
                <span className="showcase__meta-index">
                  {pad(activeIndex + 1)} — {pad(total)}
                </span>
                <span className="showcase__meta-metric">{activeProject.metric}</span>
              </div>

              <h3 className="showcase__title" data-meta>
                {activeProject.title}
              </h3>

              <p className="showcase__role" data-meta>
                {activeProject.role}
              </p>

              <p className="showcase__desc" data-meta>
                {activeProject.desc}
              </p>

              <div className="showcase__tags" data-meta>
                {activeProject.tags.map((tag) => (
                  <span key={tag} className="showcase__tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="showcase__pipeline-wrap" data-meta>
                <IsometricPipeline3D
                  project={activeProject}
                  variant="showcase"
                  onInspectDossier={onOpenDossier}
                />
              </div>

              <div className="showcase__actions" data-meta>
                <MagneticButton
                  as="button"
                  className="showcase__link showcase__link--primary"
                  strength={0.2}
                  onClick={() => onOpenDossier?.(activeProject)}
                  data-cursor="Open"
                >
                  <span>System Architecture</span>
                  <span className="showcase__link-arrow" aria-hidden="true">↗</span>
                </MagneticButton>

                <MagneticButton
                  as="a"
                  className="showcase__link"
                  strength={0.2}
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="GitHub"
                >
                  <span>GitHub Repo</span>
                  <span className="showcase__link-arrow" aria-hidden="true">↗</span>
                </MagneticButton>
              </div>

              <div
                ref={thumbsRef}
                className="showcase__thumbs"
                data-meta
                data-cursor="Drag"
                onPointerDown={onThumbPointerDown}
                onPointerMove={onThumbPointerMove}
                onPointerUp={onThumbPointerUp}
                onPointerLeave={onThumbPointerUp}
              >
                {activeProject.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={`showcase__thumb${index === imageIndex ? ' is-active' : ''}`}
                    onClick={() => setImageIndex(index)}
                    aria-label={`Show visual ${index + 1} of ${activeProject.images.length}`}
                    aria-pressed={index === imageIndex}
                  >
                    <img src={image} alt="" loading="lazy" decoding="async" />
                    <span className="showcase__thumb-index">{pad(index + 1)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="showcase__dots" role="tablist" aria-label="Featured projects">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  className={`showcase__dot${index === activeIndex ? ' is-active' : ''}`}
                  onClick={() => goTo(index)}
                >
                  <span className="showcase__dot-index">{pad(index + 1)}</span>
                  <span className="showcase__dot-line" aria-hidden="true" />
                  <span className="showcase__dot-label">{project.shortTitle}</span>
                </button>
              ))}
            </div>

            <p className="showcase__scroll-note" aria-hidden="true">
              <span className="showcase__scroll-note-dot" />
              Scroll to move through the archive · drag the image to switch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
