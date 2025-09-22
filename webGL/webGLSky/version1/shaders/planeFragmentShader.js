let planeFragmentShader = 

`#version 300 es
precision highp float;

in vec4 vPosition;
in vec4 vModelViewPosition;

layout(location = 0) out vec4 fragColor;

void main() {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    fragColor = color;
}

`