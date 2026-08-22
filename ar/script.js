navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then( stream => {
    cam.srcObject = stream;
  })
  .catch( err => {
    guide.textContent = 'camera error: ' + err.name;
  });

let model;

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
      guide.textContent = "THAT'S RIGHT!";
      guide.className = 'right';
    } else {
      guide.textContent = 'hmm... not here! keep looking!';
      guide.className = 'wrong';
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