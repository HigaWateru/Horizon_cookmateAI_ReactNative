Tôi đã hoàn thành phần giao diện (UI) của ứng dụng mobile bằng Expo React Native.

Nhiệm vụ của bạn là trở thành Senior Solution Architect và Backend Architect để thiết kế toàn bộ backend Spring Boot phù hợp với UI hiện tại.

## Công nghệ bắt buộc

Backend
- Java 21
- Spring Boot 3.x
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- MySQL
- Lombok
- Validation
- MapStruct
- Redis (Token blacklist + Cache)
- Cloudinary
- Swagger OpenAPI
- Flyway
- Maven

Frontend
- Expo React Native
- Axios

## Kiến trúc

Mobile App
        │
HTTP REST API
        │
Spring Boot
        │
Hibernate/JPA
        │
MySQL

Lưu ý:

Mobile KHÔNG BAO GIỜ kết nối trực tiếp MySQL.

Mobile chỉ gọi REST API.

Spring Boot phải chạy với

server.address=0.0.0.0

để điện thoại trong cùng mạng WiFi truy cập được.

Không được hardcode localhost trong frontend.

Frontend phải dùng BASE_URL có thể đổi được bằng biến môi trường.

Backend phải hỗ trợ CORS cho Expo.

## Yêu cầu

Hãy phân tích toàn bộ UI hiện có.

Từ UI hãy suy ra

- Entity
- Quan hệ Entity
- API cần có
- Authentication
- Business logic
- Validation
- Upload Image
- Dashboard
- Notification
- Search
- Filter
- Pagination
- Report
- Statistics

Sau đó sinh file

project-scope.md

bao gồm

1. Tổng quan hệ thống
2. Kiến trúc
3. Module
4. Entity
5. Quan hệ Database
6. API
7. Security
8. Validation
9. Upload
10. Redis
11. Logging
12. Exception Handling
13. Folder Structure
14. Sequence của từng chức năng
15. Roadmap phát triển

Không viết code.
Chỉ phân tích backend phù hợp với UI.


Cấu hình ipconfig hiện tại:
Connection-specific DNS Suffix  . : 192.168.1.1
   Link-local IPv6 Address . . . . . : fe80::a727:cfa3:2dff:d4da%16
   IPv4 Address. . . . . . . . . . . : 192.168.1.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : fe80::1%16
                                       192.168.1.1