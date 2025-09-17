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

const int iterations = 128;
const int numDirections = 256;
const float directions[numDirections] = float[numDirections](0.98357, 0.73059, 0.47862, 0.56404, 0.1599, 0.28853, 0.71755, 0.43247, 0.0093, 0.51203, 0.56075, 0.85771, 0.61639, 0.10093, 0.20997, 0.63789, 0.82568, 0.33663, 0.07618, 0.87707, 0.34708, 0.88552, 0.29124, 0.47331, 0.41146, 0.65129, 0.87395, 0.6366, 0.32362, 0.65516, 0.95098, 0.22788, 0.40042, 0.30581, 0.46496, 0.10434, 0.0909, 0.62398, 0.38642, 0.82563, 0.69811, 0.3348, 0.14689, 0.60052, 0.67853, 0.95456, 0.3192, 0.67709, 0.40134, 0.04644, 0.99679, 0.50986, 0.49725, 0.65742, 0.33486, 0.80419, 0.21789, 0.18337, 0.55184, 0.13563, 0.07618, 0.74147, 0.663, 0.72042, 0.92503, 0.56253, 0.71451, 0.90858, 0.89739, 0.78993, 0.54468, 0.00609, 0.79599, 0.11696, 0.07006, 0.08244, 0.96724, 0.44056, 0.34041, 0.42672, 0.9865, 0.17617, 0.14605, 0.73903, 0.56371, 0.08297, 0.98061, 0.35821, 0.87762, 0.59058, 0.03782, 0.00892, 0.40727, 0.55148, 0.39905, 0.6279, 0.77471, 0.9242, 0.72573, 0.28006, 0.69405, 0.6666, 0.12779, 0.55058, 0.86585, 0.17014, 0.52261, 0.76995, 0.93314, 0.8379, 0.86656, 0.95261, 0.71547, 0.54564, 0.49807, 0.94331, 0.55445, 0.61686, 0.33639, 0.52878, 0.34197, 0.19001, 0.11958, 0.08695, 0.65281, 0.34348, 0.10996, 0.49765,0.09362, 0.34827, 0.00993, 0.07558, 0.53859, 0.91732, 0.80014, 0.98812, 0.65268, 0.68423, 0.259, 0.3646, 0.08709, 0.9218, 0.25607, 0.22577, 0.53023, 0.60765, 0.75913, 0.29577, 0.9166, 0.7491, 0.14317, 0.03775, 0.1546, 0.1069, 0.89848, 0.50218, 0.55189, 0.94545, 0.01011, 0.12498, 0.32553, 0.81571, 0.92157, 0.55121, 0.34138, 0.00822, 0.12418, 0.38758, 0.47011, 0.45599, 0.06854, 0.7342, 0.47616, 0.64766, 0.24947, 0.24343, 0.75899, 0.66251, 0.23224, 0.94113, 0.61145, 0.86392, 0.42471, 0.23621, 0.45387, 0.9891, 0.85658, 0.78776, 0.46546, 0.81387, 0.16637, 0.98682, 0.0067, 0.6367, 0.31611, 0.35974, 0.28747, 0.87112, 0.06811, 0.91195, 0.84284, 0.70392, 0.42071, 0.70923, 0.79531, 0.31645, 0.05902, 0.15755, 0.31423, 0.45656, 0.78186, 0.32053, 0.1239, 0.00511, 0.96297, 0.37607, 0.79133, 0.41878, 0.20377, 0.6035, 0.14109, 0.04972, 0.224, 0.49348, 0.87414, 0.9392, 0.38333, 0.60021, 0.91692, 0.99375, 0.41669, 0.2625, 0.42759, 0.90415, 0.67967, 0.09555, 0.51575, 0.88961, 0.25969, 0.39532, 0.30462, 0.56787, 0.21215, 0.02806, 0.67391, 0.06699, 0.71782, 0.28794, 0.42456, 0.83148, 0.98304, 0.07357, 0.23059, 0.66286, 0.73111, 0.97262);

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