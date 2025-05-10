# Sử dụng image Node.js 22
FROM node:22-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép file package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Mở cổng cho React dev server
EXPOSE 3000

# Chạy ứng dụng React trong chế độ development
CMD ["npm", "start"]