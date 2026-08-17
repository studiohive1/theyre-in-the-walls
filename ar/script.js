tmImage.load( 'model/model.json', 'model/metadata.json' )
  .then( model => {
    console.log( 'loaded', model.getTotalClasses() );
  })
  .catch( err => {
    console.log( 'error', err.message );
  });

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then( stream => {
    document.getElementById( 'cam' ).srcObject = stream;
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

setInterval( () => {
  if ( !model ) return;
  model.predict( document.getElementById( 'cam' ) ).then( result => {
    console.log( result );
  });
}, 1000 );