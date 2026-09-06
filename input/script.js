const click_sound = new Audio( 'assets/sound-click.wav' );

function play( sound ) {
  sound.currentTime = 0;
  sound.play();
}

const code = document.getElementById( 'code' );

const colours = {
  Y: 'yellow',
  G: 'green',
  R: 'red'
};

let oops_timer = null;

function show_oops() {
  oops.className = 'show';
  oops_timer = setTimeout( close_oops, 3000 );
}

function close_oops() {
  clearTimeout( oops_timer );
  oops.className = '';
}

function draw_code( text ) {
  code.innerHTML = '';
  for ( const letter of text ) {
    if ( letter === '/' ) {
      const line = document.createElement( 'span' );
      line.className = 'slash';
      line.textContent = '/';
      code.appendChild( line );
    } else {
      const dot = document.createElement( 'span' );
      dot.className = 'dot ' + colours[ letter ];
      code.appendChild( dot );
    }
  }
}

function mark( text ) {
  return text
    .replace( '[', '<span class="highlight">' )
    .replace( ']', '</span>' );
}

function draw_words( text ) {
  code.innerHTML = mark( text );
}

function draw_choices( text ) {
  const urls = text.trim().split( '\n' );
  choice_1.src = urls[0];
  choice_2.src = urls[1];
  choices.style.display = 'flex';
  code.style.display = 'none';
  answer.style.display = 'none';
}

const answer = document.getElementById( 'answer' );
let is_right = false;
let done = false;
let right_answer = '';
let chal_id = '';

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

  let given = '';
  if ( chal_id === 'multiple_choice' ) {
    given = picked;
    is_right = given === right_answer;
  } else {
    given = answer.value.trim().toUpperCase();
    is_right = given === right_answer.toUpperCase();
  }

  if ( is_right ) {
    done = true;
    save_done( given );
    pick_henry();
    document.body.classList.add( 'solved' );
  } else {
    save_try( given );
    show_oops();
  }
});

oops.addEventListener( 'click', () => {
  play( click_sound );
  close_oops();
});

next.addEventListener( 'click', () => {
  play( click_sound );
  location.href = '../dice/';
});

pause.addEventListener( 'click', () => {
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

hint.addEventListener( 'click', () => {
  play( click_sound );
  hint_box.className = 'show';
});

hint_box.addEventListener( 'click', () => {
  play( click_sound );
  hint_box.className = '';
});

const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const user_id = localStorage.getItem( 'user_id' ) || 'd860b0b8-2eae-480e-b858-994873709af7';
// need to check this with patricia's nfc card!

function save_done( given ) {
  db.from( 'progress' )
    .insert({
      user_id: user_id,
      exhibit_id: 'telecomm',
      challenge_id: chal_id,
      type: 'input',
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
      user_id: user_id,
      exhibit_id: 'telecomm',
      challenge_id: chal_id,
      type: 'input',
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
    .eq( 'user_id', user_id )
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

function get_question() {
  db.from( 'challenges' )
    .select( 'question, body, answer, challenge_id, hint, hint_url, hint_gif' )
    .eq( 'type', 'input' )
    .then( result => {
      const list = result.data;
      const one = list[ Math.floor( Math.random() * list.length ) ];
      
      hint_msg.textContent = one.hint;
      hint_img.src = one.hint_url;
      if ( one.hint_gif ) hint_henry.src = one.hint_gif;

      question.innerHTML = mark( one.question );
      if ( one.challenge_id === 'morse' ) {
        draw_code( one.body );
      }
      if ( one.challenge_id === 'incorrect_word' ) {
        draw_words( one.body );
      }
      if ( one.challenge_id === 'multiple_choice' ) {
        draw_choices( one.body );
      }
      right_answer = one.answer;
      chal_id = one.challenge_id;
    });
}

get_question();

let picked = 0;

for ( const box of document.querySelectorAll( '.pick' ) ) {
  box.addEventListener( 'click', () => {
    play( click_sound );
    for ( const other of document.querySelectorAll( '.pick' ) ) {
      other.classList.remove( 'on' );
    }
    box.classList.add( 'on' );
    picked = box.dataset.num;
  });
}