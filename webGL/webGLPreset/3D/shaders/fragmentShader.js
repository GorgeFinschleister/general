let fragmentShader = 

`#version 300 es
precision highp float;

flat in vec4 vColor;

layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = vColor;
}

`