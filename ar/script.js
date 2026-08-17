navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then( stream => {
    cam.srcObject = stream;
  })
  .catch( err => {
    console.log( 'camera error', err.name );
  });

let model;

tmImage.load( 'model/model.json', 'model/metadata.json' )
  .then( m => {
    model = m;
    console.log( 'loaded', model.getTotalClasses() );
  })
  .catch( err => {
    console.log( 'error', err.message );
  });

const cam = document.getElementById( 'cam' );
const guide = document.getElementById( 'guide' );

setInterval( () => {
  if ( !model ) return;

  model.predict( cam ).then( result => {

    let chosen = result[0];
    for ( const one of result ) {
      if ( one.probability > chosen.probability ) {
        chosen = one;
      }
    }

    if ( chosen.probability < 0.8 ) {
      guide.textContent = 'hmm... i dont think thats what bert was looking for';
    } else {
      guide.textContent = chosen.className + ' ' + Math.round( chosen.probability * 100 ) + '%';
    }
  });
}, 1000 );