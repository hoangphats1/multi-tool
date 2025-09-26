import { showToast, setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getImageConverterHtml() {
    return `
    <h3>Chuyển đổi & Resize Ảnh</h3>
    <div class="drop-zone">
      <p>Kéo và thả file ảnh vào đây, hoặc bấm để chọn file</p>
      <input type="file" id="img-file" accept="image/*" class="hidden-input">
    </div>
    <div class="result" id="img-result" style="text-align: center; margin-top: 15px;">Chưa có ảnh</div>

    <div id="controls-container" style="display: none;">
        <div class="row">
          <div style="flex:1"><label for="img-w">Chiều rộng (px)</label><input id="img-w" type="number" placeholder="Giữ nguyên"></div>
          <div style="flex:1"><label for="img-h">Chiều cao (px)</label><input id="img-h" type="number" placeholder="Giữ nguyên"></div>
        </div>
        <div class="row" style="margin-top: 5px;"><input type="checkbox" id="img-aspect" checked><label for="img-aspect" style="margin-top:0;">Giữ tỉ lệ khung hình</label></div>
        <label for="img-format">Định dạng xuất</label>
        <select id="img-format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WEBP</option></select>
        <label for="img-quality">Chất lượng (JPEG/WEBP)</label>
        <input id="img-quality" type="range" value="0.9" step="0.05" min="0.1" max="1">
        <div class="row"><button class="btn" id="convertImgBtn"><i class="ph-bold ph-arrows-clockwise"></i> Convert & Tải</button></div>
    </div>
  `;
}

export function initImageConverter() {
    const MAX_IMAGE_SIZE_MB = 5;
    const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

    const panel = document.getElementById('panel');
    const resultDiv = document.getElementById('img-result');
    const controlsContainer = document.getElementById('controls-container');
    const widthInput = document.getElementById('img-w');
    const heightInput = document.getElementById('img-h');

    let currentFile = null;

    const handleFileSelect = (file) => {
        if (!file) {
            currentFile = null;
            resultDiv.innerHTML = 'Chưa có ảnh';
            controlsContainer.style.display = 'none';
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                widthInput.value = img.width;
                heightInput.value = img.height;
            };
            img.src = e.target.result;

            resultDiv.innerHTML = `<div>Xem trước:</div><img class="preview" src="${e.target.result}">`;
            controlsContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    };

    setupDragDrop(panel, 'img-file', handleFileSelect, MAX_IMAGE_SIZE_BYTES);

    document.getElementById('convertImgBtn').addEventListener('click', () => {
        if (!currentFile) {
            return showToast('Vui lòng chọn một file ảnh.', 'error');
        }

        const format = document.getElementById('img-format').value;
        const quality = parseFloat(document.getElementById('img-quality').value);

        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                let targetW = parseInt(widthInput.value);
                let targetH = parseInt(heightInput.value);
                const keepAspect = document.getElementById('img-aspect').checked;

                if (!targetW && !targetH) {
                    targetW = img.width;
                    targetH = img.height;
                } else if (keepAspect) {
                    const ratio = img.width / img.height;
                    if (targetW && !targetH) targetH = Math.round(targetW / ratio);
                    else if (!targetW && targetH) targetW = Math.round(targetH * ratio);
                    else if (targetW && targetH) targetH = Math.round(targetW / ratio);
                } else {
                    targetW = targetW || img.width;
                    targetH = targetH || img.height;
                }

                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, targetW, targetH);

                const dataUrl = canvas.toDataURL(format, quality);
                const blob = dataURLtoBlob(dataUrl);
                const ext = format.split('/')[1];
                const name = (currentFile.name.replace(/\.[^.]+$/, '') || 'image') + '.' + ext;

                downloadBlob(blob, name);

                resultDiv.innerHTML = `<div>Đã chuyển và tải: <strong>${name}</strong></div><img class="preview" src="${dataUrl}">`;
                showToast('Chuyển đổi ảnh thành công!', 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(currentFile);
    });
}