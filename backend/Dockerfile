# Sử dụng image PHP 8.3 với PHP-FPM
FROM php:8.3-fpm

# Cài đặt các tiện ích và thư viện cần thiết
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql

# Cài đặt Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Thiết lập thư mục làm việc
WORKDIR /var/www

# Sao chép mã nguồn Laravel và cài đặt dependencies
COPY . .
RUN composer install --optimize-autoloader --no-dev

# Cấp quyền cho thư mục storage và cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Sao chép entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Sử dụng entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]