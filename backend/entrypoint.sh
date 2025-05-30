#!/bin/sh


# Chờ MySQL sẵn sàng
until mysql -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_DATABASE"; do
  echo "Waiting for MySQL at $DB_HOST..."
  sleep 2
done

# Kiểm tra xem file marker đã tồn tại chưa
MARKER_FILE=/var/www/storage/.initialized

if [ ! -f "$MARKER_FILE" ]; then
    echo "Running initial setup..."
    php artisan key:generate
    php artisan migrate --force
    php artisan db:seed --force
    touch $MARKER_FILE
    echo "Initial setup completed."
else
    echo "Setup already completed, skipping..."
fi

# Chạy PHP-FPM
exec php-fpm