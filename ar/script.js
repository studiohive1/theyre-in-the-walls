navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then( stream => {
    cam.srcObject = stream;
  })
  .catch( err => {
    guide.textContent = 'camera error: ' + err.name;
  });

let model;
let is_right = false;

const cam = document.getElementById( 'cam' );
const guide = document.getElementById( 'guide' );

guide.textContent = 'loading model...';

tf.setBackend( 'cpu' ).then( () => {
  return tmImage.load( 'model/model.json', 'model/metadata.json' );
}).then( m => {
  model = m;
  guide.textContent = 'model ready';
}).catch( err => {
  guide.textContent = 'model error: ' + err.message;
});

const frame = document.createElement( 'canvas' );
frame.width = 224;
frame.height = 224;

setInterval( () => {
  if ( !model ) return;
  if ( !cam.videoWidth ) return;

  frame.getContext( '2d' ).drawImage( cam, 0, 0, 224, 224 );
  model.predict( frame ).then( result => {

    let chosen = result[0];
    for ( const one of result ) {
      if ( one.probability > chosen.probability ) {
        chosen = one;
      }
    }

    if ( chosen.className === 'Telecomm' && chosen.probability > 0.8 ) {
      guide.textContent = "THAT'S IT!";
      guide.className = 'right';
      is_right = true;
    } else {
      guide.textContent = 'KEEP LOOKING!';
      guide.className = 'wrong';
      is_right = false;
    }

  }).catch( err => {
    guide.textContent = 'predict error: ' + err.message;
  });

}, 2000 );

const click_sound = new Audio( 'assets/sound-click.wav' );

function play( sound ) {
  sound.currentTime = 0;
  sound.play();
}

submit.addEventListener( 'click', () => {
  play( click_sound );
  if ( is_right ) {
    save_done();
  }
});

pause.addEventListener( 'click', () => {
  play( click_sound );
});

hint.addEventListener( 'click', () => {
  play( click_sound );
});

reroll.addEventListener( 'click', () => {
  play( click_sound );
  overlay.className = 'show';
});

popup_close.addEventListener( 'click', () => {
  play( click_sound );
  overlay.className = '';
});

popup_yes.addEventListener( 'click', () => {
  play( click_sound );
  location.href = '../dice/';
});

const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const test_user = 'd860b0b8-2eae-480e-b858-994873709af7';
// testing with my user id for now!

function save_done() {
  db.from( 'progress' )
    .insert({
      user_id: test_user,
      exhibit_id: 'telecomm',
      challenge_id: 'ar-1',
      completed: true,
      completed_at: new Date()
    })
    .then( result => {
      console.log( result );
    });
}