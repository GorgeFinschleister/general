let skyFrag =

`#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vViewPosition;

layout(location = 0) out vec4 fragColor;

uniform vec4 uSkyColor;
uniform vec4 uCloudColor;
uniform vec4 uSunColor;
uniform mat4 uModelViewMatrix;

uniform vec3 uCloudDirection;

uniform float uTick;

uniform vec3 uSunViewPosition;
uniform float uSunBodyCoefficient;
uniform float uSunBodyExponent;
uniform float uSunBodyRadius;

uniform float uCloudSpeed;
uniform float uCloudFrequency;
uniform float uCloudFrequencyCoefficient;
uniform float uCloudAmplitude;
uniform float uCloudAmplitudeCoefficient;
uniform float uCloudCoefficient;
uniform float uCloudExponent;

float getAdjustedLightValue(float value, float coefficient, float exponent) {
    return coefficient * pow(max(0.0, value), exponent);
}

float sstep(float x) {
    return x * x * (3.0 - 2.0 * x);
}

float random(vec3 seed) {
    return fract(sin(dot(seed , vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

float getCloudValue(vec3 position) {
    float x = position.x;
    float y = position.y;
    float z = position.z;
    float frx = fract(x);
    float fry = fract(y);
    float frz = fract(z);
    float fx = x - frx;
    float fy = y - fry;
    float fz = z - frz;
    float cx = fx + 1.0;
    float cy = fy + 1.0;
    float cz = fz + 1.0;

    float lerped1_1 = mix(random(vec3(fx, fy, fz)), random(vec3(cx, fy, fz)), sstep(frx));
    float lerped2_1 = mix(random(vec3(fx, cy, fz)), random(vec3(cx, cy, fz)), sstep(frx));
    float lerped3_1 = mix(random(vec3(fx, fy, cz)), random(vec3(cx, fy, cz)), sstep(frx));
    float lerped4_1 = mix(random(vec3(fx, cy, cz)), random(vec3(cx, cy, cz)), sstep(frx));

    float lerped1_2 = mix(lerped1_1, lerped2_1, sstep(fry));
    float lerped2_2 = mix(lerped3_1, lerped4_1, sstep(fry));

    float lerped1_3 = mix(lerped1_2, lerped2_2, sstep(frz));
    
    return lerped1_3;
}

float getLayeredCloudValue(vec3 position) {
    position += uCloudSpeed * uTick * uCloudDirection;

    const int iterations = 5;
    float frequency = uCloudFrequency;
    float frequencyCoefficient = 1.5;
    float amplitude = uCloudAmplitude;
    float amplitudeCoefficient = 0.75;

    float cloudValue = 0.0;

    for (int i = 0; i < iterations; i++) {
        cloudValue += amplitude * getCloudValue(position * frequency);

        frequency *= uCloudFrequencyCoefficient;
        amplitude *= uCloudAmplitudeCoefficient;
    }

    float finalCloudValue = getAdjustedLightValue(cloudValue, uCloudCoefficient, uCloudExponent);
    finalCloudValue *= max(0.0, dot(normalize(position), vec3(0.0, 1.0, 0.0)));

    return finalCloudValue;
}

void main() {
    float distanceToSun = distance(vViewPosition, uSunViewPosition);
    float distanceToSunCoefficient = getAdjustedLightValue(distanceToSun / uSunBodyRadius, uSunBodyCoefficient, uSunBodyExponent);
    float cloudValue = getLayeredCloudValue(vPosition);

    vec4 cloudColor = uCloudColor * cloudValue;
    vec4 skyColor = uSkyColor * (vec4(1.0) - cloudColor);
    vec4 sunColor = uSunColor * distanceToSunCoefficient;

    vec4 finalColor = cloudColor + skyColor + sunColor;

    fragColor = finalColor;
}
    
`