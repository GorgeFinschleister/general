//    _____    __   __   _    __    _____     _____     _____    _    __    _____ 
//   /=====|   ||   ||   |\   ||   /=====\   |=====|   |=====|   |\   ||   /=====\
//   ||___     ||   ||   |\\  ||   |/   //     |=|       |=|     |\\  ||   |\____ 
//   |====|    ||   ||   || = ||   ||          |=|       |=|     || = ||   \=====\
//   ||        |\___/|   ||  \\|   |\___\\     |=|      _|=|_    ||  \\|   _____/|
//   ||        \=====/   ||   \|   \=====/     |=|     |=====|   ||   \|   \=====/
//   



function updateGLViewport(gl) {
    gl.canvas.width = gl.canvas.clientWidth * 2;
    gl.canvas.height = gl.canvas.clientHeight * 2;

    gl.viewport(0,  0, gl.canvas.width, gl.canvas.height);
}

function getShaderProgram(gl, vs, fs, attributeObject) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);
    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }

    let locations = attributeObject.locations;

    let attribLocations = {};

    for (let i = 0; i < locations.length; i++) {
        let currAttribLocationName = locations[i];
        let currAttribLocation = gl.getAttribLocation(shaderProgram, currAttribLocationName);

        attribLocations[currAttribLocationName] = currAttribLocation;
    }

    const programInfo = {
        program: shaderProgram,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        attribLocations: attribLocations,
    };

    return programInfo;
}

function setVertexAttribute(gl, buffer, location, numComponents, type, normalize, stride, offset) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(location, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(location);
}

function initBuffers(gl, attributeObject) {
    let locations = attributeObject.locations;

    for (let i = 0; i < locations.length; i++) {
        let currAttribLocationName = locations[i];
        let currBuffer = attributeObject[currAttribLocationName].buffer;

        let newBuffer = createBuffer(gl, new Float32Array(currBuffer));
        attributeObject[currAttribLocationName].bufferInstantiated = newBuffer;
    }
}

function createBuffer(gl, bufferContent) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferContent, gl.STATIC_DRAW);

    return buffer;
}

function finaliseProgram(programInfo, attributeObject) {
    let locations = attributeObject.locations;

    let attribLocations = programInfo.attribLocations;

    for (let i = 0; i < locations.length; i++) {
        let currAttribLocationName = locations[i];
        let currAttribLocation = attribLocations[currAttribLocationName];
        let currBuffer = attributeObject[currAttribLocationName].bufferInstantiated;
        let currBufferData = attributeObject[currAttribLocationName];

        setVertexAttribute(gl, currBuffer, currAttribLocation, currBufferData.numComponents, currBufferData.type, currBufferData.normalize, currBufferData.stride, currBufferData.offset);
    }

    gl.useProgram(programInfo.program);
}

function setUniforms(gl, programInfo, data1f, data2fv, data3fv, data4fv, dataMat4) {
    let shaderProgram = programInfo.program;

    Object.keys(data1f).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform1f(uniformLocation, data1f[key]);
    });

    Object.keys(data2fv).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform2fv(uniformLocation, data2fv[key].array());
    });

    Object.keys(data3fv).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform3fv(uniformLocation, data3fv[key].array());
    });

    Object.keys(data4fv).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform4fv(uniformLocation, data4fv[key].array());
    });

    Object.keys(dataMat4).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniformMatrix4fv(uniformLocation, false, dataMat4[key].float32Array(1));
    });
}

function deleteShaderProgram(gl, programInfo) {
    let program = programInfo.program;
    let vertexShader = programInfo.vertexShader;
    let fragmentShader = programInfo.fragmentShader;

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error occurred compiling the ${type} shader: ${gl.getShaderInfoLog(shader)}`);
        return null;
    }

    return shader;
}

function loadTextureURL(gl, url) {
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    
    const image = new Image();
    image.onload = () => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    
    image.src = url;

    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
}

function loadTextureImage(gl, texture, level, internalFormat, srcFormat, srcType, image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image,
    );

    if ((image.width && (image.width - 1)) === 0 && (image.height && (image.height - 1)) === 0) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}

function loadTexture(gl, level, internalFormat, width, height, border, srcFormat, srcType, textureArray) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, textureArray);

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}



//
//    _____     _    _     _____     ___       _____     ____      _____
//   /=====\   |=|  |=|   /=====\   |====\    /=====|   /====\    /=====\
//   |\____    |=|__|=|   ||___||   ||   \\   ||___     ||___\\   |\____
//   \=====\   |======|   |=====|   ||   ||   ||===|    |=====/   \=====\
//   _____/|   |=|  |=|   |/   \|   ||___//   ||____    ||  \\    _____/|
//   \=====/   |=|  |=|   ||   ||   |====/    \=====|   ||   \\   \=====/
//



let defaultVertexShader =

`#version 300 es
precision highp float;

in vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}

`

let defaultFragmentShader = 

`#version 300 es
precision highp float;

layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = vec4(1.0);
}

`


//
//    _____    ___        _____     _____     _____     _____     _____ 
//   /=====\   |=|       /=====\   /=====\   /=====\   /=====|   /=====\
//   |/   //   |=|       ||___||   |\____    |\____    ||___     |\____ 
//   ||        |=|       |=====|   \=====\   \=====\   ||===|    \=====\
//   |\___\\   |=|___    |/   \|   _____/|   _____/|   ||____    _____/|
//   \=====/   |=====|   ||   ||   \=====/   \=====/   \=====|   \=====/
//



class Camera {
    constructor(position, rotations, speed = 5) {
        this.position = position;
        this.rotations = rotations;

        this.velocityMax = speed;
        this.friction = 0.95;

        this.velocity = Vector3.neutral();
        this.acceleration = new Vector3(this.velocityMax / 2);

        this.setup();
        
        this.readingMouse = true;
    }

    toggleReadingMouse() {
        this.readingMouse = !this.readingMouse;
    }

    stopReadingMouse() {
        this.readingMouse = false;
    }

    startReadingMouse() {
        this.readingMouse = true;
    }

    setup() {
        this.pressedKeys = {};

        this.mouseListener = new MouseListener(document.body, 
            {
                mousemove: (e) => {
                    if (!this.readingMouse) {
                        return;
                    }
                    
                    let totalRotation = Math.PI * 2;

                    let locX = e.movementX;
                    let locY = e.movementY;
                    let ratioX = locX / document.body.clientWidth;
                    let ratioY = locY / document.body.clientHeight;

                    let rotationVector = new Vector3(ratioY, ratioX, 0.0).scaled(totalRotation);

                    this.rotations.add(rotationVector);

                    if (this.rotations.x > Math.PI / 2) {
                        this.rotations.x = Math.PI / 2;
                    } else if (this.rotations.x < -Math.PI / 2) {
                        this.rotations.x = -Math.PI / 2;
                    }
                }
            }
        );

        this.keyboardListener = new KeyboardListener(document.body,
            {
                keydown: async (e) => {
                    let code = e.code;

                    if (e.altKey) {
                        e.preventDefault();
                    }

                    if (code == "KeyF") {
                        if (document.fullscreenElement) {
                            await document.exitFullscreen();
                            document.exitPointerLock();
                        } else {
                            await document.body.requestFullscreen();
                            await document.body.requestPointerLock();
                        }

                        updateGLViewport(gl);
                    } else if (code == "Backquote") {
                        Terminal.toggleVisibility();
                    } else if (code == "Backspace") {
                        this.toggleReadingMouse();
                    }

                    this.pressedKeys[code] = true;
                },
                keyup: (e) => {
                    let code = e.code;

                    if (e.altKey) {
                        e.preventDefault();
                    }

                    this.pressedKeys[code] = false;
                }
            }
        );
    }

    tick() {
        let position = this.position;
        let rotations = this.rotations;
        let velocity = this.velocity;
        let acceleration = this.acceleration;
        let pressedKeys = this.pressedKeys;

        let sprintScale = pressedKeys["AltLeft"] ? 2 : 1;

        let movementStepX = acceleration.vectorX().rotateRad(rotations.vectorY().scaled(-1), Vector3.neutral()).scaled(sprintScale);
        let movementStepY = acceleration.vectorY().scaled(sprintScale);
        let movementStepZ = acceleration.vectorZ().rotateRad(rotations.vectorY().scaled(-1), Vector3.neutral()).scaled(sprintScale);

        if (pressedKeys["KeyA"]) {
            velocity.add(movementStepX);
        }
        if (pressedKeys["KeyD"]) {
            velocity.subtract(movementStepX);
        }
        if (pressedKeys["KeyW"]) {
            velocity.add(movementStepZ);
        }
        if (pressedKeys["KeyS"]) {
            velocity.subtract(movementStepZ);
        }
        if (pressedKeys["ShiftLeft"]) {
            velocity.add(movementStepY);
        }
        if (pressedKeys["Space"]) {
            velocity.subtract(movementStepY);
        }

        let totalVelocity = velocity.magnitude();
        if (totalVelocity > this.velocityMax * sprintScale) {
            velocity.scale(this.velocityMax * sprintScale / totalVelocity);
        }

        position.add(velocity);
        velocity.scale(this.friction);
    }
}