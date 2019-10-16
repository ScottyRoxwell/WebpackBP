import {THREE} from '../vendor';
import noise from './utils/perlinNoise';

import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass"; 
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {BloomPass} from "three/examples/jsm/postprocessing/BloomPass";
// import "../../node_modules/three/examples/js/shaders/DigitalGlitch.js";
// import "../../node_modules/three/examples/js/postprocessing/GlitchPass";
import { identifier, isInterfaceDeclaration, thisExpression } from 'babel-types';
import { transcode } from 'buffer';
import { ColorKeyframeTrack } from 'three';
import { deepStrictEqual } from 'assert';

// Variables
let distance = 6000;
let descentSpeed;
let density = 75;
let tunnelRadius;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(78,window.innerWidth/window.innerHeight,1,distance*6);

// Initiate Program
init(distance, -80, 2.98, 655);
function init(depth,camStart,descent,radius){
  distance = depth;
  descentSpeed = descent;
  tunnelRadius = radius;
  camera.position.y = camStart;
  camera.lookAt(0,distance,0);
}

//==================================== LIGHTS =======================================//
// Sparks
var light = new THREE.PointLight( 0xdcceee, .5, 1270);
light.position.y = 2410;
scene.add( light );

// FastClump Light
var fastClumpLight = new THREE.PointLight( 0xffffff, 2, tunnelRadius*1.2, .3);
scene.add( fastClumpLight );

// AMBIENT LIGHT
var ambient= new THREE.AmbientLight( 0x40ae49, .3 ); 
scene.add( ambient );

// var ambient2= new THREE.AmbientLight( 0x40ae49, 1 ); 
// scene.add( ambient2 );

// Random Light
var randomLight = new THREE.PointLight(0x00ff00, 19,2900,20)
scene.add(randomLight);

var randomLight2 = new THREE.PointLight(0x00ff00, 19,2900,20)
scene.add(randomLight2);

var cloudLightning = new THREE.PointLight(0x00ff00, 149,150,.5)
cloudLightning.position.y = distance+20;
scene.add(cloudLightning);
//=================================================================================//

//Set Up DOM Element
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);
document.body.addEventListener('keypress',(e)=>{
  if(e.key === "s") camera.position.y += 50;
  if(e.key === "d") camera.position.y -= 50;
  if(e.key === "f") camera.rotation.x += Math.PI;
});

// CAMERA CLASS
class Camera{
  constructor(){
  }
  // Camera Movement
  movement(deltaTime,randomNum){
    camera.position.x = Math.cos(deltaTime*.01224)*200;
    camera.position.z = Math.sin(deltaTime*.01224)*80;
    camera.rotation.z += .003;
    let t = noise(deltaTime*.1);
    let u = THREE.Math.mapLinear(t,0,1,-.001,.003);
    camera.rotation.z += u;
 
    cameraSpeed = (randomNum > .98) ? 2 : 1;
    if(cameraSpeed > .005){
      cameraSpeed -= .05;
    }
  camera.position.y += descentSpeed*cameraSpeed;
  }
}

//=========================== CLOUDS =============================//
// const cloudParticles = [];

// let loader = new THREE.TextureLoader();
// loader.load('../images/cloud4.png', (texture)=>{
//   let cloudGeo = new THREE.PlaneBufferGeometry(500,615);
//   let cloudMat = new THREE.MeshLambertMaterial({
//     map: texture,
//     transparent: true
//   });

//   for(let i = 0; i < 14; i++){
//     let cloud = new THREE.Mesh(cloudGeo,cloudMat);
//     cloud.position.set(
//       Math.cos(Math.random()*Math.PI*2)*Math.random()*tunnelRadius,
//       distance+2*i,
//       Math.sin(Math.random()*Math.PI*2)*Math.random()*tunnelRadius
//     );
//     cloud.rotation.x = Math.PI/2;
//     cloud.rotation.y = 0
//     cloud.rotation.z = Math.random()*Math.PI*2;
//     cloud.opacity = 0.0001;
//     cloudParticles.push(cloud);
//     scene.add(cloud);
//   };
// });

// let h1 = document.querySelector('h1');
// h1.innerHTML = "<img src='../../images/cloud1.png'>"


//=============================== GEOMETRIES =================================//
// Plane Class
class Plane{
  constructor(radius,theta,y){
    this.radius = radius;
    this.theta = theta;
    this.x = this.radius * Math.cos(this.theta);
    this.y = y;
    this.z = this.radius * Math.sin(this.theta);

    let geometry = new THREE.PlaneBufferGeometry( 39, 30 );
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
  constructor(y,initialSpeed,particleCount,sizeLimit,spread,fill,opacity=1,chunk=false){
    this._y = y;
    this._initialSpeed = initialSpeed;
    this._particleCount = particleCount;
    this._size = sizeLimit;
    this._spread = spread;
    this._fill = fill;
    this._acc = 1;
    this._delta = 0;
    this._opacity = opacity;
    this.initialSurge = false;
    this.runningDelta;
    this._chunk = chunk;

    let geometry = new THREE.Geometry();
    for(let i = 0; i < this._particleCount; i++){

      let randomTheta = Math.random()*Math.PI*2;
      let randomRadius = Math.random()*tunnelRadius*this._fill;
      let particle = new THREE.Vector3(
        Math.cos(randomTheta)*randomRadius,
        this._chunk ? Math.random()*this._spread : this.setY(),
        Math.sin(randomTheta)*randomRadius
      );
      // if(this._opacity) particle.opacity = Math.random()*.9;
      particle.speed = Math.random() > .1 ? Math.random()*.3 : Math.random();
      particle.north = true;
      // particle.y > camera.position.y ? particle.ignited = true : particle.ignited = false;
      geometry.vertices.push(particle);
    }
      let material = new THREE.PointsMaterial({
      color: 0xffffff,
      opacity: this._opacity,
      size: Math.random()*this._size,
      transparent: true
    });
    this.particleCloud = new THREE.Points(geometry,material);
    this.particleCloud.position.y = this._y;
  }
  setY(){
    return Math.random() > .2 ? Math.random()*300+100 : camera.position.y;
    // vertex.ignited = true;
  }
  jitter(amount, delta){
    let s, t, q, r;
    
    this.particleCloud.geometry.vertices.forEach(vertex => {
      delta+=.3;      
      s = noise(delta);
      t = noise(delta+7);
      q = THREE.Math.mapLinear(s,0,1,-amount,amount);
      r = THREE.Math.mapLinear(t,0,1,-amount,amount);
      vertex.x += q*vertex.speed;
      vertex.y += vertex.speed*10;
      vertex.z += r*vertex.speed; 
    });
    this.particleCloud.geometry.verticesNeedUpdate = true;
  }
  surge(){
    (!this.initialSurge) ? this._delta++ : this._delta = 0;
    if(this.runningDelta && this.initialSurge){
      this._delta++
    }
    this._delta*=200;
    this._acc += this._delta;
    this.particleCloud.position.y += this._initialSpeed + this._acc;
    if(this.particleCloud.position.y > camera.position.y + distance*6){
      this.particleCloud.position.y = camera.position.y - this._spread-130;
      this._acc = 0;
      this._delta = 0;
      this.runningDelta = false;
      this.initialSurge = true;
    }
    if(Math.random() > .95 && !this.runningDelta && this.initialSurge){
      this.runningDelta = true;
      this._acc = 10;
      this._delta = 17;
    }
    // console.log("Cloud: "  + this.particleCloud.position.y)
    // console.log("Camera: " + camera.position.y)
  } 
  recycle(cameraSpeed){
    // console.log("Particle cloud: " + this.particleCloud.position.y)
     this.particleCloud.position.y = camera.position.y;
    this.particleCloud.geometry.vertices.forEach(vertex => {
      if(vertex.y > camera.position.y + 200 && vertex.north === true){
        vertex.speed  *= Math.random()*-2;
        vertex.north = false;
        this.particleCloud.geometry.verticesNeedUpdate = true;
      }
      if(vertex.speed <= descentSpeed*cameraSpeed && vertex.y < camera.position.y && vertex.north === false){
        vertex.speed *= Math.random()*-2;
        vertex.north = true;
        this.particleCloud.geometry.verticesNeedUpdate = true;
      }
      // if(Math.sign(vertex.speed) === -1 && vertex.y <= camera.position.y -100){
      //   vertex.speed *= (Math.random()*-1) + descentSpeed*cameraSpeed;
      //   this.particleCloud.geometry.verticesNeedUpdate = true;
      // }
      
    });
    // console.log("Camera: " + camera.position.y)
  }
}
//=====================================================================//

//========================== SPAWN PARTICLES ==============================//
// particleContainer Constructor(y,speed,density,particleSizeLimit,spread,fill,opacity)
let fastClump = new ParticleContainer(camera.position.y-80,1,1200,8,distance*.69,.74,1,true);
let floaters = new ParticleContainer(camera.position.y,0,1600,2.2,0,.85,.8)
// console.log(floaters)
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

// ============================= POST PROCESSING ================================//
//COMPOSER
const composer = new EffectComposer(renderer);

//PASSES
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
// renderPass.renderToScreen = true;

const unrealPass = new UnrealBloomPass(256,1.3,.1,.09);
composer.addPass(unrealPass);
unrealPass.renderToScreen = true;

// =========================== ANIMATION RENDERING =============================//
let delta = 0;
let jitterDelta = 0;
let cameraSpeed;
let lights1 =  true;
let lights2 = true;
let lightTimer = 0;
var animate = function () {
  requestAnimationFrame( animate );
  let random = Math.random();
  delta++;
  jitterDelta+=.9;

  // CAMERA
  camera1.movement(delta,random);
  
  // ANIMATE LIGHTS
  (random > .97) ? ambient.intensity += .9 : ambient.intensity -= (ambient.intensity > .4) ? .04 : 0;

  if(random > .95){
    light.position.y = Math.random()*(camera.position.y + distance);
    light.intensity = 2;
  }
  light.intensity > .001 ? light.intensity -= .03 : light.intensity;
  ambient.intensity > .3 ? ambient.intensity -= .09 : ambient.intensity;
  (random > .2) ? light.position.y += 1050 : light.position.y -= 250;
  

  if(lightTimer <= 40 && lights1 === false && lights2 === false){
    lightTimer++;
    if(lightTimer === 40) {
      lights1 = true
      lights2 = true;
      lightTimer = Math.floor(Math.random()*40);
    }
  }  
  if(lightTimer < 100 && lights1 && lights2) {
    lightTimer++;
  } else if(lightTimer === 100 && lights1 && lights2){
    lights1 = false;
    lights2 = false;
    lightTimer = Math.floor(Math.random()*40); 
  }

  
  if(lights1){
    randomLight.intensity = 19;
    let pAngle = noise(jitterDelta)
    let pX = THREE.Math.mapLinear(pAngle,0,1,0,Math.PI);
    let pZ = THREE.Math.mapLinear(pAngle+.5,0,1,0,Math.PI);
    randomLight.position.x = Math.cos(pX)*(tunnelRadius-25);
    randomLight.position.y = camera.position.y + (pAngle+.57)*1200;
    randomLight.position.z = Math.sin(pZ)*(tunnelRadius-25);
  } else {
    randomLight.intensity = 0;
  }
  

  if(lights2){
    randomLight2.intensity = 19;
    let pAngle2 = noise(jitterDelta) + .4
    let pX2 = THREE.Math.mapLinear(pAngle2,0,1,0,Math.PI);
    let pZ2 = THREE.Math.mapLinear(pAngle2+.6,0,1,0,Math.PI);
    randomLight2.position.x = Math.cos(pX2)*(tunnelRadius-25);
    randomLight2.position.y = camera.position.y + (pAngle2+.8)*2500;
    randomLight2.position.z = Math.sin(pZ2)*(tunnelRadius-25);
  } else {
    randomLight2.intensity = 0;
  }

  // // ANIMATE CLOUDS
  // cloudParticles.forEach(cloud=>{
  //   cloud.rotation.z -= 0.009;
  //   cloud.position.y += cameraSpeed*descentSpeed;
  // });
  // // debugger;
  // cloudLightning.position.x = Math.cos(Math.random()*Math.PI*2)*Math.random()*tunnelRadius*.75;
  // cloudLightning.position.y = Math.random()*(camera.position.y + distance+21) + (camera.position.y + distance+20);
  // cloudLightning.position.z = Math.sin(Math.random()*Math.PI*2)*Math.random()*tunnelRadius*.75;
  

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
  fastClump.surge();
  fastClumpLight.position.y = fastClump.particleCloud.position.y+300;
  // fastClump.particleCloud.geometry.verticesNeedUpdate = true;
  

  // floater Particles
  floaters.jitter(5,jitterDelta*.3); 
  floaters.recycle(cameraSpeed);

  // console.log(scene)
  // renderer.render( scene, camera );
	composer.render( scene, camera );
};

animate();