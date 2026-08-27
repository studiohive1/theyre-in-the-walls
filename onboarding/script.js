const click_sound = new Audio( 'assets/sound-click.wav' );

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