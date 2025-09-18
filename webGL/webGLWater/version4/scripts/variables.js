let skyDepth = 100000;

let waterAttributeObject;
let skyAttributeObject;

let uProjectionMatrix;
let uModelViewMatrix;

let data1f = {
    uTick: 0,
    uTickSpeed: 1,
    uFoV: Math.PI / 2,
    uZNear: 0.1,
    uZFar: skyDepth * 100,

    uWaveSpeed: 0.05,
    uWaveFrequency: 0.0015,
    uWaveFrequencyCoefficient: 1.18,
    uWaveAmplitude: 125,
    uWaveAmplitudeCoefficient: 0.82,
    uWaveSpecularCoefficient: 0.75,
    uWaveSpecularExponent: 500,

    uAmbientCoefficient: 0.4,

    uSunDiffuseCoefficient: 1,
    uSunDiffuseExponent: 2,

    uSunBodyRadius: 5000,
    uSunBodyCoefficient: 3,
    uSunBodyExponent: -5.0,

    uCloudSpeed: 0.05,
    uCloudFrequency: 0.000025,
    uCloudFrequencyCoefficient: 1.2,
    uCloudAmplitude: 0.3,
    uCloudAmplitudeCoefficient: 0.75,
    uCloudCoefficient: 0.0,
    uCloudExponent: 2.0,
};

let data2fv = {

};

let data3fv = {
    uCameraPosition: Vector3.neutral(),
    uCameraRotations: Vector3.neutral(),
    uSunRotations: new Vector3(0.1 * Math.PI, 0, 0),
    uSunRotationSpeed: new Vector3(0.000, 0, 0),
    uSunDefaultPosition: new Vector3(0, 0, -skyDepth),
    uCloudDirection: new Vector3(1.0, 0.0, 1.0),
};

let data4fv = {
    uWaterColor: new Vector4(0.0, 0.4, 0.55, 1.0),
    uSkyColorDay: new Vector4(0.3, 0.6, 0.95, 1.0),
    uSkyColorNight: new Vector4(0.0, 0.0, 0.0, 1.0),
    uCloudColor: new Vector4(1.0, 1.0, 1.0, 1.0),
    uSunColor: new Vector4(1.0, 1.0, 1.0, 1.0),
};

let dataMat4 = {

}