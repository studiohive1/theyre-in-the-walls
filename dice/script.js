const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const screen = 2;
const ratio = innerWidth / innerHeight;
const camera = new THREE.OrthographicCamera( -screen * ratio, screen * ratio, screen, -screen, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setAnimationLoop( animate );
// renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( innerWidth, innerHeight, false );
document.body.appendChild( renderer.domElement )

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const loader = new THREE.TextureLoader();

function face( name ) {
  const pic = loader.load( 'assets/cube-face-' + name + '-v4-locked.png' );
  pic.magFilter = THREE.NearestFilter;
  return new THREE.MeshStandardMaterial({ map: pic });
}

function unlock( face_num, type_name ) {
  const pic = loader.load( 'assets/cube-face-' + type_name + '-v4-unlocked.png' );
  pic.magFilter = THREE.NearestFilter;
  material[ face_num ].map = pic;
  material[ face_num ].needsUpdate = true;
}

const material = [
  face( 'qr' ),    // right
  face( 'qr' ),    // left
  face( 'input' ), // top
  face( 'input' ), // bottom
  face( 'ar' ),    // front
  face( 'ar' )     // back
];
// updated with jaedan's cube face v4

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
  const pick = get_challenge();
  if ( pick ) location.href = '../' + pick.name + '/';
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
let stop_x = 0;
let stop_y = 0;
let landed = false;

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

    if ( Math.abs( roll_x ) + Math.abs( roll_y ) < 0.02 ) {
      if ( !stopped ) {
        stopped = true;
        landed = false;
        roll_x = 0;
        roll_y = 0;
        let goal = on_top();
        if ( goal.solved ) {
          const not_done = types.filter( type => !type.solved );
          if ( not_done.length > 0 ) {
            goal = not_done[ Math.floor( Math.random() * not_done.length ) ];
          }
        }
        stop_x = close( cube.rotation.x, goal.set_x * Math.PI / 2 );
        stop_y = close( cube.rotation.y, goal.set_y * Math.PI / 2 );
      }
      cube.rotation.x += ( stop_x - cube.rotation.x ) * 0.05;
      cube.rotation.y += ( stop_y - cube.rotation.y ) * 0.05;

      const gap = Math.abs( stop_x - cube.rotation.x ) + Math.abs( stop_y - cube.rotation.y );
      if ( gap < 0.01 ) landed = true;
    }

    if ( rolled && stopped && landed && jump === 0 && !done ) {
      const pick = get_challenge();
      if ( pick ) {
        done = true;
        card.textContent = pick.label;
        card.className = 'show ' + pick.name;
        action_btn.textContent = 'CHALLENGE ACCEPTED!';
      }
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
  stopped = false;
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
  stopped = false;
  roll_x = limit( ( Math.random() - 0.5 ) * 0.5 );
  roll_y = limit( ( Math.random() - 0.5 ) * 0.5 );
  jump = 0.1 + Math.random() * 0.05;
  rolled = true;
});

const types = [
  { id: 'qr-1',    name: 'qr',    solved: false, set_x: 1, set_y: 1, dir: new THREE.Vector3( 1, 0, 0 ),  label: 'HIDDEN CODES' },
  { id: 'qr-2',    name: 'qr',    solved: false, set_x: 1, set_y: 3, dir: new THREE.Vector3( -1, 0, 0 ), label: 'HIDDEN CODES' },
  { id: 'input-1', name: 'input', solved: false, set_x: 0, set_y: 0, dir: new THREE.Vector3( 0, 1, 0 ),  label: 'INPUT BASED' },
  { id: 'input-2', name: 'input', solved: false, set_x: 2, set_y: 0, dir: new THREE.Vector3( 0, -1, 0 ), label: 'INPUT BASED' },
  { id: 'ar-1',    name: 'ar',    solved: false, set_x: 1, set_y: 2, dir: new THREE.Vector3( 0, 0, 1 ),  label: 'TAKE A PHOTO' },
  { id: 'ar-2',    name: 'ar',    solved: false, set_x: 1, set_y: 0, dir: new THREE.Vector3( 0, 0, -1 ), label: 'TAKE A PHOTO' }
];

const up = new THREE.Vector3( 0, 1, 0 );

function get_challenge() {
  let chosen = null;
  let highest = -2;
  for ( const type of types ) {
    if ( type.solved ) continue;
    const point = type.dir.clone().applyQuaternion( cube.quaternion ).dot( up );
    if ( point > highest ) {
      highest = point;
      chosen = type;
    }
  }
  return chosen;
}

function close( now, want ) {
  const full = Math.PI * 2;
  return want + Math.round( ( now - want ) / full ) * full;
}

function on_top() {
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

/*
back.addEventListener( 'click', () => {
  click_sound.currentTime = 0;
  click_sound.play();
});
*/

const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const test_user = 'd860b0b8-2eae-480e-b858-994873709af7';
// testing with my user id for now!

db.from( 'progress' )
  .select( 'type' )
  .eq( 'user_id', test_user )
  .eq( 'exhibit_id', 'telecomm' )
  .eq( 'completed', true )
  .then( result => {
    fill_progress( result.data.length );

    for ( const row of result.data ) {
      for ( let i = 0; i < types.length; i++ ) {
        if ( types[i].name === row.type && !types[i].solved ) {
          unlock( i, types[i].name );
          types[i].solved = true;
          break;
        }
      }
    }
});