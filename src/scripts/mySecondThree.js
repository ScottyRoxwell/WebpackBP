import {THREE} from '../vendor';
import { Geometry, Cylindrical, Clock, GreaterStencilFunc } from 'three';

const scene = new THREE.Scene();
const distance = 6000;
const camera = new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,1,distance);

var ambient= new THREE.AmbientLight( 0x40ae49, 1 );
scene.add( ambient );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

const green = new THREE.Color(0x00ff00);
const transparent = new THREE.Color(0xffffff,.5);
const face = new THREE.Face3();


var geometry = new THREE.CylinderGeometry( 60, 60, 10, 23, 1, true );
for(let i = 0; i < geometry.faces.length; i+=2){
  let randomNumber = Math.random();
  if(randomNumber > .5){
    geometry.faces[i].color = green;
    geometry.faces[i+1].color = green;
  }
  
  console.log(geometry.faces[i])
}

var material = new THREE.MeshBasicMaterial( {color: transparent, wireframe: false, side: THREE.BackSide, vertexColors: THREE.FaceColors} );
var cylinder = new THREE.Mesh( geometry, material );

scene.add( cylinder );

camera.position.z = 0;
camera.position.y = -140;
camera.lookAt(0,20,0);

const vertices = geometry.vertices;
console.log(vertices.length)
// let clock = new Clock();

var animate = function () {
  requestAnimationFrame( animate );
  
  // clock.getElapsedTime();
  // let deltaTime = clock.getDelta();
  geometry.verticesNeedUpdate = true;
  geometry.rotateY(.004);
  geometry.vertices.forEach(vertex => {
    vertex.y -= 4;
    if(vertex.y < -60){
      geometry.vertices.forEach(v => {
        v.y += 2800;
      })
    }
  })

  renderer.render( scene, camera );

};

animate();