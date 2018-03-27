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

var geometry, particleCount = 2000, attractorCount = 5, particleSizes, particleSizeCount, size, materials = [], particles, dt = 0.05, k = 0.02;
var particlesGeometry;
var particlesMaterial;
var attractor;
var pObjArr = new Array();

var spring;

parameters = [
    [
        [1, 1, 0.5], 5
    ],
    [
        [0.95, 1, 0.5], 4
    ],
    [
        [0.90, 1, 0.5], 3
    ],
    [
        [0.85, 1, 0.5], 2
    ],
    [
        [0.80, 1, 0.5], 1
    ]
];
parameterCount = parameters.length;

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
// var attractorGeometry = new THREE.Geometry();
// var attractorVertex = new THREE.Vector3();

// attractorVertex.x = 0;
// attractorVertex.y = 0;
// attractorVertex.z = -500;

// var sizeAttractor = 20;

// attractorGeometry.vertices.push(attractorVertex);

// attractorGeometry.verticesNeedUpdate = true;

// var attractorMaterial = new THREE.PointsMaterial( { color: 0xFFFFFF, size: sizeAttractor } );
// var attractor = new THREE.Points( attractorGeometry, attractorMaterial );
// scene.add( attractor );

// Generate particles
function generateAttractor(attractorCount) {
    var attractorGeometry = new THREE.Geometry();
    for (let i = 0 ; i < attractorCount ; i++) {
        // Generate static attractor at origin
        var attractorVertex = new THREE.Vector3();
    
        attractorVertex.x = (Math.random() - 0.5) * width;
        attractorVertex.y = (Math.random() - 0.5) * height;
        attractorVertex.z = -500;
    
        attractorGeometry.vertices.push(attractorVertex);
    }
    
    attractorGeometry.verticesNeedUpdate = true;
    var sizeAttractor = 20;
    
    var attractorMaterial = new THREE.PointsMaterial( { color: 0xFFFFFF, size: sizeAttractor } );
    attractor = new THREE.Points( attractorGeometry, attractorMaterial );
    scene.add( attractor );
}

generateAttractor(attractorCount); 
generateParticles(particleCount);

// Generate particles
function generateParticles(particleCount) {
    var count = particleCount;
    var radius = Math.sqrt(width*width + height*height) / 2;
    var r, theta;
    var speedCoef;

    particlesGeometry = new THREE.Geometry();

    for (var i = 0 ; i < count; i++ ) {
        r = radius * Math.sqrt(Math.random());

        // 360 degrees = 6.28319 radians
        theta = Math.random() * 6.28319;
        theta2 = Math.random() * 6.28319;
        
        var particleVertex = new THREE.Vector3();
        particleVertex.x = r*Math.cos(theta2);
        particleVertex.y = r*Math.sin(theta);
        particleVertex.z = -500;

        particlesGeometry.vertices.push(particleVertex);   

        // Constructor
        var pObj = particleObj.apply(particleVertex);
        pObjArr.push(pObj);
    }

    particlesGeometry.verticesNeedUpdate = true;

    particlesMaterial = new THREE.PointsMaterial({
        size: 5,
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

function calculateDisplacement() {
    // spring = [];
    for (let i = 0; i < pObjArr.length; i++) {

        var pObj = pObjArr[i];

        var maxAttractorIndex = 0;
        var minDistance = Infinity;
        var distance;

        for (var k = 0 ; k < attractorCount; k++) {
            distance = pObj.position.distanceTo(attractor.geometry.vertices[k]);
            if (distance < minDistance) {
                maxAttractorIndex = k;
                minDistance = distance;
            }
        }

        pObj.displacement.subVectors(attractor.geometry.vertices[maxAttractorIndex],pObj.position);

        let a = 2000;

        // force = displacement * e^(-r^2)
        pObj.force = pObj.displacement.multiplyScalar(a * Math.pow(Math.E, -0.05 * Math.pow(minDistance,0.9))); 

        pObj.acceleration = pObj.force.divideScalar(pObj.mass);
        
        var dv = new THREE.Vector3();

        dv = pObj.acceleration.multiplyScalar(dt);

        pObj.velocity.add(dv);

        var copyOfVelocity = pObj.velocity;
        pObj.displacement = copyOfVelocity.multiplyScalar(dt);

        pObj.displacement.x *= (Math.random());
        pObj.displacement.y *= (Math.random());

        pObj.position.add(pObj.displacement);
    }
    particles.geometry.verticesNeedUpdate = true;
}



function render() {
    calculateDisplacement();
    
    var time = Date.now() * 0.00005;
    for (i = 0 ; i < parameterCount; i++) {

        color = parameters[i][0];
        
        h = (360 * (color[0] + time) % 360) / 360;
        particlesMaterial.color.setHSL(h, color[1], color[2]);
    }
    renderer.render(scene, camera);
}

function onMouseMove(e) {
    mouseX = e.clientX - windowHalfX;
    mouseY = windowHalfY - e.clientY;
    attractor.geometry.vertices[0].x = mouseX;
    attractor.geometry.vertices[0].y = mouseY;
    attractor.geometry.verticesNeedUpdate = true;
}