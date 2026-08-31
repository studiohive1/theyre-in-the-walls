pause.addEventListener( 'click', () => {
  pause_screen.classList.add( 'on' );
});

pause_close.addEventListener( 'click', () => {
  pause_screen.classList.remove( 'on' );
});

resume.addEventListener( 'click', () => {
  pause_screen.classList.remove( 'on' );
});