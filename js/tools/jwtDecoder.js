function getJwtDecoderHtml() {
    return `
    <h3>JWT (JSON Web Token) Decoder</h3>
    <p>Dán chuỗi JWT của bạn vào đây. Công cụ sẽ giải mã phần Header và Payload.</p>
    <textarea id="jwt-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" style="height: 150px;"></textarea>
    <div class="row">
      <div style="flex:1">
        <h4>Header</h4>
        <pre class="result" id="jwt-header" style="text-align:left;"></pre>
      </div>
      <div style="flex:1">
        <h4>Payload</h4>
        <pre class="result" id="jwt-payload" style="text-align:left;"></pre>
      </div>
    </div>
    <p style="font-size:13px; color:var(--text-color-light); margin-top:16px;">Lưu ý: Công cụ này không xác thực (validate) chữ ký. Nó chỉ giải mã để xem nội dung.</p>
  `;
}

function initJwtDecoder() {
    document.getElementById('jwt-input').addEventListener('input', decodeJwt);
}

function decodeJwt() {
    const headerOut = document.getElementById('jwt-header');
    const payloadOut = document.getElementById('jwt-payload');

    headerOut.textContent = '';
    payloadOut.textContent = '';

    const token = document.getElementById('jwt-input').value.trim();
    if (!token) return;

    const parts = token.split('.');
    if (parts.length !== 3) {
        payloadOut.textContent = 'JWT không hợp lệ. Phải có 3 phần ngăn cách bởi dấu chấm.';
        return;
    }

    try {
        const header = JSON.parse(base64UrlDecode(parts[0]));
        const payload = JSON.parse(base64UrlDecode(parts[1]));

        headerOut.textContent = JSON.stringify(header, null, 2);
        payloadOut.textContent = JSON.stringify(payload, null, 2);
    } catch (e) {
        payloadOut.textContent = `Lỗi giải mã: ${e.message}`;
    }
}

function base64UrlDecode(str) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
        case 0: break;
        case 2: output += '=='; break;
        case 3: output += '='; break;
        default: throw 'Chuỗi Base64Url không hợp lệ!';
    }
    // Dùng atob để giải mã, sau đó xử lý các ký tự UTF-8
    return decodeURIComponent(escape(window.atob(output)));
}