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
        setListeners();
        setup();
        start();
    } catch (error) {
        alert(error.stack);
    }
}

function canvasSetup() {
    glcanvas.width = glcanvas.clientWidth;
    glcanvas.height = glcanvas.clientHeight;

    gl = glcanvas.getContext('webgl2');
}

function setup() {
    camera = new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, 0));

    initWater(gl);
    initSky(gl);
}

function initWater(gl) {
    let width = 10000;
    let height = 50;
    let depth = 5000;
    let centerX = 0;
    let centerY = -150;
    let centerZ = depth / -2;
    let bisections = 10;

    let waterMesh = generatePlaneTriangles(width, 0, depth, centerX, centerY, centerZ, bisections).map((a) => a.array()).flat();

    waterAttributeObject = {
        locations: ["aVertexPosition"],
        "aVertexPosition": {
            buffer: waterMesh,

            numComponents: 3, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        vertexCount: waterMesh.length,
    }

    initBuffers(gl, waterAttributeObject);
}

function initSky(gl) {
    let skyPositions = [];
    let skyColors = [];

    let skyMesh = getSkyMesh();

    for (let i = 0; i < skyMesh.length; i++) {
        skyPositions.push(...skyMesh[i].array());
        skyColors.push(...data4fv.uSkyColor.array());
    }
    
    skyAttributeObject = {
        locations: ["aVertexPosition"],
        "aVertexPosition": {
            buffer: skyPositions,

            numComponents: 3, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        vertexCount: skyMesh.length,
    }

    initBuffers(gl, skyAttributeObject);
}

function getSkyMesh() {
    return generateIcosphereTriangles(skyDepth * 2, skyDepth * 2, skyDepth * 2, 0, 0, 0, 3);
}

function setListeners() {
    document.body.addEventListener("fullscreenchange", (e) => {
        glcanvas.width = glcanvas.clientWidth;
        glcanvas.height = glcanvas.clientHeight;
        gl.viewport(0, 0, glcanvas.width, glcanvas.height);
    });
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
    Terminal.clear();

    camera.tick();

    update();
    render();
}

function update() {
    data1f.uTick++;
    data3fv.uCameraPosition = camera.position;
    data3fv.uCameraRotations = camera.rotations;

    let FoV = data1f.uFoV;
    let aspect = gl.canvas.width / gl.canvas.height;
    let zNear = data1f.uZNear;
    let zFar = data1f.uZFar;
    let rotationsArray = data3fv.uCameraRotations.array();
    let translationsArray = data3fv.uCameraPosition.array();

    dataMat4.uProjectionMatrix = getMat4Projection(FoV, aspect, zNear, zFar);
    dataMat4.uModelViewMatrix = getMat4ModelView(rotationsArray, translationsArray);

    data3fv.uSunRotations.add(data3fv.uSunRotationSpeed);
    data3fv.uSunPosition = data3fv.uSunDefaultPosition.rotateRad(data3fv.uSunRotations);
    data3fv.uSunViewPosition = dataMat4.uModelViewMatrix.multiplyVector(data3fv.uSunPosition.toVector4()).toVector3();
}