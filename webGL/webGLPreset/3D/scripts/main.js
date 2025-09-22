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
    camera = new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, 0), 1);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            start();
        } else {
            clearInterval(interval);
        }
    });

    initDefault(gl);
}

function initDefault(gl) {
    let width = 50;
    let height = 50;
    let depth = 50;
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let bisections = 4;

    let mesh = generateCubeTrianglesFloat32(width, height, depth, centerX, centerY, centerZ, bisections);

    defaultAttributeObject = {
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

    initBuffers(gl, defaultAttributeObject);
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
}