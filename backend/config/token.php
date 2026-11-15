<?php
define('TOKEN_LIFETIME_SECONDS', 7 * 24 * 60 * 60);

function base64urlEncode($bin) {
    return rtrim(strtr(base64_encode($bin), '+/', '-_'), '=');
}

function base64urlDecode($text) {
    return base64_decode(strtr($text, '-_', '+/'));
}

function tokenSecret() {
    static $secret = null;
    if ($secret === null) {
        $cfg = require DIR . '/secret.php';
        $secret = $cfg['token_secret'] ?? '';
        if (strlen($secret) < 32) {
            echo json_encode(["success" => false, "code" => "SERVER_MISCONFIGURED"]);
            exit;
        }
    }
    return $secret;
}

function issueToken($role, $id) {
    $payload = base64urlEncode(json_encode([
        "r"   => $role,
        "id"  => $id,
        "exp" => time() + TOKEN_LIFETIME_SECONDS,
    ]));
    $sig = base64urlEncode(hash_hmac('sha256', $payload, tokenSecret(), true));
    return $payload . "." . $sig;
}

function verifyToken($token, $role) {
    $parts = explode('.', (string)$token);
    if (count($parts) !== 2) return null;
    list($payload, $sig) = $parts;
    $expected = base64urlEncode(hash_hmac('sha256', $payload, tokenSecret(), true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(base64urlDecode($payload), true);
    if (!is_array($data)  ($data['r'] ?? '') !== $role  (int)($data['exp'] ?? 0) < time()) {
        return null;
    }
    return $data['id'] ?? null;
}

function readBearerToken() {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if ($header === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) { $header = $value; break; }
        }
    }
    if (preg_match('/^Bearer\s+(\S+)$/i', trim($header), $m)) return $m[1];
    return '';
}