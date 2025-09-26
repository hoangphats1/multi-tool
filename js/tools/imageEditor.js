import { setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getImageEditorHtml() {
    return `
    <h3>Trình chỉnh sửa ảnh đơn giản</h3>
    <div class="drop-zone">
      <p>Kéo thả ảnh của bạn vào đây</p>
      <input type="file" id="editor-file-input" accept="image/*" class="hidden-input">
    </div>
    <div class="result" id="editor-preview-wrapper" style="text-align:center; padding: 10px; min-height: 100px; margin-top: 15px;">
        <canvas id="editor-canvas" style="max-width:100%; max-height: 50vh;"></canvas>
    </div>
    <div id="editor-controls" style="display: none; margin-top: 15px;">
      <h4>Bộ lọc (Filters)</h4>
      <div class="row">
        <button class="btn ghost" data-filter-other="grayscale(100%)">Đen trắng</button>
        <button class="btn ghost" data-filter-other="sepia(100%)">Nâu đỏ</button>
        <button class="btn ghost" data-filter-other="invert(100%)">Âm bản</button>
        <button class="btn ghost" data-filter-other="none">Bình thường</button>
      </div>
      <h4>Điều chỉnh</h4>
      <div class="row">
        <div style="flex:1"><label>Độ sáng (<span class="slider-value">100</span>%)</label><input type="range" class="editor-slider" data-filter="brightness" min="0" max="200" value="100"></div>
        <div style="flex:1"><label>Tương phản (<span class="slider-value">100</span>%)</label><input type="range" class="editor-slider" data-filter="contrast" min="0" max="200" value="100"></div>
        <div style="flex:1"><label>Bão hòa (<span class="slider-value">100</span>%)</label><input type="range" class="editor-slider" data-filter="saturate" min="0" max="200" value="100"></div>
      </div>
      <h4>Thao tác</h4>
      <div class="row">
        <button class="btn ghost" id="editor-rotate-btn"><i class="ph-bold ph-arrow-counter-clockwise"></i> Xoay trái</button>
        <button class="btn" id="editor-download-btn"><i class="ph-bold ph-download-simple"></i> Tải ảnh về</button>
      </div>
    </div>
  `;
}

export function initImageEditor() {
    const MAX_IMAGE_SIZE_MB = 5;
    const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

    const panel = document.getElementById('panel');
    const controls = document.getElementById('editor-controls');
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');

    let originalImage = new Image();
    let currentFile = null;
    let state = {
        rotation: 0,
        filters: {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            other: 'none'
        }
    };

    const resetState = () => {
        state = {
            rotation: 0,
            filters: { brightness: 100, contrast: 100, saturate: 100, other: 'none' }
        };
        document.querySelectorAll('.editor-slider').forEach(slider => {
            slider.value = 100;
            slider.previousElementSibling.querySelector('.slider-value').textContent = 100;
        });
    };

    const drawImageWithState = () => {
        if (!originalImage.src) return;

        const w = originalImage.width;
        const h = originalImage.height;
        const rad = state.rotation * Math.PI / 180;

        const isSwapped = Math.abs(state.rotation / 90) % 2 === 1;
        canvas.width = isSwapped ? h : w;
        canvas.height = isSwapped ? w : h;

        ctx.filter = `brightness(${state.filters.brightness}%) contrast(${state.filters.contrast}%) saturate(${state.filters.saturate}%) ${state.filters.other === 'none' ? '' : state.filters.other}`.trim();
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);

        ctx.drawImage(originalImage, -w / 2, -h / 2);

        ctx.restore();
        ctx.filter = 'none';
    };

    const handleFileSelect = (file) => {
        currentFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage.onload = () => {
                resetState();
                drawImageWithState();
                controls.style.display = 'block';
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    setupDragDrop(panel, 'editor-file-input', handleFileSelect, MAX_IMAGE_SIZE_BYTES);

    // Event Listeners for controls
    document.querySelectorAll('.editor-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const filterName = e.target.dataset.filter;
            const value = e.target.value;
            state.filters[filterName] = value;
            e.target.previousElementSibling.querySelector('.slider-value').textContent = value;
            drawImageWithState();
        });
    });

    document.querySelectorAll('button[data-filter-other]').forEach(button => {
        button.addEventListener('click', (e) => {
            state.filters.other = e.target.dataset.filterOther;
            drawImageWithState();
        });
    });

    document.getElementById('editor-rotate-btn').addEventListener('click', () => {
        state.rotation = (state.rotation - 90) % 360;
        drawImageWithState();
    });

    document.getElementById('editor-download-btn').addEventListener('click', () => {
        if (!currentFile) return showToast('Vui lòng chọn ảnh trước.', 'error');
        drawImageWithState();
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        downloadBlob(dataURLtoBlob(dataUrl), `edited-${currentFile.name}`);
    });
}