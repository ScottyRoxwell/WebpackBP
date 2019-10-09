import {THREE} from '../vendor';
import { identifier, isInterfaceDeclaration, thisExpression } from 'babel-types';
import { transcode } from 'buffer';

// Variables
let distance = 5000;
let descentSpeed;
let density = 55;
let tunnelRadius;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(78,window.innerWidth/window.innerHeight,1,distance);

// Initiate Program
init(distance, -80, .9, 655);
function init(depth,camStart,descent,radius){
  distance = depth;
  descentSpeed = descent;
  tunnelRadius = radius;
  camera.position.y = camStart;
  camera.lookAt(0,distance,0);
}

// LIGHTS
var light = new THREE.PointLight( 0xdcceee, .5, 1270);
light.position.y = 2410;
scene.add( light );

// Can't get this light to do anything.
var light2 = new THREE.PointLight( 0xffffff, 2, 100);
scene.add( light2 );

// AMBIENT LIGHT
var ambient= new THREE.AmbientLight( 0x40ae49, .3 ); 
scene.add( ambient );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

class Camera{
  constructor(){
    
  }
}


// Plane Class
class Plane{
  constructor(radius,theta,y){
    this.radius = radius;
    this.theta = theta;
    this.x = this.radius * Math.cos(this.theta);
    this.y = y;
    this.z = this.radius * Math.sin(this.theta);

    let geometry = new THREE.PlaneGeometry( 39, 35 );
    let material = new THREE.MeshLambertMaterial( {color: 0xeeccfe, side: THREE.DoubleSide} );
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.x = this.x;
    this.mesh.position.y = this.y;
    this.mesh.position.z = this.z;
    let r = Math.random();
    this.gear = -Math.random()*.032;
    this.speed = r < .97 ? this.speed = this.gear*.1 : this.gear;
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
  constructor(y,speed,particleCount,sizeLimit,spread){
    this._y = y;
    this._speed = speed;
    this._particleCount = particleCount;
    this._size = sizeLimit;
    this._spread = spread;

    let geometry = new THREE.Geometry();
    for(let i = 0; i < this._particleCount; i++){
      let randomTheta = Math.random()*Math.PI*2;
      let randomRadius = Math.random()*tunnelRadius*.8;
      let particle = new THREE.Vector3(
        Math.cos(randomTheta)*randomRadius,
        Math.random()*this._spread,
        Math.sin(randomTheta)*randomRadius
      );
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
  move(){
    this.particleCloud.position.y += this._speed;
  }
  lag(randomNumber){
    this.particleCloud.geometry.vertices.forEach(vertex => {
      randomNumber < .99 ? vertex.y += 1 : vertex.y -= 500;
    });
  }
  jitter(amount, delta){
    let shake = amount;
    let random;
    this.particleCloud.geometry.vertices.forEach(vertex => {
      random = Math.random();
      vertex.x += Math.cos(delta*Math.pow(random,2))*shake*Math.pow(random,2);
      vertex.y += Math.sin(delta*.0001)*.01;
      vertex.z += Math.sin(delta*Math.pow(random,2))*shake*Math.pow(random,2); 
    });
  }
  surge(){
    if(Math.random() > .95){
      if(this.particleCloud.position.y > 1.5*distance){
        this.particleCloud.position.y = camera.position.y -500;
      }
    }
  } 
  recycle(){
    this.particleCloud.geometry.vertices.forEach(vertex => {
      if(camera.position.y > vertex.y){
        vertex.y = camera.position.y + distance;
      }
    })
  }
}

// SPAWN PARTICLES
//Spawn Fast Clump
// particleContainer Constructor(y,speed,density,sizeLimit,spread)
let fastClump = new ParticleContainer(-4000,580,2200,8,4180);
let floaters = new ParticleContainer(camera.position.y,0,1100,1,distance/4);
scene.add(fastClump.particleCloud);
scene.add(floaters.particleCloud);

// CREATE TUNNEL
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
  i+=52;
}
let delta = 0;
let cameraSpeed;
var animate = function () {
  requestAnimationFrame( animate );
  
  // ANIMATE LIGHTS
  let random = Math.random();

  (random > .97) ? ambient.intensity += .9 : ambient.intensity -= (ambient.intensity > .4) ? .04 : 0;

  if(random > .95){
    light.position.y = Math.random()*(camera.position.y + distance);
    light.intensity = 2;
  }
  light.intensity > .001 ? light.intensity -= .03 : light.intensity;
  ambient.intensity > .3 ? ambient.intensity -= .09 : ambient.intensity;
  (random > .2) ? light.position.y += 1050 : light.position.y -= 250;

  // Move camera up Y-Axis
  camera.position.y += descentSpeed;;

  // Camera Movement
  ++delta;
  camera.position.x = Math.cos(delta*.01224)*200;
  camera.position.z = Math.sin(delta*.01224)*80;
  camera.rotation.z += .002;
  random > .3 ? camera.rotation.z+= .002 : camera.rotation.z -=.001;

  cameraSpeed = (random > .98) ? 2 : 1;
  if(cameraSpeed > .005){
    cameraSpeed -= .05;
  }
  camera.position.y += descentSpeed*cameraSpeed;

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


  fastClump.move();
  fastClump.lag(random);
  fastClump.surge();

  floaters.jitter(10,delta); 
  floaters.recycle();
  floaters.particleCloud.geometry.verticesNeedUpdate = true;

  light2.position.y += camera.position.y + 450;
	renderer.render( scene, camera );
};

animate();