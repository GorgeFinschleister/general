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

    drawDefault(gl);
}

function drawDefault(gl) {
    let programInfo = getShaderProgram(gl, vertexShader, fragmentShader, defaultAttributeObject);

    finaliseProgram(programInfo, defaultAttributeObject);
    setUniforms(gl, programInfo, data1f, data2fv, data3fv, data4fv, dataMat4);

    gl.drawArrays(gl.TRIANGLES, 0, defaultAttributeObject.vertexCount);

    deleteShaderProgram(gl, programInfo);  
}