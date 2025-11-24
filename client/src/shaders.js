// 3D FBM noise https://shadertoy.com/view/lss3zr
export const fbm = /* glsl */ `
  mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);

    f = f * f * (3.0 - 2.0 * f);

    float n = p.x + p.y * 57.0 + 113.0 * p.z;

    float res = mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                        mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                        mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
    return res;
  }

  float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p = m * p * 2.02;
    f += 0.2500 * noise(p); p = m * p * 2.03;
    f += 0.12500 * noise(p); p = m * p * 2.01;
    f += 0.06250 * noise(p);
    return f;
  }
`

export const fragmentShader = /* glsl */ `
  ${fbm}

  uniform vec3 uCloudSize;
  uniform vec3 uSunPosition;
  uniform vec3 uCameraPosition;
  uniform vec3 uCloudColor;
  uniform vec3 uSkyColor;
  uniform float uCloudSteps;
  uniform float uShadowSteps;
  uniform float uCloudLength;
  uniform float uShadowLength;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uFocalLength;
  uniform bool uRegress;

  float cloudDepth(vec3 position) {
    float ellipse = 1.0 - length(position * uCloudSize);
    float cloud = ellipse + fbm(position) * 2.2;

    return min(max(0.0, cloud), 1.0);
  }

  // https://shaderbits.com/blog/creating-volumetric-ray-marcher
  vec4 cloudMarch(float jitter, vec3 position, vec3 ray) {
    float stepLength = uCloudLength / uCloudSteps;
    float shadowStepLength = uShadowLength / uShadowSteps;

    vec3 lightDirection = normalize(uSunPosition);
    vec3 cloudPosition = position + ray * jitter * stepLength;

    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    for (float i = 0.0; i < uCloudSteps; i++) {
      if (color.a < 0.1) break;

      float depth = cloudDepth(cloudPosition);
      if (depth > 0.001) {
        vec3 lightPosition = cloudPosition + lightDirection * jitter * shadowStepLength;

        float shadow = 0.0;
        for (float s = 0.0; s < uShadowSteps; s++) {
          lightPosition += lightDirection * shadowStepLength;
          shadow += cloudDepth(lightPosition);
        }
        shadow = exp((-shadow / uShadowSteps) * 3.0);

        float density = clamp((depth / uCloudSteps) * 20.0, 0.0, 1.0);
        color.rgb += vec3(shadow * density) * uCloudColor * color.a;
        color.a *= 1.0 - density;

        color.rgb += density * uSkyColor * color.a;
      }

      cloudPosition += ray * stepLength;
    }

    return color;
  }

  // https://github.com/glslify/glsl-look-at
  mat3 lookAt(vec3 target, vec3 origin) {
    vec3 cw = normalize(origin - target);
    vec3 cu = normalize(cross(cw, origin));
    vec3 cv = normalize(cross(cu, cw));
    return mat3(cu, cv, cw);
  }

  void main() {
    vec2 pixel = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
    float jitter = uRegress ? hash(pixel.x + pixel.y * 50.0 + uTime) : 0.0;

    mat3 camera = lookAt(uCameraPosition, vec3(0.0, 1.0, 0.0));
    vec3 ray = camera * normalize(vec3(pixel, uFocalLength));

    vec4 color = cloudMarch(jitter, uCameraPosition, ray);
    gl_FragColor = vec4(color.rgb + uSkyColor * color.a, 1.0);
  }
`
