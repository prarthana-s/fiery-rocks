var scene = new THREE.Scene();

height = window.innerHeight;
width = window.innerWidth;
windowHalfX = width / 2;
windowHalfY = height / 2;

var fieldOfView = 75;
var nearPlane = 0.1;
var farPlane = 1000;
var aspectRatio = width/height;

var camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

document.addEventListener('mousemove', onMouseMove, false);

var geometry, particleCount, particleSizes, particleSizeCount, size, materials = [], particles, dt = 0.1, k = 0.1;

var pObjArr = new Array();

function particleObj() {
    var pObj = {};

    pObj.position = this;
    pObj.mass = 1;

    pObj.force = new THREE.Vector3();
    pObj.force.x = 0;
    pObj.force.y = 0;

    pObj.acceleration = new THREE.Vector3();
    pObj.acceleration.x = 0;
    pObj.acceleration.y = 0;

    pObj.velocity = new THREE.Vector3();
    pObj.velocity.x = 0;
    pObj.velocity.y = 0;

    pObj.displacement = new THREE.Vector3();
    pObj.displacement.x = 0;
    pObj.displacement.y = 0;

    return pObj;
};

// Generate static attractor at origin
var attractorGeometry = new THREE.Geometry();
var attractorVertex = new THREE.Vector3();

attractorVertex.x = 0;
attractorVertex.y = 0;
attractorVertex.z = -500;

var sizeAttractor = 20;

attractorGeometry.vertices.push(attractorVertex);

attractorGeometry.verticesNeedUpdate = true;

var attractorMaterial = new THREE.PointsMaterial( { color: 0xFFFFFF, size: sizeAttractor } );
var attractor = new THREE.Points( attractorGeometry, attractorMaterial );
scene.add( attractor );

generateParticles(100);

// Generate particles
function generateParticles(particleCount) {
    var count = particleCount;
    // var pt;
    // var delta;
    // var color;
    var radius = Math.sqrt(width*width + height*height) / 2;
    var r, theta;
    var speedCoef;

    particlesGeometry = new THREE.Geometry();

    for (var i = 0 ; i < count; i++ ) {
        r = radius * Math.sqrt(Math.random());

        // 360 degrees = 6.28319 radians
        theta = Math.random() * 6.28319;

        var particleVertex = new THREE.Vector3();
        particleVertex.x = r*Math.cos(theta);
        particleVertex.y = r*Math.sin(theta);
        particleVertex.z = -500;

        particlesGeometry.vertices.push(particleVertex);   

        // Constructor
        var pObj = particleObj.apply(particleVertex);
        pObjArr.push(pObj);
    }

    particlesGeometry.verticesNeedUpdate = true;

    particlesMaterial = new THREE.PointsMaterial({
        size: 5
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);

    scene.add(particles);
}


camera.position.z = 5;

animate();

function animate() {
    requestAnimationFrame(animate);
    render();
}

// function calculateDisplacement() {
//     displacement = [];
//     for (let i = 0; i < particles.geometry.vertices.length; i++) {
//         let res = new THREE.Vector3();
//         res.subVectors(attractor.geometry.vertices[0],particles.geometry.vertices[i]);
//         displacement.push(res);
//         displacement[i].divideScalar(1/dt);  
//         particles.geometry.vertices[i].add(displacement[i]);  
//     }
//     particles.geometry.verticesNeedUpdate = true;
// }

function calculateDisplacement() {
    for (let i = 0; i < pObjArr.length; i++) {

        var pObj = pObjArr[i];

        pObj.displacement.subVectors(pObj.position,attractor.geometry.vertices[0]);

        pObj.force = pObj.displacement.multiplyScalar(-k);

        pObj.acceleration = pObj.force.divideScalar(pObj.mass);
        
        var dv = new THREE.Vector3();

        dv = pObj.acceleration.multiplyScalar(dt);

        pObj.velocity.add(dv);

        var copyOfVelocity = pObj.velocity;
        copyOfVelocity.multiplyScalar(dt);
        pObj.displacement = copyOfVelocity;

        pObj.position.add(pObj.displacement);

    }
    particles.geometry.verticesNeedUpdate = true;
}

function render() {
    calculateDisplacement();
    renderer.render(scene, camera);
}

function onMouseMove(e) {
    mouseX = e.clientX - windowHalfX;
    mouseY = windowHalfY - e.clientY;
    attractor.geometry.vertices[0].x = mouseX;
    attractor.geometry.vertices[0].y = mouseY;
    attractor.geometry.verticesNeedUpdate = true;
}