const click_sound = new Audio( 'assets/sound-click.wav' );
const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const card_guid = new URLSearchParams( location.search ).get( 'card' );

function play( sound ) {
  sound.currentTime = 0;
  sound.play();
}

let now = 0;
const steps = document.querySelectorAll( '.step' );

function go_next() {
  if ( now >= steps.length - 1 ) return;
  steps[ now ].classList.remove( 'on' );
  now = now + 1;
  steps[ now ].classList.add( 'on' );
}

function go_back() {
  if ( now <= 0 ) return;
  steps[ now ].classList.remove( 'on' );
  now = now - 1;
  steps[ now ].classList.add( 'on' );
}

p1.addEventListener( 'click', go_next );
p2.addEventListener( 'click', go_next );

back.addEventListener( 'click', e => {
  e.stopPropagation();
  play( click_sound );
  if ( p12.classList.contains( 'picked' ) ) {
    p12.classList.remove( 'picked' );
    exhibit_talk.textContent = 'If you pick an exhibit, maybe we can see if any of my friends was working there';
    return;
  }
  go_back();
});

pause.addEventListener( 'click', e => {
  e.stopPropagation();
  play( click_sound );
});

let user_id = '';

function make_tag() {
  const num = Math.floor( Math.random() * 10000 );
  return String( num ).padStart( 4, '0' );
}

thats_me.addEventListener( 'click', () => {
  play( click_sound );
  const typed = name_box.value.trim();
  if ( typed === '' ) return;

  const tag = make_tag();

  db.from( 'users' )
    .insert({ username: typed, tag: tag })
    .select()
    .single()
    .then( result => {
      if ( result.error ) {
        console.log( result.error );
        return;
      }
      user_id = result.data.id;
      if ( card_guid ) {
        return db.from( 'nfc_cards' ).insert({ guid: card_guid, user_id: user_id });
      }
    })
    .then( result => {
      if ( !user_id ) return;
      localStorage.setItem( 'user_id', user_id );
      localStorage.setItem( 'username', typed );
      localStorage.setItem( 'tag', tag );
      username.textContent = name_box.value.trim().toUpperCase();
      card_name.textContent = typed + '#' + tag;
      go_next();
    });
}); 

name_box.addEventListener( 'focus', () => {
  p3.classList.add( 'typing' );
  setTimeout( () => {
    window.scrollTo( 0, 0 );
  }, 100 );
});

name_box.addEventListener( 'blur', () => {
  p3.classList.remove( 'typing' );
});

looks_good.addEventListener( 'click', () => {
  play( click_sound );
  go_next();
});

for ( const btn of document.querySelectorAll( '.action' ) ) {
  if ( btn.id === 'hmm' || btn.id === 'got_it' || btn.id === 'lets_go' ) continue;
  btn.addEventListener( 'click', () => {
    play( click_sound );
    go_next();
  });
}

hmm.addEventListener( 'click', () => {
  play( click_sound );

  const guy = document.querySelector( '#p7 .henry' );
  guy.classList.remove( 'look' );
  guy.classList.add( 'raise' );

  p8.classList.add( 'on' );

  setTimeout( () => {
    p8.classList.add( 'rise' );
  }, 2004 );

  setTimeout( go_next, 3504 );

  setTimeout( go_next, 5504 );
});

got_it.addEventListener( 'click', () => {
  play( click_sound );
  go_next();
});

let rule_now = 0;
const slide = document.querySelector( '.slide' );
const gifs = [
  'assets/dice-rules-1.gif',
  'assets/dice-rules-2.gif',
  'assets/dice-rules-3.gif',
  'assets/dice-rules-4.gif'
];

function show_rule() {
  slide.style.transform = 'translateX(' + ( rule_now * -25 ) + '%)';
  cube_gif.src = gifs[ rule_now ];
  stop_sprite();
  if ( rule_now === 1 ) start_sprite();
}

left.addEventListener( 'click', () => {
  play( click_sound );
  if ( rule_now <= 0 ) return;
  rule_now = rule_now - 1;
  show_rule();
});

right.addEventListener( 'click', () => {
  play( click_sound );
  if ( rule_now >= 3 ) return;
  rule_now = rule_now + 1;
  show_rule();
});

let frame_now = 0;
let sprite_timer = null;

function show_card() {
  if ( frame_now >= 3 && frame_now <= 11 ) {
    chal_card.src = 'assets/input-card.png';
    chal_card.classList.add( 'show' );
  } else if ( frame_now >= 27 && frame_now <= 36 ) {
    chal_card.src = 'assets/qr-card.png';
    chal_card.classList.add( 'show' );
  } else if ( frame_now >= 52 && frame_now <= 60 ) {
    chal_card.src = 'assets/ar-card.png';
    chal_card.classList.add( 'show' );
  } else {
    chal_card.classList.remove( 'show' );
  }
}

function next_frame() {
  dice_sprite.style.backgroundPosition = ( frame_now * 100 / 72 ) + '% 0';
  show_card();
  frame_now = frame_now + 1;
  if ( frame_now >= 73 ) frame_now = 0;
}

function start_sprite() {
  p11.classList.add( 'sprite_mode' );
  frame_now = 0;
  sprite_timer = setInterval( next_frame, 125 );
}

function stop_sprite() {
  p11.classList.remove( 'sprite_mode' );
  chal_card.classList.remove( 'show' );
  clearInterval( sprite_timer );
}

let exhibit_now = '';

for ( const btn of document.querySelectorAll( '#pick .exhibit' ) ) {
  btn.addEventListener( 'click', () => {
    play( click_sound );

    if ( btn.id !== 'telecomm' ) {
      sthelse.classList.add( 'show' );
      return;
    }

    exhibit_now = btn.id;
    picked_name.textContent = btn.textContent;
    picked_name.className = 'exhibit ' + btn.id;
    exhibit_talk.innerHTML = 'Great! Looks like <span class="highlight">Morph</span> was working here';
    fill_progress( 0 );
    p12.classList.add( 'picked' );
  });
}

sthelse.addEventListener( 'click', () => {
  sthelse.classList.remove( 'show' );
});