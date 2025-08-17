import { showToast } from '../ui.js';

export function getUuidGeneratorHtml() {
    return `
    <h3>Trình tạo UUID/GUID</h3>
    <p>Tạo một mã định danh duy nhất toàn cầu (UUID v4) ngẫu nhiên.</p>
    <div class="row">
        <input type="text" id="uuid-output" readonly style="flex-grow:1; background-color: var(--input-bg-color); font-family: var(--font-mono); text-align: center;">
    </div>
    <div class="row">
        <button class="btn" id="uuid-generate-btn"><i class="ph-bold ph-arrows-clockwise"></i> Tạo mới</button>
        <button class="btn ghost" id="uuid-copy-btn"><i class="ph-bold ph-copy"></i> Sao chép</button>
    </div>
  `;
}

export function initUuidGenerator() {
    const output = document.getElementById('uuid-output');
    const generateBtn = document.getElementById('uuid-generate-btn');
    const copyBtn = document.getElementById('uuid-copy-btn');

    const generateUuid = () => {
        if (window.crypto && window.crypto.randomUUID) {
            output.value = crypto.randomUUID();
        } else {
            output.value = 'Trình duyệt của bạn không hỗ trợ API Crypto.';
            showToast('Trình duyệt không được hỗ trợ.', 'error');
        }
    };

    generateBtn.addEventListener('click', () => {
        generateUuid();
        showToast('Đã tạo UUID mới!', 'success');
    });

    copyBtn.addEventListener('click', () => {
        if (!output.value || output.value.startsWith('Trình duyệt')) return;
        navigator.clipboard.writeText(output.value).then(() => {
            showToast('Đã sao chép UUID!', 'success');
        });
    });

    generateUuid();
}