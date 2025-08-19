<!-- Access Token -->
- Khi đăng nhập, BE sẽ khởi tạo AT và RT rồi lưu vào http Cookie, có thể mở trong mục Application/Cookie
- AT được lưu trong cookie mỗi khi request, nghĩa là F5 thì vẫn là AT đó.
- Khi decode ra sẽ thấy trong AT có thuộc tính exp. dựa vào đó biết được thời gian sống còn lại = exp * 1000 - Date.now()
- Còn iat là thời gian token được tạo ra.