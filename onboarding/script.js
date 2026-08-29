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
  go_back();
});

pause.addEventListener( 'click', e => {
  e.stopPropagation();
  play( click_sound );
});

let user_id = '';

thats_me.addEventListener( 'click', () => {
  play( click_sound );
  const typed = name_box.value.trim();
  if ( typed === '' ) return;

  db.from( 'users' )
    .insert({ username: typed })
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
      username.textContent = name_box.value.trim().toUpperCase();
      card_name.textContent = name_box.value.trim();
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
  if ( btn.id === 'hmm' ) continue;
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

let rule_now = 0;
const slide = document.querySelector( '.slide' );

function show_rule() {
  slide.style.transform = 'translateX(' + ( rule_now * -25 ) + '%)';
}

left.addEventListener( 'click', () => {
  play( click_sound );
  if ( rule_now <= 0 ) return;
  rule_now = rule_now - 1;
  show_rule();
});

right.addEventListener( 'click', () => {
  play( click_sound );
  if ( rule_now >= 3 ) {
    location.href = '../dice/';
    return;
  }
  rule_now = rule_now + 1;
  show_rule();
});