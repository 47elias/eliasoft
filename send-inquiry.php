<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

function respond(bool $success, string $message, int $status = 200): void
{
    http_response_code($status);
    $acceptsJson = strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

    if ($acceptsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message]);
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    $title = $success ? 'Inquiry sent' : 'Inquiry not sent';
    $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . $safeTitle . ' | Eliasoft Technologies</title><body style="font:16px/1.6 Arial,sans-serif;max-width:680px;margin:12vh auto;padding:24px;color:#17213b">';
    echo '<h1>' . $safeTitle . '</h1><p>' . $safeMessage . '</p><p><a href="index.html#contact">Return to Eliasoft</a></p></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Please submit the contact form to send your inquiry.', 405);
}

if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(true, 'Thank you. Your inquiry has been received.');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$organization = trim((string) ($_POST['organization'] ?? ''));
$project = trim((string) ($_POST['project'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

$allowedProjects = [
    'Advanced high school management system',
    'Retail, sales or inventory system',
    'HR, payroll or finance system',
    'Website or web application',
    'Mobile application',
    'Digital consulting or support',
    'Something else',
];

if ($name === '' || strlen($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    respond(false, 'Enter your name and a valid email address, then submit the form again.', 422);
}
if ($organization !== '' && strlen($organization) > 160) {
    respond(false, 'Keep the company or school name under 160 characters.', 422);
}
if (!in_array($project, $allowedProjects, true)) {
    respond(false, 'Choose a project type from the list and submit the form again.', 422);
}
if ($message === '' || strlen($message) > 4000) {
    respond(false, 'Enter project details under 4,000 characters.', 422);
}

$autoload = __DIR__ . '/vendor/autoload.php';
$configPath = __DIR__ . '/mail-config.php';
if (!is_file($autoload) || !is_file($configPath)) {
    respond(false, 'The email service is not configured yet. Please email Eliasoft at musamukahlera@gmail.com.', 503);
}

define('ELIASOFT_MAIL_HANDLER', true);
$config = require $configPath;
if (!is_array($config)
    || empty($config['smtp_username'])
    || empty($config['smtp_password'])
    || $config['smtp_password'] === 'PASTE_GOOGLE_APP_PASSWORD_HERE'
    || empty($config['to_email'])) {
    respond(false, 'The email service is not configured yet. Please email Eliasoft at musamukahlera@gmail.com.', 503);
}

require $autoload;

try {
    $mailer = new PHPMailer(true);
    $mailer->isSMTP();
    $mailer->Host = (string) ($config['smtp_host'] ?? 'smtp.gmail.com');
    $mailer->SMTPAuth = true;
    $mailer->Username = (string) $config['smtp_username'];
    $mailer->Password = preg_replace('/\s+/', '', (string) $config['smtp_password']);
    $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mailer->Port = (int) ($config['smtp_port'] ?? 587);
    $mailer->Timeout = 15;
    $mailer->SMTPDebug = 0;
    $mailer->CharSet = PHPMailer::CHARSET_UTF8;
    $mailer->setFrom($mailer->Username, 'Eliasoft Website');
    $mailer->addAddress((string) $config['to_email'], 'Eliasoft Technologies');
    $mailer->addReplyTo($email, $name);
    $mailer->Subject = 'Website inquiry: ' . $project;
    $mailer->isHTML(false);

    $emailBody = [
        'New project inquiry from the Eliasoft website',
        '',
        'Name: ' . $name,
        'Email: ' . $email,
        $organization !== '' ? 'Company or school: ' . $organization : null,
        'Interested in: ' . $project,
        '',
        'Project details:',
        $message,
    ];
    $mailer->Body = implode("\n", array_filter($emailBody, static fn ($line) => $line !== null));
    $mailer->send();

    respond(true, 'Thanks. Your inquiry has been emailed to Eliasoft. We will contact you soon.');
} catch (Throwable $error) {
    error_log('Eliasoft contact form mail error: ' . $error->getMessage());
    respond(false, 'We could not send your inquiry right now. Please email musamukahlera@gmail.com or contact us on WhatsApp.', 502);
}
