let skyFragmentShader = 

`#version 300 es
precision highp float;

in vec4 vPosition;
in vec4 vModelViewPosition;

layout(location = 0) out vec4 fragColor;

uniform vec4 uSkyColorNight;
uniform vec4 uSkyColorDay;
uniform vec4 uSkyColorHorizon;
uniform vec4 uSunColor;
uniform vec4 uMoonColor;

uniform vec3 uSunPosition;
uniform vec3 uMoonPosition;
uniform vec3 uSunModelViewPosition;
uniform vec3 uMoonModelViewPosition;

uniform float uHorizonBias;
uniform float uHorizonIntensity;

void main() {
    vec3 fragmentDirection = normalize(vPosition.xyz);
    vec3 fragmentModelViewDirection = normalize(vModelViewPosition.xyz);

    vec3 sunDirection = normalize(uSunPosition);
    vec3 sunModelViewDirection = normalize(uSunModelViewPosition);
    vec3 moonModelViewDirection = normalize(uMoonModelViewPosition);

    float fragmentSunDot = dot(fragmentDirection, sunDirection);
    float fragmentSunModelViewDot = dot(fragmentModelViewDirection, sunModelViewDirection);
    float fragmentMoonModelViewDot = dot(fragmentModelViewDirection, moonModelViewDirection);

    float skyHorizonInfluence = (1.0 - clamp(abs(fragmentSunDot + uHorizonBias), 0.0, 1.0)) * uHorizonIntensity;

    vec4 skyColor = mix(mix(uSkyColorNight, uSkyColorDay, fragmentSunDot), uSkyColorHorizon, skyHorizonInfluence);
    vec4 sunColor = uSunColor * pow(clamp(fragmentSunModelViewDot, 0.0, 1.0), 400.0) * 2.0;
    vec4 moonColor = uMoonColor * pow(clamp(fragmentMoonModelViewDot, 0.0, 1.0), 400.0) * 2.0;

    vec4 color = skyColor * (vec4(1.0) - sunColor - moonColor) + sunColor + moonColor;

    fragColor = color;
}

`