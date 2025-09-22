let skyVertexShader =

`#version 300 es
precision highp float;

in vec4 aVertexPosition;

out vec4 vPosition;
out vec4 vModelViewPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    vPosition = aVertexPosition;
    vModelViewPosition = uModelViewMatrix * aVertexPosition;

    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
    
`