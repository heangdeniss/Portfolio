/**
 * Ambient WebGL background shader.
 * Dark obsidian / deep slate gradients, slow fbm flow fields, warm amber and
 * emerald light bleeds, pointer attraction and scroll-velocity energy.
 * Written for a full-screen 2x2 PlaneGeometry + OrthographicCamera.
 */

export const ambientVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ambientFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uScrollVelocity;
  uniform float uQuality;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
    vec2 mouse = (uMouse - 0.5) * vec2(
      uResolution.x / min(uResolution.x, uResolution.y),
      uResolution.y / min(uResolution.x, uResolution.y)
    ) * 0.35;

    float t = uTime * 0.055;
    vec2 flow = p + mouse * (0.18 + 0.05 * sin(t * 1.4));

    float n1 = fbm(flow * 1.45 + vec2(t, -t * 0.62));
    float n2 = fbm(flow * 2.15 + vec2(-t * 0.45, t * 0.82) + n1 * 0.72);
    float n3 = fbm(flow * 0.82 + vec2(t * 0.22, t * 0.31) + 12.7);

    vec3 obsidian = vec3(0.027, 0.035, 0.055);
    vec3 slate = vec3(0.055, 0.078, 0.125);
    vec3 amber = vec3(0.961, 0.620, 0.043);
    vec3 emerald = vec3(0.063, 0.725, 0.506);

    float base = smoothstep(-0.95, 1.15, p.y * 0.8 + n3 * 0.9);
    vec3 color = mix(obsidian, slate, base);

    float amberField = smoothstep(0.42, 0.96, n1 + 0.25 * sin(p.x * 1.6 - t * 2.2));
    float emeraldField = smoothstep(0.48, 0.98, n2 + 0.20 * cos(p.y * 1.4 + t * 1.7));

    color += amber * amberField * 0.17;
    color += emerald * emeraldField * 0.10;

    float pointerLight = smoothstep(0.85, 0.0, length(p - mouse * 0.9));
    color += amber * pointerLight * 0.045;
    color += emerald * smoothstep(0.55, 0.0, length(p + vec2(0.72, -0.42))) * 0.018;

    float beam = smoothstep(0.0, 0.8, n1 * n2) * 0.045;
    color += vec3(0.38, 0.55, 0.95) * beam;

    float energy = abs(uScrollVelocity);
    color += amber * energy * 0.020 * smoothstep(0.2, 1.0, n2);
    color += emerald * energy * 0.014 * smoothstep(0.3, 1.0, n1);

    float grain = hash21(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5;
    color += grain * 0.012;

    float vignette = smoothstep(1.45, 0.35, length(p));
    color *= mix(0.72, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;
