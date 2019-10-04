import {THREE} from '../vendor'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1000);

var light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
const canvas = document.querySelector('.canvas');
canvas.appendChild(renderer.domElement);

var geometry = new THREE.CylinderGeometry( 5, 5, 40, 40, 64, true );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cylinder = new THREE.Mesh( geometry, material );
scene.add( cylinder );


camera.position.z = 40;

var animate = function () {
	requestAnimationFrame( animate );
	cylinder.rotation.x += 0.01;
  cylinder.rotation.y += 0.01;
  cylinder.rotation.z += 0.0001;
	renderer.render( scene, camera );
};

animate();