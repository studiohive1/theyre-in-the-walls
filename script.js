const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const screen = 2;
const ratio = innerWidth / innerHeight;
const camera = new THREE.OrthographicCamera( -screen * ratio, screen * ratio, screen, -screen, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setAnimationLoop( animate );
// renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( innerWidth / 3, innerHeight / 3, false );
// will adjust it again after getting the dice png file
document.body.appendChild( renderer.domElement )

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const loader = new THREE.TextureLoader();
const pic = loader.load('assets/placeholder.png');
const beexel = loader.load('assets/beexel.png');
pic.magFilter = THREE.NearestFilter;
beexel.magFilter = THREE.NearestFilter;

const material = [
  new THREE.MeshStandardMaterial({ map: beexel }), // right
  new THREE.MeshStandardMaterial({ map: beexel }), // left
  new THREE.MeshStandardMaterial({ map: beexel }), // top
  new THREE.MeshStandardMaterial({ map: beexel }), // bottom
  new THREE.MeshStandardMaterial({ map: beexel }), // front
  new THREE.MeshStandardMaterial({ map: beexel }) // back
];
// testing beexel

const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );
const container = new THREE.Group();
container.rotation.x = Math.atan( 1 / Math.sqrt( 2 ) );
container.rotation.y = Math.PI / 4;
// isometric
container.add( cube );
scene.add( container );

scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );

const light = new THREE.DirectionalLight( 0xffffff, 0.8 );
light.position.set( -5, 10, 5 );
scene.add( light );

camera.position.z = 5;

function animate( time ) {

  // cube.rotation.x = time / 2000;
  // cube.rotation.y = time / 1000;

  container.position.y += jump;
  jump -= gravity;
  
  if ( container.position.y < 0 ) {
    container.position.y = 0;
    if ( Math.abs( jump ) < 0.04 ) {
      jump = 0;
    } else {
      jump = -jump * 0.4;
    }
  }

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
  const speed = Math.abs( roll_x ) + Math.abs( roll_y );
  jump = Math.min( speed * 1.5, 0.15 );
  // 1.5 and 0.15 feel good on a laptop for now, but need to be tested on mobile!
});

const moving_speed = 0.01;
let roll_x = 0;
let roll_y = 0;
let jump = 0;
const gravity = 0.01;
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