if ( navigator.mediaDevices ) {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then( stream => {
      cam.srcObject = stream;
    })
    .catch( err => {
      console.log( 'camera error: ' + err.name );
    });
} else {
  console.log( 'skipping camera hehe' );
}

const click_sound = new Audio( 'assets/sound-click.wav' );

let is_right = false;
let done = false;

function play( sound ) {
  sound.currentTime = 0;
  sound.play();
}

const henrys = [
  'assets/henry-correct.gif',
  'assets/henry-correct-2.gif',
  'assets/henry-correct-3.gif'
];

function pick_henry() {
  const n = Math.floor( Math.random() * henrys.length );
  correct_henry.src = henrys[ n ];
}

submit.addEventListener( 'click', () => {
  play( click_sound );
  if ( done ) return;
  if ( is_right ) {
    done = true;
    save_done();
    pick_henry();
    document.body.classList.add( 'solved' );
  } else {
    save_try();
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
  location.href = '../dice/?reroll=1';
});

const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const user_id = localStorage.getItem( 'user_id' ) || 'd860b0b8-2eae-480e-b858-994873709af7';
// need to check this with patricia's nfc card!

function save_done() {
  db.from( 'progress' )
    .insert({
      user_id: user_id,
      exhibit_id: 'telecomm',
      challenge_id: chal_id,
      type: 'qr',
      completed: true,
      completed_at: new Date(),
      given_answer: last_seen
    })
    .then( result => {
      console.log( result );
      count_progress();
    });
}

function save_try() {
  db.from( 'progress' )
    .insert({
      user_id: user_id,
      exhibit_id: 'telecomm',
      challenge_id: chal_id,
      type: 'qr',
      completed: false,
      given_answer: last_seen
    })
    .then( result => {
      console.log( result );
    });
}

function count_progress() {
  db.from( 'progress' )
    .select( 'challenge_id' )
    .eq( 'user_id', user_id )
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
let locked = false;
let last_seen = '';
let right_answer = '';
let chal_id = '';

const photo_cam = photo.getContext( '2d' );

function take_photo() {
  photo.width = cam.videoWidth;
  photo.height = cam.videoHeight;
  photo_cam.drawImage( cam, 0, 0, photo.width, photo.height );
  locked = true;
  is_right = true;
  view.classList.add( 'locked' );
  guide.className = 'right';
}

setInterval( () => {
  if ( locked ) return;
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
    if ( result.data === right_answer ) {
      take_photo();
      return;
    }
  } else {
    last_seen = '';
  }

  is_right = false;
  guide.className = 'wrong';

}, 500 );

function get_question() {
  db.from( 'progress' )
    .select( 'challenge_id' )
    .eq( 'user_id', user_id )
    .eq( 'exhibit_id', 'telecomm' )
    .eq( 'completed', true )
    .then( result => {
      const done_ids = result.data.map( row => row.challenge_id );
      pick_question( done_ids );
    });
}

function pick_question( done_ids ) {
  db.from( 'challenges' )
    .select( 'question, answer, challenge_id, hint, hint_url, hint_gif' )
    .eq( 'type', 'qr' )
    .then( result => {
      let list = result.data.filter( row => !done_ids.includes( row.challenge_id ) );
      if ( list.length === 0 ) list = result.data;

      const one = list[ Math.floor( Math.random() * list.length ) ];

      question.innerHTML = mark( one.question );
      right_answer = one.answer;
      chal_id = one.challenge_id;
      hint_msg.textContent = one.hint;
      hint_img.src = one.hint_url;
      if ( one.hint_gif ) hint_henry.src = one.hint_gif;
    });
}

get_question();

function mark( text ) {
  return text
    .replace( '[', '<span class="highlight">' )
    .replace( ']', '</span>' );
}