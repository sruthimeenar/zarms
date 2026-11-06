<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Email {
    private $driver;

    public function __construct() {
        $this->driver = EMAIL_DRIVER;
    }

    private static function service() {
        return new self();
    }

    public static function send($to, $subject, $htmlBody, $textBody = null, $replyTo = null) {
        return self::service()->dispatch($to, $subject, $htmlBody, $textBody, $replyTo);
    }

    public static function sendRegistrationOtpToAdmin($adminEmail, $adminName, $requestName, $requestEmail, $requestPhone, $otp) {
        $title = 'Registration OTP Approval';
        $subject = 'ZARMS Tec - Registration OTP Verification';

        $content = "
            <p>Hello {$adminName},</p>
            <p>A new registration request was submitted.</p>
            <p><strong>Requested by:</strong> {$requestName}<br>
            <strong>Email:</strong> {$requestEmail}<br>
            <strong>Phone:</strong> {$requestPhone}</p>
            <p>Use the OTP below to approve registration.</p>
        ";

        $footer = 'This OTP expires in ' . OTP_EXPIRY_MINUTES . ' minutes.';
        $html = self::service()->buildTemplate($title, $content, $otp, $footer);

        return self::send($adminEmail, $subject, $html);
    }

    public static function sendPasswordResetOTP($email, $name, $otp) {
        $title = 'Password Reset OTP';
        $subject = 'ZARMS Tec - Password Reset Verification';

        $content = "
            <p>Hello {$name},</p>
            <p>We received a request to reset your password.</p>
            <p>Use the OTP below to continue:</p>
        ";

        $footer = 'This OTP expires in ' . OTP_EXPIRY_MINUTES . ' minutes. If you did not request this, ignore this email.';
        $html = self::service()->buildTemplate($title, $content, $otp, $footer);

        return self::send($email, $subject, $html);
    }

    public static function sendRegistrationSuccess($email, $name) {
        $title = 'Registration Successful';
        $subject = 'Welcome to ZARMS Tec';

        $content = "
            <p>Hello {$name},</p>
            <p>Your admin registration is approved and your account is now active.</p>
            <p>You can sign in using your registered email and password.</p>
        ";

        $footer = 'If you did not create this account, contact the administrator immediately.';
        $html = self::service()->buildTemplate($title, $content, null, $footer);

        return self::send($email, $subject, $html);
    }

    public static function sendEnquiryNotification($enquiryEmails, $enquiry) {
        $service = $enquiry['service'] ?? 'general';
        $title = 'New Enquiry Received';
        $subject = "ZARMS Tec - New {$service} enquiry";

        $content = "
            <p>A new enquiry has been submitted on the website.</p>
            <p><strong>Name:</strong> " . htmlspecialchars((string)$enquiry['name']) . "<br>
            <strong>Email:</strong> " . htmlspecialchars((string)$enquiry['email']) . "<br>
            <strong>Phone:</strong> " . htmlspecialchars((string)$enquiry['phone']) . "<br>
            <strong>Company:</strong> " . htmlspecialchars((string)($enquiry['company'] ?? '-')) . "<br>
            <strong>Service:</strong> " . htmlspecialchars((string)$service) . "</p>
            <p><strong>Message:</strong><br>" . nl2br(htmlspecialchars((string)$enquiry['message'])) . "</p>
        ";

        $footer = 'Please review and respond from the admin dashboard.';
        $html = self::service()->buildTemplate($title, $content, null, $footer);

        // Get user's email for Reply-To
        $userEmail = $enquiry['email'] ?? null;
        $userName = $enquiry['name'] ?? 'Customer';

        $results = [];
        foreach ($enquiryEmails as $email) {
            $results[$email] = self::send($email, $subject, $html, null, $userEmail);
        }

        return $results;
    }

    public static function sendEnquiryThankYou($toEmail, $name, $service) {
        $title = 'Thank You For Contacting Us';
        $subject = 'ZARMS Tec - We received your enquiry';

        $content = "
            <p>Hello {$name},</p>
            <p>Thank you for contacting ZARMS Tec.</p>
            <p>We received your enquiry for <strong>" . htmlspecialchars((string)$service) . "</strong> and our team will contact you soon.</p>
        ";

        $footer = 'This is an automated acknowledgment email.';
        $html = self::service()->buildTemplate($title, $content, null, $footer);

        return self::send($toEmail, $subject, $html);
    }

    public static function sendUserCredentials($email, $name, $password, $role, $isGenerated = true) {
        $title = 'Welcome to ZARMS Tec - Your Account Credentials';
        $subject = 'Welcome to ZARMS Tec - Your Account Credentials';

        $content = "
            <p>Hello <strong>{$name}</strong>,</p>
            <p>Your account has been created successfully at ZARMS Tec!</p>
        ";

        if ($isGenerated) {
            $content .= "
                <p>A temporary password has been generated for your account. For your security, we recommend changing it after your first login.</p>
            ";
        }

        $content .= "
            <div style='background: #f0f9ff; padding: 20px; margin: 20px 0; border-left: 4px solid #0ea5e9;'>
                <h3 style='margin: 0 0 10px 0; color: #0c5460;'>🔐 Your Login Credentials</h3>
                <table style='border-collapse: collapse; width: 100%;'>
                    <tr>
                        <td style='padding: 8px 0; font-weight: bold; min-width: 100px;'>Email:</td>
                        <td style='padding: 8px;'>" . htmlspecialchars($email) . "</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; font-weight::bold;'>Password:</td>
                        <td style='padding: 8px;'><code style='background: #f8f9fa; padding: 4px 8px; font-size: 14px;'>" . htmlspecialchars($password) . "</code></td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; font-weight: bold;'>Role:</td>
                        <td style='padding: 8px;'>" . ucfirst($role) . "</td>
                    </tr>
                </table>
            </div>
            <p style='margin: 20px 0 10px 0;'>You can login at: <a href='http://localhost:5173/login' style='color: #0ea5e9; text-decoration: none; font-weight: 600;'>http://localhost:5173/login</a></p>
        ";

        $footer = $isGenerated
            ? 'For security, please change your password after first login. If you did not request this account, please contact administrator immediately.'
            : 'If you did not create this account, please contact administrator immediately.';

        $html = self::service()->buildTemplate($title, $content, null, $footer);

        return self::send($email, $subject, $html);
    }

    public static function sendPasswordResetSuccess($email, $name) {
        $title = 'Password Reset Successful';
        $subject = 'ZARMS Tec - Your password has been reset';

        $content = "
            <p>Hello {$name},</p>
            <p>Your password has been successfully reset.</p>
            <p>You can now sign in to your account using your new password.</p>
            <p style='background: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;'>
                <strong>🔒 Security Notice:</strong><br>
                For your security, all previous sessions have been revoked. You will need to log in again on all devices.
            </p>
            <p>If you did not request this password reset, please contact our support team immediately.</p>
        ";

        $footer = 'If you did not reset your password, please contact administrator immediately.';
        $html = self::service()->buildTemplate($title, $content, null, $footer);

        return self::send($email, $subject, $html);
    }

    private function dispatch($to, $subject, $htmlBody, $textBody = null, $replyTo = null) {
        if ($this->driver === 'smtp') {
            return $this->sendViaSMTP($to, $subject, $htmlBody, $textBody, $replyTo);
        }

        if ($this->driver === 'sendgrid') {
            return $this->sendViaSendGrid($to, $subject, $htmlBody, $textBody, $replyTo);
        }

        return $this->sendViaMock($to, $subject, $htmlBody);
    }

    private function sendViaSMTP($to, $subject, $htmlBody, $textBody = null, $replyTo = null) {
        try {
            $mailer = new PHPMailer(true);
            $mailer->isSMTP();
            $mailer->Host = SMTP_HOST;
            $mailer->SMTPAuth = true;
            $mailer->Username = SMTP_USERNAME;
            $mailer->Password = SMTP_PASSWORD;
            $mailer->SMTPSecure = SMTP_ENCRYPTION;
            $mailer->Port = SMTP_PORT;
            $mailer->CharSet = 'UTF-8';

            $mailer->setFrom(EMAIL_FROM_ADDRESS, EMAIL_FROM_NAME);
            $mailer->addAddress($to);

            // Set Reply-To to user's email if provided
            if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
                $mailer->addReplyTo($replyTo);
            }

            $mailer->Subject = $subject;
            $mailer->isHTML(true);
            $mailer->Body = $htmlBody;
            $mailer->AltBody = $textBody ?? strip_tags($htmlBody);
            $mailer->send();

            return ['success' => true, 'message' => 'Email sent successfully'];
        } catch (Exception $e) {
            error_log('SMTP send failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'SMTP send failed'];
        }
    }

    private function sendViaSendGrid($to, $subject, $htmlBody, $textBody = null, $replyTo = null) {
        if (empty(SENDGRID_API_KEY)) {
            return ['success' => false, 'message' => 'SendGrid API key not configured'];
        }

        $personalization = [
            'to' => [['email' => $to]],
            'subject' => $subject
        ];

        // Add Reply-To if provided
        if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
            $personalization['reply_to'] = ['email' => $replyTo];
        }

        $data = [
            'personalizations' => [$personalization],
            'from' => [
                'email' => EMAIL_FROM_ADDRESS,
                'name' => EMAIL_FROM_NAME
            ],
            'content' => [[
                'type' => 'text/html',
                'value' => $htmlBody
            ]]
        ];

        if ($textBody) {
            $data['content'][] = ['type' => 'text/plain', 'value' => $textBody];
        }

        $ch = curl_init('https://api.sendgrid.com/v3/mail/send');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . SENDGRID_API_KEY,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($status === 202) {
            return ['success' => true, 'message' => 'Email sent successfully'];
        }

        error_log('SendGrid send failed: ' . $response);
        return ['success' => false, 'message' => 'SendGrid send failed'];
    }

    private function sendViaMock($to, $subject, $htmlBody) {
        $log = "\n[EMAIL MOCK] " . date('Y-m-d H:i:s') . "\nTo: {$to}\nSubject: {$subject}\n" . strip_tags($htmlBody) . "\n";
        error_log($log);
        return ['success' => true, 'message' => 'Email logged (mock mode)'];
    }

    private function buildTemplate($title, $contentHtml, $otp = null, $footer = '') {
        $otpBlock = '';
        if ($otp !== null) {
            $otpBlock = "
                <div style='margin:24px 0; text-align:center;'>
                    <div style='display:inline-block; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px 20px;'>
                        <div style='font-size:12px; color:#64748b; margin-bottom:6px;'>OTP Code</div>
                        <div style='font-size:32px; letter-spacing:8px; font-weight:700; color:#1e3a8a;'>{$otp}</div>
                    </div>
                </div>
            ";
        }

        return "
            <div style='font-family:Inter,Segoe UI,Roboto,Arial,sans-serif; background:#f1f5f9; padding:24px;'>
                <div style='max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;'>
                    <div style='background:linear-gradient(135deg,#1e3a8a,#2563eb); color:#ffffff; padding:20px 24px;'>
                        <h1 style='margin:0; font-size:24px;'>ZARMS Tec</h1>
                        <p style='margin:6px 0 0 0; opacity:.92; font-size:14px;'>{$title}</p>
                    </div>
                    <div style='padding:24px; color:#0f172a; font-size:15px; line-height:1.6;'>
                        {$contentHtml}
                        {$otpBlock}
                        <p style='margin-top:24px; color:#64748b; font-size:13px;'>{$footer}</p>
                    </div>
                    <div style='padding:14px 24px; border-top:1px solid #e2e8f0; color:#94a3b8; font-size:12px;'>
                        � " . date('Y') . " ZARMS Tec. All rights reserved.
                    </div>
                </div>
            </div>
        ";
    }
}
