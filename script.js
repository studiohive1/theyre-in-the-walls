const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setAnimationLoop( animate );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement )

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = [
  new THREE.MeshBasicMaterial({ color: 0xF9C22E }),
  new THREE.MeshBasicMaterial({ color: 0x30C5FF }),
  new THREE.MeshBasicMaterial({ color: 0xF15946 }),
  new THREE.MeshBasicMaterial({ color: 0x00CC66 }),
  new THREE.MeshBasicMaterial({ color: 0xFF7D00 }),
  new THREE.MeshBasicMaterial({ color: 0xF26CA7 })
];const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate( time ) {

  cube.rotation.x = time / 2000;
  cube.rotation.y = time / 1000;

  renderer.render( scene, camera );

}