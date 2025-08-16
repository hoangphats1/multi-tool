import { showToast, setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getBase64FileHtml() {
    return `
    <h3>File ↔ Base64</h3>
    <div class="row">
        <button class="btn" id="b64-mode-encode">Mã hóa (File → Base64)</button>
        <button class="btn ghost" id="b64-mode-decode">Giải mã (Base64 → File)</button>
    </div>
    <div id="b64-panel">
        </div>
  `;
}

export function initBase64File() {
    const encodeBtn = document.getElementById('b64-mode-encode');
    const decodeBtn = document.getElementById('b64-mode-decode');

    const setMode = (isEncode) => {
        const panel = document.getElementById('b64-panel');
        if (isEncode) {
            encodeBtn.classList.remove('ghost');
            decodeBtn.classList.add('ghost');
            panel.innerHTML = `
                <div class="drop-zone" style="margin-top:16px;">
                  <p>Kéo thả file bất kỳ vào đây</p>
                  <input type="file" id="b64-file-in" class="hidden-input">
                </div>
                <div class="row">
                  <button class="btn" id="b64-encode-btn"><i class="ph-bold ph-arrow-down"></i> Mã hóa</button>
                </div>
                <label for="b64-out">Chuỗi Base64</label>
                <textarea id="b64-out" readonly style="height:150px;"></textarea>
            `;
            setupDragDrop(panel, 'b64-file-in', null, window.MAX_FILE_SIZE); 
            document.getElementById('b64-encode-btn').addEventListener('click', encodeFileToBase64);
        } else {
            decodeBtn.classList.remove('ghost');
            encodeBtn.classList.add('ghost');
            panel.innerHTML = `
                <label for="b64-in">Dán chuỗi Base64 vào đây</label>
                <textarea id="b64-in" style="height:150px;"></textarea>
                <label for="b64-mime">MIME Type (ví dụ: image/png, application/pdf)</label>
                <input type="text" id="b64-mime" placeholder="image/jpeg">
                <label for="b64-filename">Tên file</label>
                <input type="text" id="b64-filename" placeholder="download.jpg">
                <div class="row">
                  <button class="btn" id="b64-decode-btn"><i class="ph-bold ph-arrow-up"></i> Giải mã & Tải về</button>
                </div>
            `;
            document.getElementById('b64-decode-btn').addEventListener('click', decodeBase64ToFile);
        }
    };

    encodeBtn.addEventListener('click', () => setMode(true));
    decodeBtn.addEventListener('click', () => setMode(false));


    setMode(true);
}

function encodeFileToBase64() {
    const file = document.getElementById('b64-file-in').files[0];
    if (!file) return showToast('Vui lòng chọn file.', 'error');

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        const base64String = dataUrl.split(',')[1];
        document.getElementById('b64-out').value = base64String;
        showToast('Mã hóa file thành công!', 'success');
    };
    reader.onerror = () => showToast('Không thể đọc file.', 'error');
    reader.readAsDataURL(file);
}

function decodeBase64ToFile() {
    const base64String = document.getElementById('b64-in').value;
    const mimeType = document.getElementById('b64-mime').value || 'application/octet-stream';
    const filename = document.getElementById('b64-filename').value || 'download';

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