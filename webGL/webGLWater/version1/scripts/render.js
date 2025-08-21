function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawWater(gl);
    drawSky(gl);
}

function drawWater(gl) {
    let programInfo = getShaderProgram(gl, waterVert, waterFrag, waterAttributeObject);
    finaliseProgram(programInfo, waterAttributeObject);
    
    setUniforms(gl, programInfo, data1f, data3fv, data4fv, dataMat4);

    gl.drawArrays(gl.TRIANGLES, 0, waterAttributeObject.vertexCount);

    deleteShaderProgram(gl, programInfo);  
}

function drawSky(gl) {
    let programInfo = getShaderProgram(gl, skyVert, skyFrag, skyAttributeObject);
    finaliseProgram(programInfo, skyAttributeObject);

    setUniforms(gl, programInfo, data1f, data3fv, data4fv, dataMat4);

    gl.drawArrays(gl.TRIANGLES, 0, skyAttributeObject.vertexCount);

    deleteShaderProgram(gl, programInfo);  
}