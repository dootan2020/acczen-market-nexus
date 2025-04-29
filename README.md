
# Digital Deals Hub - Nền tảng giao dịch sản phẩm số

Digital Deals Hub là một nền tảng thương mại điện tử chuyên về sản phẩm kỹ thuật số cho thị trường Make Money Online (MMO). Hệ thống cung cấp tài khoản email, tài khoản mạng xã hội, khóa phần mềm và các sản phẩm số khác cho khách hàng quốc tế.

## Tính năng chính

- Duyệt sản phẩm theo danh mục: Tài khoản Email, Tài khoản Mạng xã hội, và Phần mềm & Khóa
- Tìm kiếm sản phẩm cụ thể
- Thêm sản phẩm vào giỏ hàng, tiến hành thanh toán và hoàn tất mua hàng
- Hiển thị thông tin chi tiết sản phẩm, giá, đánh giá và nhãn

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 16.x trở lên)
- npm hoặc yarn

### Cài đặt các gói phụ thuộc
```bash
npm install
# hoặc
yarn install
```

### Khởi chạy môi trường phát triển
```bash
npm run dev
# hoặc
yarn dev
```

### Build cho môi trường production
```bash
npm run build
# hoặc
yarn build
```

## Cấu trúc dự án

```
digital-deals-hub/
├── public/             # Tài nguyên tĩnh
├── src/                # Mã nguồn
│   ├── components/     # Components UI
│   ├── contexts/       # Context API
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Các trang chính
│   ├── providers/      # Providers (Cart, Auth, etc.)
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Component gốc
│   └── main.tsx        # Entry point
├── .env                # Biến môi trường (không được commit)
├── vite.config.ts      # Cấu hình Vite
└── tailwind.config.ts  # Cấu hình Tailwind CSS
```

## Triển khai

### Các bước triển khai
1. Build dự án: `npm run build`
2. Kiểm tra build tại thư mục `dist/`
3. Triển khai thư mục `dist/` lên dịch vụ web hosting hoặc CDN

### Cấu hình môi trường
Tạo file `.env` với các biến môi trường cần thiết:

```
VITE_API_URL=https://api.example.com
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-key
```

## Tối ưu hiệu suất

Dự án đã được tối ưu hiệu suất với nhiều kỹ thuật:

- Code splitting tự động với Vite
- Lazy loading cho các components không quan trọng
- Bundle analysis với rollup-plugin-visualizer
- Service worker cho trải nghiệm offline và caching
- Tối ưu hóa hình ảnh với lazy loading

## Đóng góp

Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết chi tiết về quy trình đóng góp.

## Giấy phép

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE.md](LICENSE.md) để biết chi tiết.
