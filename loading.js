const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const card_guid = new URLSearchParams( location.search ).get( 'card' );

let return_user = false;

function go_title() {
  loading.classList.remove( 'on' );
  title.classList.add( 'on' );
}

if ( card_guid ) {
  db.from( 'nfc_cards' )
    .select( 'user_id' )
    .eq( 'guid', card_guid )
    .maybeSingle()
    .then( result => {
      if ( result.data ) {
        return_user = true;
        localStorage.setItem( 'user_id', result.data.user_id );
      }
      go_title();
    });
} else {
  if ( localStorage.getItem( 'user_id' ) ) {
    return_user = true;
  }
  go_title();
}

start.addEventListener( 'click', () => {
  if ( return_user ) {
    location.href = '../welcome/';
  } else {
    location.href = '../onboarding/' + location.search;
  }
});