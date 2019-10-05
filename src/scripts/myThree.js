import {THREE} from '../vendor';
import { identifier } from 'babel-types';
import { transcode } from 'buffer';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,1,12000);

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

// class Point{
//   constructor(radius,theta,y){
//     this.radius = radius;
//     this.theta = theta;
//     this.y = y;
//     // let cylinderPoint = new Cylindrical(this.radius,this.theta,this.y);
//     this.x = this.radius * Math.cos(this.theta);
//     this.y = y;
//     this.z = this.radius * Math.sin(this.theta);
//     // this.cylPoint = new THREE.Cylindrical(this.radius,this.theta,this.y);
    
    

//   }
// }


class Ball{
  
  constructor(radius,theta,y){
    debugger;
    this.radius = radius;
    this.theta = theta;
    this.x = this.radius * Math.cos(this.theta);
    this.y = y;
    this.z = this.radius * Math.sin(this.theta);
    // this.geometry = new THREE.SphereGeometry(2,2,2);
    // this.material = new THREE.MeshBasicMaterial({color:0xffffff});
    // this.sphere = new THREE.Mesh(this.geometry,this.material);
    // this.sphere.position.x = this.x;
    // this.sphere.position.y = this.y;
    // this.sphere.position.z = this.z;

    // this.geometry = new THREE.BoxGeometry(2,2,2);
    // this.material = new THREE.MeshBasicMaterial({color:0xffffff});
    // this.cube = new THREE.Mesh(this.geometry,this.material);
    // this.cube.position.y = this.y;
    // this.cube.position.x = this.x;
    // this.cube.position.z = this.z;

    var geometry = new THREE.PlaneGeometry( 25, 25 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    this.plane = new THREE.Mesh( geometry, material );
    this.plane.position.y = this.y;
    this.plane.position.x = this.x;
    this.plane.position.z = this.z;
    this.speed = -(Math.random()*.006);
    this.isDead = false;
  }
  move(){
    this.theta += this.speed;
    this.plane.position.x = this.radius * Math.cos(this.theta);
    this.plane.position.z = this.radius * Math.sin(this.theta);
  }
}

let theta = 0;

let balls = [];
let i = 0;
while(i < 2300){
  theta = Math.random()*10;
  let ball = new Ball(550,theta,i);
  balls.push(ball);
  let randoNum = Math.random()*55;
  for(let k = 0; k < randoNum; k++){
    theta = Math.random()*10;
    let extraBall = new Ball(550,theta,i);
    balls.push(extraBall);
    scene.add(extraBall.plane);
  }
  scene.add(ball.plane);

  i+=26;
}

camera.position.y = -80;
camera.lookAt(0,20,0);

// console.log(direction)
var animate = function () {
  requestAnimationFrame( animate );
  

  camera.position.y += .2;


  let j = 2001;
  function growStars(arr){
    balls.forEach(ball => {
      ball.plane.lookAt(0,ball.plane.position.y,0)
      if(camera.position.y > ball.y){
        ball.isDead = true;
        let oldBall =  balls.shift();
        oldBall.y = j;
        balls.push(oldBall);
        oldBall.move();
      }
      
      ball.move();
      j+=4;
    })
  }
  balls = balls.filter(ball => !ball.isDead);
  growStars(balls);
  // ball.life--;
	// cylinder.rotation.x += 0.01;
  // cylinder.rotation.y += 0.01;
  // cylinder.rotation.z += 0.0001;
	renderer.render( scene, camera );
};

animate();