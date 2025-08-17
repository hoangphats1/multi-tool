import { showToast } from '../ui.js';

export function getColorConverterHtml() {
    return `
    <h3>Bộ chuyển đổi màu (HEX / RGB / HSL)</h3>
    <p>Chọn một màu hoặc nhập giá trị vào một trong các ô để xem kết quả chuyển đổi.</p>
    <div class="color-converter-grid">
        <div id="color-preview" title="Màu hiện tại"></div>
        <div class="color-picker-wrapper">
             <input style="padding:4px;height:42px;" type="color" id="color-picker" value="#2a78e4">
        </div>
        <div class="color-inputs">
            <label for="hex-input">HEX</label>
            <div class="row">
                <input type="text" id="hex-input" style="flex-grow:1;">
                <button class="btn ghost small" id="copy-hex"><i class="ph-bold ph-copy"></i></button>
            </div>
            <label for="rgb-input">RGB</label>
            <div class="row">
                <input type="text" id="rgb-input" style="flex-grow:1;">
                <button class="btn ghost small" id="copy-rgb"><i class="ph-bold ph-copy"></i></button>
            </div>
            <label for="hsl-input">HSL</label>
            <div class="row">
                <input type="text" id="hsl-input" style="flex-grow:1;">
                <button class="btn ghost small" id="copy-hsl"><i class="ph-bold ph-copy"></i></button>
            </div>
        </div>
    </div>
  `;
}

export function initColorConverter() {
    const picker = document.getElementById('color-picker');
    const preview = document.getElementById('color-preview');
    const hexInput = document.getElementById('hex-input');
    const rgbInput = document.getElementById('rgb-input');
    const hslInput = document.getElementById('hsl-input');

    let isUpdating = false;

    const updateAll = (source, value) => {
        if (isUpdating) return;
        isUpdating = true;

        try {
            let r, g, b;
            if (source === 'hex') {
                const rgb = hexToRgb(value);
                if (!rgb) { isUpdating = false; return; }
                [r, g, b] = [rgb.r, rgb.g, rgb.b];
            } else if (source === 'rgb') {
                const match = value.match(/(\d+),\s*(\d+),\s*(\d+)/);
                if (!match) { isUpdating = false; return; }
                [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
            } else if (source === 'hsl') {
                const match = value.match(/(\d+),\s*(\d+)%?,\s*(\d+)%?/);
                if (!match) { isUpdating = false; return; }
                const rgb = hslToRgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
                [r, g, b] = [rgb.r, rgb.g, rgb.b];
            } else { // from picker
                const rgb = hexToRgb(value);
                [r, g, b] = [rgb.r, rgb.g, rgb.b];
            }

            if ([r, g, b].some(v => v < 0 || v > 255 || isNaN(v))) {
                isUpdating = false;
                return;
            }

            const hex = rgbToHex(r, g, b);
            const hsl = rgbToHsl(r, g, b);

            preview.style.backgroundColor = hex;
            if (source !== 'picker') picker.value = hex;
            if (source !== 'hex') hexInput.value = hex;
            if (source !== 'rgb') rgbInput.value = `rgb(${r}, ${g}, ${b})`;
            if (source !== 'hsl') hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        } catch (e) {

        }

        isUpdating = false;
    };

    picker.addEventListener('input', (e) => updateAll('picker', e.target.value));
    hexInput.addEventListener('input', (e) => updateAll('hex', e.target.value));
    rgbInput.addEventListener('input', (e) => updateAll('rgb', e.target.value));
    hslInput.addEventListener('input', (e) => updateAll('hsl', e.target.value));

    document.getElementById('copy-hex').addEventListener('click', () => copyToClipboard(hexInput.value));
    document.getElementById('copy-rgb').addEventListener('click', () => copyToClipboard(rgbInput.value));
    document.getElementById('copy-hsl').addEventListener('click', () => copyToClipboard(hslInput.value));

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => showToast('Đã sao chép!', 'success'));
    };

    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        return { r: +r, g: +g, b: +b };
    }
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
    }
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) { h = s = 0; }
        else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }
    function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2, r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { [r, g, b] = [c, x, 0]; }
        else if (60 <= h && h < 120) { [r, g, b] = [x, c, 0]; }
        else if (120 <= h && h < 180) { [r, g, b] = [0, c, x]; }
        else if (180 <= h && h < 240) { [r, g, b] = [0, x, c]; }
        else if (240 <= h && h < 300) { [r, g, b] = [x, 0, c]; }
        else if (300 <= h && h <= 360) { [r, g, b] = [c, 0, x]; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return { r, g, b };
    }

    updateAll('picker', picker.value);
}