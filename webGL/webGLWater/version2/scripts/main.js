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
    gl = glcanvas.getContext('webgl2');
    gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_float_linear');
}

function setup() {
    camera = new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, 0));

    initWater(gl);
    initSky(gl);
}

function initWater(gl) {
    let width = 20000 / 4;
    let height = 50;
    let depth = 10000 / 2;
    let centerX = 0;
    let centerY = -1000;
    let centerZ = depth / -2;
    let bisections = 10;

    data1f.uMaxWaveHeight = data1f.uWaveAmplitude * (Math.pow(data1f.uWaveAmplitudeCoefficient, 64) - 1) / Math.log(data1f.uWaveAmplitudeCoefficient);

    data2fv.uWaterDimensions = new Vector2(width, depth);
    data2fv.uWaterPosition = new Vector2(centerX, centerZ);

    let waterMesh;

    let useFloatInstantiation = true;

    let benchmarker = new Benchmarker("Performance");

    if (useFloatInstantiation) {
        waterMesh = generatePlaneTrianglesFloat32(width, 0, depth, centerX, centerY, centerZ, bisections);
    } else {
        waterMesh = new Float32Array(generatePlaneTriangles(width, 0, depth, centerX, centerY, centerZ, bisections).map((a) => a.array()).flat());
    }

    benchmarker.add();

    Terminal.print(benchmarker);

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
        vertexCount: waterMesh.length / 3,
    }

    initBuffers(gl, waterAttributeObject);
}

function initSky(gl) {
    let skyPositions = [];

    let skyMesh = generateIcosphereTriangles(skyDepth * 2, skyDepth * 2, skyDepth * 2, 0, 0, 0, 2);

    for (let i = 0; i < skyMesh.length; i++) {
        skyPositions.push(...skyMesh[i].array());
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
    Terminal.show();

    let benchmarker = new Benchmarker("Performance");

    camera.tick();

    update();
    render();

    benchmarker.add();
    
    Terminal.print(benchmarker);
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

    dataMat4.uProjectionMatrix = getMat4Projection(FoV, aspect, zNear, zFar);
    dataMat4.uModelViewMatrix = getMat4ModelView(rotationsArray, translationsArray);

    data3fv.uSunRotations.add(data3fv.uSunRotationSpeed.scaled(data1f.uTickSpeed));
    data3fv.uSunPosition = data3fv.uSunDefaultPosition.rotateRad(data3fv.uSunRotations);
    data3fv.uSunViewPosition = dataMat4.uModelViewMatrix.multiplyVector(data3fv.uSunPosition.toVector4()).toVector3();
}