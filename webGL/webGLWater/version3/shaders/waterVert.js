let waterVert = 

`#version 300 es
precision highp float;

#define useGenericSine 0

struct WaveData {
    vec4 offset;
    vec3 normal;
};

in vec4 aVertexPosition;

out vec3 vPosition;
out vec3 vViewPosition;
out vec4 vColor;
out vec3 vNormal;
out vec3 vRotatedNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

uniform vec4 uWaterColor;

uniform float uTick;
uniform float uMaxWaveHeight;
uniform float uWaveSpeed;
uniform float uWaveFrequency;
uniform float uWaveFrequencyCoefficient;
uniform float uWaveAmplitude;
uniform float uWaveAmplitudeCoefficient;

uniform sampler2D FBMData;

const int iterations = 32;
const int width = 16;

WaveData getWaveData(vec4 position) {
    vec2 positionVec2 = position.xz;
    vec2 derivativeSum = vec2(0.0);
    vec2 prevDerivative = vec2(0.0);

    float waveShiftCoefficient = 1.0 * 1.0;
    float tickBySpeed = uTick * uWaveSpeed;
    
    float offset = 0.0;

    for (int i = 0; i < iterations; i++) {
        vec4 currentFBMData = texture(FBMData, vec2(i % width, i / width) / float(width));

        vec2 direction = normalize(currentFBMData.xy + prevDerivative * waveShiftCoefficient);
        float frequency = currentFBMData.z;
        float amplitude = currentFBMData.w;
        vec2 directionTimesFrequency = direction * frequency;

        float innerWaveComponent = dot(positionVec2, directionTimesFrequency) + tickBySpeed;

        float waveValue = amplitude * exp(sin(innerWaveComponent) - 1.0);
        vec2 derivative = directionTimesFrequency * waveValue * cos(innerWaveComponent);

        offset += waveValue;
        derivativeSum += derivative;
        prevDerivative = derivative;
    }

    vec3 dx = normalize(vec3(1.0, derivativeSum.x, 0.0));
    vec3 dz = normalize(vec3(0.0, derivativeSum.y, 1.0));
    vec3 normal = normalize(cross(dz, dx));

    vec4 offsetVec = vec4(0.0, offset, 0.0, 0.0);

    WaveData returnData = WaveData(offsetVec, normal);

    return returnData;
}

float X(float x, float n) {
    return mod(x, n);
}

float Y(float y, float n) {
    return -1.0 * floor(y/n) / n;
}

void main() {
    WaveData waveData = getWaveData(aVertexPosition);

    vec4 position = aVertexPosition + waveData.offset;
    vec4 modelViewPosition = uModelViewMatrix * position;

    float seafoamCoefficient = pow(length(waveData.offset) / uMaxWaveHeight, 4.0) * 2.0;
    vec4 seafoamColor = vec4(1.0) * seafoamCoefficient;

    vPosition = position.xyz;
    vViewPosition = modelViewPosition.xyz;
    vColor = uWaterColor + seafoamColor;
    vNormal = waveData.normal;
    vRotatedNormal = (uModelViewMatrix * vec4(waveData.normal, 0.0)).xyz;

    gl_Position = uProjectionMatrix * modelViewPosition;
}
    
`