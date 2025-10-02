let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let matrices = [];

let loop;
let tickRate = 16;
let tick = 0;
let interpolationRate = 250;

let numMatrices = 2;
let iterations = 8;
let randomiseMatrices = true;
let keepIntermediatePoints = true;

let rotations1 = [
    new Vector2( 0 , 0 ),
    new Vector2( 0 , 0 ),
    new Vector2( 0 , 0 ),
];

let translations1 = [
    new Vector2( -0.5 ,  0.433 ),
    new Vector2(  0   , -0.433 ),
    new Vector2(  0.5 ,  0.433 ),
];

let shears1 = [
    new Vector2(0, 0),
    new Vector2(0, 0),
    new Vector2(0, 0),
];

let scales1 = [
    0.5,
    0.5,
    0.5,
];

let rotations2 = [
    new Vector2( Math.PI * 2 , 0 ),
    new Vector2( Math.PI * 2 , 0 ),
    new Vector2( Math.PI * 2 , 0 ),
];

let translations2 = [
    new Vector2( -0.5 ,  0.433 ),
    new Vector2(  0   , -0.433 ),
    new Vector2(  0.5 ,  0.433 ),
];

let shears2 = [
    new Vector2(0, 0),
    new Vector2(0, 0),
    new Vector2(0, 0),
];

let scales2 = [
    0.5,
    0.5,
    0.5,
];

function onload() {
    Terminal.init();
    Terminal.setOpacity(0);

    document.body.addEventListener("keydown", (e) => {
        if (e.key == "Backspace") {
            if (loop) {
                clearInterval(loop);
                loop = undefined;
            } else {
                startLoop();
            }
        }
    })

    try {
        setup();
        startLoop();
    } catch (error) {
        Terminal.error(error);
    }
}

function setup() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    ctx.translate(canvas.width / 2, canvas.height / 2);

    if (!randomiseMatrices) {
        numMatrices = translations1.length;
    }

    setupMatrix1Components();
    setupMatrix2Components();
}

function setupMatrix1Components() {
    if (randomiseMatrices) {
        for (let i = 0; i < numMatrices; i++) {
            let matrixType = Math.floor(Math.random());

            rotations1[i] = Vector2.rand().scaled(Math.PI * 2);
            shears1[i] = Vector2.rand().scaled(2).difference(new Vector2(1));

            translations1[i] = Vector2.rand().scaled(2).difference(new Vector2(1));

            scales1[i] = 0.5;
        }
    }
}

function setupMatrix2Components() {
    if (randomiseMatrices) {
        for (let i = 0; i < numMatrices; i++) {
            rotations2[i] = Vector2.rand().scaled(Math.PI * 2);

            shears2[i] = Vector2.rand().scaled(2).difference(new Vector2(1));
            translations2[i] = Vector2.rand().scaled(2).difference(new Vector2(1));

            scales2[i] = 0.5;
        }
    }
}

function swapMatrices() {
    let rotations = rotations1;
    let translations = translations1;
    let shears = shears1;
    let scales = scales1;

    rotations1 = rotations2;
    translations1 = translations2;
    shears1 = shears2;
    scales1 = scales2;

    rotations2 = rotations;
    translations2 = translations;
    shears2 = shears;
    scales2 = scales;
}

function startLoop() {
    loop = setInterval(function() {
        try {
            update();
            draw();
        } catch (error) {
            Terminal.error(error);
        }
    }, tickRate)
}

function update() {
    if (tick >= interpolationRate) {
        tick = 0;

        swapMatrices();
        setupMatrix2Components();
    }

    let interpolationWeight = ease((tick / interpolationRate) % 1);

    for (let i = 0; i < rotations1.length; i++) {
        let rotations = rotations1[i].lerp(rotations2[i], interpolationWeight);
        let translations = translations1[i].lerp(translations2[i], interpolationWeight);
        let shears = shears1[i].lerp(shears2[i], interpolationWeight);
        let scale = scales1[i] + (scales2[i] - scales1[i]) * interpolationWeight;

        matrices[i] = Matrix.affineTransformation2D(rotations.array(), translations.array(), shears.array(), scale, 0);
    }

    tick++;
}

function draw() {
    ctx.fillStyle = "white";

    let points = [Matrix.from(3, 1,
        [
            [0,],
            [0,],
            [1,],
        ]
    )];

    let matricesLength = matrices.length;

    if (keepIntermediatePoints) {
        for (let i = 0; i < iterations; i++) {
            let numPoints = Math.pow(matrices.length, i) - 1;
            let targetPoints = Math.pow(matrices.length, i + 1);

            let index = numPoints + 1;

            for (let j = numPoints; j < targetPoints; j++) {
                let point = points[j];

                for (let k = 0; k < matricesLength; k++) {
                    let matrix = matrices[k];

                    let newPoint = matrix.multiply(point);

                    points[index++] = newPoint;
                }

            }
        }
    } else {
        for (let i = 0; i < iterations; i++) {
            let newPoints = [];

            for (let j = 0; j < points.length; j++) {
                let point = points[j];

                for (let k = 0; k < matrices.length; k++) {
                    let matrix = matrices[k];

                    let newPoint = matrix.multiply(point);

                    newPoints.push(newPoint);
                }
            }

            points = newPoints;
        }
    }

    let buffer = new Uint8ClampedArray(canvas.width * canvas.height * 4);

    for (let i = 0; i < points.length; i++) {
        let point = points[i];

        let scale = canvas.height / 2;
        
        let x = (point.getValue(0, 0) * scale + canvas.width / 2);
        let y = (point.getValue(1, 0) * scale + canvas.height / 2);

        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
            continue;
        }

        let index = ((x << 0) + (y << 0) * canvas.width) * 4;

        buffer[index] = 255;
        buffer[index + 1] = 255;
        buffer[index + 2] = 255;
        buffer[index + 3] = 255;
    }

    ctx.putImageData(new ImageData(buffer, canvas.width), 0, 0);
}

function ease(value) {
    return Math2.easeinoutquad(value);
}