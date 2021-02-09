export const terrain_shader = (function() {

  const _VS_1 = `

// Triplanar Attributes
in vec4 weights1;
in vec4 weights2;

// Outputs
out vec3 vCoords;
out vec4 vWeights1;
out vec4 vWeights2;


`;


    const _VS_2 = `

vCoords = transformed.xyz;
vWeights1 = weights1;
vWeights2 = weights2;

`;

  const _VS = `

// Attributes
in vec3 coords;
in vec3 color;
in vec4 weights1;
in vec4 weights2;

// Outputs
out vec2 vUV;
out vec4 vColor;
out vec3 vNormal;
out vec3 vCoords;
out vec4 vWeights1;
out vec4 vWeights2;

void main(){
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vUV = uv;
  vNormal = normal;

  vColor = vec4(color, 1);
  vCoords = position.xyz;
  vWeights1 = weights1;
  vWeights2 = weights2;
}
  `;
  

  const _PS = `

precision highp float;
precision highp int;
precision highp sampler2DArray;

uniform sampler2DArray TRIPLANAR_normalMap;
uniform sampler2DArray TRIPLANAR_diffuseMap;
uniform sampler2D TRIPLANAR_noiseMap;

in vec3 vCoords;
in vec4 vWeights1;
in vec4 vWeights2;


const float _TRI_SCALE = 10.0;

float sum( vec3 v ) { return v.x+v.y+v.z; }

vec4 hash4( vec2 p ) {
  return fract(
    sin(vec4(1.0+dot(p,vec2(37.0,17.0)), 
              2.0+dot(p,vec2(11.0,47.0)),
              3.0+dot(p,vec2(41.0,29.0)),
              4.0+dot(p,vec2(23.0,31.0))))*103.0);
}

vec4 _TerrainBlend_4(vec4 samples[4]) {
  float depth = 0.2;
  float ma = max(
      samples[0].w,
      max(
          samples[1].w,
          max(samples[2].w, samples[3].w))) - depth;

  float b1 = max(samples[0].w - ma, 0.0);
  float b2 = max(samples[1].w - ma, 0.0);
  float b3 = max(samples[2].w - ma, 0.0);
  float b4 = max(samples[3].w - ma, 0.0);

  vec4 numer = (
      samples[0] * b1 + samples[1] * b2 +
      samples[2] * b3 + samples[3] * b4);
  float denom = (b1 + b2 + b3 + b4);
  return numer / denom;
}

vec4 _TerrainBlend_4_lerp(vec4 samples[4]) {
  return (
      samples[0] * samples[0].w + samples[1] * samples[1].w +
      samples[2] * samples[2].w + samples[3] * samples[3].w);
}

// Lifted from https://www.shadertoy.com/view/Xtl3zf
vec4 texture_UV(in sampler2DArray srcTexture, in vec3 x) {
  float k = texture(TRIPLANAR_noiseMap, 0.0025*x.xy).x; // cheap (cache friendly) lookup
  float l = k*8.0;
  float f = fract(l);
  
  float ia = floor(l+0.5); // suslik's method (see comments)
  float ib = floor(l);
  f = min(f, 1.0-f)*2.0;

  vec2 offa = sin(vec2(3.0,7.0)*ia); // can replace with any other hash
  vec2 offb = sin(vec2(3.0,7.0)*ib); // can replace with any other hash

  vec4 cola = texture(srcTexture, vec3(x.xy + offa, x.z));
  vec4 colb = texture(srcTexture, vec3(x.xy + offb, x.z));

  return mix(cola, colb, smoothstep(0.2,0.8,f-0.1*sum(cola.xyz-colb.xyz)));
}

vec4 _Triplanar_UV(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  vec4 dx = texture_UV(tex, vec3(pos.zy / _TRI_SCALE, texSlice));
  vec4 dy = texture_UV(tex, vec3(pos.xz / _TRI_SCALE, texSlice));
  vec4 dz = texture_UV(tex, vec3(pos.xy / _TRI_SCALE, texSlice));

  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);

  return dx * weights.x + dy * weights.y + dz * weights.z;
}

vec4 _TriplanarN_UV(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  // Tangent Reconstruction
  // Triplanar uvs
  vec2 uvX = pos.zy; // x facing plane
  vec2 uvY = pos.xz; // y facing plane
  vec2 uvZ = pos.xy; // z facing plane
  // Tangent space normal maps
  vec3 tx = texture_UV(tex, vec3(uvX / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 ty = texture_UV(tex, vec3(uvY / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 tz = texture_UV(tex, vec3(uvZ / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);

  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);

  // Get the sign (-1 or 1) of the surface normal
  vec3 axis = sign(normal);
  // Construct tangent to world matrices for each axis
  vec3 tangentX = normalize(cross(normal, vec3(0.0, axis.x, 0.0)));
  vec3 bitangentX = normalize(cross(tangentX, normal)) * axis.x;
  mat3 tbnX = mat3(tangentX, bitangentX, normal);

  vec3 tangentY = normalize(cross(normal, vec3(0.0, 0.0, axis.y)));
  vec3 bitangentY = normalize(cross(tangentY, normal)) * axis.y;
  mat3 tbnY = mat3(tangentY, bitangentY, normal);

  vec3 tangentZ = normalize(cross(normal, vec3(0.0, -axis.z, 0.0)));
  vec3 bitangentZ = normalize(-cross(tangentZ, normal)) * axis.z;
  mat3 tbnZ = mat3(tangentZ, bitangentZ, normal);

  // Apply tangent to world matrix and triblend
  // Using clamp() because the cross products may be NANs
  vec3 worldNormal = normalize(
      clamp(tbnX * tx, -1.0, 1.0) * weights.x +
      clamp(tbnY * ty, -1.0, 1.0) * weights.y +
      clamp(tbnZ * tz, -1.0, 1.0) * weights.z
      );
  return vec4(worldNormal, 0.0);
}

vec4 _Triplanar(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  vec4 dx = texture(tex, vec3(pos.zy / _TRI_SCALE, texSlice));
  vec4 dy = texture(tex, vec3(pos.xz / _TRI_SCALE, texSlice));
  vec4 dz = texture(tex, vec3(pos.xy / _TRI_SCALE, texSlice));

  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);

  return dx * weights.x + dy * weights.y + dz * weights.z;
}

vec4 _TriplanarN(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  vec2 uvx = pos.zy;
  vec2 uvy = pos.xz;
  vec2 uvz = pos.xy;
  vec3 tx = texture(tex, vec3(uvx / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 ty = texture(tex, vec3(uvy / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 tz = texture(tex, vec3(uvz / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);

  vec3 weights = abs(normal.xyz);
  weights *= weights;
  weights = weights / (weights.x + weights.y + weights.z);

  vec3 axis = sign(normal);
  vec3 tangentX = normalize(cross(normal, vec3(0.0, axis.x, 0.0)));
  vec3 bitangentX = normalize(cross(tangentX, normal)) * axis.x;
  mat3 tbnX = mat3(tangentX, bitangentX, normal);

  vec3 tangentY = normalize(cross(normal, vec3(0.0, 0.0, axis.y)));
  vec3 bitangentY = normalize(cross(tangentY, normal)) * axis.y;
  mat3 tbnY = mat3(tangentY, bitangentY, normal);

  vec3 tangentZ = normalize(cross(normal, vec3(0.0, -axis.z, 0.0)));
  vec3 bitangentZ = normalize(-cross(tangentZ, normal)) * axis.z;
  mat3 tbnZ = mat3(tangentZ, bitangentZ, normal);

  vec3 worldNormal = normalize(
      clamp(tbnX * tx, -1.0, 1.0) * weights.x +
      clamp(tbnY * ty, -1.0, 1.0) * weights.y +
      clamp(tbnZ * tz, -1.0, 1.0) * weights.z);
  return vec4(worldNormal, 0.0);
}

void main() {
  vec3 worldPosition = vCoords;

  float weightIndices[4] = float[4](vWeights1.x, vWeights1.y, vWeights1.z, vWeights1.w);
  float weightValues[4] = float[4](vWeights2.x, vWeights2.y, vWeights2.z, vWeights2.w);

  // TRIPLANAR SPLATTING w/ NORMALS & UVS
  vec3 worldSpaceNormal = normalize(vNormal);
  vec4 diffuseSamples[4];
  vec4 normalSamples[4];

  for (int i = 0; i < 4; ++i) {
    vec4 d = vec4(0.0);
    vec4 n = vec4(0.0);
    if (weightValues[i] > 0.0) {
      d = _Triplanar_UV(
        worldPosition, worldSpaceNormal, weightIndices[i], TRIPLANAR_diffuseMap);
      n = _TriplanarN_UV(
        worldPosition, worldSpaceNormal, weightIndices[i], TRIPLANAR_normalMap);

      d.w *= weightValues[i];
      n.w = d.w;
    }

    diffuseSamples[i] = d;
    normalSamples[i] = n;
  }

  vec4 diffuseBlended = _TerrainBlend_4(diffuseSamples);
  vec4 normalBlended = _TerrainBlend_4(normalSamples);
  vec3 diffuse = diffuseBlended.xyz;

  vec3 finalColour = diffuse;

  // finalColour = vec3(sin(worldPosition.x), sin(worldPosition.y), sin(worldPosition.z));

  gl_FragColor = vec4(finalColour, 1);
}

  `;


  const _PS_1 = `

precision mediump sampler2DArray;

uniform sampler2DArray TRIPLANAR_normalMap;
uniform sampler2DArray TRIPLANAR_diffuseMap;
uniform sampler2D TRIPLANAR_noiseMap;

in vec3 vCoords;
in vec4 vWeights1;
in vec4 vWeights2;


const float _TRI_SCALE = 10.0;

float sum( vec3 v ) { return v.x+v.y+v.z; }

vec4 hash4( vec2 p ) {
  return fract(
    sin(vec4(1.0+dot(p,vec2(37.0,17.0)), 
              2.0+dot(p,vec2(11.0,47.0)),
              3.0+dot(p,vec2(41.0,29.0)),
              4.0+dot(p,vec2(23.0,31.0))))*103.0);
}

vec4 _TerrainBlend_4(vec4 samples[4]) {
  float depth = 0.2;
  float ma = max(
      samples[0].w,
      max(
          samples[1].w,
          max(samples[2].w, samples[3].w))) - depth;

  float b1 = max(samples[0].w - ma, 0.0);
  float b2 = max(samples[1].w - ma, 0.0);
  float b3 = max(samples[2].w - ma, 0.0);
  float b4 = max(samples[3].w - ma, 0.0);

  vec4 numer = (
      samples[0] * b1 + samples[1] * b2 +
      samples[2] * b3 + samples[3] * b4);
  float denom = (b1 + b2 + b3 + b4);
  return numer / denom;
}

vec4 _TerrainBlend_4_lerp(vec4 samples[4]) {
  return (
      samples[0] * samples[0].w + samples[1] * samples[1].w +
      samples[2] * samples[2].w + samples[3] * samples[3].w);
}

// Lifted from https://www.shadertoy.com/view/Xtl3zf
vec4 texture_UV(in sampler2DArray srcTexture, in vec3 x) {
  float k = texture(TRIPLANAR_noiseMap, 0.0025*x.xy).x; // cheap (cache friendly) lookup
  float l = k*8.0;
  float f = fract(l);
  
  float ia = floor(l+0.5); // suslik's method (see comments)
  float ib = floor(l);
  f = min(f, 1.0-f)*2.0;

  vec2 offa = sin(vec2(3.0,7.0)*ia); // can replace with any other hash
  vec2 offb = sin(vec2(3.0,7.0)*ib); // can replace with any other hash

  vec4 cola = texture(srcTexture, vec3(x.xy + offa, x.z));
  vec4 colb = texture(srcTexture, vec3(x.xy + offb, x.z));

  return mix(cola, colb, smoothstep(0.2,0.8,f-0.1*sum(cola.xyz-colb.xyz)));
}

vec4 _Triplanar_UV(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  vec4 dx = texture_UV(tex, vec3(pos.zy / _TRI_SCALE, texSlice));
  vec4 dy = texture_UV(tex, vec3(pos.xz / _TRI_SCALE, texSlice));
  vec4 dz = texture_UV(tex, vec3(pos.xy / _TRI_SCALE, texSlice));

  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);

  return dx * weights.x + dy * weights.y + dz * weights.z;
}

vec4 _TriplanarN_UV(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  // Tangent Reconstruction
  // Triplanar uvs
  vec2 uvX = pos.zy; // x facing plane
  vec2 uvY = pos.xz; // y facing plane
  vec2 uvZ = pos.xy; // z facing plane
  // Tangent space normal maps
  vec3 tx = texture_UV(tex, vec3(uvX / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 ty = texture_UV(tex, vec3(uvY / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 tz = texture_UV(tex, vec3(uvZ / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);

  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);

  // Get the sign (-1 or 1) of the surface normal
  vec3 axis = sign(normal);
  // Construct tangent to world matrices for each axis
  vec3 tangentX = normalize(cross(normal, vec3(0.0, axis.x, 0.0)));
  vec3 bitangentX = normalize(cross(tangentX, normal)) * axis.x;
  mat3 tbnX = mat3(tangentX, bitangentX, normal);

  vec3 tangentY = normalize(cross(normal, vec3(0.0, 0.0, axis.y)));
  vec3 bitangentY = normalize(cross(tangentY, normal)) * axis.y;
  mat3 tbnY = mat3(tangentY, bitangentY, normal);

  vec3 tangentZ = normalize(cross(normal, vec3(0.0, -axis.z, 0.0)));
  vec3 bitangentZ = normalize(-cross(tangentZ, normal)) * axis.z;
  mat3 tbnZ = mat3(tangentZ, bitangentZ, normal);

  // Apply tangent to world matrix and triblend
  // Using clamp() because the cross products may be NANs
  vec3 worldNormal = normalize(
      clamp(tbnX * tx, -1.0, 1.0) * weights.x +
      clamp(tbnY * ty, -1.0, 1.0) * weights.y +
      clamp(tbnZ * tz, -1.0, 1.0) * weights.z
      );
  return vec4(worldNormal, 0.0);
}

vec4 _Triplanar(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  vec4 dx = texture(tex, vec3(pos.zy / _TRI_SCALE, texSlice));
  vec4 dy = texture(tex, vec3(pos.xz / _TRI_SCALE, texSlice));
  vec4 dz = texture(tex, vec3(pos.xy / _TRI_SCALE, texSlice));

  vec3 weights = abs(normal.xyz);
  weights = weights / (weights.x + weights.y + weights.z);

  return dx * weights.x + dy * weights.y + dz * weights.z;
}

vec4 _TriplanarN(vec3 pos, vec3 normal, float texSlice, sampler2DArray tex) {
  vec2 uvx = pos.zy;
  vec2 uvy = pos.xz;
  vec2 uvz = pos.xy;
  vec3 tx = texture(tex, vec3(uvx / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 ty = texture(tex, vec3(uvy / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);
  vec3 tz = texture(tex, vec3(uvz / _TRI_SCALE, texSlice)).xyz * vec3(2,2,2) - vec3(1,1,1);

  vec3 weights = abs(normal.xyz);
  weights *= weights;
  weights = weights / (weights.x + weights.y + weights.z);

  vec3 axis = sign(normal);
  vec3 tangentX = normalize(cross(normal, vec3(0.0, axis.x, 0.0)));
  vec3 bitangentX = normalize(cross(tangentX, normal)) * axis.x;
  mat3 tbnX = mat3(tangentX, bitangentX, normal);

  vec3 tangentY = normalize(cross(normal, vec3(0.0, 0.0, axis.y)));
  vec3 bitangentY = normalize(cross(tangentY, normal)) * axis.y;
  mat3 tbnY = mat3(tangentY, bitangentY, normal);

  vec3 tangentZ = normalize(cross(normal, vec3(0.0, -axis.z, 0.0)));
  vec3 bitangentZ = normalize(-cross(tangentZ, normal)) * axis.z;
  mat3 tbnZ = mat3(tangentZ, bitangentZ, normal);

  vec3 worldNormal = normalize(
      clamp(tbnX * tx, -1.0, 1.0) * weights.x +
      clamp(tbnY * ty, -1.0, 1.0) * weights.y +
      clamp(tbnZ * tz, -1.0, 1.0) * weights.z);
  return vec4(worldNormal, 0.0);
}

  `;
  
    const _PS_2 = `

{
  vec3 worldPosition = vCoords;

  float weightIndices[4] = float[4](vWeights1.x, vWeights1.y, vWeights1.z, vWeights1.w);
  float weightValues[4] = float[4](vWeights2.x, vWeights2.y, vWeights2.z, vWeights2.w);
  
  // TRIPLANAR SPLATTING w/ NORMALS & UVS
  vec3 worldSpaceNormal = normalize(vNormal);
  vec4 diffuseSamples[4];
  // vec4 normalSamples[4];
  
  for (int i = 0; i < 4; ++i) {
    vec4 d = vec4(0.0);
    // vec4 n = vec4(0.0);
    if (weightValues[i] > 0.0) {
      d = _Triplanar_UV(
          worldPosition, worldSpaceNormal, weightIndices[i], TRIPLANAR_diffuseMap);
      // n = _TriplanarN_UV(
      //     worldPosition, worldSpaceNormal, weightIndices[i], TRIPLANAR_normalMap);
  
      d.w *= weightValues[i];
      // n.w = d.w;
    }
  
    diffuseSamples[i] = d;
    // normalSamples[i] = n;
  }
  
  vec4 diffuseBlended = _TerrainBlend_4(diffuseSamples);
  // vec4 normalBlended = _TerrainBlend_4(normalSamples);
  diffuseColor = sRGBToLinear(diffuseBlended);
  // normal = normalBlended.xyz;
}

    `;

    return {
      VS: _VS,
      PS: _PS,
      VS1: _VS_1,
      VS2: _VS_2,
      PS1: _PS_1,
      PS2: _PS_2,
    };
  })();
  