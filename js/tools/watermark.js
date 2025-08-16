import { showToast, setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getWatermarkHtml() {
    return `
    <h3>Đóng dấu ảnh (Watermark)</h3>
    <div class="drop-zone">
      <p>Kéo thả ảnh gốc vào đây</p>
      <input type="file" id="wm-base-img" accept="image/*" class="hidden-input">
    </div>
    
    <div class="row">
        <div style="flex:2"><label for="wm-text">Nội dung watermark (text)</label><input id="wm-text" type="text" placeholder="© 2025 My Website"></div>
        <div style="flex:1"><label for="wm-font-size">Cỡ chữ</label><input id="wm-font-size" type="number" value="48"></div>
    </div>
    
    <div class="row">
        <div style="flex:1"><label for="wm-opacity">Độ mờ (0-1)</label><input id="wm-opacity" type="number" value="0.7" step="0.1" min="0" max="1"></div>
        <div style="flex:1"><label for="wm-color">Màu chữ</label><input id="wm-color" type="color" value="#FFFFFF" style="height:42px; padding: 4px;"></div>
    </div>

    <div class="row">
      <button class="btn" id="addWmBtn"><i class="ph-bold ph-stamp"></i> Đóng dấu & Tải về</button>
    </div>
    <div class="result" id="wm-result">Chưa có ảnh</div>
  `;
}

export function initWatermark() {
    document.getElementById('addWmBtn').addEventListener('click', applyWatermark);
    document.getElementById('wm-base-img').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) showToast(`Đã chọn ảnh gốc: ${file.name}`);
    });
    setupDragDrop(panel, 'wm-base-img', null, MAX_FILE_SIZE);
}

function applyWatermark() {
    const baseImgFile = document.getElementById('wm-base-img').files[0];
    const watermarkText = document.getElementById('wm-text').value;
    const fontSize = parseInt(document.getElementById('wm-font-size').value) || 48;
    const opacity = parseFloat(document.getElementById('wm-opacity').value) || 0.7;
    const color = document.getElementById('wm-color').value;

    if (!baseImgFile) {
        showToast('Vui lòng chọn ảnh gốc.', 'error');
        return;
    }
    if (!watermarkText.trim()) {
        showToast('Vui lòng nhập nội dung watermark.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0);

            ctx.fillStyle = color;
            ctx.globalAlpha = opacity;
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';

            ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20);

            const dataUrl = canvas.toDataURL(baseImgFile.type);
            const blob = dataURLtoBlob(dataUrl);
            const name = (baseImgFile.name.replace(/\.[^.]+$/, '') || 'image') + '_watermarked.png';
            downloadBlob(blob, name);

            document.getElementById('wm-result').innerHTML = `<div>Đã đóng dấu và tải về!</div><img class="preview" src="${dataUrl}">`;
            showToast('Đóng dấu ảnh thành công!', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(baseImgFile);
}