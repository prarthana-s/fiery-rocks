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

var geometry, particleCount = 5000, attractorCount = 3, particleSizes, particleSizeCount, size, materials = [], particles, dt = 0.05, k = 0.02;
var particlesGeometry;
var particlesMaterial;
var attractor;
var color, sprite, size;
var pObjArr = new Array();

var spring;


// Parameters for colors and size
// parameters = [
//     [
//         [1, 1, 0.5], 5
//     ],
//     [
//         [0.95, 1, 0.5], 4
//     ],
//     [
//         [0.90, 1, 0.5], 3
//     ],
//     [
//         [0.85, 1, 0.5], 2
//     ],
//     [
//         [0.80, 1, 0.5], 1
//     ]
// ];

function particleObj() {
    var pObj = {};
    
    pObj.position = this;
    pObj.mass = Math.random() * 10;

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
// var sprite1 = textureLoader.load( "textures/sprites/snowflake1.png" );
// var sprite2 = textureLoader.load( "textures/sprites/snowflake2.png" );
// var sprite3 = textureLoader.load( "textures/sprites/snowflake3.png" );
// var sprite4 = textureLoader.load( "textures/sprites/snowflake4.png" );
// var sprite5 = textureLoader.load( "textures/sprites/snowflake5.png" );

// var fireSprite = textureLoader.load( "textures/sprites/fire-sprite.png" );

var spriteArr = [
    textureLoader.load( "textures/sprites/flame_sprite1.png" ),
    textureLoader.load( "textures/sprites/flame_sprite2.png" ),
    textureLoader.load( "textures/sprites/flame_sprite3.png" ),
    textureLoader.load( "textures/sprites/flame_sprite4.png" ),
    textureLoader.load( "textures/sprites/flame_sprite5.png" ),
    textureLoader.load( "textures/sprites/flame_sprite6.png" )
];

var spriteIndex = 0;


parameters = [
    [ [1.0, 0.2, 0.5], 20 ],
    [ [0.95, 0.1, 0.5], 15 ],
    [ [0.90, 0.05, 0.5], 10 ],
    [ [0.85, 0, 0.5], 8 ],
    [ [0.80, 0, 0.5], 5 ]
];    
parameterCount = parameters.length;

// Generate particles
function generateParticlesNew(particleCount) {
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
        size: 80,
        map: spriteArr[0], 
        blending: THREE.AdditiveBlending, 
        depthTest: false, 
        transparent : true
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);

    scene.add(particles);
}

// // Generate particles
// function generateParticles(particleCount) {
//     var count = particleCount;
//     var radius = Math.sqrt(width*width + height*height) / 2;
//     var r, theta;
//     var speedCoef;

//     for (var i = 0 ; i < count; i++ ) {
//         r = radius * Math.sqrt(Math.random());

//         // 360 degrees = 6.28319 radians
//         theta = Math.random() * 6.28319;
//         theta2 = Math.random() * 6.28319;
        
//         var particleVertex = new THREE.Vector3();
//         particleVertex.x = r*Math.cos(theta2);
//         particleVertex.y = r*Math.sin(theta);
//         particleVertex.z = -500;

//         particlesGeometry.vertices.push(particleVertex);   

//         // Constructor
//         var pObj = particleObj.apply(particleVertex);
//         pObjArr.push(pObj);
//     }

//     particlesGeometry.verticesNeedUpdate = true;

//     particlesMaterial = new THREE.PointsMaterial({
//         size: 3,
//     });

//     particles = new THREE.Points(particlesGeometry, particlesMaterial);

//     scene.add(particles);
// }

generateAttractor(attractorCount); 
generateParticlesNew(particleCount);


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

        let a = 1000;

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

var cycle = 5;
console.log(particlesMaterial.map);

function render() {
    calculateDisplacement();
    
    // Cycle through colours
    // var time = Date.now() * 0.00005;
    // for (i = 0 ; i < parameterCount; i++) {
        
    //     color = parameters[i][0];
        
    //     h = (360 * (color[0] + time) % 360) / 360;
    //     particlesMaterial.color.setHSL(h, color[1], color[2]);
    //     // console.log(particlesMaterial);
    // }
    spriteIndex = (spriteIndex+1) % 6;
    particlesMaterial.map = spriteArr[spriteIndex];
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