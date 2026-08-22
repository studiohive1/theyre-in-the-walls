const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const screen = 2;
const ratio = innerWidth / innerHeight;
const camera = new THREE.OrthographicCamera( -screen * ratio, screen * ratio, screen, -screen, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setAnimationLoop( animate );
// renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( innerWidth, innerHeight, false );
// will adjust it again after getting the dice png file
renderer.setClearColor( 0x15131E );
document.body.appendChild( renderer.domElement )

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const loader = new THREE.TextureLoader();

function face( name ) {
  const pic = loader.load( 'assets/cube-face-' + name + '-v3-locked.png' );
  pic.magFilter = THREE.NearestFilter;
  return new THREE.MeshStandardMaterial({ map: pic });
}

const material = [
  face( 'qr' ),    // right
  face( 'qr' ),    // left
  face( 'input' ), // top
  face( 'input' ), // bottom
  face( 'ar' ),    // front
  face( 'ar' )     // back
];
// updated with jaedan's cube face v3

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
  }, 200 );
  setTimeout( () => {
    light.color.set( colour );
    light_up.color.set( colour );
  }, 400 );

  setTimeout( () => {
    light.color.set( 0xffffff );
    light_up.color.set( 0xffffff );
  }, 600 );
}

function right() {
  flick( '#00CC66');
}

function wrong() {
  flick( '#F15946' );
  shake = 0.2;
}

function move() {
  location.href = '../' + get_challenge().name + '/';
}

const light = new THREE.DirectionalLight( 0xffffff, 0.8 );
light.position.set( -5, 10, 5 );
scene.add( light );

camera.position.z = 5;

let stamp = 0;
let shake = 0;
let done = false;
const card = document.getElementById( 'card' );
let rolled = false;

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

    if ( Math.abs( roll_x ) + Math.abs( roll_y ) < 0.04 ) {
      // console.log( 'stopped' );
      const quarter = Math.PI / 2;
      cube.rotation.x += ( Math.round( cube.rotation.x / quarter ) * quarter - cube.rotation.x ) * 0.15;
      cube.rotation.y += ( Math.round( cube.rotation.y / quarter ) * quarter - cube.rotation.y ) * 0.15;
      stopped = true;
    }

    if ( rolled && stopped && jump === 0 && !done ) {
      done = true;
      card.textContent = get_challenge().label;
      card.className = 'show ' + get_challenge().name;
      action_btn.textContent = 'CHALLENGE ACCEPTED!';
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
  if ( done ) return;
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
  // console.log( 'roll', roll_x.toFixed(3), roll_y.toFixed(3) );
  if ( speed > 0.01 ) rolled = true;
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

const action_btn = document.getElementById( 'action_btn' );
const btn_sound = new Audio( 'assets/sound-button.wav' );
const click_sound = new Audio( 'assets/sound-click.wav' );

action_btn.addEventListener( 'click', () => {
  btn_sound.currentTime = 0;
  btn_sound.play();
  if ( done ) {
    move();
    return;
  }
  roll_x = limit( ( Math.random() - 0.5 ) * 0.5 );
  roll_y = limit( ( Math.random() - 0.5 ) * 0.5 );
  jump = 0.1 + Math.random() * 0.05;
  rolled = true;
});

const types = [
  { name: 'qr',    dir: new THREE.Vector3( 1, 0, 0 ),  label: 'HIDDEN CODES' }, // right
  { name: 'qr',    dir: new THREE.Vector3( -1, 0, 0 ), label: 'HIDDEN CODES' }, // left
  { name: 'input', dir: new THREE.Vector3( 0, 1, 0 ),  label: 'INPUT BASED' },  // top
  { name: 'input', dir: new THREE.Vector3( 0, -1, 0 ), label: 'INPUT BASED' },  // bottom
  { name: 'ar',    dir: new THREE.Vector3( 0, 0, 1 ),  label: 'TAKE A PHOTO' }, // front
  { name: 'ar',    dir: new THREE.Vector3( 0, 0, -1 ), label: 'TAKE A PHOTO' }  // back
];

const up = new THREE.Vector3( 0, 1, 0 );

function get_challenge() {
  let chosen = types[0];
  let highest = -2;
  for ( const type of types ) {
    const point = type.dir.clone().applyQuaternion( cube.quaternion ).dot( up );
    if ( point > highest ) {
      highest = point;
      chosen = type;
    }
  }
  return chosen;
}

card.addEventListener( 'click', () => {
  if ( !done ) return;
  move();
});

pause.addEventListener( 'click', () => {
  click_sound.currentTime = 0;
  click_sound.play();
});

back.addEventListener( 'click', () => {
  click_sound.currentTime = 0;
  click_sound.play();
});

const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const test_user = 'd860b0b8-2eae-480e-b858-994873709af7';
// testing with my user id for now!

db.from( 'progress' )
  .select()
  .eq( 'user_id', test_user )
  .then( result => {
    console.log( result );
  });