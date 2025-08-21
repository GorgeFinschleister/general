let skyDepth = 100000;

let waterAttributeObject;
let skyAttributeObject;

let uProjectionMatrix;
let uModelViewMatrix;

let data1f = {
    uTick: 0,
    uFoV: Math.PI / 2,
    uZNear: 0.1,
    uZFar: skyDepth * 10,

    uWaveSpeed: 0.05,
    uWaveFrequency: 0.0125,
    uWaveFrequencyCoefficient: 1.18,
    uWaveAmplitude: 15,
    uWaveAmplitudeCoefficient: 0.75,

    uAmbientCoefficient: 0.4,

    uSunDiffuseCoefficient: 1.5,
    uSunDiffuseExponent: 2,
    uSunSpecularCoefficient: 0.75,
    uSunSpecularExponent: 500,

    uSunBodyRadius: 5000,
    uSunBodyCoefficient: 3,
    uSunBodyExponent: -5.0,

    uCloudSpeed: 5.0,
    uCloudFrequency: 0.000025,
    uCloudFrequencyCoefficient: 1.2,
    uCloudAmplitude: 0.5,
    uCloudAmplitudeCoefficient: 0.75,
    uCloudCoefficient: 1.0,
    uCloudExponent: 1.0,
};

let data3fv = {
    uCameraPosition: Vector3.neutral(),
    uCameraRotations: Vector3.neutral(),
    uSunRotations: new Vector3(0.1 * Math.PI, 0, 0),
    uSunRotationSpeed: new Vector3(0.0, 0, 0),
    uSunDefaultPosition: new Vector3(0, 0, -skyDepth),
    uCloudDirection: new Vector3(1.0, 0.0, 1.0),
};

let data4fv = {
    uWaterColor: new Vector4(0.2, 0.27, 0.32, 1.0),
    //uSkyColor: new Vector4(0.8, 0.7, 0.6, 1.0),
    uSkyColor: new Vector4(0.3, 0.6, 0.95, 1.0),
    uCloudColor: new Vector4(1.0, 1.0, 1.0, 1.0),
    uSunColor: new Vector4(1.0, 1.0, 1.0, 1.0),
};

let dataMat4 = {

}