import { setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getWatermarkHtml() {
    return `
    <style>
      .position-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;margin-top:8px;}
      .position-grid label{display:flex;align-items:center;justify-content:center;border:1px solid var(--border-color);border-radius:6px;padding:10px;cursor:pointer;transition:all 0.2s ease;}
      .position-grid input:checked + label{background-color:var(--primary-color);color:white;border-color:var(--primary-color);}
      .position-grid input{display:none;}
      .hidden{display:none;}
    </style>
    <h3>Đóng dấu ảnh (Watermark)</h3>
    <p>Tải ảnh gốc, sau đó tùy chỉnh và thêm watermark dạng chữ hoặc hình ảnh.</p>
    
    <h4>1. Tải ảnh gốc</h4>
    <div class="drop-zone" id="base-drop-zone">
      <p>Kéo thả ảnh gốc vào đây</p>
      <input type="file" id="wm-base-img" accept="image/*" class="hidden-input">
    </div>
    <div id="base-image-preview-container" class="result" style="text-align:center; display:none; margin-top:15px;"></div>

    <div id="main-controls" style="display:none;">
      <h4>2. Tùy chỉnh Watermark</h4>
      <div class="row" style="flex-wrap: wrap;">
        <label style="flex-basis: 100%; margin-bottom: 0;">Loại Watermark:</label>
        <div class="radio-options-group">
            <div class="checkbox-group"><input type="radio" id="type-text" name="wm-type" value="text" checked><label for="type-text">Chữ (Text)</label></div>
            <div class="checkbox-group"><input type="radio" id="type-image" name="wm-type" value="image"><label for="type-image">Ảnh (Image)</label></div>
        </div>
      </div>
      <div id="text-options">
        <div class="row">
          <div style="flex:2"><label for="wm-text">Nội dung</label><input id="wm-text" type="text" value="© Multi Tool"></div>
          <div style="flex:1"><label for="wm-font-size">Cỡ chữ</label><input id="wm-font-size" type="number" value="48"></div>
        </div>
        <div class="row">
          <div style="flex:1"><label for="wm-font">Font chữ</label><select id="wm-font"><option>Arial</option><option>Times New Roman</option><option>Courier New</option><option>Verdana</option></select></div>
          <div style="flex:1"><label for="wm-color">Màu chữ</label><input id="wm-color" type="color" value="#FFFFFF" style="height:42px; padding: 4px;"></div>
        </div>
      </div>
      <div id="image-options" class="hidden">
        <label>Tải ảnh làm watermark (logo...)</label>
        <div class="drop-zone" id="watermark-drop-zone"><p>Kéo thả ảnh watermark vào đây</p><input type="file" id="wm-image-img" accept="image/*" class="hidden-input"></div>
      </div>
      
      <h4>3. Tùy chỉnh hiển thị</h4>
      <div class="row">
        <div style="flex:1"><label for="wm-opacity">Độ mờ (0-1)</label><input id="wm-opacity" type="range" value="0.7" step="0.1" min="0" max="1"></div>
        <div style="flex:1"><label for="wm-rotation">Góc xoay (°)</label><input id="wm-rotation" type="range" value="0" step="5" min="-180" max="180"></div>
      </div>
      <div class="row"><input type="checkbox" id="wm-tile"><label for="wm-tile">Lặp lại trên toàn bộ ảnh (Tiling)</label></div>
      <div id="position-options">
        <label>Vị trí</label>
        <div class="position-grid">
          <input type="radio" id="pos-tl" name="position" value="top-left"><label for="pos-tl">Trên-Trái</label>
          <input type="radio" id="pos-tc" name="position" value="top-center"><label for="pos-tc">Trên-Giữa</label>
          <input type="radio" id="pos-tr" name="position" value="top-right"><label for="pos-tr">Trên-Phải</label>
          <input type="radio" id="pos-ml" name="position" value="middle-left"><label for="pos-ml">Giữa-Trái</label>
          <input type="radio" id="pos-mc" name="position" value="middle-center"><label for="pos-mc">Giữa</label>
          <input type="radio" id="pos-mr" name="position" value="middle-right"><label for="pos-mr">Giữa-Phải</label>
          <input type="radio" id="pos-bl" name="position" value="bottom-left"><label for="pos-bl">Dưới-Trái</label>
          <input type="radio" id="pos-bc" name="position" value="bottom-center"><label for="pos-bc">Dưới-Giữa</label>
          <input type="radio" id="pos-br" name="position" value="bottom-right" checked><label for="pos-br">Dưới-Phải</label>
        </div>
      </div>
      <div class="row"><button class="btn" id="addWmBtn"><i class="ph-bold ph-stamp"></i> Đóng dấu & Tải về</button></div>
    </div>
    <div id="wm-result" style="text-align:center; margin-top:15px;"></div>
  `;
}

export function initWatermark() {
    const MAX_BASE_IMAGE_SIZE_MB = 10;
    const MAX_WATERMARK_IMAGE_SIZE_MB = 2;

    const panel = document.getElementById('panel');
    const textOptions = document.getElementById('text-options');
    const imageOptions = document.getElementById('image-options');
    const positionOptions = document.getElementById('position-options');
    const tileCheckbox = document.getElementById('wm-tile');
    const mainControls = document.getElementById('main-controls');
    const baseImagePreviewContainer = document.getElementById('base-image-preview-container');
    const resultDiv = document.getElementById('wm-result');

    let baseImageFile = null;
    let watermarkImageFile = null;

    document.querySelectorAll('input[name="wm-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isText = e.target.value === 'text';
            textOptions.classList.toggle('hidden', !isText);
            imageOptions.classList.toggle('hidden', isText);
        });
    });

    tileCheckbox.addEventListener('change', (e) => {
        positionOptions.classList.toggle('hidden', e.target.checked);
    });

    setupDragDrop(panel, 'wm-base-img', (file) => {
        baseImageFile = file;
        const reader = new FileReader();
        reader.onload = e => {
            baseImagePreviewContainer.innerHTML = `<img class="preview" src="${e.target.result}" alt="Ảnh gốc">`;
            baseImagePreviewContainer.style.display = 'block';
            mainControls.style.display = 'block';
            resultDiv.innerHTML = '';
        };
        reader.readAsDataURL(file);
    }, MAX_BASE_IMAGE_SIZE_MB * 1024 * 1024);

    setupDragDrop(panel, 'wm-image-img', (file) => {
        watermarkImageFile = file;
    }, MAX_WATERMARK_IMAGE_SIZE_MB * 1024 * 1024);

    document.getElementById('addWmBtn').addEventListener('click', async () => {
        const settings = {
            text: document.getElementById('wm-text').value,
            fontSize: parseInt(document.getElementById('wm-font-size').value) || 48,
            font: document.getElementById('wm-font').value,
            color: document.getElementById('wm-color').value,
            opacity: parseFloat(document.getElementById('wm-opacity').value) || 0.7,
            rotation: parseInt(document.getElementById('wm-rotation').value) || 0,
            isTiled: tileCheckbox.checked,
            position: document.querySelector('input[name="position"]:checked').value,
        };
        const watermarkType = document.querySelector('input[name="wm-type"]:checked').value;

        if (!baseImageFile) return showToast('Vui lòng chọn ảnh gốc.', 'error');

        try {
            const baseImage = await loadImage(baseImageFile);
            let watermarkSource = null;

            if (watermarkType === 'image') {
                if (!watermarkImageFile) return showToast('Vui lòng chọn ảnh watermark.', 'error');
                watermarkSource = await loadImage(watermarkImageFile);
            } else {
                if (!settings.text.trim()) return showToast('Vui lòng nhập nội dung watermark.', 'error');
                watermarkSource = settings.text;
            }

            const canvas = document.createElement('canvas');
            canvas.width = baseImage.width;
            canvas.height = baseImage.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(baseImage, 0, 0);
            ctx.globalAlpha = settings.opacity;

            if (settings.isTiled) {
                drawTiledWatermark(ctx, watermarkSource, settings);
            } else {
                drawSingleWatermark(ctx, watermarkSource, settings);
            }

            const dataUrl = canvas.toDataURL(baseImageFile.type);
            downloadBlob(dataURLtoBlob(dataUrl), `watermarked-${baseImageFile.name}`);
            resultDiv.innerHTML = `<div>Đã đóng dấu và tải về!</div><img class="preview" src="${dataUrl}">`;
            showToast('Đóng dấu ảnh thành công!', 'success');
        } catch (error) {
            showToast(`Đã xảy ra lỗi: ${error.message}`, 'error');
        }
    });
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('No file provided'));
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function drawSingleWatermark(ctx, source, settings) {
    const { width, height } = ctx.canvas;
    const margin = 20;

    let sourceWidth, sourceHeight;
    if (typeof source === 'string') {
        ctx.fillStyle = settings.color;
        ctx.font = `${settings.fontSize}px ${settings.font}`;
        const metrics = ctx.measureText(source);
        sourceWidth = metrics.width;
        sourceHeight = settings.fontSize;
    } else {
        sourceWidth = source.width;
        sourceHeight = source.height;
    }

    let x, y;
    if (settings.position.includes('left')) { ctx.textAlign = 'left'; x = margin; }
    else if (settings.position.includes('center')) { ctx.textAlign = 'center'; x = width / 2; }
    else { ctx.textAlign = 'right'; x = width - margin; }

    if (settings.position.includes('top')) { ctx.textBaseline = 'top'; y = margin; }
    else if (settings.position.includes('middle')) { ctx.textBaseline = 'middle'; y = height / 2; }
    else { ctx.textBaseline = 'bottom'; y = height - margin; }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(settings.rotation * Math.PI / 180);

    if (typeof source === 'string') {
        ctx.fillText(source, 0, 0);
    } else {
        let drawX = 0, drawY = 0;
        if (ctx.textAlign === 'center') drawX = -sourceWidth / 2;
        if (ctx.textAlign === 'right') drawX = -sourceWidth;
        if (ctx.textBaseline === 'middle') drawY = -sourceHeight / 2;
        if (ctx.textBaseline === 'bottom') drawY = -sourceHeight;
        ctx.drawImage(source, drawX, drawY);
    }

    ctx.restore();
}

function drawTiledWatermark(ctx, source, settings) {
    ctx.save();
    const padding = 100;
    let itemWidth, itemHeight;
    if (typeof source === 'string') {
        ctx.fillStyle = settings.color;
        ctx.font = `${settings.fontSize}px ${settings.font}`;
        const metrics = ctx.measureText(source);
        itemWidth = metrics.width + padding;
        itemHeight = settings.fontSize + padding;
    } else {
        itemWidth = source.width + padding;
        itemHeight = source.height + padding;
    }

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(settings.rotation * Math.PI / 180);
    ctx.translate(-centerX, -centerY);

    for (let x = -itemWidth; x < ctx.canvas.width + itemWidth; x += itemWidth) {
        for (let y = -itemHeight; y < ctx.canvas.height + itemHeight; y += itemHeight) {
            if (typeof source === 'string') {
                ctx.fillText(source, x, y);
            } else {
                ctx.drawImage(source, x, y);
            }
        }
    }
    ctx.restore();
}