const count = document.getElementById( 'count' );
const progress = document.getElementById( 'progress' );
const total = 6;

function fill_progress( done, chal_type ) {
  count.textContent = done + '/' + total;

  progress.querySelectorAll( '.hex' ).forEach( hex => hex.remove() );

  for ( let i = 0; i < total; i++ ) {
    const hex = document.createElement( 'span' );
    hex.className = 'hex';
    if ( i < done ) hex.classList.add( 'done' );
    if ( i === done && chal_type ) hex.classList.add( chal_type );
    progress.appendChild( hex );
  }
}