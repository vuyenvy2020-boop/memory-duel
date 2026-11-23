# Memory Duel

Game **lật thẻ tìm cặp** cho 2 người chơi trực tuyến, chủ đề công chúa cổ tích. Hai người lần lượt lật hai thẻ: giống nhau thì ghi một cặp và được lật tiếp, khác nhau thì úp lại và nhường lượt. Ai tìm được nhiều cặp hơn khi hết thẻ là người thắng.

## Chức năng

- Đăng ký, đăng nhập (mật khẩu được mã hóa trên máy chủ), đổi tên hiển thị và đổi mật khẩu
- Chơi với bạn bè bằng mã phòng hoặc link mời
- Ghép trận ngẫu nhiên theo cấp độ
- Luyện tập với máy ở 3 cấp độ: Dễ, Vừa, Khó
- Chat trong phòng, biểu cảm bay, đồng hồ đếm giờ mỗi lượt
- Nhiệm vụ hằng ngày, xu, phần thưởng (nhân vật, khung hồ sơ)
- Bảng xếp hạng, lịch sử trận đấu, thông báo và lời mời

## Công nghệ

- **Giao diện:** Vite + React
- **Máy chủ:** Node.js, Express, Socket.IO
- **Quản lý mã nguồn:** Git, GitHub

## Chạy trên máy

Cần cài sẵn Node.js. Mở hai cửa sổ terminal.

Máy chủ:

    cd server
    npm install
    npm run dev

Giao diện:

    cd client
    npm install
    npm run dev

Mở `http://localhost:5173` trên trình duyệt. Để thử hai người chơi, mở hai tab và đăng nhập hai tài khoản khác nhau.

## Cấu trúc thư mục

- `client/`: giao diện (React)
- `server/`: máy chủ (Socket.IO, luật chơi, tài khoản, bảng xếp hạng)

## Tác giả

Vũ Yến Vy