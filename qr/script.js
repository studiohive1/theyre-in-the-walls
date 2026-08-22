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
const button_sound = new Audio( 'assets/sound-button.wav' );

function play( sound ) {
  sound.currentTime = 0;
  sound.play();
}

submit.addEventListener( 'click', () => {
  play( button_sound );
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
  play( button_sound );
  location.href = '../dice/';
});