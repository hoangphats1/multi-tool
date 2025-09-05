import { showToast } from '../ui.js';

export function getGradientGeneratorHtml() {
  return `
    <style>
      #gradient-preview {
        width: 100%;
        height: 250px;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        margin-bottom: 16px;
      }
      .controls-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .color-stop {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        margin-bottom: 0.5em;
      }
      .color-stop input[type="color"] {
        min-width: 40px;
        height: 40px;
        border: none;
        padding: 0;
        background: none;
      }
      .color-stop input[type="range"] {
        flex-grow: 1;
      }
       .color-stop button {
        background-color: var(--error-color);
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
      }
    </style>

    <h3>CSS Gradient Generator</h3>
    <p>Tạo các dải màu tuyến tính (linear-gradient) một cách trực quan.</p>

    <div id="gradient-preview"></div>

    <div class="controls-grid">
      <div class="control-group">
        <label for="angle-slider">Góc xoay: <span id="angle-value">90</span>deg</label>
        <input type="range" id="angle-slider" min="0" max="360" value="90">
      </div>

      <div class="control-group">
        <label>Các điểm màu (Color Stops)</label>
        <div id="color-stops-container"></div>
        <button id="add-color-btn" class="btn" style="margin-top: 10px;"><i class="ph-bold ph-plus"></i> Thêm màu</button>
      </div>

      <div class="control-group">
        <label>Kết quả CSS</label>
        <textarea id="css-output" rows="3" readonly></textarea>
        <button id="copy-css-btn" class="btn" style="margin-top: 8px;"><i class="ph-bold ph-copy"></i> Sao chép CSS</button>
      </div>
    </div>
  `;
}

export function initGradientGenerator() {
    const preview = document.getElementById('gradient-preview');
    const angleSlider = document.getElementById('angle-slider');
    const angleValue = document.getElementById('angle-value');
    const stopsContainer = document.getElementById('color-stops-container');
    const addColorBtn = document.getElementById('add-color-btn');
    const cssOutput = document.getElementById('css-output');
    const copyCssBtn = document.getElementById('copy-css-btn');

    let state = {
        angle: 90,
        colors: [
            { color: '#ff8a00', position: 0 },
            { color: '#e52e71', position: 100 }
        ]
    };

    function updateGradient() {
        const colorStopsString = state.colors
            .sort((a, b) => a.position - b.position)
            .map(c => `${c.color} ${c.position}%`)
            .join(', ');

        const gradientCss = `linear-gradient(${state.angle}deg, ${colorStopsString})`;
        
        preview.style.background = gradientCss;
        cssOutput.value = `background-image: ${gradientCss};`;
        angleValue.textContent = state.angle;
    }
    
    function renderColorStops() {
        stopsContainer.innerHTML = '';
        state.colors.forEach((colorStop, index) => {
            const stopDiv = document.createElement('div');
            stopDiv.className = 'color-stop';
            stopDiv.innerHTML = `
                <input type="color" value="${colorStop.color}" data-index="${index}">
                <input type="range" min="0" max="100" value="${colorStop.position}" data-index="${index}">
                <button data-index="${index}" ${state.colors.length <= 2 ? 'disabled' : ''}>&times;</button>
            `;
            stopsContainer.appendChild(stopDiv);
        });
    }

    angleSlider.addEventListener('input', (e) => {
        state.angle = e.target.value;
        updateGradient();
    });

    addColorBtn.addEventListener('click', () => {
        state.colors.push({ color: '#ffffff', position: 50 });
        renderAndListen();
    });

    stopsContainer.addEventListener('input', (e) => {
        const index = e.target.dataset.index;
        if (e.target.type === 'color') {
            state.colors[index].color = e.target.value;
        }
        if (e.target.type === 'range') {
            state.colors[index].position = e.target.value;
        }
        updateGradient();
    });

    stopsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && state.colors.length > 2) {
            const index = e.target.dataset.index;
            state.colors.splice(index, 1);
            renderAndListen();
        }
    });
    
    copyCssBtn.addEventListener('click', () => {
        if (cssOutput.value) {
            navigator.clipboard.writeText(cssOutput.value);
            showToast('Đã sao chép CSS!', 'success');
        }
    });

    function renderAndListen() {
        renderColorStops();
        updateGradient();
    }
    
    renderAndListen();
}