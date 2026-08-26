navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then( stream => {
    cam.srcObject = stream;
  })
  .catch( err => {
    console.log( 'camera error: ' + err.name );
  });

let model;
let is_right = false;
let done = false;
let ok_time = 0;
let last_seen = '';
let right_answer = '';
let chal_id = '';

const cam = document.getElementById( 'cam' );
const guide = document.getElementById( 'guide' );

console.log( 'loading model...' );

tf.setBackend( 'cpu' ).then( () => {
  return tmImage.load( 'model/model.json', 'model/metadata.json' );
}).then( m => {
  model = m;
  console.log( 'model ready' );
}).catch( err => {
  console.log( 'model error: ' + err.message );
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

    if ( chosen.className === right_answer && chosen.probability > 0.8 ) {
      ok_time = Date.now();
    }
    last_seen = chosen.className;

    is_right = Date.now() - ok_time < 3000;
    guide.className = is_right ? 'right' : 'wrong';

  }).catch( err => {
    console.log( 'predict error: ' + err.message );
  });

}, 2000 );

const click_sound = new Audio( 'assets/sound-click.wav' );

function play( sound ) {
  sound.currentTime = 0;
  sound.play();
}

submit.addEventListener( 'click', () => {
  play( click_sound );
  if ( done ) return;
  if ( is_right ) {
    done = true;
    save_done( last_seen );
    document.body.classList.add( 'solved' );
  } else {
    save_try( last_seen );
  }
});

next.addEventListener( 'click', () => {
  play( click_sound );
  location.href = '../dice/';
});

pause.addEventListener( 'click', () => {
  play( click_sound );
});

hint.addEventListener( 'click', () => {
  play( click_sound );
  hint_box.className = 'show';
});

hint_box.addEventListener( 'click', () => {
  play( click_sound );
  hint_box.className = '';
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

function save_done( given ) {
  db.from( 'progress' )
    .insert({
      user_id: test_user,
      exhibit_id: 'telecomm',
      challenge_id: chal_id,
      type: 'ar',
      completed: true,
      completed_at: new Date(),
      given_answer: given
    })
    .then( result => {
      console.log( result );
      count_progress();
    });
}

function save_try( given ) {
  db.from( 'progress' )
    .insert({
      user_id: test_user,
      exhibit_id: 'telecomm',
      challenge_id: chal_id,
      type: 'ar',
      completed: false,
      given_answer: given
    })
    .then( result => {
      console.log( result );
    });
}

function count_progress() {
  db.from( 'progress' )
    .select( 'challenge_id' )
    .eq( 'user_id', test_user )
    .eq( 'exhibit_id', 'telecomm' )
    .eq( 'completed', true )
    .then( result => {
      if ( done ) {
        fill_progress( result.data.length );
      } else {
        fill_progress( result.data.length, 'ar' );
      }
    });
}

count_progress();

function get_question() {
  db.from( 'challenges' )
    .select( 'question, answer, challenge_id, hint, hint_url' )
    .eq( 'type', 'ar' )
    .then( result => {
      const list = result.data;
      const one = list[ Math.floor( Math.random() * list.length ) ];

      question.textContent = one.question;
      right_answer = one.answer;
      chal_id = one.challenge_id;
      hint_msg.textContent = one.hint;
      hint_img.src = one.hint_url;
    });
}

get_question();