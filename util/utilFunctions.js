function extendArray(source, targetLength) {
    let newArr = [];

    let sourceLength = source.length;

    for (let i = 0; i < targetLength; i++) {
        newArr[i] = source[i % sourceLength];
    }

    return newArr;
}

function padArrayStart(source, targetLength, filler) {
    let newArr = [];

    let sourceLength = source.length;
    let diff = targetLength - sourceLength;

    for (let i = 0; i < targetLength; i++) {
        if (i >= diff) {
            newArr[i] = source[i - diff];
        } else {
            newArr[i] = filler;
        }
    }

    return newArr;
}

function padArrayEnd(source, targetLength, filler) {
    let newArr = [];

    let sourceLength = source.length;

    for (let i = 0; i < targetLength; i++) {
        if (i < sourceLength) {
            newArr[i] = source[i];
        } else {
            newArr[i] = filler;
        }
    }

    return newArr;
}

function resizeArray(source, width, height) {
    let newArray = [];

    for (let i = 0; i < width; i++) {
        newArray[i] = [];

        for (let j = 0; j < height; j++) {
            let index = i + j * width;

            newArray[i][j] = source[index];
        }
    }

    return newArray;
}

function fRandom(limit) {
    return Math.floor(Math.random() * limit);
}

function splitStringArray(string, delimiters) {
    const regex = new RegExp(`[${delimiters.join('')}]`);

    return string.split(regex);
}

function removeNewLines(string) {
    return string.split(/[\n]/).join(" ");
}

function isAlpha(string) {
    return /^[a-zA-Z]+$/.test(string);   
}

function isBasicCharacter(string) {
    return /^[a-zA-Z ,.!?]+$/.test(string);
}

function isNotCaps(string) {
    return !/^[A-Z]+$/.test(string);
}

function isCaps(string) {
    return /^[A-Z]+$/.test(string);
}

function isNumber(string) {
    return !isNaN(parseFloat(string)) && !isNaN(Number(string));
}

function isNotNumber(string) {
    return isNaN(parseFloat(string)) && isNaN(Number(string));
}

function generateCubeStrip(width, height, depth, centerX, centerY, centerZ) {
    let dimVec = new Vector3(width / 2, height / 2, depth / 2);
    let cenVec = new Vector3(centerX, centerY, centerZ);

    let pointConfig = [
        new Vector3( +1, -1, +1), // + + - 
        new Vector3( -1, -1, +1), // - + -
        new Vector3( +1, +1, +1), // + - -
        new Vector3( -1, +1, +1), // - - -

        new Vector3( +1, -1, -1), // + + +
        new Vector3( -1, -1, -1), // - + + 
        new Vector3( +1, +1, -1), // + - +
        new Vector3( -1, +1, -1), // - - +
    ].map(v => v.product(dimVec).sum(cenVec));

    let facesConfig = [3, 7, 1, 5, 4, 7, 6, 3, 2, 1, 0, 4, 2, 6];

    let positions = facesConfig.map(a => pointConfig[a]);

    return positions;
}

function generateSphereStrip(width, height, depth, centerX, centerY, centerZ, faces) {
    let positions = [];
    let vertices = [];

    let numVertices = Math.floor(Math.sqrt(faces));

    let rX = width / 2;
    let rY = height / 2;
    let rZ = depth / 2;

    for (let x = 0; x <= numVertices; x++) {
        for (let y = 0; y <= numVertices; y++) {
            let theta = 2 * Math.PI * (x / numVertices);
            let phi = Math.PI / 2 - Math.PI * (y / numVertices);

            let newX = centerX + rX * Math.cos(phi) * Math.cos(theta);
            let newY = centerY + rY * Math.cos(phi) * Math.sin(theta);
            let newZ = centerZ + rZ * Math.sin(phi);
            
            vertices.push(new Vector3(newX, newY, newZ));
        }
    }

    for (let i = numVertices; i < vertices.length; i++) {
        positions.push(vertices[i]);
        positions.push(vertices[i - numVertices]);
    }

    return positions;
}

function generateIcosphereTriangles(width, height, depth, centerX, centerY, centerZ, bisections = 0) {
    let dimVec = new Vector3(width / 2, height / 2, depth / 2);
    let cenVec = new Vector3(centerX, centerY, centerZ);

    let a = 0.525731112119133606;
    let c = 0.850650808352039932;

    let vertices = [
        new Vector3(0, c, -a), new Vector3(0, c, a),
        new Vector3(-c, a, 0), new Vector3(c, a, 0),
        new Vector3(-a, 0, -c), new Vector3(a, 0, -c),
        new Vector3(-a, 0, c), new Vector3(a, 0, c), 
        new Vector3(-c, -a, 0), new Vector3(c, -a, 0),
        new Vector3(0, -c, -a), new Vector3(0, -c, a),
    ];

    let indices = [
        [0, 2, 1], [0, 1, 3],
        [2, 0, 4], [3, 5, 0], [5, 4, 0],
        [2, 6, 1], [3, 1, 7], [7, 1, 6],
        [5, 3, 9], [4, 8, 2], 
        [7, 9, 3], [6, 2, 8], 
        [9, 7, 11], [8, 11, 6], [6, 11, 7], 
        [9, 10, 5], [8, 4, 10], [4, 5, 10],
        [11, 10, 9], [11, 8, 10],
    ];

    let faces = indices.map((a) => a.map((i) => vertices[i]));
    faces = bisectFaces(faces, bisections);

    return faces.flat().map((v) => v.normalised().product(dimVec).sum(cenVec));
}

function generateCubeTriangles(width, height, depth, centerX, centerY, centerZ, bisections = 0) {
    let dimVec = new Vector3(width / 2, height / 2, depth / 2);
    let cenVec = new Vector3(centerX, centerY, centerZ);

    let vertices = [
        new Vector3( +1, -1, -1), // + + - 
        new Vector3( -1, -1, -1), // - + -
        new Vector3( +1, +1, -1), // + - -
        new Vector3( -1, +1, -1), // - - -

        new Vector3( +1, -1, +1), // + + +
        new Vector3( -1, -1, +1), // - + + 
        new Vector3( +1, +1, +1), // + - +
        new Vector3( -1, +1, +1), // - - +
    ];

    let indices = [
        [0, 1, 2], [3, 2, 1], // front
        [5, 4, 7], [6, 7, 4], // back
        [4, 5, 0], [1, 0, 5], // top
        [7, 6, 3], [2, 3, 6], // bottom
        [1, 5, 3], [7, 3, 5], // left
        [4, 0, 6], [2, 6, 0], // right
    ]

    let faces = indices.map((a) => a.map((i) => vertices[i]));
    faces = bisectFaces(faces, bisections);

    return faces.flat().map((v) => v.product(dimVec).sum(cenVec));
}

function generateCubeTrianglesFloat32(width, height, depth, centerX, centerY, centerZ, bisections = 0) {
    let dimVec = new Vector3(width / 2, height / 2, depth / 2);
    let cenVec = new Vector3(centerX, centerY, centerZ);

    let vertices = [
        new Vector3( +1, -1, -1), // + + - 
        new Vector3( -1, -1, -1), // - + -
        new Vector3( +1, +1, -1), // + - -
        new Vector3( -1, +1, -1), // - - -

        new Vector3( +1, -1, +1), // + + +
        new Vector3( -1, -1, +1), // - + + 
        new Vector3( +1, +1, +1), // + - +
        new Vector3( -1, +1, +1), // - - +
    ];

    let indices = [
        [0, 1, 2], [3, 2, 1], // front
        [5, 4, 7], [6, 7, 4], // back
        [4, 5, 0], [1, 0, 5], // top
        [7, 6, 3], [2, 3, 6], // bottom
        [1, 5, 3], [7, 3, 5], // left
        [4, 0, 6], [2, 6, 0], // right
    ];

    vertices = vertices.map((v) => v.product(dimVec).sum(cenVec));

    let faces = new Float32Array(indices.length * 9);

    for (let i = 0; i < indices.length; i++) {
        let indices1 = indices[i];

        for (let j = 0; j < indices1.length; j++) {
            let vertexIndex = indices1[j];
            let faceIndex = (i * 3 + j) * 3;

            let vertex = vertices[vertexIndex];

            faces[faceIndex + 0] = vertex[0];
            faces[faceIndex + 1] = vertex[1];
            faces[faceIndex + 2] = vertex[2];
        }
    }

    faces = bisectFacesFloat32(faces, bisections);

    return faces;
}

function generatePlaneTriangles(width, height, depth, centerX, centerY, centerZ, bisections = 0) {
    let dimVec = new Vector3(width / 2, height / 2, depth / 2);
    let cenVec = new Vector3(centerX, centerY, centerZ);

    let vertices;

    if (width == 0) {
        vertices = [
            new Vector3( +0, +1, -1 ), 
            new Vector3( +0, -1, -1 ),
            new Vector3( +0, +1, +1 ),
            new Vector3( +0, -1, +1 ),
        ];
    } else if (height == 0) {
        vertices = [
            new Vector3( +1, +0, -1, ), 
            new Vector3( -1, +0, -1, ),
            new Vector3( +1, +0, +1, ),
            new Vector3( -1, +0, +1, ),
        ];
    } else {
        vertices = [
            new Vector3( +1, -1, +0 ), 
            new Vector3( -1, -1, +0 ),
            new Vector3( +1, +1, +0 ),
            new Vector3( -1, +1, +0 ),
        ];
    }

    let indices = [
        [0, 1, 2], [3, 2, 1],
    ];

    vertices = vertices.map((v) => v.product(dimVec).sum(cenVec))

    let faces = indices.map((a) => a.map((i) => vertices[i]));
    faces = bisectFaces(faces, bisections);

    return faces.flat();
}

function generatePlaneTrianglesFloat32(width, height, depth, centerX, centerY, centerZ, bisections = 0) {
    let dimVec = new Vector3(width / 2, height / 2, depth / 2);
    let cenVec = new Vector3(centerX, centerY, centerZ);

    let vertices;

    if (width == 0) {
        vertices = [
            new Vector3( +0, +1, -1 ), 
            new Vector3( +0, -1, -1 ),
            new Vector3( +0, +1, +1 ),
            new Vector3( +0, -1, +1 ),
        ];
    } else if (height == 0) {
        vertices = [
            new Vector3( +1, +0, -1, ), 
            new Vector3( -1, +0, -1, ),
            new Vector3( +1, +0, +1, ),
            new Vector3( -1, +0, +1, ),
        ];
    } else {
        vertices = [
            new Vector3( +1, -1, +0 ), 
            new Vector3( -1, -1, +0 ),
            new Vector3( +1, +1, +0 ),
            new Vector3( -1, +1, +0 ),
        ];
    }

    let indices = [
        [0, 1, 2], [3, 2, 1],
    ];

    vertices = vertices.map((v) => v.product(dimVec).sum(cenVec));

    let faces = new Float32Array(indices.length * 9);

    for (let i = 0; i < indices.length; i++) {
        let indices1 = indices[i];

        for (let j = 0; j < indices1.length; j++) {
            let vertexIndex = indices1[j];
            let faceIndex = (i * 3 + j) * 3;

            let vertex = vertices[vertexIndex];

            faces[faceIndex + 0] = vertex[0];
            faces[faceIndex + 1] = vertex[1];
            faces[faceIndex + 2] = vertex[2];
        }
    }

    faces = bisectFacesFloat32(faces, bisections);

    return faces;
}

function bisectFaces(faces, bisections) {
    for (let i = 0; i < bisections; i++) {
        let faces2 = [];

        for (let j = 0; j < faces.length; j++) {
            let triangle = faces[j];

            let v1 = triangle[0];
            let v2 = triangle[1];
            let v3 = triangle[2];

            let a = v2.average(v3);

            faces2.push([a, v1, v2]);
            faces2.push([a, v3, v1]);
        }

        faces = faces2;
    }

    return faces;
}

function bisectFacesFloat32(faces, bisections) {
    let numFaces = faces.length / 9;

    for (let i = 0; i < bisections; i++) {
        let faces1 = new Float32Array(9 * numFaces * Math.pow(2, i + 1));

        let numFaces1 = numFaces * Math.pow(2, i);

        for (let j = 0; j < numFaces1; j++) {
            let index = j * 9;
            let index1 = index * 2;

            let v1x = faces[index + 0];
            let v1y = faces[index + 1];
            let v1z = faces[index + 2];
            let v2x = faces[index + 3];
            let v2y = faces[index + 4];
            let v2z = faces[index + 5];
            let v3x = faces[index + 6];
            let v3y = faces[index + 7];
            let v3z = faces[index + 8];

            let ax = (v2x + v3x) / 2;
            let ay = (v2y + v3y) / 2;
            let az = (v2z + v3z) / 2;

            faces1.set([
                ax, ay, az, v1x, v1y, v1z, v2x, v2y, v2z,
                ax, ay, az, v3x, v3y, v3z, v1x, v1y, v1z,
            ], index1);
        }

        faces = faces1;
    }

    return faces;
}