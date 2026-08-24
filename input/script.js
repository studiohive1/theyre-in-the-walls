const click_sound = new Audio( 'assets/sound-click.wav' );

function play( sound ) {
  sound.currentTime = 0;
  sound.play();
}

const answer = document.getElementById( 'answer' );
let is_right = false;
let done = false;

submit.addEventListener( 'click', () => {
  play( click_sound );
  if ( done ) return;
  const typed = answer.value.trim().toUpperCase();
  is_right = typed === 'RUN';
  if ( is_right ) {
    done = true;
    save_done( typed );
    document.body.classList.add( 'solved' );
  } else {
    save_try( typed );
    oops.className = 'show';
  }
});

oops.addEventListener( 'click', () => {
  play( click_sound );
  oops.className = '';
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

function save_done( given ) {
  db.from( 'progress' )
    .insert({
      user_id: test_user,
      exhibit_id: 'telecomm',
      challenge_id: 'input-1',
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
      challenge_id: 'input-1',
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
        fill_progress( result.data.length, 'input' );
      }
    });
}

count_progress();