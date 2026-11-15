<?php
return [
    'host'       => 'smtp.gmail.com',
    'port'       => 587,

'username'   => 'silahacademic@gmail.com',
    'password'   => (require __DIR__ . '/secret.php')['mail_password'],
    'from_email' => 'silahacademic@gmail.com',
    'from_name'  => 'Silah'
];