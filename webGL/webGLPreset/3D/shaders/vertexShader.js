let vertexShader =

`#version 300 es
precision highp float;

in vec4 aVertexPosition;

flat out vec4 vColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    vColor = aVertexPosition / 100.0 + 0.5;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
    
`