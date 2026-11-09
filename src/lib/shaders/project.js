/**
 * Project image plane shaders.
 *
 * Vertex: cylindrical plane curvature + Lenis scroll-velocity bend + a small
 * hover wave. Geometry is a PlaneGeometry with 32x32 segments so the bends are
 * smooth rather than faceted.
 *
 * Fragment: cover-fitted texture sampling, slow liquid UV drift, cursor ripple,
 * hover + velocity chromatic aberration, vignette and grain.
 */

export const projectVertexShader = /* glsl */ `
  precision highp float;

  uniform float uScrollVelocity;
  uniform float uHover;
  uniform float uTime;
  uniform float uActive;

  varying vec2 vUv;
  varying float vBend;

  void main() {
    vUv = uv;
    vec3 p = position;

    // Cylindrical curvature across the plane.
    float curve = pow(abs(uv.x - 0.5) * 2.0, 2.0);
    p.z -= curve * 0.22;

    // Scroll velocity bends the plane and shears it vertically.
    p.z += (uv.x - 0.5) * uScrollVelocity * 0.28;
    p.y += sin(uv.x * 3.14159265) * uScrollVelocity * 0.045;

    // Gentle hover wave across the surface.
    p.z += sin(uv.y * 6.28318 + uTime * 1.1) * uHover * 0.035;

    vBend = uScrollVelocity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const projectFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uHover;
  uniform float uOpacity;
  uniform float uActive;
  uniform float uTextureAspect;
  uniform float uPlaneAspect;
  uniform float uScrollVelocity;
  uniform vec2 uMouse;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    // Cover-fit the texture inside the plane without stretching.
    vec2 ratio = vec2(
      min(uPlaneAspect / uTextureAspect, 1.0),
      min(uTextureAspect / uPlaneAspect, 1.0)
    );
    vec2 uv = vec2(
      (vUv.x - 0.5) * ratio.x + 0.5,
      (vUv.y - 0.5) * ratio.y + 0.5
    );

    // Slow liquid drift.
    float waveX = sin(uv.y * 10.0 + uTime * 0.9) * 0.0028;
    float waveY = sin(uv.x * 8.0 - uTime * 0.7) * 0.0024;
    vec2 distortion = vec2(waveX, waveY);

    // Pointer ripple, only while hovered.
    vec2 mouse = vec2(uMouse.x, 1.0 - uMouse.y);
    float distanceToMouse = distance(uv, mouse);
    float ripple = smoothstep(0.42, 0.0, distanceToMouse);
    vec2 direction = normalize(uv - mouse + vec2(0.0001));
    distortion += direction * ripple * uHover * 0.022 * sin(distanceToMouse * 28.0 - uTime * 5.0);

    vec2 finalUv = clamp(uv + distortion, 0.001, 0.999);

    // Chromatic aberration: hover + a whisper of scroll velocity.
    float split = uHover * (0.0045 + ripple * 0.012) + abs(uScrollVelocity) * 0.0018;
    float red = texture2D(uTexture, finalUv + vec2(split, 0.0)).r;
    float green = texture2D(uTexture, finalUv).g;
    float blue = texture2D(uTexture, finalUv - vec2(split, 0.0)).b;
    vec3 color = vec3(red, green, blue);

    // Inactive planes sit back visually.
    color *= mix(0.78, 1.0, uActive);

    // Soft vignette keeps the image embedded in the stage.
    float vignette = smoothstep(0.92, 0.24, length(vUv - 0.5));
    color *= mix(0.72, 1.0, vignette);

    // Fine grain to avoid banding on dark dashboard screenshots.
    float grain = hash21(vUv * 1000.0 + uTime) - 0.5;
    color += grain * 0.016;

    gl_FragColor = vec4(color, uOpacity);
  }
`;
