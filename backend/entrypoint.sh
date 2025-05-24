#!/bin/sh

# Kiểm tra xem file marker đã tồn tại chưa
MARKER_FILE=/var/www/storage/.initialized

if [ ! -f "$MARKER_FILE" ]; then
    echo "Running initial setup..."
    php artisan key:generate
    php artisan migrate --seed --force
    touch $MARKER_FILE
    echo "Initial setup completed."
else
    echo "Setup already completed, skipping..."
fi

# Chạy PHP-FPM
exec php-fpm