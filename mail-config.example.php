<?php
// Copy this file to mail-config.php and add a Google App Password.
// Never put your normal Google account password here.
if (!defined('ELIASOFT_MAIL_HANDLER')) {
    http_response_code(404);
    exit;
}

return [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_username' => 'eliyasmukahlera1971@gmail.com',
    'smtp_password' => 'nowzhwdmxgeltvvz',
    'to_email' => 'musamukahlera@gmail.com',
];
