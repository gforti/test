filter_var($s, FILTER_SANITIZE_STRING) -> remove html tags

filter_input(INPUT_GET, ‘id’, FILTER_VALIDATE_INT) validate or sanitize an input variable

ctype_* ctype_alpha

For output always use
htmlspecialchars($s, ENT_QUOTES) to ensure html is not output


For Json always set the content-type to application/json
header(‘content-type: application/json’);

json_encode, second parameters JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP

Content security policy

Header(“Content-Security-Policy: default-src ’self’ ”)
- only files from the origin can be used
- inline is also prevented by content security 

If you need inline you can add ‘unsafe-inline’

Header(“Content-Security-Policy: default-src ’self’ ’unsafe-inline’ “);

For after inline code you can use a nonce

’Nonce-[uiid]’

‘Nonce-abc123’

<script nonce=“abc123”>

$nonce = uniqid();

Header(“Content-Security-Policy: default-src ’self’ ‘nonce-$nonce’ “);

<script nonce=“<?php echo $nonce; ?>”> alert(1);</script>


Cookies
Use https
Set secure cookie flag
Use http only

Set cookie function, they are optional but set the cookie with the correct values.

Name, value, expiration date, path, domain, secure flag, http only
setcookie(‘cookie1’, rand(100,999),  0, ‘/‘, ‘’, false, true);
setcookie(‘cookie2’, rand(100,999),  0, ‘/‘, ‘’, true, false);

Check document.cookie, JavaScript cannot access cookie

Sessions
Secure it in ini file
Session.use_strict_mode = 1 - tries to prevent session fixation, so new session with new id created
Session.cookie_secure = 1 - secure flag is set for the cookie
Session.use_only_cookies = 1 - only session id in cookies are accepted not from the url
Session.cookie_httponly = 1 - javascript does not access cookie
Session.hash_function = 1 - do not want attacker to guess the hash, make it longer and harder
Session.hash_bits_per_character = 6

HTTP Strict Transport Security

Strict-Transport-Security
max-age=31536000; includeSubDomains; preload

Prevent cross site scripting

$name = ‘token-‘ . mt_rand();
$token = random_bytes(32);
$_session[$name] = $token;

<input type=“hidden” name=“_csrfname” value=‘token-123456” />
<input type=“hidden” name=“_csrfvalue” value=‘abcdefg123456” />


Highjacking with Iframes, using your site to make people click a different link

header(‘X-FRAME-OPTIONS’, ‘DENY’) or ‘SAMEORIGIN’

header(‘Content-Security-Policy’, “frame-ancestors: ‘none’ ”); or ‘self’, or domain/URI list

<Iframe src=frame.php?setHeader=1”></iframe>

$deny = filter_input(INPUT_GET, ‘setHeader’);
If ( $deny ) {
header(‘X-FRAME-OPTIONS’, ‘DENY’);
}

Errors

display_errors = off
display_startup_errors = off
log_errors = on
error_log = syslog

Disable revealing information
expose_php = off


