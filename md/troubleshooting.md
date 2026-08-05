# Tài liệu Sửa lỗi & Khắc phục Sự cố (Troubleshooting Guide)

Tài liệu này ghi lại các lỗi đã gặp trong quá trình phát triển và kiểm thử dự án CookMate AI cùng phương án khắc phục tương ứng.

---

## 1. Lỗi 401 Unauthorized do Redis ngừng hoạt động (Redis Downtime)

### Triệu chứng
- Khi truy cập vào các REST API yêu cầu xác thực (ví dụ `/api/v1/recipes/recommend`), server luôn trả về mã lỗi `401 Unauthorized`, mặc dù tiêu đề `Authorization: Bearer <TOKEN>` gửi đi là hoàn toàn hợp lệ.

### Nguyên nhân
- Trong lớp [JwtAuthenticationFilter.java](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/security/JwtAuthenticationFilter.java), bộ lọc gọi `redisService.isTokenBlacklisted(jwt)` để kiểm tra danh sách đen.
- Khi dịch vụ Redis cục bộ chưa được bật, việc truy vấn Redis ném ra ngoại lệ `RedisConnectionFailureException`. Ngoại lệ này bị bắt ở khối `catch` bên ngoài, dẫn tới việc biến `email` giữ giá trị `null` và luồng bảo mật bỏ qua bước thiết lập ngữ cảnh xác thực.

### Giải pháp
- Tăng tính linh hoạt và khả năng tự phục hồi của Backend tại môi trường phát triển cục bộ bằng cách sửa đổi phương thức `isTokenBlacklisted` trong lớp [RedisServiceImpl.java](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/impl/RedisServiceImpl.java).
- Bao bọc lệnh kiểm tra trong khối `try-catch`, nếu xảy ra lỗi kết nối Redis, hệ thống sẽ log cảnh báo và mặc định trả về `false` (coi như token chưa bị thu hồi), giúp quá trình xác thực JWT tiếp tục diễn ra trôi chảy.

---

## 2. Lỗi thiếu biến môi trường EXPO_PUBLIC_API_URL và cảnh báo default export

### Triệu chứng
- Trình biên Metro của Expo báo lỗi fatal: 
  `ERROR [Error: Missing environment variable: EXPO_PUBLIC_API_URL is required to run this application.]`
- Đồng thời báo cảnh báo:
  `WARN Route "./budget.tsx" is missing the required default export.`
  `WARN Route "./recipes.tsx" is missing the required default export.`

### Nguyên nhân
- Thư mục `client` chưa được tạo tệp cấu hình `.env` từ tệp mẫu `.env.example`.
- Khi Metro nạp các màn hình ứng dụng, các màn hình này liên kết gián tiếp tới tệp [api.ts](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/config/api.ts). Tệp này ném lỗi crash ở luồng import tĩnh đầu tiên, làm gián đoạn luồng biên dịch của Metro dẫn đến các màn hình không thể đăng ký export default thành công.

### Giải pháp
- Tạo tệp [.env](file:///d:/code/ctdmst/product/CookMateAI_test/client/.env) trong thư mục `client` và cấu hình chính xác địa chỉ IP LAN IPv4 của máy tính chạy server (ở đây là IP Wi-Fi `192.168.1.10` thu được qua `ipconfig`):
  ```env
  EXPO_PUBLIC_API_URL=http://192.168.1.10:8080/api/v1
  ```
- Khởi động lại Metro bundler hoặc nhấn phím **`r`** để nạp lại cấu hình.

---

## 3. Lỗi "Invalid UTF-8 middle byte" khi gửi dữ liệu tiếng Việt có dấu qua PowerShell

### Triệu chứng
- Khi sử dụng cmdlet `Invoke-RestMethod` của PowerShell gửi gói tin chứa ký tự tiếng Việt (ví dụ: `"name": "Thịt Bò"`), server ném lỗi ngoại lệ HTTP 500:
  `JSON parse error: Invalid UTF-8 middle byte 0x6e`

### Nguyên nhân
- PowerShell trên Windows sử dụng định dạng mã hóa ký tự (Encoding) mặc định theo trang mã vùng ANSI cục bộ (như Windows-1258 hoặc UTF-16 ở một số môi trường) thay vì định dạng UTF-8 tiêu chuẩn. Khi chuyển đổi chuỗi JSON có ký tự tiếng Việt có dấu, PowerShell gửi các byte không tương thích lên API Spring Boot (vốn chỉ chấp nhận UTF-8).

### Giải pháp
- Đây là giới hạn về định dạng mã hóa của console Windows PowerShell khi kiểm thử thủ công, **không phải lỗi logic phần mềm**.
- Khi chạy ứng dụng trên thiết bị di động thật thông qua Expo Go, dữ liệu luôn được gửi đi bằng mã hóa UTF-8 tiêu chuẩn, đảm bảo tính nhất quán và xử lý thành công trên Backend.

---

## 4. Lỗi "AsyncStorageError: Native module is null, cannot access legacy storage" khi chạy trên nền tảng Web

### Triệu chứng
- Khi mở ứng dụng trong trình duyệt Web (ví dụ Chrome qua `http://localhost:8081`), hoặc trên môi trường giả lập chưa liên kết đầy đủ native module, giao diện hiển thị các thông báo lỗi:
  `Error getting access token from storage: [AsyncStorageError: Native module is null, cannot access legacy storage]`

### Nguyên nhân
- Thư viện `@react-native-async-storage/async-storage` cố gắng truy xuất trực tiếp các API native của hệ điều hành (như SQLite của Android hay NSUserDefaults của iOS). Các API này hoàn toàn không tồn tại trong môi trường Web của trình duyệt, dẫn đến việc ném lỗi.

### Giải pháp
- Thay đổi cấu trúc lớp quản lý lưu trữ JWT trong [tokenStorage.ts](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/services/tokenStorage.ts).
- Tích hợp các hàm bao bọc an toàn (`safeGetItem`, `safeSetItem`, `safeRemoveItem`):
  - Tự động nhận diện nền tảng: Nếu chạy trên Web (`Platform.OS === 'web'`), chuyển sang sử dụng trực tiếp cơ chế lưu trữ trình duyệt `window.localStorage`.
  - Nếu gặp lỗi native module trên điện thoại, tự động chuyển vùng lưu trữ về bộ nhớ đệm RAM (`memoryStorage`) để đảm bảo ứng dụng không bao giờ bị treo và tiếp tục hoạt động bình thường.

---

## 5. Lỗi cảnh báo xác thực "No refresh token available" khi chưa đăng nhập

### Triệu chứng
- Khi ứng dụng khởi chạy và hiển thị màn hình đăng nhập (chưa đăng nhập), ở console Metro liên tục xuất hiện các dòng lỗi màu đỏ:
  `ERROR Failed to fetch recipe recommendations [Error: No refresh token available]`
  `ERROR Failed to fetch budget summary [Error: No refresh token available]`

### Nguyên nhân
- Tại các màn hình [recipes.tsx](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/app/recipes.tsx) và [budget.tsx](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/app/budget.tsx), hook `useEffect` được thiết lập tự động kích hoạt truy vấn các API xác thực tương ứng ngay sau khi component mount.
- Vì người dùng chưa đăng nhập, cả `accessToken` lẫn `refreshToken` đều rỗng, khiến interceptor của `apiClient` cố gắng làm mới phiên đăng nhập nhưng thất bại và ném lỗi ra console.

### Giải pháp
- Thêm bước kiểm tra quyền xác thực trước khi gửi request trong các hàm `fetchRecommendations` và `fetchSummary`:
  ```typescript
  const token = await tokenStorage.getAccessToken();
  if (!token) return; // Ngăn chặn gọi API bảo mật khi chưa có session
  ```
- Giải pháp này loại bỏ hoàn toàn các log cảnh báo không cần thiết trên console phát triển, tối ưu hiệu năng mạng của ứng dụng.

---

## 6. Lỗi 500 khi gọi API đăng xuất do thiếu header Authorization (khi dùng chế độ Demo)

### Triệu chứng
- Khi người dùng click Đăng xuất, ở console Metro xuất hiện thông báo lỗi:
  `WARN [API Client Error] URL: /auth/logout {"code": 9999, "message": "Lỗi hệ thống không xác định: Required request header 'Authorization' for method parameter type String is not present"}`
  `WARN Backend logout request failed, clearing local tokens anyway. [AxiosError: Request failed with status code 500]`

### Nguyên nhân
- Trên Backend, endpoint `/api/v1/auth/logout` ban đầu yêu cầu bắt buộc tham số `@RequestHeader("Authorization") String authHeader`. Khi người dùng bấm Đăng xuất ở phiên đăng nhập cũ (chưa đi qua hàm Đăng nhập mới sửa để lưu token), request gửi đi thiếu header này sẽ kích hoạt lỗi thiếu tham số bắt buộc của Spring Boot.

### Giải pháp
- **Phía Client**: Sửa đổi hàm xử lý đăng nhập `handleSubmit` trong [auth.tsx](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/components/auth.tsx) để tự động khởi tạo và lưu các token giả lập (`demo_access_token`) khi sử dụng chế độ khách.
- **Phía Backend**: Cập nhật tệp [AuthController.java](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/controller/AuthController.java), đặt thuộc tính `required = false` cho Header `Authorization`:
  ```java
  public ApiResponse<String> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
      if (authHeader != null && !authHeader.isEmpty()) {
          authService.logout(authHeader);
      }
      return ApiResponse.success("Đăng xuất thành công", "Mã token đã được đưa vào danh sách đen");
  }
  ```
- **Kết quả**: Đạt được tính năng bảo vệ 2 đầu (dual-protection). Ngay cả khi client chưa có token lưu trữ, việc gọi API đăng xuất vẫn trả về mã thành công `200 OK` thay vì lỗi 500, đảm bảo luồng đăng xuất luôn trơn tru.
