let activationFunctions = {
    sigmoid: {
        function: (x) => {
            return 1 / (1 + Math.exp(-1 * x));
        },
        derivative: (x) => {
            return x * (1 - x);
        },
    },
    relu: {
        function: (x) => {
            return x >= 0 ? x : 0;
        },
        derivative: (x) => {
            return x >= 0 ? 1 : 0;
        },
    },
    tanh: {
        function: (x) => {
            return Math.tanh(x);
        },
        derivative: (x) => {
            return 1 - (x * x);
        }
    },
}

let precision = 3;

let n = [2, 5, 5, 2];
let activations = [activationFunctions.sigmoid, activationFunctions.sigmoid, activationFunctions.sigmoid, activationFunctions.round];

let layers = n.length;
let m = 10;

let W = [];
let b = [];

let X = Matrix.from(m, 2, 
    [
        [150, 70], 
        [254, 73],
        [312, 68],
        [120, 60],
        [154, 61],
        [212, 65],
        [216, 67],
        [145, 67],
        [184, 64],
        [130, 69],
    ]
);

let y = Matrix.from(m, 2, 
    [
        [0, 1],
        [1, 0],
        [1, 0],
        [0, 1],
        [0, 1],
        [1, 0],
        [1, 0],
        [0, 1],
        [1, 0],
        [0, 1],
    ]
);

let X_norm;

let gSegmentDelimiter = /[\n]/;
let gValueDelimiter = /[,|;]/;
let printEpochs = false;

let _1_minus_x = (x) => {
    return 1 - x;
}

function onload() {
    Terminal.init();

    try {
        setup();
        resetNetwork();
    } catch (error) {
        Terminal.error(error);
    }
}

function loadData(file, doResetNetwork = false) {
    let reader = new FileReader();

    reader.onload = (e) => {
        let {extraData, inputs, outputs} = parseTextAsData(e.target.result);

        X = Matrix.from(inputs.length, inputs[0].length, inputs);
        y = Matrix.from(outputs.length, outputs[0].length, outputs);

        setup();

        if (doResetNetwork) {
            resetNetwork();
        }

        Terminal.print("Data loaded.");
    }

    reader.readAsText(file);
}

function parseTextAsData(text) {
    try {
        let benchmarker = new Benchmarker("Time to Parse File (ms)");

        let extraData = [];
        let inputs = [];
        let outputs = [];

        let metadata = {};

        let segments = text.split(gSegmentDelimiter).filter((segment) => segment.length > 0);

        if (segments[0].charAt(0) == "#") {
            while (segments[0].charAt(0) == "#") {
                let segment = segments.shift();
                let values = segment.split(gValueDelimiter).filter((segment) => segment.length > 0);
                
                let metadataKey = values.shift().substring(1);
                let metadataValues = values.map(parseStringifiedValues);

                metadata[metadataKey] = metadataValues;
            }
        }

        let headers = segments.shift();

        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            
            let {segmentExtraData, segmentInputs, segmentOutputs} = processDataSegment(metadata, segment);

            extraData.push(segmentExtraData);
            inputs.push(segmentInputs);
            outputs.push(segmentOutputs);
        }

        benchmarker.add();

        return {extraData: extraData, inputs: inputs, outputs: outputs};

        function processDataSegment(metadata, segment) {
            let values = segment.split(gValueDelimiter);
            
            let segmentExtraData = [];
            let segmentInputs = [];
            let segmentOutputs = [];

            if (metadata["extraData"] ?? 1) {
                let extraDataFilter = metadata.extraDataFilter ?? [];
                let extraDataNum = metadata["extraDataNum"] ?? extraDataFilter.length;
                segmentExtraData = filterValues(values.splice(0, extraDataNum), extraDataFilter).map(parseStringifiedValues);
            }
            if (metadata["inputs"] ?? 1) {
                let inputsFilter = metadata.inputsFilter ?? [];
                let inputsNum = metadata["inputsNum"] ?? inputsFilter.length;
                segmentInputs = filterValues(values.splice(0, inputsNum), inputsFilter).map(parseStringifiedValues);
            }
            if (metadata["outputs"] ?? 1) {
                let outputsFilter = metadata.outputsFilter ?? [];
                let outputsNum = metadata["outputsNum"] ?? outputsFilter.length;
                segmentOutputs = filterValues(values.splice(0, outputsNum), outputsFilter).map(parseStringifiedValues);
            }

            return {
                segmentExtraData: segmentExtraData,
                segmentInputs: segmentInputs,
                segmentOutputs: segmentOutputs,
            }
        }
    } catch (error) {
        alert(error.stack);
    }
}

function parseStringifiedValues(value) {
    if (!isNaN(value)) {
        return Number(value);
    } else {
        return 0;
    }
}

function filterValues(values, filter) {
    return values.filter((a, index) => filter[index] ?? 1);
}

function setup() {
    layers = n.length;
    m = X.rows;
    n[0] = X.columns;
    n[layers - 1] = y.columns;

    X_norm = normalise_data(X);
}

function resetNetwork() {
    for (let i = 0; i < layers - 1; i++) {
        W[i] = Matrix.random(n[i + 1], n[i], -1, 1);
        b[i] = Matrix.random(n[i + 1], 1, -1, 1);
    }
}

function normalise_data(data) {
    let mean = data.sumAxis(0, false).divideNum(data.rows);
    let dataMinusMean = data.difference(mean);
    let standardDeviation = dataMinusMean.elementMultiply(dataMinusMean).sumAxis(0).divideNum(data.rows).map((x) => {return Math.sqrt(x)});
    let normalised = dataMinusMean.elementDivide(standardDeviation);

    return normalised;
}

function prepare_data() {
    let A0 = X_norm.T;
    let Y = y.reshape(n[layers - 1], m);

    return {A0: A0, Y: Y};
}

function feed_forward(A0) {
    let A = [A0];
    let Z = []

    for (let i = 0; i < layers - 1; i++) {
        Z[i] = W[i].multiply(A[i]).sum(b[i]);

        A[i + 1] = Z[i].map(activations[i].function);
    }

    return {A: A, Z: Z};
}

function get_cost(y_hat, Y) {
    let losses = Y.elementMultiply(y_hat.log()).sum(Y.map(_1_minus_x).elementMultiply(y_hat.map(_1_minus_x).log())).multiplyNum(-1);

    let summedLosses = losses.sumAxis(1).divideNum(m);

    return summedLosses.sumAxis();
}

function backprop_final_layer(Y, A0, A1, W) {
    let dC_dZ = A1.difference(Y).divideNum(m);
    let dC_dW = dC_dZ.multiply(A0.T);
    let dC_db = dC_dZ.sumAxis(1, true);
    let dC_dA = W.T.multiply(dC_dZ);

    return {dC_dW: dC_dW, dC_db: dC_db, dC_dA: dC_dA};
}

function backprop_hidden_layer(prop, A0, A1, W, derivative) {
    let dA_dZ = A1.map(derivative);
    let dC_dZ = prop.elementMultiply(dA_dZ);
    let dC_dW = dC_dZ.multiply(A0.T);
    let dC_db = dC_dW.sumAxis(1, true);
    let dC_dA = W.T.multiply(dC_dZ);

    return {dC_dW: dC_dW, dC_db: dC_db, dC_dA: dC_dA}
}

async function train() {
    Terminal.print("Training...");

    await sleep(1);

    let benchmarker = new Benchmarker("Performance");

    let {A0, Y} = prepare_data();

    let epochs = 5000;
    let alpha = 0.05;
    let costs = [];

    for (let i = 0; i < epochs; i++) {
        let {A, Z} = feed_forward(A0);

        let y_hat = A[layers - 1];

        let currentBackprop = backprop_final_layer(Y, A[layers - 2], A[layers - 1], W[layers - 2]);

        for (let j = layers - 2; j > 0; j--) {
            W[j] = W[j].difference(currentBackprop.dC_dW.multiplyNum(alpha));
            b[j] = b[j].difference(currentBackprop.dC_db.multiplyNum(alpha));

            currentBackprop = backprop_hidden_layer(currentBackprop.dC_dA, A[j - 1], A[j], W[j - 1], activations[j - 1].derivative);
        }

        if (i == epochs - 1) {
            let cost = get_cost(y_hat, Y);
            costs.push(cost);
        }

        if (i % 1000 == 0) {
            if (printEpochs) {
                Terminal.print(`Current Epoch: ${i}`);
            }
            await sleep(1);
        }
    }

    benchmarker.add();

    Terminal.print(`Final Cost: ${costs[costs.length - 1]}`);
    Terminal.print(`Time to Train: ${benchmarker.averageRelativeTime(precision)}ms`);
    Terminal.print("~~~~~~~~~");
}

async function test() {
    Terminal.print("Testing...");

    await sleep(1);

    let {A0, Y} = prepare_data();
    let cache = feed_forward(A0);

    let final = cache[layers - 1].map((x) => {return Math.round(x)});
    let cost = get_cost(cache[layers - 1], Y);

    Terminal.print(`Cost: ${cost}`);
    Terminal.print(`Target: \n${Y}`);
    Terminal.print(`Result: \n${final}`);
    Terminal.print(`Difference: \n${Y.difference(final)}`);
    Terminal.print(`Difference Compact: \n${Y.difference(final).sumAxis(0)}`);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}