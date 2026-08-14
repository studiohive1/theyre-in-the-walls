const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setAnimationLoop( animate );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement )

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const loader = new THREE.TextureLoader();
const pic = loader.load('assets/placeholder.png');
pic.magFilter = THREE.NearestFilter;
const material = [
  new THREE.MeshStandardMaterial({ color: 0xF9C22E }), // right
  new THREE.MeshStandardMaterial({ color: 0x30C5FF }), // left
  new THREE.MeshStandardMaterial({ color: 0xF15946 }), // top
  new THREE.MeshStandardMaterial({ color: 0x00CC66 }), // bottom
  new THREE.MeshStandardMaterial({ map: pic }), // front
  new THREE.MeshStandardMaterial({ color: 0xF26CA7 }) // back
];const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );
const container = new THREE.Group();
container.rotation.x = Math.PI / 4;
container.rotation.y = Math.atan( 1 / Math.sqrt( 2 ) );
// isometric
container.add( cube );
scene.add( container );

scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );

const light = new THREE.DirectionalLight( 0xffffff, 0.8 );
light.position.set( -3, 4, 5 );
scene.add( light );

camera.position.z = 5;

function animate( time ) {

  // cube.rotation.x = time / 2000;
  // cube.rotation.y = time / 1000;

  if ( !moving ) {
    cube.rotation.x += roll_x;
    cube.rotation.y += roll_y;
    roll_x *= 0.96;
    roll_y *= 0.96;
    // 0.96 or 0.97 seems fine for now, might adjust later!

    if ( Math.abs( roll_x ) + Math.abs( roll_y ) < 0.01 ) {
      // console.log( 'stopped' );
      const quarter = Math.PI / 2;
      cube.rotation.x += ( Math.round( cube.rotation.x / quarter ) * quarter - cube.rotation.x ) * 0.3;
      cube.rotation.y += ( Math.round( cube.rotation.y / quarter ) * quarter - cube.rotation.y ) * 0.3;
      // around 0.2-0.5 seems alright, might ask the team what they think
      roll_x = 0;
      roll_y = 0;
      stopped = true;
    }

  }

  renderer.render( scene, camera );

}

let moving = false;
let rembr_x = 0;
let rembr_y = 0;

addEventListener( 'pointerdown', e => {
  stopped = false;
  moving = true;
  rembr_x = e.clientX;
  rembr_y = e.clientY;
});

addEventListener( 'pointerup', () => {
  moving = false;
});

const moving_speed = 0.01;
let roll_x = 0;
let roll_y = 0;
let stopped = false;

addEventListener( 'pointermove', e => {
  if ( !moving ) return;
  const diff_x = e.clientX - rembr_x;
  const diff_y = e.clientY - rembr_y;
  // console.log( diff_x, diff_y );
  cube.rotation.y += diff_x * moving_speed;
  cube.rotation.x += diff_y * moving_speed;
  rembr_x = e.clientX;
  rembr_y = e.clientY;
  roll_x = diff_y * moving_speed;
  roll_y = diff_x * moving_speed;
});
