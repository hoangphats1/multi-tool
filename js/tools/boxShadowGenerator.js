export function getBoxShadowGeneratorHtml() {
    return `
    <h3>CSS Box-Shadow Generator</h3>
    <p>Tạo hiệu ứng đổ bóng phức tạp một cách trực quan.</p>

    <div class="row" style="gap: 30px; align-items: flex-start;">
        <div style="flex: 1;">
            <label>Horizontal Offset (px): <span id="offset-x-value">10</span></label>
            <input type="range" id="offset-x" min="-100" max="100" value="10">

            <label>Vertical Offset (px): <span id="offset-y-value">10</span></label>
            <input type="range" id="offset-y" min="-100" max="100" value="10">

            <label>Blur Radius (px): <span id="blur-radius-value">5</span></label>
            <input type="range" id="blur-radius" min="0" max="100" value="5">

            <label>Spread Radius (px): <span id="spread-radius-value">0</span></label>
            <input type="range" id="spread-radius" min="-50" max="50" value="0">

            <label for="shadow-color">Shadow Color</label>
            <input style="padding:4px;height:42px;" type="color" id="shadow-color" value="#000000">

            <div class="checkbox-group" style="margin-top: 16px;">
              <input type="checkbox" id="inset-shadow"><label for="inset-shadow">Inset Shadow</label>
            </div>
        </div>

        <div style="flex: 1;">
            <div id="preview-box" style="width: 100%; height: 150px; background-color: var(--primary-color); border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center; color: white; transition: all 0.2s ease;">PREVIEW</div>
            <pre id="css-code-output" class="result" style="margin-top: 20px;">box-shadow: 10px 10px 5px 0px #000000;</pre>
        </div>
    </div>
  `;
}

export function initBoxShadowGenerator() {
    const controls = {
        offsetX: document.getElementById('offset-x'),
        offsetY: document.getElementById('offset-y'),
        blurRadius: document.getElementById('blur-radius'),
        spreadRadius: document.getElementById('spread-radius'),
        shadowColor: document.getElementById('shadow-color'),
        inset: document.getElementById('inset-shadow'),
    };

    const valueDisplays = {
        offsetX: document.getElementById('offset-x-value'),
        offsetY: document.getElementById('offset-y-value'),
        blurRadius: document.getElementById('blur-radius-value'),
        spreadRadius: document.getElementById('spread-radius-value'),
    };

    const previewBox = document.getElementById('preview-box');
    const codeOutput = document.getElementById('css-code-output');

    const updateShadow = () => {
        const offsetX = controls.offsetX.value;
        const offsetY = controls.offsetY.value;
        const blurRadius = controls.blurRadius.value;
        const spreadRadius = controls.spreadRadius.value;
        const color = controls.shadowColor.value;
        const inset = controls.inset.checked ? 'inset ' : '';

        const shadowValue = `${inset}${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`;

        previewBox.style.boxShadow = shadowValue;
        codeOutput.textContent = `box-shadow: ${shadowValue};`;

        valueDisplays.offsetX.textContent = offsetX;
        valueDisplays.offsetY.textContent = offsetY;
        valueDisplays.blurRadius.textContent = blurRadius;
        valueDisplays.spreadRadius.textContent = spreadRadius;
    };

    for (const key in controls) {
        controls[key].addEventListener('input', updateShadow);
    }

    updateShadow();
}