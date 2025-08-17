import { showToast } from '../ui.js';

export function getUnixTimestampConverterHtml() {
    return `
    <h3>Bộ chuyển đổi Unix Timestamp</h3>
    <p>Chuyển đổi giữa Unix Timestamp và ngày giờ thông thường.</p>
    
    <div class="row">
        <button class="btn" id="ts-now-btn"><i class="ph-bold ph-clock"></i> Lấy Timestamp hiện tại</button>
    </div>

    <label for="ts-input">Unix Timestamp (mili giây hoặc giây)</label>
    <div class="row">
        <input type="number" id="ts-input" placeholder="Dán timestamp vào đây..." style="flex-grow:1;">
        <button class="btn ghost" id="ts-paste-btn"><i class="ph-bold ph-clipboard"></i> Dán</button>
    </div>
    <div class="row">
        <button class="btn" id="ts-to-date-btn"><i class="ph-bold ph-arrow-down"></i> Chuyển sang Ngày giờ</button>
    </div>
    <label for="ts-output-local">Kết quả (Giờ địa phương)</label>
    <input type="text" id="ts-output-local" readonly style="background-color: var(--input-bg-color);">
    <label for="ts-output-utc">Kết quả (Giờ UTC)</label>
    <input type="text" id="ts-output-utc" readonly style="background-color: var(--input-bg-color);">

    <hr style="margin: 24px 0;">

    <label for="date-input">Ngày giờ (ví dụ: 2025-08-17 16:35:07)</label>
    <div class="row">
      <input type="text" id="date-input" placeholder="Nhập ngày giờ vào đây..." style="flex-grow:1;">
      <button class="btn" id="date-to-ts-btn"><i class="ph-bold ph-arrow-up"></i> Chuyển sang Timestamp</button>
    </div>
    <label for="date-output">Kết quả (mili giây)</label>
    <div class="row">
      <input type="text" id="date-output" readonly style="background-color: var(--input-bg-color); flex-grow:1;">
      <button class="btn ghost" id="ts-copy-btn"><i class="ph-bold ph-copy"></i> Sao chép</button>
    </div>
  `;
}

export function initUnixTimestampConverter() {
    const tsInput = document.getElementById('ts-input');
    const tsToDateBtn = document.getElementById('ts-to-date-btn');
    const tsOutputLocal = document.getElementById('ts-output-local');
    const tsOutputUtc = document.getElementById('ts-output-utc');
    const tsNowBtn = document.getElementById('ts-now-btn');
    const tsPasteBtn = document.getElementById('ts-paste-btn');

    const dateInput = document.getElementById('date-input');
    const dateToTsBtn = document.getElementById('date-to-ts-btn');
    const dateOutput = document.getElementById('date-output');
    const tsCopyBtn = document.getElementById('ts-copy-btn');

    tsNowBtn.addEventListener('click', () => {
        const now = Date.now();
        tsInput.value = now;
        convertTsToDate(now);
        showToast('Đã lấy timestamp hiện tại!', 'success');
    });

    tsPasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            tsInput.value = text;
            showToast('Đã dán từ clipboard!', 'success');
        } catch (err) {
            showToast('Không thể đọc clipboard.', 'error');
        }
    });

    const convertTsToDate = (timestamp) => {
        let ts = parseInt(timestamp);
        if (isNaN(ts)) {
            showToast('Timestamp không hợp lệ.', 'error');
            return;
        }

        if (ts.toString().length <= 10) {
            ts *= 1000;
        }
        const date = new Date(ts);
        tsOutputLocal.value = date.toLocaleString();
        tsOutputUtc.value = date.toUTCString();
    };

    tsToDateBtn.addEventListener('click', () => convertTsToDate(tsInput.value));
    tsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') convertTsToDate(tsInput.value);
    });

    const convertDateToTs = () => {
        const dateString = dateInput.value;
        if (!dateString.trim()) {
            showToast('Vui lòng nhập ngày giờ.', 'warning');
            return;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            showToast('Định dạng ngày giờ không hợp lệ.', 'error');
            return;
        }
        dateOutput.value = date.getTime();
    };

    dateToTsBtn.addEventListener('click', convertDateToTs);
    dateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') convertDateToTs();
    });

    tsCopyBtn.addEventListener('click', () => {
        if (!dateOutput.value) {
            showToast('Không có gì để sao chép.', 'warning');
            return;
        }
        navigator.clipboard.writeText(dateOutput.value).then(() => {
            showToast('Đã sao chép timestamp!', 'success');
        }).catch(() => {
            showToast('Sao chép thất bại.', 'error');
        });
    });

    dateInput.value = new Date().toLocaleString('sv-SE').replace(' ', 'T').slice(0, 19).replace('T', ' ');
}