import {THREE} from '../vendor';
import { Vector3, Cylindrical } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,1,1000);

var light = new THREE.PointLight( 0xffffff, 100, 500);
scene.add( light );

var ambient= new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambient );

camera.position.z = 100;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

let theta = 0;
let radius = 25;
let misterpointy = new Vector3();


var geometry = new THREE.PlaneGeometry( 24, 24 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry, material );
scene.add( plane );

var animate = function () {
  requestAnimationFrame( animate );
  theta += .1;

  misterpointy.x = radius * Math.cos(theta);
  misterpointy.z = radius * Math.sin(theta);
  // plane.rotation.y = Math.PI;
  plane.lookAt(misterpointy);
  console.log(misterpointy)
	renderer.render( scene, camera );
};

animate();