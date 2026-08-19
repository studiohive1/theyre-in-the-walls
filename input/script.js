const click_sound = new Audio( 'assets/sound-click.wav' );

settings.addEventListener( 'click', () => {
  click_sound.currentTime = 0;
  click_sound.play();
});

back.addEventListener( 'click', () => {
  click_sound.currentTime = 0;
  click_sound.play();
});