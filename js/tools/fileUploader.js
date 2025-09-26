import { showToast, setupDragDrop } from '../ui.js';
import { downloadBlob } from '../utils.js';

export function getFileUploaderHtml() {
    return `
    <h3>Upload & Lấy File (Platzi Fake Store API)</h3>
    <p>Tải file của bạn lên và nhận link chia sẻ, sau đó có thể lấy lại file bằng tên của nó trên server.</p>
    
    <label for="upload-section"><strong>1. Upload File</strong></label>
    <div class="drop-zone" style="margin-top: 5px;">
        <p>Kéo thả file vào đây, hoặc bấm để chọn file</p>
        <input type="file" id="file-input" class="hidden-input">
    </div>

    <div id="upload-status" class="info-box" style="display: none; margin-top: 20px;"></div>

    <div id="upload-result-area" class="result" style="display: none; margin-top: 20px;">
        <p><strong>Upload thành công!</strong></p>
        <div class="result-grid" style="grid-template-columns: 1fr auto;">
            <div class="grid-item">
                <span class="grid-item-label">Link File</span>
                <a id="download-link" href="#" target="_blank" class="grid-item-value" style="font-size: 1.1em;"></a>
            </div>
            <button id="copy-link-btn" class="btn ghost"><i class="ph-bold ph-copy"></i></button>
        </div>
        <div class="grid-item" style="margin-top: 10px;">
            <span class="grid-item-label">Tên file trên server (dùng để lấy file ở bước 2)</span>
            <p id="server-filename" class="grid-item-value"></p>
        </div>
    </div>

    <hr style="margin-top: 30px; margin-bottom: 20px;">

    <label for="get-file-section"><strong>2. Lấy File</strong></label>
    <div class="row" style="margin-top: 5px;">
        <input type="text" id="get-filename-input" placeholder="Dán 'tên file trên server' vào đây, ví dụ: f3a5.png" style="flex: 1;">
        <button id="get-file-btn" class="btn">Lấy File</button>
    </div>

    <div id="file-preview-area" class="result" style="display: none; margin-top: 20px; text-align: center;">
        </div>
  `;
}

export function initFileUploader() {
    const MAX_FILE_SIZE_MB = 1;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const statusDiv = document.getElementById('upload-status');
    const resultArea = document.getElementById('upload-result-area');
    const downloadLink = document.getElementById('download-link');
    const serverFilename = document.getElementById('server-filename');
    const copyBtn = document.getElementById('copy-link-btn');
    const panel = document.getElementById('panel');

    const handleFileUpload = async (file) => {
        statusDiv.innerHTML = '';
        statusDiv.style.display = 'block';
        resultArea.style.display = 'none';
        try {
            statusDiv.textContent = 'Đang tải file lên...';
            const formData = new FormData();
            formData.append('file', file);
            const uploadResponse = await fetch('https://api.escuelajs.co/api/v1/files/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadResponse.json();
            if (uploadResponse.ok) {
                const link = uploadData.location;
                downloadLink.href = link;
                downloadLink.textContent = link;
                serverFilename.textContent = uploadData.filename;
                resultArea.style.display = 'block';
                statusDiv.style.display = 'none';
                showToast('Upload thành công!', 'success');
            } else {
                throw new Error(uploadData.message || 'Upload file thất bại.');
            }
        } catch (error) {
            statusDiv.textContent = `Lỗi: ${error.message}`;
            statusDiv.style.color = 'var(--error-color)';
            showToast('Có lỗi xảy ra.', 'error');
        }
    };

    setupDragDrop(panel, 'file-input', handleFileUpload, MAX_FILE_SIZE_BYTES);

    copyBtn.addEventListener('click', () => {
        const urlToCopy = downloadLink.textContent;
        if (urlToCopy) {
            navigator.clipboard.writeText(urlToCopy).then(() => showToast('Đã sao chép link!', 'success'));
        }
    });

    const getFilenameInput = document.getElementById('get-filename-input');
    const getFileBtn = document.getElementById('get-file-btn');
    const filePreviewArea = document.getElementById('file-preview-area');

    getFileBtn.addEventListener('click', async () => {
        const filename = getFilenameInput.value.trim();
        if (!filename) {
            showToast('Vui lòng nhập tên file.', 'warning');
            return;
        }
        getFileBtn.disabled = true;
        getFileBtn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i>';
        filePreviewArea.style.display = 'none';
        filePreviewArea.innerHTML = '';
        try {
            const url = `https://api.escuelajs.co/api/v1/files/${filename}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Không tìm thấy file hoặc có lỗi xảy ra (${response.status})`);
            }
            const blob = await response.blob();
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(blob);
                const img = document.createElement('img');
                img.src = imageUrl;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '400px';
                img.style.borderRadius = 'var(--border-radius)';
                filePreviewArea.appendChild(img);
            } else {
                const downloadButton = document.createElement('button');
                downloadButton.className = 'btn';
                downloadButton.innerHTML = `<i class="ph-bold ph-download-simple"></i> Tải xuống ${filename}`;
                downloadButton.onclick = () => {
                    downloadBlob(blob, filename);
                };
                filePreviewArea.appendChild(downloadButton);
            }
            filePreviewArea.style.display = 'block';
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            getFileBtn.disabled = false;
            getFileBtn.textContent = 'Lấy File';
        }
    });
}