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

camera.position.y = -160;
camera.lookAt(0,20,0);

class Plane{
  constructor(radius,theta,y,size){
    this._radius = radius;
    this._theta = theta;
    this._y = y;
    this._size = size;
    this._x = this._radius * Math.cos(this._theta);
    this._z = this._radius * Math.sin(this._theta);
  }
  draw(){
    let geometry = new THREE.PlaneGeometry(this._size,this._size);
    let material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false, side: THREE.DoubleSide});
    let plane = new THREE.Mesh(geometry,material);
    plane.position.x = this._x;
    plane.position.z = this._z;
    // plane.rotateX(Math.PI/2)
    plane.lookAt(0,plane.position.y,0);
    console.log(plane)
    scene.add(plane);
  }
}

class Wheel{
  constructor(y, radius, size) {
    this._y = y;
    this._radius = radius;
    this._size = size;
  }
  makeWheel(){
    for(let i = 0; i < Math.random()*60; i++){
      let plane = new Plane(this._radius,(180/Math.PI)*Math.random()*Math.PI*2,this._y,this._size);
      plane.draw();
      
      
    }
    
  }
}

let wheel = new Wheel(20,40,4)
console.log(wheel)
wheel.makeWheel()
console.log(scene)


// var animate = function () {
//   requestAnimationFrame( animate );



   renderer.render( scene, camera );
// };

// animate();