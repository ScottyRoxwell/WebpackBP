import {THREE} from '../vendor'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,1,20);

var light = new THREE.PointLight( 0xffffff, 0.01, 100 );
scene.add( light );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

var geometry = new THREE.CylinderGeometry( 5, 5, 40, 40, 64, true );
var material = new THREE.MeshPhysicalMaterial( { color: 0x00ff00 } );
material.side = THREE.DoubleSide;
var cylinder = new THREE.Mesh( geometry, material );
cylinder.rotation.x = (Math.PI)/2;
scene.add( cylinder );


camera.position.z = 40;

// console.log(direction)


var animate = function () {
  requestAnimationFrame( animate );
  camera.position.z -= .002;
	// cylinder.rotation.x += 0.01;
  // cylinder.rotation.y += 0.01;
  // cylinder.rotation.z += 0.0001;
	renderer.render( scene, camera );
};

animate();