import {THREE} from '../vendor';
import { Geometry } from 'three';

const scene = new THREE.Scene();
const distance = 6000;
const camera = new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,1,distance);

var ambient= new THREE.AmbientLight( 0x40ae49, 1 );
scene.add( ambient );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

camera.position.y = -90;
camera.lookAt(0,20,0);

let planes = [];

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
    let geometry = new THREE.PlaneGeometry(this._size,this._size);
    let material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false, side: THREE.DoubleSide});
    let plane = new THREE.Mesh(geometry,material);
    plane.position.x = this._x;
    plane.position.z = this._z;
    plane._randomTheta = rT;
    planes.push(plane);
    console.log(plane)
    scene.add(plane);
  }
}

class Wheel{
  constructor(y, radius, size, rotationSpeed, density, speed) {
    this._y = y;
    this._radius = radius;
    this._size = size;
    this._rotationSpeed = rotationSpeed;
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
    theta -= this._rotationSpeed;
    planes.forEach(plane => {
      plane.position.x = this._radius * Math.cos(theta + plane._randomTheta);
      plane.position.z = this._radius * Math.sin(theta + plane._randomTheta);
      plane.lookAt(0,plane.position.y,0);
    })  
  }
  bringForward(){
    planes.forEach(plane => {
      plane.position.y -= this._speed;
      if(plane.position.y < -60){
        plane.position.y += 800;
      }
    })
  }
}

class Tunnel{
  constructor(depth){
    this._depth = depth;
  }
  makeTunnel(){

  }
}
// Wheel constructor(y, radius, size, rotationSpeed, density, speed)
let wheel = new Wheel(40, 30, 2, 0.02, 290, .3);
wheel.makeWheel();

let theta = 0;
const animate = function () {
  requestAnimationFrame( animate );
  wheel.spin()
  wheel.bringForward();


   renderer.render( scene, camera );
};

animate();
