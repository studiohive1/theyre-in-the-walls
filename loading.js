const supa_api = 'https://jxsilhqrwbnytjghdwdw.supabase.co/';
const supa_key = 'sb_publishable_xhJeQe0pPWiMq19Q5UgwgA_8b5mAJUg';
const db = supabase.createClient( supa_api, supa_key );

const card_guid = new URLSearchParams( location.search ).get( 'card' );

let return_user = false;
let checked = false;
let waited = false;

function go_title() {
  if ( !checked || !waited ) return;
  loading.classList.remove( 'on' );
  title.classList.add( 'on' );
}

setTimeout( () => {
  waited = true;
  go_title();
}, 2000 );
// checked with cass!

if ( card_guid ) {
  db.from( 'nfc_cards' )
    .select( 'user_id, users(username)' )
    .eq( 'guid', card_guid )
    .maybeSingle()
    .then( result => {
      if ( result.data ) {
        return_user = true;
        localStorage.setItem( 'user_id', result.data.user_id );
        localStorage.setItem( 'username', result.data.users.username );
      }
      checked = true;
      go_title();
    });
} else {
  if ( localStorage.getItem( 'user_id' ) ) {
    return_user = true;
  }
  checked = true;
  go_title();
}

start.addEventListener( 'click', () => {
  if ( return_user ) {
    location.href = '../welcome/';
  } else {
    location.href = '../onboarding/' + location.search;
  }
});

title.addEventListener( 'click', () => {
  title.classList.add( 'ready' );
});

played.addEventListener( 'click', () => {
  location.href = 'welcome/';
});