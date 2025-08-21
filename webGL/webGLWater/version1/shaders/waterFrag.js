let waterFrag = 

`#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vViewPosition;
in vec4 vColor;
in vec3 vWaveOffset;
in vec3 vNormal;
in vec3 vRotatedNormal;

layout(location = 0) out vec4 fragColor;

uniform mat4 uModelViewMatrix;

uniform vec4 uSunColor;

uniform vec3 uSunPosition;
uniform vec3 uSunViewPosition;
uniform vec3 uCameraPosition;

uniform float uSunDiffuseCoefficient;
uniform float uSunDiffuseExponent;
uniform float uSunSpecularCoefficient;
uniform float uSunSpecularExponent;

uniform float uAmbientCoefficient;

float getAdjustedLightValue(float value, float coefficient, float exponent) {
    return coefficient * pow(max(0.0, value), exponent);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 rotatedNormal = normalize(vRotatedNormal);

    vec3 toCamera = normalize(vViewPosition);
    vec3 toSun = normalize(uSunViewPosition - vViewPosition);
    vec3 specularHalfwayVector = normalize((toSun - toCamera) / 2.0);

    float diffuseDot = getAdjustedLightValue(dot(rotatedNormal, toSun), uSunDiffuseCoefficient, uSunDiffuseExponent);
    float specularDot = getAdjustedLightValue(dot(rotatedNormal, specularHalfwayVector), uSunSpecularCoefficient, uSunSpecularExponent);

    vec4 ambientColor = vColor * uAmbientCoefficient;
    vec4 diffuseColor = vColor * uSunColor * diffuseDot * (1.0 - specularDot);
    vec4 specularColor = uSunColor * specularDot;

    vec4 finalColor = ambientColor + diffuseColor + specularColor;

    fragColor = vec4(finalColor.xyz, 1.0);
}
    
`