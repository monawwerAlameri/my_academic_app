<?php
return [
    'host'       => 'smtp.gmail.com',
    'port'       => 587,
    'username'   => 'your_email@gmail.com',
    'password' => (require DIR . '/secret.php')['mail_password'],
    'from_email' => 'your_email@gmail.com',
    'from_name'  => 'Academic Booking'
];