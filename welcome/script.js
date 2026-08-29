const click_sound = new Audio( 'assets/sound-click.wav' );

const saved_name = localStorage.getItem( 'username' );

if ( saved_name ) {
  username.textContent = saved_name.toUpperCase();
  name_slot.textContent = saved_name;
}

choose.addEventListener( 'click', () => {
  click_sound.currentTime = 0;
  click_sound.play();
  location.href = '../exhibit/';
});