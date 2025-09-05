import cronstrue from 'cronstrue';
import { showToast } from '../ui.js';

export function getCronJobHelperHtml() {
  return `
    <h3>Cron Job Helper</h3>
    <p>Dễ dàng tạo và giải mã các biểu thức Cron Job.</p>

    <div class="tool-section">
      <h4>Giải thích biểu thức Cron</h4>
      <label for="cron-input">Nhập biểu thức Cron (ví dụ: <code>*/5 * * * *</code>)</label>
      <input type="text" id="cron-input" placeholder="* * * * *">
      <p id="cron-explanation" class="result-text" style="margin-top: 8px; font-weight: 500;">...</p>
    </div>

    <hr style="margin: 24px 0;">

    <div class="tool-section">
      <h4>Xây dựng biểu thức Cron</h4>
      <div id="cron-builder">
        <div class="cron-field">
          <label>Phút</label>
          <input type="text" data-unit="minute" value="*">
          <span>(0-59)</span>
        </div>
        <div class="cron-field">
          <label>Giờ</label>
          <input type="text" data-unit="hour" value="*">
          <span>(0-23)</span>
        </div>
        <div class="cron-field">
          <label>Ngày (Tháng)</label>
          <input type="text" data-unit="dayOfMonth" value="*">
          <span>(1-31)</span>
        </div>
        <div class="cron-field">
          <label>Tháng</label>
          <input type="text" data-unit="month" value="*">
          <span>(1-12)</span>
        </div>
        <div class="cron-field">
          <label>Thứ (Tuần)</label>
          <input type="text" data-unit="dayOfWeek" value="*">
          <span>(0-7, 0 và 7 là CN)</span>
        </div>
      </div>
      <div class="result-container" style="margin-top: 16px;">
        <label>Kết quả biểu thức Cron</label>
        <div class="row">
            <input type="text" id="cron-builder-output" readonly>
            <button id="copy-cron-btn" class="btn ghost" title="Sao chép"><i class="ph-bold ph-copy"></i></button>
        </div>
      </div>
    </div>
    
    <style>
      .cron-field { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
      .cron-field label { width: 100px; }
      .cron-field input { flex: 1; }
      .cron-field span { font-size: 0.8em; color: var(--text-color-secondary); }
      .result-text { color: var(--primary-color); }
    </style>
  `;
}

export function initCronJobHelper() {
    const cronInput = document.getElementById('cron-input');
    const cronExplanation = document.getElementById('cron-explanation');

    cronInput.addEventListener('input', () => {
        const expression = cronInput.value.trim();
        if (!expression) {
            cronExplanation.textContent = '...';
            return;
        }
        try {
            cronExplanation.textContent = cronstrue.toString(expression, { locale: 'vi' });
            cronExplanation.style.color = 'var(--primary-color)';
        } catch (e) {
            cronExplanation.textContent = 'Biểu thức Cron không hợp lệ.';
            cronExplanation.style.color = 'var(--error-color)';
        }
    });

    const builderContainer = document.getElementById('cron-builder');
    const builderInputs = builderContainer.querySelectorAll('input[type="text"]');
    const builderOutput = document.getElementById('cron-builder-output');
    const copyBtn = document.getElementById('copy-cron-btn');

    const updateCronString = () => {
        const values = Array.from(builderInputs).map(input => input.value || '*');
        builderOutput.value = values.join(' ');
    };

    builderInputs.forEach(input => {
        input.addEventListener('input', updateCronString);
    });

    copyBtn.addEventListener('click', () => {
        if (builderOutput.value) {
            navigator.clipboard.writeText(builderOutput.value);
            showToast('Đã sao chép biểu thức Cron!', 'success');
        }
    });

    updateCronString();
}