import { showToast, setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getBase64FileHtml() {
    return `
    <h3>File ↔ Base64</h3>
    <div class="row">
        <button class="btn" id="b64-mode-encode">Mã hóa (File → Base64)</button>
        <button class="btn ghost" id="b64-mode-decode">Giải mã (Base64 → File)</button>
    </div>
    <div id="b64-panel" style="margin-top:16px;">
        </div>
  `;
}

export function initBase64File() {
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const encodeBtn = document.getElementById('b64-mode-encode');
    const decodeBtn = document.getElementById('b64-mode-decode');
    const panel = document.getElementById('b64-panel');

    const setMode = (isEncode) => {
        if (isEncode) {
            encodeBtn.classList.remove('ghost');
            decodeBtn.classList.add('ghost');
            panel.innerHTML = `
                <div class="drop-zone">
                  <p>Kéo thả file vào đây, quá trình mã hóa sẽ tự động bắt đầu</p>
                  <input type="file" id="b64-file-in" class="hidden-input">
                </div>
                <label for="b64-out" style="margin-top:15px;">Chuỗi Base64</label>
                <textarea id="b64-out" readonly style="height:150px;" placeholder="Kết quả Base64 sẽ hiện ở đây..."></textarea>
            `;
            setupDragDrop(panel, 'b64-file-in', (file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target.result;
                    const base64String = dataUrl.split(',')[1];
                    document.getElementById('b64-out').value = base64String;
                    showToast('Mã hóa file thành công!', 'success');
                };
                reader.onerror = () => showToast('Không thể đọc file.', 'error');
                reader.readAsDataURL(file);
            }, MAX_FILE_SIZE_BYTES);
        } else {
            decodeBtn.classList.remove('ghost');
            encodeBtn.classList.add('ghost');
            panel.innerHTML = `
                <label for="b64-in">Dán chuỗi Base64 vào đây</label>
                <textarea id="b64-in" style="height:150px;"></textarea>
                <div class="row">
                    <div style="flex:1;"><label for="b64-mime">MIME Type</label><input type="text" id="b64-mime" placeholder="ví dụ: image/png"></div>
                    <div style="flex:1;"><label for="b64-filename">Tên file</label><input type="text" id="b64-filename" placeholder="download.png"></div>
                </div>
                <div class="row">
                  <button class="btn" id="b64-decode-btn"><i class="ph-bold ph-arrow-up"></i> Giải mã & Tải về</button>
                </div>
            `;
            const mimeInput = document.getElementById('b64-mime');
            const filenameInput = document.getElementById('b64-filename');
            mimeInput.addEventListener('input', () => {
                const mime = mimeInput.value.trim();
                if (mime.includes('/')) {
                    const ext = mime.split('/')[1];
                    filenameInput.placeholder = `download.${ext}`;
                }
            });
            document.getElementById('b64-decode-btn').addEventListener('click', decodeBase64ToFile);
        }
    };

    encodeBtn.addEventListener('click', () => setMode(true));
    decodeBtn.addEventListener('click', () => setMode(false));

    setMode(true);
}

function decodeBase64ToFile() {
    const base64String = document.getElementById('b64-in').value;
    const mimeType = document.getElementById('b64-mime').value || 'application/octet-stream';
    const filenameInput = document.getElementById('b64-filename');
    let filename = filenameInput.value.trim();

    if (!filename) {
        filename = filenameInput.placeholder || 'download';
    }

    if (!base64String.trim()) return showToast('Vui lòng nhập chuỗi Base64.', 'error');

    try {
        const dataUrl = `data:${mimeType};base64,${base64String}`;
        const blob = dataURLtoBlob(dataUrl);
        downloadBlob(blob, filename);
        showToast('Giải mã và tải file thành công!', 'success');
    } catch (e) {
        showToast('Chuỗi Base64 không hợp lệ.', 'error');
    }
}