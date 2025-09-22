let skyAttributeObject;
let planeAttributeObject;

let uProjectionMatrix;
let uModelViewMatrix;

let scale = 100;

let data1f = {
    uTick: 0,
    uTickSpeed: 1,
    uFoV: Math.PI / 2,
    uZNear: 0.1,
    uZFar: 15000 * scale,
    uSkyDiameter: 12756 * scale,
    uSkyHeight: 100 * scale,

    uHorizonBias: 0.2,
    uHorizonIntensity: 0.2,

    uSunBodyThreshold: 0.1,
};

let data2fv = {

};

let data3fv = {
    uCameraPosition: Vector3.neutral(),
    uCameraRotations: Vector3.neutral(),
    
    uSunPositionDefault: new Vector3(0.0, 0.0, data1f.uZFar * 10),
    uSunRotations: new Vector3(Math.PI * 0, 0.0, 0.0),
    uSunRotationSpeed: new Vector3(0.005, 0.0, 0.0),
    
    uMoonPositionDefault: new Vector3(0.0, 0.0, data1f.uZFar * 10),
    uMoonRotations: new Vector3(Math.PI * 1, 0.0, 0.0),
    uMoonRotationSpeed: new Vector3(0.005, 0.0, 0.0),
};

let data4fv = {
    uSkyColorNight: new Vector4(0.0, 0.0, 0.0, 1.0),
    uSkyColorDay: new Vector4(0.53, 0.81, 0.92, 1.0),
    uSkyColorHorizon: new Vector4(0.9, 0.37, 0.33, 1.0),

    uSunColor: new Vector4(1.0, 0.9, 0.5, 1.0),
    uMoonColor: new Vector4(0.8, 1.0, 1.0, 1.0),
};

let dataMat4 = {

}