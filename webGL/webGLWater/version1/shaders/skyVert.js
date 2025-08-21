let skyVert =

`#version 300 es
precision highp float;

in vec4 aVertexPosition;

out vec3 vPosition;
out vec3 vViewPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

void main() {
    vPosition = aVertexPosition.xyz;
    vViewPosition = (uModelViewMatrix * aVertexPosition).xyz;

    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
    
`