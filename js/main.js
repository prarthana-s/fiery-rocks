var scene = new THREE.Scene();
var fieldOfView = 75;
var nearPlane = 0.1;
var farPlane = 1000;
var aspectRatio = window.innerWidth/window.innerHeight;

var camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry, particleCount, particleSizes, particleSizeCount, size, materials = [], particles, dt = 0.01;

var displacement = new Array();

// Generate particles
particleCount = 500; 

particlesGeometry = new THREE.Geometry();

for (i = 0; i < particleCount; i++) {

    var particleVertex = new THREE.Vector3();
    particleVertex.x = Math.random() * 1600 - 800;
    particleVertex.y = Math.random() * 600 - 300;
    particleVertex.z = -500;

    particlesGeometry.vertices.push(particleVertex);
}
particlesGeometry.verticesNeedUpdate = true;

particlesMaterial = new THREE.PointsMaterial({
    size: 5
});

particles = new THREE.Points(particlesGeometry, particlesMaterial);

scene.add(particles);


// Generate static attractor at origin

var attractorGeometry = new THREE.Geometry();
var attractorVertex = new THREE.Vector3();

attractorVertex.x = 0;
attractorVertex.y = 0;
attractorVertex.z = -500;

var sizeAttractor = 20;

attractorGeometry.vertices.push(attractorVertex);

var attractorMaterial = new THREE.PointsMaterial( { color: 0xFFFFFF, size: sizeAttractor } );
var attractor = new THREE.Points( attractorGeometry, attractorMaterial );
scene.add( attractor );

camera.position.z = 5;

animate();

function animate() {
    requestAnimationFrame(animate);
    render();
}

function calculateDisplacement() {
    displacement = [];
    for (let i = 0; i < particles.geometry.vertices.length; i++) {
        let res = new THREE.Vector3();
        res.subVectors(attractorVertex,particles.geometry.vertices[i]);
        displacement.push(res);
        displacement[i].divideScalar(1/dt);
        particles.geometry.vertices[i].add(displacement[i]);   
    }
    particles.geometry.verticesNeedUpdate = true;
}

function render() {
    calculateDisplacement();
    console.log(particles.geometry.vertices);
    renderer.render(scene, camera);
}