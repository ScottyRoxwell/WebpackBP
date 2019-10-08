import {THREE} from '../vendor';
import { identifier, thisExpression } from 'babel-types';
import { transcode } from 'buffer';

// const loader = new THREE.FontLoader();

// loader.load('fonts/droid/droid_sans_regular.typeface.json', function(font){
//   var textGeo = new THREE.TextGeometry( 'Hello three.js!', {
// 		font: font,
// 		size: 80,
// 		height: 5,
// 		curveSegments: 12,
// 		bevelEnabled: true,
// 		bevelThickness: 10,
// 		bevelSize: 8,
// 		bevelOffset: 0,
// 		bevelSegments: 5
//   });
// })

// var textMaterial = new THREE.MeshBasicMaterial(0xfffff);
// var text = new THREE.Mesh(loader,textMaterial);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,1,7200);

var light = new THREE.PointLight( 0xacaeff, 2, 1270);
light.position.y = 2410;
scene.add( light );


var ambient= new THREE.AmbientLight( 0x40ae49, 2 ); // soft white light
scene.add( ambient );

var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( -90, 20, 20 );

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add( spotLight );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

// scene.add(loader.load());


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

    var geometry = new THREE.PlaneGeometry( 15, 55 );
    var material = new THREE.MeshStandardMaterial( {color: 0xeeccfe, side: THREE.DoubleSide, roughness: 1.001, metalness: .55} );
    this.plane = new THREE.Mesh( geometry, material );
    this.plane.position.x = this.x;
    this.plane.position.y = this.y;
    this.plane.position.z = this.z;
    this.r = Math.random();
    this.gear = -Math.random()*.072;
    this.speed = this.r < .95 ? this.speed = this.gear*.1: this.gear;

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
function buildTunnel(i){
  while(i < 500){
    theta = Math.random()*10;
    let ball = new Ball(550,theta,i);
    balls.push(ball);
    let randoNum = Math.random()*85;
    for(let k = 0; k < randoNum; k++){
      let setSpeed = ball.speed;
      theta = Math.random()*10;
      let extraBall = new Ball(550,theta,i);
      extraBall.speed = setSpeed;
      balls.push(extraBall);
      scene.add(extraBall.plane);
    }
    scene.add(ball.plane);
  
    i+=42;
  }
}

camera.position.y = -1080;
camera.lookAt(0,20,0);

// console.log(direction)
var animate = function () {
  requestAnimationFrame( animate );
  let random = Math.random();

  if(random > .88){
    light.position.y = Math.random()*7300;
    light.intensity = 2;
  }
  //  light.intensity > .0000001 ? light.intensity -= .0000001 : light.intensity = light.intensity;
  
  (random > .2) ? light.position.y += random*1650 : light.position.y -= 250;

  camera.position.y += 4.98;


  let j = 2001;
  function growStars(arr){
    arr.forEach(ball => {
      ball.plane.lookAt(0,ball.plane.position.y+70,0)
      if(camera.position.y > ball.y){
        let oldBall =  balls.shift();
        oldBall.y = j;
        arr.push(oldBall);
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