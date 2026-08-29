const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const click_sound = new Audio( 'assets/sound-click.wav' );

const saved_id = localStorage.getItem( 'user_id' );
const saved_name = localStorage.getItem( 'username' );

if ( !saved_id ) {
  location.href = '../onboarding/';
} else if ( !saved_name ) {
  db.from( 'users' )
    .select( 'username' )
    .eq( 'id', saved_id )
    .maybeSingle()
    .then( result => {
      if ( result.data ) {
        localStorage.setItem( 'username', result.data.username );
        username.textContent = result.data.username.toUpperCase();
        name_slot.textContent = result.data.username;
      } else {
        location.href = '../onboarding/';
      }
    });
} else {
  username.textContent = saved_name.toUpperCase();
  name_slot.textContent = saved_name;
}

choose.addEventListener( 'click', () => {
  click_sound.currentTime = 0;
  click_sound.play();
  location.href = '../dice/';
});