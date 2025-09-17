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

    updateGLViewport(gl);
    initFBMData(gl);
    initWater(gl);
    initSky(gl);
}

function updateGLViewport(gl) {
    gl.canvas.width = gl.canvas.clientWidth * 2;
    gl.canvas.height = gl.canvas.clientHeight * 2;

    gl.viewport(0,  0, gl.canvas.width, gl.canvas.height);
}

function initFBMData(gl) {
    data1f.uMaxWaveHeight = data1f.uWaveAmplitude * (Math.pow(data1f.uWaveAmplitudeCoefficient, 64) - 1) / Math.log(data1f.uWaveAmplitudeCoefficient);

    let angles = [0.98357, 0.73059, 0.47862, 0.56404, 0.1599, 0.28853, 0.71755, 0.43247, 0.2393, 0.51203, 0.56075, 0.85771, 0.61639, 0.10093, 0.20997, 0.63789, 0.82568, 0.33663, 0.07618, 0.87707, 0.34708, 0.88552, 0.29124, 0.47331, 0.41146, 0.65129, 0.87395, 0.6366, 0.32362, 0.65516, 0.95098, 0.22788, 0.40042, 0.30581, 0.46496, 0.10434, 0.0909, 0.62398, 0.38642, 0.82563, 0.69811, 0.3348, 0.14689, 0.60052, 0.67853, 0.95456, 0.3192, 0.67709, 0.40134, 0.04644, 0.99679, 0.50986, 0.49725, 0.65742, 0.33486, 0.80419, 0.21789, 0.18337, 0.55184, 0.13563, 0.07618, 0.74147, 0.663, 0.72042, 0.92503, 0.56253, 0.71451, 0.90858, 0.89739, 0.78993, 0.54468, 0.00609, 0.79599, 0.11696, 0.07006, 0.08244, 0.96724, 0.44056, 0.34041, 0.42672, 0.9865, 0.17617, 0.14605, 0.73903, 0.56371, 0.08297, 0.98061, 0.35821, 0.87762, 0.59058, 0.03782, 0.00892, 0.40727, 0.55148, 0.39905, 0.6279, 0.77471, 0.9242, 0.72573, 0.28006, 0.69405, 0.6666, 0.12779, 0.55058, 0.86585, 0.17014, 0.52261, 0.76995, 0.93314, 0.8379, 0.86656, 0.95261, 0.71547, 0.54564, 0.49807, 0.94331, 0.55445, 0.61686, 0.33639, 0.52878, 0.34197, 0.19001, 0.11958, 0.08695, 0.65281, 0.34348, 0.10996, 0.49765,0.09362, 0.34827, 0.00993, 0.07558, 0.53859, 0.91732, 0.80014, 0.98812, 0.65268, 0.68423, 0.259, 0.3646, 0.08709, 0.9218, 0.25607, 0.22577, 0.53023, 0.60765, 0.75913, 0.29577, 0.9166, 0.7491, 0.14317, 0.03775, 0.1546, 0.1069, 0.89848, 0.50218, 0.55189, 0.94545, 0.01011, 0.12498, 0.32553, 0.81571, 0.92157, 0.55121, 0.34138, 0.00822, 0.12418, 0.38758, 0.47011, 0.45599, 0.06854, 0.7342, 0.47616, 0.64766, 0.24947, 0.24343, 0.75899, 0.66251, 0.23224, 0.94113, 0.61145, 0.86392, 0.42471, 0.23621, 0.45387, 0.9891, 0.85658, 0.78776, 0.46546, 0.81387, 0.16637, 0.98682, 0.0067, 0.6367, 0.31611, 0.35974, 0.28747, 0.87112, 0.06811, 0.91195, 0.84284, 0.70392, 0.42071, 0.70923, 0.79531, 0.31645, 0.05902, 0.15755, 0.31423, 0.45656, 0.78186, 0.32053, 0.1239, 0.00511, 0.96297, 0.37607, 0.79133, 0.41878, 0.20377, 0.6035, 0.14109, 0.04972, 0.224, 0.49348, 0.87414, 0.9392, 0.38333, 0.60021, 0.91692, 0.99375, 0.41669, 0.2625, 0.42759, 0.90415, 0.67967, 0.09555, 0.51575, 0.88961, 0.25969, 0.39532, 0.30462, 0.56787, 0.21215, 0.02806, 0.67391, 0.06699, 0.71782, 0.28794, 0.42456, 0.83148, 0.98304, 0.07357, 0.23059, 0.66286, 0.73111, 0.97262];
    let width = 16;
    let height = width;

    let randomiseAngles = false;

    if (randomiseAngles) {
        angles = angles.map((a) => parseFloat(Math.random().toFixed(5)));
        document.getElementById('output').textContent = angles;
    }

    let buffer = new Float32Array(width * height * 4 * 4);

    let frequency = data1f.uWaveFrequency;
    let frequencyCoefficient = data1f.uWaveFrequencyCoefficient;
    let amplitude = data1f.uWaveAmplitude;
    let amplitudeCoefficient = data1f.uWaveAmplitudeCoefficient;

    for (let i = 0; i < width * height; i++) {
        let angle = angles[i] * Math.PI * 2;
        let index = i * 4;

        let direction = new Vector2(Math.cos(angle), Math.sin(angle)).normalised();

        buffer[index + 0] = direction[0];
        buffer[index + 1] = direction[1];
        buffer[index + 2] = frequency;
        buffer[index + 3] = amplitude;
        
        frequency *= frequencyCoefficient;
        amplitude *= amplitudeCoefficient;
    }

    loadTexture(gl, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, buffer);
}

function initWater(gl) {
    let width = 20000 / 4;
    let height = 50;
    let depth = 10000 / 2;
    let centerX = 0;
    let centerY = -800;
    let centerZ = depth / -2;
    let bisections = 10;

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