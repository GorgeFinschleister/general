class Camera {
    constructor(position, rotations, mouseTarget = document.body, keyTarget = mouseTarget) {
        this.position = position;
        this.rotations = rotations;

        this.mouseTarget = mouseTarget;
        this.keyTarget = keyTarget;

        this.velocityMax = 5;
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

        this.mouseListener = new MouseListener(this.mouseTarget, 
            {
                mousemove: (e) => {
                    if (!this.readingMouse) {
                        return;
                    }
                    
                    let totalRotation = Math.PI * 2;

                    let locX = e.movementX;
                    let locY = e.movementY;
                    let ratioX = locX / this.mouseTarget.clientWidth;
                    let ratioY = -locY / this.mouseTarget.clientHeight;

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

        this.keyboardListener = new KeyboardListener(this.keyTarget,
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
                            await this.keyTarget.requestFullscreen();
                            await this.keyTarget.requestPointerLock();
                        }
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

let canvas;
let ctx;

let camera;

let loop;
let tickRate = 16;
let tick = 0;
let useRealTime = false;

let width = 1920;
let height = 1080;
let sourceWidth = 1920;
let sourceHeight = 1080;
let depth = 1000;
let bounces = 250;
let passes = 1;

let backgroundColor = new Vector4(0.25, 0.25, 0.25, 1);

let containerColor = new Vector4(1, 1, 1, 1);
let containerEmissiveColor = new Vector4(1, 1, 1, 1);
let containerRoughness = 0.0;
let containerEmissiveStrength1 = 0;
let containerEmissiveStrength2 = 0.25;

let objects = [
    {
        type: "sphere",
        position: new Vector3(-100, 0, 0),
        radius: 50,

        color: new Vector4(1, 0, 0, 1),
        emissionColor: new Vector4(1),
        emissionStrength: 0,
        roughness: 0.0,
    },
    {
        type: "sphere",
        position: new Vector3(100, 0, 0),
        radius: 50,

        color: new Vector4(0, 0, 1, 1),
        emissionColor: new Vector4(1),
        emissionStrength: 0,
        roughness: 0.0,
    },
    
    

    // width
    {
        type: "plane",
        position: new Vector3(-250, 0, 0),
        radius: 5000,

        normal: new Vector3(1, 0, 0),

        color: containerColor,
        emissionColor: containerEmissiveColor,
        emissionStrength: containerEmissiveStrength1,
        roughness: containerRoughness,
    },
    {
        type: "plane",
        position: new Vector3(250, 0, 0),
        radius: 5000,

        normal: new Vector3(-1, 0, 0),

        color: containerColor,
        emissionColor: containerEmissiveColor,
        emissionStrength: containerEmissiveStrength1,
        roughness: containerRoughness,
    },

    // height
    {
        type: "plane",
        position: new Vector3(0, -250, 0),
        radius: 5000,

        normal: new Vector3(0, 1, 0),

        color: containerColor,
        emissionColor: containerEmissiveColor,
        emissionStrength: containerEmissiveStrength2,
        roughness: containerRoughness,
    },
    {
        type: "plane",
        position: new Vector3(0, 250, 0),
        radius: 5000,

        normal: new Vector3(0, -1, 0),

        color: containerColor,
        emissionColor: containerEmissiveColor,
        emissionStrength: containerEmissiveStrength2,
        roughness: containerRoughness,
    },

    // depth
    {
        type: "plane",
        position: new Vector3(0, 0, 250),
        radius: 5000,

        normal: new Vector3(0, 0, -1),

        color: containerColor,
        emissionColor: containerEmissiveColor,
        emissionStrength: containerEmissiveStrength1,
        roughness: containerRoughness,
    },
    {
        type: "plane",
        position: new Vector3(0, 0, -250),
        radius: 5000,

        normal: new Vector3(0, 0, 1),

        color: containerColor,
        emissionColor: containerEmissiveColor,
        emissionStrength: containerEmissiveStrength1,
        roughness: containerRoughness,
    },
];

function onload() {
    try {
        Terminal.init();
        Terminal.setOpacity(0.1);
        setup();
        beginLoop();
    } catch (error) {
        alert(error.stack);
    }
}

function setup() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    camera = new Camera(new Vector3(0, 0, -250), new Vector3(0), canvas, document.body);
}

function beginLoop() {
    if (useRealTime) {
        loop = setInterval(function() {
            try {
                update();
                draw();
            } catch (error) {
                Terminal.error(error);
            }
        }, tickRate);
    } else {
        update();
        draw();
    }
}

function update() {
    tick++;

    camera.tick();

    width = canvas.width;
    height = canvas.height;
}

async function draw() {
    let chunkSize = Math.round(width / 1);

    let benchmarker = new Benchmarker(`Render Time (Frame #${tick})`)

    let halfWidth = width / 2;
    let halfHeight = height / 2;

    let resolutionScaleVector = new Vector3(sourceWidth / width, sourceHeight / height, 1);
    let cameraPosition = camera.position.clone();
    let cameraRotations = camera.rotations.clone();

    for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
            let position = cameraPosition.product(resolutionScaleVector);
            let direction = new Vector3(i - halfWidth, j - halfHeight, depth).product(resolutionScaleVector).rotateRad(cameraRotations).normalised();

            let color = new Vector4(0);

            for (let k = 0; k < passes; k++) {
                color.add(raytrace(position, direction));
            }

            color.scale(256 / passes);
            color.floor();

            ctx.fillStyle = `rgba(${color.x}, ${color.y}, ${color.z}, 1)`;
            ctx.fillRect(i, j, 1, 1);
            
        
            if ((i + j * width) % chunkSize == 0) {
                Terminal.clear();
                Terminal.print(`${Number(((i + j * width) / (width * height) * 100).toFixed(2))}% done.`);
                await sleep(0);
            }
        }
    }

    benchmarker.add();
    Terminal.print(benchmarker);
}

function raytrace(position, direction) {
    let incomingLight = new Vector4(0);
    let rayColor = new Vector4(1);

    for (let i = -1; i < bounces; i++) {
        let nearestObject;
        let nearestDistance = Infinity;
        let nearestCollisionData;
        
        for (let object of objects) {
            let collisionData = getCollisionData(position, direction, object);

            if (collisionData.distance < nearestDistance) {
                nearestObject = object;
                nearestDistance = collisionData.distance;
                nearestCollisionData = collisionData;
            }
        }

        if (nearestObject) {
            let reflectionScatter = Vector3.random(-nearestObject.roughness, nearestObject.roughness).scaled(Math.PI);

            position = nearestCollisionData.collisionPosition;
            direction = direction.reflect(nearestCollisionData.normal).rotateRad(reflectionScatter);

            let emittedLight = nearestObject.emissionColor.scaled(nearestObject.emissionStrength);

            incomingLight.add(emittedLight.product(rayColor));
            rayColor.multiply(nearestObject.color);
        } else {
            incomingLight.add(backgroundColor.product(rayColor));
            break;
        }
    }

    return incomingLight;
}

function getCollisionData(position, direction, object) {
    if (object.type == "sphere") {
        return raySphereIntersection(position, direction, object);
    } else if (object.type == "plane") {
        return rayPlaneIntersection(position, direction, object);
    }
}

function raySphereIntersection(position, direction, object) {
    let position1 = position.difference(object.position);

    let a = direction.dotProd(direction);
    let b = 2 * position1.dotProd(direction);
    let c = position1.dotProd(position1) - object.radius * object.radius;

    let numerator = -b / (2 * a);
    let sqrt = Math.sqrt(b * b - 4 * a * c) / (2 * a);

    let x1 = numerator + sqrt;
    let x2 = numerator - sqrt;

    if (x1 < 0) {
        x1 = Infinity;
    }
    if (x2 < 0) {
        x2 = Infinity;
    }
    
    let x = Math.round(Math.min(x1, x2)) - 1;

    if (Number.isFinite(x) && x >= 0) {
        let collisionPosition = position.sum(direction.scaled(x));
        let normal = collisionPosition.difference(object.position).normalised();

        return {
            distance: x,
            collisionPosition: collisionPosition,
            normal: normal,
        }
    } else {
        return Infinity;
    }
}

function rayPlaneIntersection(position, direction, object) {
    let objectNormal = object.normal;

    let denom = direction.dotProd(objectNormal);
    let x = Math.round(object.position.difference(position).dotProd(objectNormal) / denom) - 1;
    
    if (Number.isFinite(x) && x >= 0) {
        let collisionPosition = position.sum(direction.scaled(x));
        let normal = direction.dotProd(objectNormal) > 0 ? objectNormal : objectNormal.scaled(-1);

        return {
            distance: x,
            collisionPosition: collisionPosition,
            normal: normal,
        }
    } else {
        return Infinity;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); 
}