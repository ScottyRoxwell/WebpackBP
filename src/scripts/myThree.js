import {THREE} from '../vendor';
import noise from './utils/perlinNoise';
import { identifier, isInterfaceDeclaration, thisExpression } from 'babel-types';
import { transcode } from 'buffer';

// Variables
let distance = 5000;
let descentSpeed;
let density = 75;
let tunnelRadius;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(78,window.innerWidth/window.innerHeight,1,distance*4);

// Initiate Program
init(distance, -80, 1.92, 655);
function init(depth,camStart,descent,radius){
  distance = depth;
  descentSpeed = descent;
  tunnelRadius = radius;
  camera.position.y = camStart;
  camera.lookAt(0,distance,0);
}

let test = noise(34)
console.log(test)

//==================================== LIGHTS =======================================//
// Sparks
var light = new THREE.PointLight( 0xdcceee, .5, 1270);
light.position.y = 2410;
scene.add( light );

// FastClump Light
var fastClumpLight = new THREE.PointLight( 0xffffff, 2, tunnelRadius*1.2, .9);
scene.add( fastClumpLight );

// AMBIENT LIGHT
var ambient= new THREE.AmbientLight( 0x40ae49, .3 ); 
scene.add( ambient );
//=================================================================================//

//Set Up DOM Element
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

// CAMERA CLASS
class Camera{
  constructor(){
  }
  // Camera Movement
  movement(deltaTime,randomNum){
    camera.position.x = Math.cos(deltaTime*.01224)*200;
    camera.position.z = Math.sin(deltaTime*.01224)*80;
    camera.rotation.z += .003;
    randomNum > .3 ? camera.rotation.z+= .003 : camera.rotation.z -=.001;
 
    cameraSpeed = (randomNum > .98) ? 2 : 1;
    if(cameraSpeed > .005){
      cameraSpeed -= .05;
    }
  camera.position.y += descentSpeed*cameraSpeed;
  }
}

//=============================== GEOMETRIES =================================//
// Plane Class
class Plane{
  constructor(radius,theta,y){
    this.radius = radius;
    this.theta = theta;
    this.x = this.radius * Math.cos(this.theta);
    this.y = y;
    this.z = this.radius * Math.sin(this.theta);

    let geometry = new THREE.PlaneGeometry( 39, 30 );
    let material = new THREE.MeshLambertMaterial( {color: 0xeeccfe, side: THREE.DoubleSide} );
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y;
    this.mesh.position.z = this.z;
    let r = Math.random();
    this.gear = -Math.random()*.032;
    // r predicts likliness of fast spinning rings
    this.speed = r < .90 ? this.speed = this.gear*.1 : this.gear;
  }
  //function to spin the planes
  spin(){
    this.theta += this.speed;
    this.mesh.position.x = this.radius * Math.cos(this.theta);
    this.mesh.position.z = this.radius * Math.sin(this.theta);
  }
}

// Particle Container Class
class ParticleContainer{
  constructor(y,initialSpeed,particleCount,sizeLimit,spread,fill){
    this._y = y;
    this._initialSpeed = initialSpeed;
    this._particleCount = particleCount;
    this._size = sizeLimit;
    this._spread = spread;
    this._fill = fill;
    this._acc = 1;
    this._delta = 0;

    let geometry = new THREE.Geometry();
    for(let i = 0; i < this._particleCount; i++){
      let randomTheta = Math.random()*Math.PI*2;
      let randomRadius = Math.random()*tunnelRadius*this._fill;
      let particle = new THREE.Vector3(
        Math.cos(randomTheta)*randomRadius,
        Math.random()*this._spread,
        Math.sin(randomTheta)*randomRadius
      );
      particle.speed = Math.random() > .1 ? Math.random()*.3 : Math.random();
      geometry.vertices.push(particle);
    }
    let material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: Math.random()*this._size,
      transparent: true
    });
    this.particleCloud = new THREE.Points(geometry,material);
    this.particleCloud.position.y = this._y;
  }
  lag(randomNumber){
    this.particleCloud.geometry.vertices.forEach(vertex => {
      randomNumber < .99 ? vertex.y += 1 : vertex.y -= 500;
    });
  }
  jitter(amount, delta){
    let shake = amount;
    this.particleCloud.geometry.vertices.forEach(vertex => {
      delta += .01;
      let p = noise(delta*.01);
      let q = noise((delta+.03)*.01);
      p = THREE.Math.mapLinear(p,0,1,-shake,shake);
      

      vertex.x += p*vertex.speed*Math.random();
      vertex.y += vertex.speed*10;
      vertex.z += q*vertex.speed*Math.random(); 
    });
  }
  surge(){
    this._delta++;
    this._acc += this._delta*7;
    this.particleCloud.position.y += this._initialSpeed + this._acc;
    if(Math.random() > .95){
      if(this.particleCloud.position.y > distance*4){
        this.particleCloud.position.y = camera.position.y - this._spread - 35;
        this._acc = 1;
        this._delta = 0;
      }
    }
  } 
  recycle(){
    this.particleCloud.geometry.vertices.forEach(vertex => {
      if(camera.position.y > vertex.y){
        // console.log(vertex)
        vertex.y += distance/4;
        // console.log(vertex)
      }
    })
    // console.log(camera.position.y);
  }
}
//=====================================================================//

//========================== SPAWN PARTICLES ==============================//
// particleContainer Constructor(y,speed,density,sizeLimit,spread,fill)
let fastClump = new ParticleContainer(-2550,1,600,8,5180,.74);
let floaters = new ParticleContainer(camera.position.y,0,1100,3,distance/4,.85)
console.log(floaters)
scene.add(fastClump.particleCloud);
scene.add(floaters.particleCloud);

// Instantiate Camera Instance
let camera1 = new Camera();

//=============== CREATE TUNNEL ===============//
let theta = 0;
let elements = [];
let i = 0;
while(i < distance){
  theta = Math.random()*10;
  let plane = new Plane(tunnelRadius,theta,i);
  elements.push(plane);
  let randoNum = Math.random()*density;
  for(let k = 0; k < randoNum; k++){
    let setSpeed = plane.speed;
    theta = Math.random()*10;
    let childPlane = new Plane(tunnelRadius,theta,i);
    childPlane.speed = setSpeed;
    elements.push(childPlane);
    scene.add(childPlane.mesh);
  }
  scene.add(plane.mesh);

  // Space allotted per ring
  i+=35;
}

// =========================== ANIMATION RENDERING =============================//
let delta = 0;
let cameraSpeed;
var animate = function () {
  requestAnimationFrame( animate );
  let random = Math.random();
  delta++;
  
  // ANIMATE LIGHTS
  (random > .97) ? ambient.intensity += .9 : ambient.intensity -= (ambient.intensity > .4) ? .04 : 0;

  if(random > .95){
    light.position.y = Math.random()*(camera.position.y + distance);
    light.intensity = 2;
  }
  light.intensity > .001 ? light.intensity -= .03 : light.intensity;
  ambient.intensity > .3 ? ambient.intensity -= .09 : ambient.intensity;
  (random > .2) ? light.position.y += 1050 : light.position.y -= 250;

  //CAMERA
  camera1.movement(delta,random);

  // Send planes that are below camera to the back of the tunnel.
  // Made this an IFFE just for the hell of it.
  (function recyclePlanes(arr){
    arr.forEach(plane => {
      plane.mesh.lookAt(0,plane.mesh.position.y+70,0)
      if(camera.position.y > plane.mesh.position.y){
        plane.mesh.position.y = distance+camera.position.y;
      }
      plane.spin();
    })
  })(elements);
  // recyclePlanes(elements);


  // fastClump Particles
  // console.log(fastClump.particleCloud.position.y)
  fastClump.lag(random);
  fastClump.surge();
  fastClumpLight.position.y = fastClump.particleCloud.position.y;
  fastClump.particleCloud.geometry.verticesNeedUpdate = true;
  

  // floater Particles
  floaters.jitter(3,delta); 
  floaters.recycle();
  floaters.particleCloud.geometry.verticesNeedUpdate = true;

	renderer.render( scene, camera );
};

animate();