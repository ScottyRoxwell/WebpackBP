import {THREE} from '../vendor';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90,window.innerWidth/window.innerHeight,1,12000);

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
    this.radius = radius;
    this.theta = theta;
    this.x = this.radius * Math.cos(this.theta);
    this.y = y;
    this.z = this.radius * Math.sin(this.theta);
    this.life = 0;
    this.geometry = new THREE.SphereGeometry(2,3,3);
    this.material = new THREE.MeshBasicMaterial({color:0xffffff});
    this.sphere = new THREE.Mesh(this.geometry,this.material);
    this.sphere.position.x = this.x;
    this.sphere.position.y = this.y;
    this.sphere.position.z = this.z;
    this.speed = Math.random()*.018;
  }
  move(){
    this.theta -= this.speed;
    this.sphere.position.x = this.radius * Math.cos(this.theta);
    this.sphere.position.z = this.radius * Math.sin(this.theta);
  }
}

let theta = 0;

let balls = [];

let i = 0;
while(balls.length < 6000){
  i +=1;

  theta = (Math.random())*10;
  let ball = new Ball(250,theta,i);
  ball.life = 1200;
  balls.push(ball);

  scene.add(ball.sphere)
}

camera.position.y = -380;
camera.lookAt(0,20,0);

// console.log(direction)


var animate = function () {
  requestAnimationFrame( animate );
  camera.position.y += 7;
  balls.forEach(ball => {
    if(ball.life > 0){
      ball.life--;
    } else {
      balls.pop();
    }
    
    ball.move();
    
  })
  
  
  // ball.life--;
	// cylinder.rotation.x += 0.01;
  // cylinder.rotation.y += 0.01;
  // cylinder.rotation.z += 0.0001;
	renderer.render( scene, camera );
};

animate();