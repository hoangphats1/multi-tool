import { setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getImageEditorHtml() {
    return `
    <h3>Trình chỉnh sửa ảnh đơn giản</h3>
    <div class="drop-zone">
      <p>Kéo thả ảnh của bạn vào đây</p>
      <input type="file" id="editor-file-input" accept="image/*" class="hidden-input">
    </div>
    <div id="editor-controls" style="display: none;">
      <h4>Bộ lọc (Filters)</h4>
      <div class="row">
        <button class="btn ghost" data-filter="grayscale(100%)">Đen trắng</button>
        <button class="btn ghost" data-filter="sepia(100%)">Nâu đỏ</button>
        <button class="btn ghost" data-filter="invert(100%)">Âm bản</button>
        <button class="btn ghost" data-filter="none">Bình thường</button>
      </div>
      <h4>Điều chỉnh</h4>
      <div class="row">
        <div style="flex:1"><label>Độ sáng</label><input type="range" class="editor-slider" data-filter="brightness" min="0" max="200" value="100"></div>
        <div style="flex:1"><label>Tương phản</label><input type="range" class="editor-slider" data-filter="contrast" min="0" max="200" value="100"></div>
        <div style="flex:1"><label>Bão hòa</label><input type="range" class="editor-slider" data-filter="saturate" min="0" max="200" value="100"></div>
      </div>
      <h4>Thao tác</h4>
      <div class="row">
        <button class="btn ghost" id="editor-rotate-btn"><i class="ph-bold ph-arrow-counter-clockwise"></i> Xoay trái</button>
        <button class="btn" id="editor-download-btn"><i class="ph-bold ph-download-simple"></i> Tải ảnh về</button>
      </div>
    </div>
    <div class="result" id="editor-preview-wrapper" style="text-align:center; padding: 10px;">
        <canvas id="editor-canvas" style="max-width:100%;"></canvas>
    </div>
  `;
}

export function initImageEditor() {
    const fileInput = document.getElementById('editor-file-input');
    const controls = document.getElementById('editor-controls');
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    let originalImage = new Image();
    let currentRotation = 0;

    let filters = {
        brightness: 100,
        contrast: 100,
        saturate: 100,
        other: 'none'
    };

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage.onload = () => {
                currentRotation = 0;
                drawImageWithFilters();
                controls.style.display = 'block';
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function drawImageWithFilters() {
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;

        if (currentRotation !== 0) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(currentRotation * Math.PI / 180);
            ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);
            ctx.restore();
        } else {
            ctx.drawImage(originalImage, 0, 0);
        }

        const filterString = `
            brightness(${filters.brightness}%) 
            contrast(${filters.contrast}%) 
            saturate(${filters.saturate}%) 
            ${filters.other === 'none' ? '' : filters.other}
        `.trim();
        ctx.filter = filterString;

        ctx.drawImage(canvas, 0, 0);
    }

    document.querySelectorAll('.editor-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            filters[e.target.dataset.filter] = e.target.value;
            drawImageWithFilters();
        });
    });

    document.querySelectorAll('button[data-filter]').forEach(button => {
        button.addEventListener('click', (e) => {
            filters.other = e.target.dataset.filter;
            drawImageWithFilters();
        });
    });

    document.getElementById('editor-rotate-btn').addEventListener('click', () => {
        currentRotation = (currentRotation - 90) % 360;
        drawImageWithFilters();
    });

    document.getElementById('editor-download-btn').addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        downloadBlob(dataURLtoBlob(dataUrl), 'edited-image.png');
    });

    setupDragDrop(panel, 'editor-file-input', null, MAX_FILE_SIZE);
}