function render() {
    let depthTest = true;
    let backfaceCulling = false;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    if (depthTest) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }

    if (backfaceCulling) {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawSky(gl);
    drawPlane(gl);
}

function drawSky(gl) {
    let programInfo = getShaderProgram(gl, skyVertexShader, skyFragmentShader, skyAttributeObject);

    finaliseProgram(programInfo, skyAttributeObject);
    setUniforms(gl, programInfo, data1f, data2fv, data3fv, data4fv, dataMat4);

    gl.drawArrays(gl.TRIANGLES, 0, skyAttributeObject.vertexCount);

    deleteShaderProgram(gl, programInfo);  
}

function drawPlane(gl) {
    let programInfo = getShaderProgram(gl, planeVertexShader, planeFragmentShader, planeAttributeObject);

    finaliseProgram(programInfo, planeAttributeObject);
    setUniforms(gl, programInfo, data1f, data2fv, data3fv, data4fv, dataMat4);

    gl.drawArrays(gl.TRIANGLES, 0, planeAttributeObject.vertexCount);

    deleteShaderProgram(gl, programInfo);  
}