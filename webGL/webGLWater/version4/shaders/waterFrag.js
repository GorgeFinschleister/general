let waterFrag = 

`#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vViewPosition;
in vec4 vColor;
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
uniform float uWaveSpecularCoefficient;
uniform float uWaveSpecularExponent;

uniform float uAmbientCoefficient;

float getAdjustedLightValue(float value, float coefficient, float exponent) {
    return coefficient * pow(max(0.0, value), exponent);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 rotatedNormal = normalize(vRotatedNormal);
    
    vec4 color = vColor;

    vec3 toCamera = normalize(vViewPosition);
    vec3 toSun = normalize(uSunViewPosition - vViewPosition);
    vec3 specularHalfwayVector = normalize((toSun - toCamera) / 2.0);
    float fresnel = pow(1.0 - dot(toCamera, normal), 5.0);

    float diffuseDot = getAdjustedLightValue(dot(rotatedNormal, toSun), uSunDiffuseCoefficient, uSunDiffuseExponent);
    float specularDot = getAdjustedLightValue(dot(rotatedNormal, specularHalfwayVector), uWaveSpecularCoefficient, uWaveSpecularExponent);

    vec4 ambientColor = color * uAmbientCoefficient;
    vec4 diffuseColor = color * uSunColor * diffuseDot * (1.0 - specularDot);
    vec4 specularColor = uSunColor * specularDot * fresnel;

    vec4 finalColor = ambientColor + diffuseColor + specularColor;

    fragColor = vec4(finalColor.xyz, 1.0);
    //fragColor = vec4(vNormal.xz * 0.5 + 0.5, 0.0, 1.0);
}
    
`