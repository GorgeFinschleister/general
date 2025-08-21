let waterVert = 

`#version 300 es
precision highp float;

struct WaveData {
    vec4 offset;
    vec3 normal;
};

in vec4 aVertexPosition;

out vec3 vPosition;
out vec3 vViewPosition;
out vec4 vColor;
out vec3 vWaveOffset;
out vec3 vNormal;
out vec3 vRotatedNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

uniform vec4 uWaterColor;

uniform float uTick;
uniform float uWaveSpeed;
uniform float uWaveFrequency;
uniform float uWaveFrequencyCoefficient;
uniform float uWaveAmplitude;
uniform float uWaveAmplitudeCoefficient;

const int iterations = 20;
const int numDirections = 20;
const float directions[numDirections] = float[numDirections](0.44345, 0.64041, 0.65973, 0.05262, 0.27399, 0.487, 0.7316, 0.54246, 0.43524, 0.68831, 0.05589, 0.82248, 0.44419, 0.4753, 0.64882, 0.62044, 0.40697, 0.81248, 0.84478, 0.08581);

WaveData getWaveData(vec4 position) {
    float offset = 0.0;
    vec2 derivativeSum = vec2(0.0);
    vec2 prevDerivative = vec2(0.0);

    vec2 positionVec2 = position.xz;
    
    float frequency = uWaveFrequency;
    float amplitude = uWaveAmplitude;

    float tickBySpeed = uTick * uWaveSpeed;

    for (int i = 0; i < iterations; i++) {
        float directionAngle = directions[i] * 6.28318530718;
        vec2 direction = vec2(cos(directionAngle), sin(directionAngle));

        float positionDirectionDot = dot(positionVec2, direction) * frequency;

        float waveValue = amplitude * exp(sin(positionDirectionDot + tickBySpeed) - 1.0);
        float waveValueDerivativeX = amplitude * frequency * direction.x * exp(sin(positionDirectionDot + tickBySpeed) - 1.0) * cos(positionDirectionDot + tickBySpeed);
        float waveValueDerivativeZ = amplitude * frequency * direction.y * exp(sin(positionDirectionDot + tickBySpeed) - 1.0) * cos(positionDirectionDot + tickBySpeed);

        positionVec2 += prevDerivative;

        vec2 derivative = vec2(waveValueDerivativeX, waveValueDerivativeZ);

        offset += waveValue;
        derivativeSum += derivative;
        prevDerivative = derivative;

        frequency *= uWaveFrequencyCoefficient;
        amplitude *= uWaveAmplitudeCoefficient;
    }

    vec3 dx = normalize(vec3(1.0, derivativeSum.x, 0.0));
    vec3 dz = normalize(vec3(0.0, derivativeSum.y, 1.0));
    vec3 normal = normalize(cross(dz, dx));

    vec4 offsetVec = vec4(0.0, offset, 0.0, 0.0);

    WaveData returnData = WaveData(offsetVec, normal);

    return returnData;
}
WaveData getWaveData1(vec4 position) {
    float offset = 0.0;
    float derivativeX = 0.0;
    float derivativeZ = 0.0;

    vec2 positionVec2 = position.xz;
    
    float frequency = uWaveFrequency;
    float amplitude = uWaveAmplitude;

    float tickBySpeed = uTick * uWaveSpeed;

    for (int i = 0; i < iterations; i++) {
        float directionAngle = directions[i] * 6.28;
        vec2 direction = vec2(-cos(directionAngle), sin(directionAngle));

        float positionDirectionDot = dot(positionVec2, direction) * frequency;

        float waveValue = sin(positionDirectionDot + tickBySpeed);
        float waveValueDerivativeX = amplitude * frequency * direction.x * cos(positionDirectionDot + tickBySpeed);
        float waveValueDerivativeZ = amplitude * frequency * direction.y * cos(positionDirectionDot + tickBySpeed);

        offset += waveValue;
        derivativeX += waveValueDerivativeX;
        derivativeZ += waveValueDerivativeZ;

        frequency *= uWaveFrequencyCoefficient;
        amplitude *= uWaveAmplitudeCoefficient;
    }

    vec3 dx = normalize(vec3(1.0, derivativeX, 0.0));
    vec3 dz = normalize(vec3(0.0, derivativeZ, 1.0));
    vec3 normal = normalize(cross(dz, dx));

    vec4 offsetVec = vec4(0.0, offset, 0.0, 0.0);

    WaveData returnData = WaveData(offsetVec, normal);

    return returnData;
}

void main() {
    WaveData waveData = getWaveData(aVertexPosition);

    vec4 position = aVertexPosition + waveData.offset;

    vPosition = position.xyz;
    vViewPosition = (uModelViewMatrix * position).xyz;
    vColor = uWaterColor;
    vWaveOffset = waveData.offset.xyz;
    vNormal = waveData.normal;
    vRotatedNormal = (uModelViewMatrix * vec4(waveData.normal, 0.0)).xyz;

    gl_Position = uProjectionMatrix * uModelViewMatrix * position;
}
    
`