# Student Planner — FPT University Đà Nẵng

Website quản lý kế hoạch học tập cá nhân bằng HTML, CSS và JavaScript thuần. Không cần máy chủ hoặc cài đặt thư viện.

## Cấu trúc thư mục
- `index.html`: bố cục các trang và biểu mẫu.
- `style.css`: giao diện responsive, màu cam – trắng – đen.
- `app.js`: chức năng và dữ liệu demo.
- Dữ liệu được lưu trên trình duyệt bằng `localStorage`.

## Chạy trên máy tính
1. Giải nén `student-planner.zip`.
2. Mở thư mục `student-planner`.
3. Nhấp đúp `index.html` để mở bằng Chrome hoặc Microsoft Edge.
4. Thử thêm, sửa, xóa, hoàn thành công việc; thêm môn học và buổi học. Tải lại trang để kiểm tra dữ liệu còn được lưu.

## Đưa website lên mạng miễn phí bằng GitHub Pages
1. Đăng nhập hoặc tạo tài khoản tại https://github.com.
2. Tạo repository mới, ví dụ `student-planner`; chọn Public.
3. Bấm **Add file → Upload files**, tải lên cả `index.html`, `style.css`, `app.js` (có thể kéo thả 3 file từ thư mục).
4. Bấm **Commit changes**.
5. Mở **Settings → Pages**.
6. Trong **Build and deployment**, chọn **Deploy from a branch**; Branch chọn `main`, folder chọn `/(root)`, bấm **Save**.
7. Chờ GitHub hoàn tất triển khai. Đường dẫn website sẽ hiện trong phần Pages, thường có dạng `https://TEN-TAI-KHOAN.github.io/student-planner/`.

## Lưu ý khi thuyết trình
- Đây là bản demo, tên môn học và lịch học là dữ liệu minh họa; hãy chỉnh lại theo thời khóa biểu thực tế.
- `localStorage` lưu dữ liệu trên trình duyệt/thiết bị hiện tại, không tự đồng bộ giữa các thiết bị và có thể mất nếu xóa dữ liệu trình duyệt.
- Không có đăng nhập hoặc cơ sở dữ liệu máy chủ; đây là phiên bản phù hợp để trình diễn bài tập cơ bản.
