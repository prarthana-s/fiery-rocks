var scene = new THREE.Scene();
var fieldOfView = 75;
var nearPlane = 0.1;
var farPlane = 1000;
var aspectRatio = window.innerWidth/window.innerHeight;

var camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry, particleCount, particleSizes, particleSizeCount, size, materials = [], particles;

var displacement = new Array();

geometry = new THREE.Geometry();


// Generate particles

particleCount = 50; 

for (i = 0; i < particleCount; i++) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 1600 - 800;
    vertex.y = Math.random() * 600 - 300;
    vertex.z = -500;

    geometry.vertices.push(vertex);
}

material = new THREE.PointsMaterial({
    size: 5
});

particles = new THREE.Points(geometry, material);

scene.add(particles);



// Generate static attractor at origin

var geometryAttractor = new THREE.Geometry();
var vertexAttractor = new THREE.Vector3();

vertexAttractor.x = 0;
vertexAttractor.y = 0;
vertexAttractor.z = -500;

var sizeAttractor = 20;

geometryAttractor.vertices.push(vertexAttractor);

var materialAttractor = new THREE.PointsMaterial( { color: 0xFFFFFF, size: sizeAttractor } );
var attractor = new THREE.Points( geometryAttractor, materialAttractor );
scene.add( attractor );

camera.position.z = 5;

animate();

function animate() {
    requestAnimationFrame(animate);
    render();
}

function calculateDisplacement() {
    for (let i = 0; i < particles.geometry.vertices.length; i++) {
        var res = new THREE.Vector3();
        res.subVectors(vertexAttractor,particles.geometry.vertices[i]);
        displacement.push(res);
    }
}

function render() {
    calculateDisplacement();
    renderer.render(scene, camera);
}