import {THREE} from '../vendor';
import { Geometry } from 'three';
import { isInterfaceDeclaration } from 'babel-types';
import { inherits } from 'util';

const scene = new THREE.Scene();
let distance;
let speed;
const camera = new THREE.PerspectiveCamera(128,window.innerWidth/window.innerHeight,1,distance);

var ambient= new THREE.AmbientLight( 0x40ae49, 1 );
scene.add( ambient );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

const planes = [];
const wheels = [];

init(220, .4, -22);

function init(depth,descentSpeed, camStart){
  distance = depth;
  speed = descentSpeed;
  camera.position.y = camStart;
}

class Plane{
  constructor(radius,theta,y,size){
    this._radius = radius;
    this._theta = theta;
    this._y = y;
    this._size = size;
    this._x = this._radius * Math.cos(this._theta);
    this._z = this._radius * Math.sin(this._theta);
    this._randomTheta = 0;
  }
  draw(rT){
    let geometry = new THREE.PlaneGeometry(this._size,1);
    let material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false, side: THREE.DoubleSide});
    let plane = new THREE.Mesh(geometry,material);
    plane.position.x = this._x;
    plane.position.y = this._y;
    plane.position.z = this._z;
    plane._randomTheta = rT;
    planes.push(plane);
    scene.add(plane);
  }
}

class Wheel{
  constructor(y, radius, size, speed, density) {
    this._y = y;
    this._radius = radius;
    this._size = size;
    this._density = density;
    this._speed = speed;
  }
  makeWheel(){
    for(let i = 0; i < Math.random()*this._density; i++){
      let randomTheta = Math.random()*Math.PI*2;
      let plane = new Plane(this._radius,randomTheta,this._y,this._size);
      plane.draw(randomTheta);  
    }
  }
  spin(){
    theta -= this._speed;
    planes.forEach(plane => {
      plane.position.x = this._radius * Math.cos(theta + plane._randomTheta);
      plane.position.z = this._radius * Math.sin(theta + plane._randomTheta);
      plane.lookAt(0,plane.position.y,0);
    })  
  }
  bringForward(){
    planes.forEach(plane => {
      if(plane.position.y < camera.position.y){
        plane.position.y += distance;
      }
    })
    
  }
}

class Tunnel{
  constructor(depth){
    this._depth = depth;
  }
  makeTunnel(){
    let randomSpeed;
    for(let i = 0; i < this._depth; i+=1.5){
      randomSpeed = Math.random()*.0001;
      let wheel = new Wheel(i, 80, 4, randomSpeed, 30);
      wheels.push(wheel);
      wheel.makeWheel();
    }
  }
}
// Wheel constructor(y, radius, size, theta, density, speed)
const tunnel = new Tunnel(distance);
tunnel.makeTunnel();

let theta = 0;
const animate = function () {
  requestAnimationFrame( animate );
  wheels.forEach(wheel => {
    wheel.spin();
    wheel.bringForward();
  })
  camera.position.y += speed;
  camera.lookAt(0,distance+camera.position.y,0);


   renderer.render( scene, camera );
};

animate();
