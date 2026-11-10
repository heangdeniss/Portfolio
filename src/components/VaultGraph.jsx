import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '../lib/animations';
import { useExperience } from '../context/ExperienceContext';
import useMediaQuery from '../hooks/useMediaQuery';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useReveal from '../hooks/useReveal';
import { vaultGraph, vaultStats } from '../lib/vault';
import { motion } from '../data/motion';
import SectionTitle from './SectionTitle';

const GROUP_STYLE = {
  profile: { color: '#f59e0b', radius: 14 },
  project: { color: '#22d3ee', radius: 9 },
  timeline: { color: '#a78bfa', radius: 7 },
  system: { color: '#34d399', radius: 8 },
  note: { color: '#94a3b8', radius: 7 },
};

const TIMELINE_ANGLES = [155, 200, 245, 295, 340, 25];

function buildScene(nodes, isWide) {
  const width = isWide ? 1200 : 420;
  const height = isWide ? 440 : 600;
  const positions = new Map();

  const profile = nodes.find((node) => node.group === 'profile');
  const projects = nodes.filter((node) => node.group === 'project');
  const timeline = nodes.filter((node) => node.group === 'timeline');
  const system = nodes.filter((node) => node.group === 'system');
  const other = nodes.filter(
    (node) => !['profile', 'project', 'timeline', 'system'].includes(node.group),
  );

  if (isWide) {
    if (profile) positions.set(profile.id, { x: 600, y: 214 });

    const projectSpots = [
      { x: 440, y: 178 },
      { x: 760, y: 178 },
      { x: 600, y: 344 },
    ];

    projects.forEach((node, index) => {
      const spot = projectSpots[index];
      if (spot) {
        positions.set(node.id, spot);
        return;
      }

      const angle = ((index * 137.5 - 90) * Math.PI) / 180;
      positions.set(node.id, {
        x: 600 + Math.cos(angle) * 190,
        y: 214 + Math.sin(angle) * 130,
      });
    });

    timeline.forEach((node, index) => {
      const angle = (TIMELINE_ANGLES[index % TIMELINE_ANGLES.length] * Math.PI) / 180;
      positions.set(node.id, {
        x: 600 + Math.cos(angle) * 332,
        y: 214 + Math.sin(angle) * 154,
      });
    });

    system.forEach((node, index) => {
      positions.set(node.id, { x: 600 + index * 42 - (system.length - 1) * 21, y: 34 });
    });

    other.forEach((node, index) => {
      positions.set(node.id, { x: 168 + index * 58, y: 390 });
    });
  } else {
    if (profile) positions.set(profile.id, { x: 210, y: 56 });

    const projectSpots = [
      { x: 66, y: 172 },
      { x: 210, y: 172 },
      { x: 354, y: 172 },
    ];

    projects.forEach((node, index) => {
      positions.set(node.id, projectSpots[index] ?? {
        x: 66 + (index % 3) * 144,
        y: 172,
      });
    });

    const timelineSpots = [
      { x: 82, y: 294 },
      { x: 338, y: 294 },
      { x: 82, y: 386 },
      { x: 338, y: 386 },
      { x: 82, y: 478 },
      { x: 338, y: 478 },
    ];

    timeline.forEach((node, index) => {
      positions.set(node.id, timelineSpots[index] ?? {
        x: 82 + (index % 2) * 256,
        y: 294 + Math.floor(index / 2) * 92,
      });
    });

    system.forEach((node, index) => {
      positions.set(node.id, { x: 210 + index * 42 - (system.length - 1) * 21, y: 556 });
    });

    other.forEach((node, index) => {
      positions.set(node.id, { x: 70 + index * 80, y: 556 });
    });
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return {
    width,
    height,
    center: isWide ? { x: 600, y: 214 } : { x: 210, y: 300 },
    nodes: nodes
      .map((node) => {
        const position = positions.get(node.id);
        if (!position) return null;
        return { ...node, ...position };
      })
      .filter(Boolean),
    nodeById,
    positions,
  };
}

function edgesForGraph(links, layout) {
  return links
    .map((link, index) => {
      const source = layout.positions.get(link.source);
      const target = layout.positions.get(link.target);
      if (!source || !target) return null;

      const controlX = (source.x + target.x) / 2 + (source.y - target.y) * 0.07;
      const controlY = (source.y + target.y) / 2 + (target.x - source.x) * 0.07;
      const targetNode = layout.nodeById.get(link.target);
      const sourceNode = layout.nodeById.get(link.source);
      const accentNode =
        targetNode?.group === 'profile' ? sourceNode : targetNode ?? sourceNode;

      return {
        id: `${link.source}-${link.target}`,
        source: link.source,
        target: link.target,
        color: GROUP_STYLE[accentNode?.group]?.color ?? GROUP_STYLE.note.color,
        path: `M ${source.x.toFixed(1)} ${source.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${target.x.toFixed(1)} ${target.y.toFixed(1)}`,
        index,
      };
    })
    .filter(Boolean);
}

function labelForNode(node, center, isWide) {
  if (!isWide) {
    const isMiddleProject =
      node.group === 'project' && Math.abs(node.x - center.x) < 40;
    const offset = isMiddleProject
      ? -20
      : node.group === 'profile'
        ? 30
        : node.group === 'project'
          ? 24
          : 22;
    return {
      x: node.x,
      y: node.y + offset,
      anchor: 'middle',
      className:
        node.group === 'profile'
          ? 'is-profile'
          : node.group === 'project'
            ? 'is-project'
            : node.group === 'system'
              ? 'is-system'
              : '',
    };
  }

  if (node.group === 'profile') {
    return { x: node.x, y: node.y + 30, anchor: 'middle', className: 'is-profile' };
  }

  if (node.group === 'project') {
    return { x: node.x, y: node.y + 24, anchor: 'middle', className: 'is-project' };
  }

  if (node.group === 'system') {
    return { x: node.x, y: node.y + 22, anchor: 'middle', className: 'is-system' };
  }

  if (node.x < center.x - 70) {
    return { x: node.x - 16, y: node.y + 4, anchor: 'end', className: '' };
  }

  if (node.x > center.x + 70) {
    return { x: node.x + 16, y: node.y + 4, anchor: 'start', className: '' };
  }

  return { x: node.x, y: node.y + 22, anchor: 'middle', className: '' };
}

export default function VaultGraph() {
  const [revealRef, visible] = useReveal({ threshold: 0.08 });
  const panelRef = useRef(null);
  const sceneRef = useRef(null);
  const sceneQuickRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { quality } = useExperience();
  const isWide = useMediaQuery('(min-width: 760px)');
  const [hoveredId, setHoveredId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null);

  const activeId = hoveredId ?? pinnedId;

  const showMotion = motion.vaultGraph && !prefersReducedMotion;
  const nodes = vaultGraph.nodes;
  const layout = useMemo(() => buildScene(nodes, isWide), [nodes, isWide]);
  const edges = useMemo(() => edgesForGraph(vaultGraph.links, layout), [layout]);

  const activeConnections = useMemo(() => {
    if (!activeId) return null;

    const connected = new Set([activeId]);
    edges.forEach((edge) => {
      if (edge.source === activeId) connected.add(edge.target);
      if (edge.target === activeId) connected.add(edge.source);
    });

    return connected;
  }, [activeId, edges]);

  const activeNode = useMemo(
    () => (activeId ? layout.nodeById.get(activeId) ?? null : null),
    [activeId, layout],
  );

  useEffect(() => {
    if (prefersReducedMotion || !panelRef.current) return undefined;

    const context = gsap.context(() => {
      gsap.to(panelRef.current, {
        yPercent: -3.5,
        ease: 'none',
        scrollTrigger: {
          trigger: panelRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    });

    return () => context.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || prefersReducedMotion) {
      sceneQuickRef.current = null;
      return undefined;
    }

    sceneQuickRef.current = {
      x: gsap.quickTo(scene, 'x', { duration: 0.55, ease: 'power3.out' }),
      y: gsap.quickTo(scene, 'y', { duration: 0.55, ease: 'power3.out' }),
    };

    return () => {
      sceneQuickRef.current = null;
      gsap.set(scene, { clearProps: 'transform' });
    };
  }, [prefersReducedMotion, isWide]);

  const onPointerMove = (event) => {
    if (prefersReducedMotion || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    panelRef.current.style.setProperty('--vault-px', px.toFixed(3));
    panelRef.current.style.setProperty('--vault-py', py.toFixed(3));

    sceneQuickRef.current?.x(px * 16);
    sceneQuickRef.current?.y(py * 11);
  };

  const resetPointer = () => {
    panelRef.current?.style.setProperty('--vault-px', '0');
    panelRef.current?.style.setProperty('--vault-py', '0');
    sceneQuickRef.current?.x(0);
    sceneQuickRef.current?.y(0);
  };

  const togglePinned = (id) => {
    setPinnedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="notes" className="section vault-section" data-ghost="VAULT" ref={revealRef}>
      <div className={`container${visible ? ' is-visible' : ''}`}>
        <div className="section-header vault__header">
          <p className="section-label">Living Knowledge Base</p>
          <SectionTitle>Built from Notes, Wired to Code.</SectionTitle>
          <p className="section-subtitle">
            This portfolio is generated from an Obsidian vault. The graph below maps the notes
            that supply its copy, projects, timeline and motion settings — no runtime fetch, no
            CMS, no token cost.
          </p>
        </div>

        {motion.vaultGraph ? (
          <div
            ref={panelRef}
            className="vault__panel"
            onPointerMove={onPointerMove}
            onPointerLeave={resetPointer}
          >
            <div className="vault__panel-head">
              <span className="vault__badge">
                <span className="vault__badge-dot" aria-hidden="true" />
                Obsidian · Build-time sync
              </span>
              <span className="vault__meta" aria-live="polite">
                {activeNode ? (
                  <>
                    <strong className="vault__meta-active">{activeNode.label}</strong>
                    <i aria-hidden="true">·</i>
                    {String(Math.max(0, (activeConnections?.size ?? 1) - 1)).padStart(2, '0')} links
                  </>
                ) : (
                  <>
                    {String(vaultStats.notes).padStart(2, '0')} notes
                    <i aria-hidden="true">/</i>
                    {String(vaultStats.links).padStart(2, '0')} links
                  </>
                )}
              </span>
            </div>

            <div className="vault__stage" onClick={() => setPinnedId(null)}>
              <div className="vault__radial" aria-hidden="true" />

              <svg
                className={`vault__graph${visible ? ' is-visible' : ''}${activeId ? ' has-active' : ''}`}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                role="img"
                aria-label={`Knowledge graph of ${vaultStats.notes} published notes and ${vaultStats.links} links`}
              >
                <g ref={sceneRef} className="vault__scene">
                  <g className="vault__edges" aria-hidden="true">
                    {edges.map((edge) => {
                      const isActive =
                        activeId && (edge.source === activeId || edge.target === activeId);
                      const isDimmed = activeId && !isActive;

                      return (
                        <path
                          key={edge.id}
                          d={edge.path}
                          className={`vault__edge${isActive ? ' is-active' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                          style={{
                            '--edge-color': edge.color,
                            '--edge-index': edge.index,
                          }}
                          pathLength="1"
                        />
                      );
                    })}
                  </g>

                  {showMotion && quality !== 'low' && (
                    <g className="vault__packets" aria-hidden="true">
                      {edges.map((edge) => {
                        const isActive =
                          activeId && (edge.source === activeId || edge.target === activeId);
                        const isDimmed = activeId && !isActive;

                        return (
                          <circle
                            key={`packet-${edge.id}`}
                            r={isActive ? '2.2' : '1.6'}
                            className={`vault__packet${isActive ? ' is-active' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                            style={{ fill: edge.color }}
                          >
                            <animateMotion
                              dur={`${4.4 + (edge.index % 5) * 0.78}s`}
                              begin={`${(edge.index * 0.34).toFixed(2)}s`}
                              repeatCount="indefinite"
                              keyPoints="0;1"
                              keyTimes="0;1"
                              calcMode="linear"
                              path={edge.path}
                            />
                          </circle>
                        );
                      })}
                    </g>
                  )}

                  <g className="vault__nodes">
                    {layout.nodes.map((node, index) => {
                      const group = GROUP_STYLE[node.group] ?? GROUP_STYLE.note;
                      const label = labelForNode(node, layout.center, isWide);
                      const isActive = activeId === node.id;
                      const isConnected = activeConnections?.has(node.id);
                      const isNeighbor = Boolean(activeId && isConnected && !isActive);
                      const isDimmed = activeConnections && !isConnected;

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x} ${node.y})`}
                          className={`vault__node-anchor${isActive ? ' is-active' : ''}${isNeighbor ? ' is-connected' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                          style={{
                            '--node-color': group.color,
                            '--node-index': index,
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`${node.title} (${node.group} note)`}
                          aria-pressed={pinnedId === node.id}
                          onPointerEnter={() => setHoveredId(node.id)}
                          onPointerLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(node.id)}
                          onBlur={() => setHoveredId(null)}
                          onClick={(event) => {
                            event.stopPropagation();
                            togglePinned(node.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              event.stopPropagation();
                              togglePinned(node.id);
                            } else if (event.key === 'Escape') {
                              setPinnedId(null);
                              setHoveredId(null);
                            }
                          }}
                        >
                          <title>{node.title}</title>
                          <g className="vault__node">
                            <circle
                              className="vault__node-halo"
                              r={group.radius * 2.8}
                            />
                            <circle
                              className="vault__node-ring"
                              r={group.radius + 7}
                              style={{ animationDelay: `${(index % 5) * 0.4}s` }}
                            />
                            <circle
                              className="vault__node-core"
                              r={group.radius}
                            />
                            <circle
                              className="vault__node-glint"
                              r={Math.max(2, group.radius * 0.32)}
                              cx={-group.radius * 0.28}
                              cy={-group.radius * 0.28}
                            />
                          </g>
                          <text
                            className={`vault__label ${label.className}`}
                            x={label.x - node.x}
                            y={label.y - node.y}
                            textAnchor={label.anchor}
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>

              <div className="vault__legend" aria-hidden="true">
                <span><i className="is-profile" /> Profile</span>
                <span><i className="is-project" /> Projects</span>
                <span><i className="is-timeline" /> Timeline</span>
                <span><i className="is-system" /> System</span>
              </div>
            </div>

            <div className="vault__panel-foot">
              <span>Edit markdown → save → Vite rebuilds the content.</span>
              <span className="vault__sync">
                <span className="vault__sync-dot" aria-hidden="true" />
                {motion.intensity} motion · 0 runtime tokens
              </span>
            </div>
          </div>
        ) : (
          <div className="vault__fallback">
            <p>
              Motion graph is disabled in <code>motion.md</code>. Content notes are still active.
            </p>
            <div className="vault__note-strip">
              {nodes.map((node) => (
                <span key={node.id} className="vault__note-chip">
                  {node.label}
                  <i>{node.group}</i>
                </span>
              ))}
            </div>
          </div>
        )}

        {motion.vaultGraph && (
          <div className="vault__note-strip" aria-label="Content notes powering this page">
            {nodes.map((node) => {
              const isActive = activeId === node.id;
              const isConnected = activeConnections?.has(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`vault__note-chip${isActive ? ' is-active' : ''}${isConnected && !isActive ? ' is-connected' : ''}`}
                  onPointerEnter={() => setHoveredId(node.id)}
                  onPointerLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(node.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={() => togglePinned(node.id)}
                  aria-pressed={pinnedId === node.id}
                >
                  {node.label}
                  <i>{node.group}</i>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
