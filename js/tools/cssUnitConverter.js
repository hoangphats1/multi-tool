export function getCssUnitConverterHtml() {
    return `
        <h3>CSS Unit Converter (px, rem, em)</h3>
        <p>Chuyển đổi các đơn vị đo lường phổ biến trong CSS.</p>

        <label for="css-base-size">Base Font Size (px)</label>
        <input type="number" id="css-base-size" value="16" min="1" style="width: 100px; margin-bottom: 20px;">

        <div class="result-grid">
            <div class="grid-item">
                <label class="grid-item-label" for="css-px-input">Pixels (px)</label>
                <input type="number" id="css-px-input" class="grid-item-value" placeholder="e.g., 24">
            </div>
            <div class="grid-item">
                <label class="grid-item-label" for="css-rem-input">REM</label>
                <input type="number" id="css-rem-input" class="grid-item-value" placeholder="e.g., 1.5">
            </div>
            <div class="grid-item">
                <label class="grid-item-label" for="css-em-input">EM</label>
                <input type="number" id="css-em-input" class="grid-item-value" placeholder="e.g., 1.5">
            </div>
        </div>

        <style>
            #panel input.grid-item-value { 
                width: 100%; border: none; padding: 0; 
                background-color: transparent; font-size: 1.2em;
            }
            #panel input.grid-item-value:focus { box-shadow: none; }
        </style>
    `;
}

export function initCssUnitConverter() {
    const baseSizeInput = document.getElementById('css-base-size');
    const pxInput = document.getElementById('css-px-input');
    const remInput = document.getElementById('css-rem-input');
    const emInput = document.getElementById('css-em-input');

    const updateValues = (source) => {
        const base = parseFloat(baseSizeInput.value) || 16;

        if (source === 'px') {
            const px = parseFloat(pxInput.value);
            if (isNaN(px)) {
                remInput.value = '';
                emInput.value = '';
                return;
            }
            remInput.value = parseFloat((px / base).toFixed(4));
            emInput.value = parseFloat((px / base).toFixed(4));
        } else if (source === 'rem' || source === 'em') {
            const unit = source === 'rem' ? parseFloat(remInput.value) : parseFloat(emInput.value);
            if (isNaN(unit)) {
                pxInput.value = '';
                if (source === 'rem') emInput.value = ''; else remInput.value = '';
                return;
            }
            pxInput.value = parseFloat((unit * base).toFixed(4));
            if (source === 'rem') {
                emInput.value = parseFloat(remInput.value);
            } else {
                remInput.value = parseFloat(emInput.value);
            }
        }
    };

    baseSizeInput.addEventListener('input', () => updateValues('px'));
    pxInput.addEventListener('input', () => updateValues('px'));
    remInput.addEventListener('input', () => updateValues('rem'));
    emInput.addEventListener('input', () => updateValues('em'));
}