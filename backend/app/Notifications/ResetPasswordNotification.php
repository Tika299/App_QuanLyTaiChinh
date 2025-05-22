<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public $token;
    public $email;

    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = "http://localhost:3000/reset-password/{$this->token}?email={$this->email}";

        return (new MailMessage)
            ->subject('Đặt lại mật khẩu')
            ->line('Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu.')
            ->action('Đặt lại mật khẩu', $url)
            ->line('Nếu bạn không yêu cầu, bạn có thể bỏ qua email này.');
    }
}
