navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then( stream => {
    cam.srcObject = stream;
  })
  .catch( err => {
    guide.textContent = 'camera error: ' + err.name;
  });

const cam = document.getElementById( 'cam' );
const guide = document.getElementById( 'guide' );

const click_sound = new Audio( 'assets/sound-click.wav' );

let is_right = false;
let done = false;

function play( sound ) {
  sound.currentTime = 0;
  sound.play();
}

submit.addEventListener( 'click', () => {
  play( click_sound );
  if ( done ) return;
  if ( is_right ) {
    done = true;
    save_done();
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

function save_done() {
  db.from( 'progress' )
    .insert({
      user_id: test_user,
      exhibit_id: 'telecomm',
      challenge_id: chal_id,
      type: 'qr',
      completed: true,
      completed_at: new Date()
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
      type: 'qr',
      completed_at: new Date(),
      given_answer: last_seen
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
        fill_progress( result.data.length, 'qr' );
      }
    });
}

count_progress();

const frame = document.createElement( 'canvas' );
let ok_time = 0;
let last_seen = '';
let right_answer = '';
let chal_id = '';

setInterval( () => {
  if ( !cam.videoWidth ) return;
  if ( done ) return;

  frame.width = cam.videoWidth;
  frame.height = cam.videoHeight;

  const draw = frame.getContext( '2d' );
  draw.drawImage( cam, 0, 0 );
  const pixels = draw.getImageData( 0, 0, frame.width, frame.height );
  const result = jsQR( pixels.data, pixels.width, pixels.height );

  if ( result ) {
    console.log( 'qr:', result.data );
    last_seen = result.data;
    if ( result.data === right_answer ) ok_time = Date.now();
  } else {
    last_seen = '';
  }

  is_right = Date.now() - ok_time < 3000;
  guide.className = is_right ? 'right' : 'wrong';

}, 500 );

function get_question() {
  db.from( 'challenges' )
    .select( 'question, answer, challenge_id, hint, hint_url' )
    .eq( 'type', 'qr' )
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