import {THREE} from '../vendor';
import { Cylindrical } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,1,1000);

var light = new THREE.PointLight( 0xffffff, 100, 500);
scene.add( light );

var ambient= new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambient );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

// var geometry = new THREE.CylinderGeometry( 5, 5, 40, 40, 64, true );
// var material = new THREE.MeshPhysicalMaterial( { color: 0x00ff00 } );
// material.side = THREE.DoubleSide;
// var cylinder = new THREE.Mesh( geometry, material );
// cylinder.rotation.x = (Math.PI)/2;
// scene.add( cylinder );

class Point{
  constructor(radius,theta,y){
    this.radius = radius;
    this.theta = theta;
    this.y = y;
    // let cylinderPoint = new Cylindrical(this.radius,this.theta,this.y);
    this.x = this.radius * Math.cos(this.theta);
    this.y = y;
    this.z = this.radius * Math.sin(this.theta);
    // this.cylPoint = new THREE.Cylindrical(this.radius,this.theta,this.y);
    
    

  }
}


class Ball{
  constructor(_x=0,_y=0,_z=0){
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.geometry = new THREE.SphereGeometry(2,22,22);
    this.material = new THREE.MeshPhysicalMaterial({color:0xffffff});
    this.sphere = new THREE.Mesh(this.geometry,this.material);
    this.sphere.position.x = this.x;
    this.sphere.position.y = this.y;
    this.sphere.position.z = this.z;
  }
}

let theta = 0;
let i = 0;

while(i < 2000){
  i += 20;

  theta = (Math.random())*10;
  let point = new Point(150,theta,i);
  console.log(point);
  let ball = new Ball(point.x,point.y,point.z);
  scene.add(ball.sphere);
}
console.log(scene)

camera.position.y = -40;
camera.lookAt(0,400,0);

// console.log(direction)


var animate = function () {
  requestAnimationFrame( animate );
  camera.position.y += .02;
	// cylinder.rotation.x += 0.01;
  // cylinder.rotation.y += 0.01;
  // cylinder.rotation.z += 0.0001;
	renderer.render( scene, camera );
};

animate();