import { showToast } from '../ui.js';

export function getBase64CoderHtml() {
    return `
    <h3>Encode / Decode Base64</h3>
    <p>Chuyển đổi văn bản thành chuỗi Base64 và ngược lại.</p>

    <label for="base64-source">Văn bản gốc:</label>
    <textarea id="base64-source" rows="8" placeholder="Nhập văn bản hoặc chuỗi Base64 vào đây..."></textarea>

    <div class="row" style="justify-content: center;">
        <button class="btn" id="encode-btn"><i class="ph-bold ph-arrow-down"></i> Encode</button>
        <button class="btn ghost" id="decode-btn"><i class="ph-bold ph-arrow-up"></i> Decode</button>
    </div>

    <label for="base64-result">Kết quả:</label>
    <textarea id="base64-result" rows="8" readonly placeholder="Kết quả sẽ hiển thị ở đây..."></textarea>
  `;
}

export function initBase64Coder() {
    const sourceText = document.getElementById('base64-source');
    const resultText = document.getElementById('base64-result');
    const encodeBtn = document.getElementById('encode-btn');
    const decodeBtn = document.getElementById('decode-btn');

    const utf8_to_b64 = (str) => {
        return btoa(unescape(encodeURIComponent(str)));
    }

    const b64_to_utf8 = (str) => {
        return decodeURIComponent(escape(atob(str)));
    }

    encodeBtn.addEventListener('click', () => {
        const input = sourceText.value;
        if (!input) {
            showToast('Vui lòng nhập văn bản để mã hóa.', 'warning');
            return;
        }
        try {
            resultText.value = utf8_to_b64(input);
        } catch (error) {
            showToast('Lỗi khi mã hóa văn bản.', 'error');
            console.error(error);
        }
    });

    decodeBtn.addEventListener('click', () => {
        const input = sourceText.value;
        if (!input) {
            showToast('Vui lòng nhập chuỗi Base64 để giải mã.', 'warning');
            return;
        }
        try {
            resultText.value = b64_to_utf8(input);
        } catch (error) {
            showToast('Chuỗi Base64 không hợp lệ.', 'error');
            console.error(error);
            resultText.value = 'Lỗi: Dữ liệu đầu vào không phải là một chuỗi Base64 hợp lệ.';
        }
    });
}