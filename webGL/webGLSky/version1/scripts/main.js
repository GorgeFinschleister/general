let glcanvas = document.getElementById('glcanvas');
let gl;

let interval;
let tickRate = 16;
let dt = 1;

let camera;

function onload() {
    try {
        Terminal.init();
        Terminal.hide();

        canvasSetup();
        setup();
        start();
    } catch (error) {
        alert(error.stack);
    }
}

function canvasSetup() {
    gl = glcanvas.getContext('webgl2');
    gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_float_linear');

    updateGLViewport(gl);
}

function setup() {
    camera = new Camera(new Vector3(0, -(data1f.uSkyDiameter / 2 - data1f.uSkyHeight) - 10, 0), new Vector3(0, 0, 0), 1);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            start();
        } else {
            clearInterval(interval);
        }
    });

    initSky(gl);
    initPlane(gl);
}

function initSky(gl) {
    let width = data1f.uSkyDiameter;
    let height = data1f.uSkyDiameter;
    let depth = data1f.uSkyDiameter;
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let bisections = 2;

    let mesh = generateIcosphereTriangles(width, height, depth, centerX, centerY, centerZ, bisections).map((a) => a.array()).flat();

    skyAttributeObject = {
        locations: ["aVertexPosition"],
        "aVertexPosition": {
            buffer: mesh,

            numComponents: 3, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        vertexCount: mesh.length / 3,
    }

    initBuffers(gl, skyAttributeObject);
}

function initPlane(gl) {
    let width = data1f.uSkyDiameter - data1f.uSkyHeight * 2;
    let height = 0;
    let depth = data1f.uSkyDiameter - data1f.uSkyHeight * 2;
    let centerX = 0;
    let centerY = data1f.uSkyDiameter / 2 - data1f.uSkyHeight;
    let centerZ = 0;
    let bisections = 0;

    let mesh = generatePlaneTrianglesFloat32(width, height, depth, centerX, centerY, centerZ, bisections)

    planeAttributeObject = {
        locations: ["aVertexPosition"],
        "aVertexPosition": {
            buffer: mesh,

            numComponents: 3, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        vertexCount: mesh.length / 3,
    }

    initBuffers(gl, planeAttributeObject);
}

function start() {
    interval = setInterval(function() {
        try {
            tick();
        } catch (error) {
            Terminal.error(error); 
        }
    }, tickRate);
}

function tick() {
    camera.tick();

    update();
    render();
}

function update() {
    data1f.uTick += data1f.uTickSpeed;
    data3fv.uCameraPosition = camera.position;
    data3fv.uCameraRotations = camera.rotations;

    let FoV = data1f.uFoV;
    let aspect = gl.canvas.width / gl.canvas.height;
    let zNear = data1f.uZNear;
    let zFar = data1f.uZFar;
    let rotationsArray = data3fv.uCameraRotations.array();
    let translationsArray = data3fv.uCameraPosition.array();

    dataMat4.uProjectionMatrix = Matrix.projection3D(FoV, aspect, zNear, zFar);
    dataMat4.uModelViewMatrix = Matrix.affineTransformation3D(rotationsArray, translationsArray);

    data3fv.uSunRotations.add(data3fv.uSunRotationSpeed);
    data3fv.uSunRotations = data3fv.uSunRotations.mod(Math.PI * 2);
    data3fv.uSunPosition = data3fv.uSunPositionDefault.rotateRad(data3fv.uSunRotations);
    data3fv.uSunModelViewPosition = dataMat4.uModelViewMatrix.multiply(data3fv.uSunPosition.toVector4().toColumnMatrix()).columnToVector(0).toVector3();

    data3fv.uMoonRotations.add(data3fv.uMoonRotationSpeed);
    data3fv.uMoonRotations = data3fv.uMoonRotations.mod(Math.PI * 2);
    data3fv.uMoonPosition = data3fv.uMoonPositionDefault.rotateRad(data3fv.uMoonRotations);
    data3fv.uMoonModelViewPosition = dataMat4.uModelViewMatrix.multiply(data3fv.uMoonPosition.toVector4().toColumnMatrix()).columnToVector(0).toVector3();
}