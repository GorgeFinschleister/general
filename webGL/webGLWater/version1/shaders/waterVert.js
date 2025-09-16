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
const float directions[numDirections] = float[numDirections](0.0578, 0.30791, 0.75709, 0.47779, 0.1735, 0.4324, 0.61367, 0.45316, 0.22213, 0.54967, 0.32037, 0.27197, 0.84127, 0.76328, 0.85567, 0.60643, 0.83696, 0.83801, 0.09466, 0.61066);

WaveData getWaveData(vec4 position) {
    float offset = 0.0;
    vec2 derivativeSum = vec2(0.0);
    vec2 prevDerivative = vec2(0.0);

    vec2 positionVec2 = position.xz;
    
    float frequency = uWaveFrequency;
    float amplitude = uWaveAmplitude;

    float tickBySpeed = uTick * uWaveSpeed;

    for (int i = 0; i < iterations; i++) {
        float directionAngle = directions[i] * 6.28;
        vec2 direction = vec2(cos(directionAngle), sin(directionAngle));

        float positionDirectionDot = dot(positionVec2, direction) * frequency;

        float waveValue = amplitude * exp(sin(positionDirectionDot + tickBySpeed) - 1.0);
        float waveValueDerivativeX = amplitude * frequency * direction.x * exp(cos(positionDirectionDot + tickBySpeed) - 1.0) * cos(positionDirectionDot + tickBySpeed);
        float waveValueDerivativeZ = amplitude * frequency * direction.y * exp(cos(positionDirectionDot + tickBySpeed) - 1.0) * cos(positionDirectionDot + tickBySpeed);

        positionVec2 += prevDerivative * 100.0;

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

float X(float x, float n) {
    return mod(x, n);
}

float Y(float y, float n) {
    return -1.0 * floor(y/n) / n;
}

void main() {
    WaveData waveData = getWaveData(aVertexPosition);

    vec4 position = aVertexPosition + waveData.offset;

    float seafoamCoefficient = pow(length(waveData.offset) / (uWaveAmplitude + pow(uWaveAmplitudeCoefficient, float(iterations))), 4.0) * 0.003;
    vec4 seafoamColor = vec4(1.0) * seafoamCoefficient;

    vPosition = position.xyz;
    vViewPosition = (uModelViewMatrix * position).xyz;
    vColor = uWaterColor + seafoamColor;
    vWaveOffset = waveData.offset.xyz;
    vNormal = waveData.normal;
    vRotatedNormal = (uModelViewMatrix * vec4(waveData.normal, 0.0)).xyz;

    gl_Position = uProjectionMatrix * uModelViewMatrix * position;
}
    
`