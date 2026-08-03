# Hướng dẫn Khởi chạy & Kiểm thử Dự án CookMate AI

Tài liệu này hướng dẫn chi tiết cách cấu hình, khởi chạy hệ thống (bao gồm cả Backend Spring Boot và Frontend Expo Mobile) cùng cách kiểm thử các API, chức năng đã hoàn thành.

---

## 1. Yêu cầu Hệ thống (Prerequisites)

Trước khi khởi chạy, hãy đảm bảo máy tính đã cài đặt các công cụ sau:
- **Java Development Kit (JDK)**: Phiên bản 21.
- **Node.js**: Phiên bản LTS mới nhất (Khuyên dùng v18 hoặc v20).
- **MySQL Server**: Cổng mặc định `3306`.
- **Redis Server**: Cổng mặc định `6379`.
- **Expo Go**: Tải ứng dụng này trên điện thoại (iOS/Android) từ App Store hoặc CH Play để chạy ứng dụng mobile qua cùng mạng Wi-Fi.

---

## 2. Chuẩn bị Cơ sở Dữ liệu & Redis

1. **Khởi động MySQL**:
   - Đăng nhập vào MySQL và tạo cơ sở dữ liệu có tên là `cookmateai_db`:
     ```sql
     CREATE DATABASE cookmateai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - Đảm bảo tài khoản MySQL có tên đăng nhập là `root` và mật khẩu là `123456` (Cấu hình mặc định trong file [application-dev.properties](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/resources/application-dev.properties)).

2. **Khởi động Redis**:
   - Đảm bảo dịch vụ Redis đang chạy tại địa chỉ `localhost:6379`. Redis được sử dụng để quản lý danh sách đen các JWT Token đã đăng xuất và lưu giữ tạm thời mã xác thực OTP.

---

## 3. Khởi chạy Backend (Server)

1. Mở cửa sổ terminal trong thư mục `server`:
   ```bash
   cd server
   ```

2. Biên dịch và khởi chạy dự án Spring Boot:
   - **Cách thông thường (Khuyên dùng)**: Chạy trực tiếp dự án qua Gradle (áp dụng khi đường dẫn thư mục chứa dự án không chứa ký tự tiếng Việt có dấu):
     - Trên **Windows**:
       ```powershell
       .\gradlew bootRun
       ```
     - Trên **macOS/Linux**:
       ```bash
       ./gradlew bootRun
       ```
   - **Trường hợp đặc biệt (Thư mục dự án có dấu)**: Nếu đường dẫn thư mục chứa dự án có chứa ký tự tiếng Việt có dấu (ví dụ: `d:\dự án\cookmate`), lệnh `bootRun` có thể gặp lỗi mã hóa đường dẫn. Khi đó bạn cần đóng gói dự án và khởi chạy thông qua file JAR:
     - Biên dịch ra file JAR:
       ```powershell
       .\gradlew bootJar
       ```
     - Chạy ứng dụng từ file JAR đóng gói sẵn với cấu hình UTF-8:
       ```powershell
       java "-Dfile.encoding=UTF-8" -jar build/libs/server-0.0.1-SNAPSHOT.jar
       ```

3. **Xác nhận hoạt động**:
   - Khi chạy thành công, console log sẽ hiển thị thông tin bảng được tự động tạo và tiến trình seeder khởi tạo dữ liệu mặc định:
     ```text
     ===> Khởi chạy DataSeeder để tạo dữ liệu mặc định...
     Seeding Permission: READ_PROFILE
     Seeding Role: ROLE_USER
     Seeding User: ban@cookmate.vn
     Seeding Ingredient: Trứng gà
     ===> Hoàn tất chạy DataSeeder!
     ```
   - Server lắng nghe tại địa chỉ `http://0.0.0.0:8080`. Địa chỉ này cho phép tất cả thiết bị cùng dải mạng LAN truy cập thông qua IP của máy chủ (ví dụ: `http://192.168.1.10:8080`).

---

## 4. Khởi chạy Frontend (Client)

1. Mở cửa sổ terminal trong thư mục `client`:
   ```bash
   cd client
   ```

2. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   npm install
   ```

3. **Cấu hình địa chỉ API kết nối đến Backend (Không hardcode)**:
   - Dự án đã cấu hình sử dụng biến môi trường tập trung nhằm tránh lỗi khi đổi IP hoặc Wi-Fi.
   - Sao chép file `.env.example` thành `.env` trong thư mục `client`:
     ```bash
     cp .env.example .env
     ```
   - Lấy địa chỉ IPv4 LAN của máy tính chạy server (ví dụ trên Windows chạy `ipconfig` tìm được `192.168.1.10`), sau đó chỉnh sửa file `.env`:
     ```env
     EXPO_PUBLIC_API_URL=http://192.168.1.10:8080/api/v1
     ```
   - **Lưu ý quan trọng**: Không sử dụng `localhost` hoặc `127.0.0.1` vì thiết bị di động thật khi dùng Expo Go quét QR sẽ không thể kết nối được tới máy chủ của bạn qua địa chỉ đó.
   - **Khi đổi máy hoặc đổi mạng Wi-Fi**: Chỉ cần đổi địa chỉ IP trong file `.env` này, sau đó khởi chạy lại Expo với tham số `-c` để xóa cache và nạp cấu hình mới:
     ```bash
     npx expo start -c
     ```

5. **Trình chiếu ứng dụng**:
   - Mở ứng dụng **Expo Go** trên điện thoại.
   - Quét mã QR code hiển thị trên màn hình terminal để tải giao diện ứng dụng.

---

## 5. Kiểm thử APIs và Chức năng đã có (API Testing)

Bạn có thể kiểm thử bằng Postman, Insomnia hoặc công cụ dòng lệnh `cURL`.

### A. Kiểm thử Module 1: Authentication

#### 1. Đăng ký tài khoản mới (Register)
- **API**: `POST /api/v1/auth/register`
- **Body (JSON)**:
  ```json
  {
    "name": "Nguyễn Văn A",
    "email": "nguyena@cookmate.vn",
    "password": "password123"
  }
  ```
- **Kết quả mong muốn**: Nhận về mã token xác thực cùng thông báo yêu cầu kích hoạt. Kiểm tra tab console của Server để lấy mã OTP gửi về email (mã OTP được giả lập ghi ra Console log dưới dạng `[EMAIL VERIFICATION] Gửi mã xác thực [XXXXXX] tới email nguyena@cookmate.vn`).

#### 2. Xác thực Email (Verify Email)
- **API**: `POST /api/v1/auth/verify-email`
- **Body (JSON)**:
  ```json
  {
    "email": "nguyena@cookmate.vn",
    "code": "MÃ_OTP_TỪ_CONSOLES_LOG"
  }
  ```

#### 3. Đăng nhập (Login)
- **API**: `POST /api/v1/auth/login`
- **Body (JSON)**:
  ```json
  {
    "email": "ban@cookmate.vn",
    "password": "password123"
  }
  ```
- **Kết quả mong muốn**: Trả về `accessToken`, `refreshToken` và thông tin tài khoản user `ban@cookmate.vn`.
- **Lưu ý**: Hãy copy `accessToken` nhận được từ phản hồi này để sử dụng làm header `Authorization: Bearer <accessToken>` cho các API quản lý kho nguyên liệu tiếp theo.

#### 4. Đăng xuất (Logout)
- **API**: `POST /api/v1/auth/logout`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Kết quả mong muốn**: Token bị đưa vào danh sách đen trong Redis. Nếu tiếp tục sử dụng token này để gọi API khác sẽ bị trả về lỗi `401 Unauthenticated`.

#### 5. Quên và đặt lại mật khẩu (Forgot/Reset Password)
- **Yêu cầu OTP**: `POST /api/v1/auth/forgot-password` với body `{"email": "ban@cookmate.vn"}`. Lấy mã OTP đặt lại mật khẩu từ console log.
- **Đặt lại mật khẩu**: `POST /api/v1/auth/reset-password` với body:
  ```json
  {
    "email": "ban@cookmate.vn",
    "otp": "MÃ_OTP_KHÔI_PHỤC",
    "newPassword": "newpassword123"
  }
  ```

---

### B. Kiểm thử Module 2: Inventory (Kho nguyên liệu)

*Yêu cầu tất cả các request này phải gửi kèm Header:*
`Authorization: Bearer <accessToken>`

#### 1. Lấy danh sách nguyên liệu có phân trang, tìm kiếm & bộ lọc
- **API**: `GET /api/v1/inventory`
- **Các tham số lọc tùy chọn (Query Params)**:
  - `page`: Số trang muốn lấy (mặc định: `1`).
  - `size`: Số bản ghi mỗi trang (mặc định: `10`).
  - `search`: Tìm kiếm tên nguyên liệu (ví dụ: `?search=Rau`).
  - `category`: Lọc theo danh mục (ví dụ: `?category=Rau củ`).
  - `storageLocation`: Lọc theo nơi bảo quản (ví dụ: `?storageLocation=Ngăn mát`).
  - `sortBy`: Sắp xếp theo cột (ví dụ: `expiryDate`, `daysLeft`, `quantity`. Mặc định: `expiryDate`).
  - `order`: Hướng sắp xếp (ví dụ: `asc` hoặc `desc`. Mặc định: `asc`).

#### 2. Thêm nguyên liệu mới vào kho
- **API**: `POST /api/v1/inventory`
- **Body (JSON)**:
  ```json
  {
    "name": "Thịt bò Mỹ",
    "quantity": 500.0,
    "unit": "g",
    "price": 120000,
    "storageLocation": "Ngăn đá",
    "icon": "🥩",
    "category": "Thịt",
    "expiryDays": 14,
    "note": "Mua tại siêu thị"
  }
  ```

#### 3. Cập nhật nguyên liệu
- **API**: `PUT /api/v1/inventory/{id}`
- **Body (JSON)**: Truyền các trường thông tin cần sửa đổi tương tự như payload thêm mới.

#### 4. Xem chi tiết nguyên liệu
- **API**: `GET /api/v1/inventory/{id}`

#### 5. Xóa nguyên liệu
- **API**: `DELETE /api/v1/inventory/{id}`
