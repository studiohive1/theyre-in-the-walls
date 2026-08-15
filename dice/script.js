const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const screen = 2;
const ratio = innerWidth / innerHeight;
const camera = new THREE.OrthographicCamera( -screen * ratio, screen * ratio, screen, -screen, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setAnimationLoop( animate );
// renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( innerWidth / 2, innerHeight / 2, false );
// will adjust it again after getting the dice png file
renderer.setClearColor( 0x5448C8 );
document.body.appendChild( renderer.domElement )

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const loader = new THREE.TextureLoader();
const beexel = loader.load('assets/beexel-32.png');
const studio_hive = loader.load('assets/studio-hive-32.png');
beexel.magFilter = THREE.NearestFilter;
studio_hive.magFilter = THREE.NearestFilter;

const material = [
  new THREE.MeshStandardMaterial({ map: studio_hive }), // right
  new THREE.MeshStandardMaterial({ map: studio_hive }), // left
  new THREE.MeshStandardMaterial({ map: studio_hive }), // top
  new THREE.MeshStandardMaterial({ map: studio_hive }), // bottom
  new THREE.MeshStandardMaterial({ map: studio_hive }), // front
  new THREE.MeshStandardMaterial({ map: beexel }) // back
];
// testing beexel & studio-hive

const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );
const container = new THREE.Group();
container.rotation.x = Math.atan( 1 / Math.sqrt( 2 ) );
container.rotation.y = Math.PI / 4;
// isometric
container.add( cube );
scene.add( container );

// scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );
const light_up = new THREE.AmbientLight( 0xffffff, 0.6 );
scene.add( light_up );

function flick( colour ) {
  light.color.set( colour );
  light_up.color.set( colour );
  setTimeout( () => {
    light.color.set( 0xffffff );
    light_up.color.set( 0xffffff );
  }, 600 );
}

const light = new THREE.DirectionalLight( 0xffffff, 0.8 );
light.position.set( -5, 10, 5 );
scene.add( light );

camera.position.z = 5;

let stamp = 0;
let shake = 0;

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

  if ( shake > 0.001 ) {
    container.position.x = Math.sin( time / 30 ) * shake;
    shake *= 0.9;
  } else {
    container.position.x = 0;
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

  if ( time - stamp > 1000 / 12 ) {
    stamp = time;
    renderer.render( scene, camera );
  }
  // 8 or 12, depending on how fast we want the animation to be

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
  console.log( 'roll', roll_x.toFixed(3), roll_y.toFixed(3) );
});

const moving_speed = 0.01;
let roll_x = 0;
let roll_y = 0;
let jump = 0;
const gravity = 0.01;
let stopped = false;

function limit( v ) {
  return Math.max( -0.3, Math.min( 0.3, v ) );
}

addEventListener( 'pointermove', e => {
  if ( !moving ) return;
  const diff_x = e.clientX - rembr_x;
  const diff_y = e.clientY - rembr_y;
  // console.log( diff_x, diff_y );
  cube.rotation.y += diff_x * moving_speed;
  cube.rotation.x += diff_y * moving_speed;
  rembr_x = e.clientX;
  rembr_y = e.clientY;
  roll_x = limit( diff_y * moving_speed * 0.5 );
  roll_y = limit( diff_x * moving_speed * 0.5 );
});

const roll_btn = document.getElementById( 'roll_btn' );

roll_btn.addEventListener( 'click', () => {
  roll_x = limit( ( Math.random() - 0.5 ) * 0.5 );
  roll_y = limit( ( Math.random() - 0.5 ) * 0.5 );
  jump = Math.random() * 0.15;
});