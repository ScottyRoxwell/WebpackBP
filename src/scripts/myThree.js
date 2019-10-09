import {THREE} from '../vendor';
import { identifier, isInterfaceDeclaration } from 'babel-types';
import { transcode } from 'buffer';

// Variables
let distance = 5000;
let descentSpeed;
let density = 55;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(78,window.innerWidth/window.innerHeight,1,distance);

// Initiate Program
init(distance, -80, .98);
function init(depth,camStart,descent){
  distance = depth;
  descentSpeed = descent;
  camera.position.y = camStart;
  camera.lookAt(0,distance,0);
}

// LIGHTS
var light = new THREE.PointLight( 0xdcceee, .5, 1270);
light.position.y = 2410;
scene.add( light );

var light2 = new THREE.PointLight( 0xffffff, 2, 100);
scene.add( light2 );

// AMBIENT LIGHT
var ambient= new THREE.AmbientLight( 0x40ae49, .3 ); 
scene.add( ambient );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);


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
  move(){
    this.theta += this.speed;
    this.mesh.position.x = this.radius * Math.cos(this.theta);
    this.mesh.position.z = this.radius * Math.sin(this.theta);
  }
}

// CREATE TUNNEL
let theta = 0;
let elements = [];
let i = 0;
while(i < distance){
  theta = Math.random()*10;
  let plane = new Plane(650,theta,i);
  elements.push(plane);
  let randoNum = Math.random()*density;
  for(let k = 0; k < randoNum; k++){
    let setSpeed = plane.speed;
    theta = Math.random()*10;
    let childPlane = new Plane(550,theta,i);
    childPlane.speed = setSpeed;
    elements.push(childPlane);
    scene.add(childPlane.mesh);
  }
  scene.add(plane.mesh);

  // Space allotted for ring
  i+=52;
}
let delta = 0;
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
  camera.position.x = Math.cos(delta*.01234)*200;
  camera.position.z = Math.sin(delta*.01234)*80;
  camera.rotation.z += .003;
  // random > .3 ? camera.rotation.z += .003 : camera.rotation.z -=.003;

  let cameraSpeed = (random > .9) ? 8 : 1;
  camera.position.y += cameraSpeed;
  if(cameraSpeed > .005){
    cameraSpeed -= .0008;
  }
  if(camera.position.y > cameraSpeed)
  camera.position.y -= .009;
  
  //move on the z axis

  function recyclePlanes(arr){
    arr.forEach(plane => {
      plane.mesh.lookAt(0,plane.mesh.position.y+70,0)
      if(camera.position.y > plane.mesh.position.y){
        plane.mesh.position.y = distance+camera.position.y;
        plane.move();
      }
      plane.move();
    })
  }
  recyclePlanes(elements);
  light2.position.y += camera.position.y + 450;

	renderer.render( scene, camera );
};

animate();