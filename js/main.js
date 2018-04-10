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
window.addEventListener( 'resize', onWindowResize, false );

var attractor;
var particleCount = 1000, attractorCount = 3, dt = 0.05, k = 0.02, massMultipler = 10;
var particlesGeometry = new Array();
var particlesMaterial = new Array();
var particles = new Array();
var pObjArr = new Array();

function particleObj(paramIndex) {
    var pObj = {};
    
    pObj.position = this;
    pObj.mass = Math.random() * masses[paramIndex];

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


// Generate attractors
function generateAttractor(attractorCount) {
    var attractorGeometry = new THREE.Geometry();
    for (let i = 0 ; i < attractorCount ; i++) {
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

var textureLoader = new THREE.TextureLoader();

var spriteArr = [
    textureLoader.load( "textures/sprites/flame_sprite1.png" ),
    textureLoader.load( "textures/sprites/flame_sprite2.png" ),
    textureLoader.load( "textures/sprites/flame_sprite3.png" ),
    textureLoader.load( "textures/sprites/flame_sprite4.png" ),
    textureLoader.load( "textures/sprites/flame_sprite5.png" ),
    textureLoader.load( "textures/sprites/flame_sprite6.png" )
];

var spriteIndex = [0,1,2,3,4,5,6];

var sizesArr = [ 200, 100, 65, 30, 20 ] ;   
var numParticles = [50, 100, 2000, 1500, 2000];
var masses = [ 30, 20, 15, 10, 5];
var sizesArrCount = sizesArr.length;

// Generate particles
function generateParticlesNew(particleCount, paramIndex) {
    var count = particleCount;
    var radius = Math.sqrt(width*width + height*height) / 2;
    var r, theta;
    var speedCoef;

    particlesGeometry[paramIndex] = new THREE.Geometry();

    for (var i = 0 ; i < numParticles[paramIndex]; i++ ) {
        r = radius * Math.sqrt(Math.random());

        // 360 degrees = 6.28319 radians
        theta = Math.random() * 6.28319;
        theta2 = Math.random() * 6.28319;
        
        var particleVertex = new THREE.Vector3();
        particleVertex.x = r*Math.cos(theta2);
        particleVertex.y = r*Math.sin(theta);
        particleVertex.z = -500;

        particlesGeometry[paramIndex].vertices.push(particleVertex);   

        // Constructor
        var pObj = particleObj.apply(particleVertex,[paramIndex]);
        pObjArr.push(pObj);
    }

    particlesGeometry[paramIndex].verticesNeedUpdate = true;

    particlesMaterial[paramIndex] = new THREE.PointsMaterial({
        size: sizesArr[paramIndex],
        map: spriteArr[paramIndex], 
        blending: THREE.AdditiveBlending, 
        depthTest: false, 
        transparent : true
    });

    particles[paramIndex] = new THREE.Points(particlesGeometry[paramIndex], particlesMaterial[paramIndex]);

    scene.add(particles[paramIndex]);
}

generateAttractor(attractorCount); 

for (let i = 0 ; i < sizesArrCount; i++) {
    generateParticlesNew(particleCount,i);
}

camera.position.z = 0;

animate();

function animate() {
    requestAnimationFrame(animate);        
    render();
}

function calculateDisplacement() {
    for (let i = 0; i < pObjArr.length; i++) {

        var pObj = pObjArr[i];

        var maxAttractorIndex = 0;
        var minDistance = Infinity;
        var distance;

        // Find the closest attractor
        for (var k = 0 ; k < attractorCount; k++) {
            distance = pObj.position.distanceTo(attractor.geometry.vertices[k]);
            if (distance < minDistance) {
                maxAttractorIndex = k;
                minDistance = distance;
            }
        }

        pObj.displacement.subVectors(attractor.geometry.vertices[maxAttractorIndex],pObj.position);

        // force = displacement * e^(-r^2)
        let a = 1000;
        let r = 0.05;
        let powerR = 0.8;

        pObj.force = pObj.displacement.multiplyScalar(a * Math.pow(Math.E, -r * Math.pow(minDistance,powerR))); 

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
    for (let z = 0 ; z < sizesArrCount ; z++) {
        particles[z].geometry.verticesNeedUpdate = true;
    }
}

function render() {
    calculateDisplacement();

    for (let i = 0 ; i < sizesArrCount; i++) {
        spriteIndex[i] = (spriteIndex[i]+1) % 6;
        let index = spriteIndex[i];
        particlesMaterial[i].map = spriteArr[index];
    }

    renderer.render(scene, camera);
}


// One attractors follows the cursor
function onMouseMove(e) {
    mouseX = e.clientX - windowHalfX;
    mouseY = windowHalfY - e.clientY;
    attractor.geometry.vertices[0].x = mouseX;
    attractor.geometry.vertices[0].y = mouseY;
    attractor.geometry.verticesNeedUpdate = true;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}