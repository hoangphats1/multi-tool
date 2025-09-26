import { showToast } from '../ui.js';
import { downloadBlob } from '../utils.js';

export function getLinkShortenerHtml() {
    return `
    <h3>Rút gọn & Thống kê Link (spoo.me)</h3>
    <p>Tạo link rút gọn với các tùy chọn nâng cao, sau đó kiểm tra thống kê của link.</p>
    
    <label for="long-url-input">URL cần rút gọn:</label>
    <input type="text" id="long-url-input" placeholder="https://example.com/long-url-to-shorten">

    <h4>Tùy chọn nâng cao khi rút gọn (không bắt buộc)</h4>
    <div class="row">
        <div style="flex: 1;">
            <label for="alias-input">Alias (tên tùy chỉnh)</label>
            <input type="text" id="alias-input" placeholder="my-custom-link">
        </div>
        <div style="flex: 1;">
            <label for="password-input">Mật khẩu</label>
            <input type="text" id="password-input" placeholder="Mật khẩu bảo vệ">
        </div>
    </div>
    <div class="row">
        <div style="flex: 1;">
            <label for="max-clicks-input">Số lần click tối đa</label>
            <input type="number" id="max-clicks-input" min="0" placeholder="0 = không giới hạn">
        </div>
        <div style="flex: 1;" class="checkbox-group">
             <input type="checkbox" id="block-bots-checkbox">
             <label for="block-bots-checkbox">Chặn bots</label>
        </div>
    </div>
    
    <div class="row">
         <button id="shorten-btn" class="btn">Rút gọn</button>
    </div>

    <div id="result-area" class="result" style="display: none; margin-top: 20px;">
        <p><strong>Link đã rút gọn:</strong></p>
        <div class="result-grid" style="grid-template-columns: 1fr auto;">
            <div class="grid-item">
                <a id="short-url-output" href="#" target="_blank" class="grid-item-value" style="font-size: 1.1em;"></a>
            </div>
            <button id="copy-short-url-btn" class="btn ghost"><i class="ph-bold ph-copy"></i></button>
        </div>
    </div>
    
    <hr style="margin-top: 30px; margin-bottom: 20px;">

    <h3>Kiểm tra Thống kê Link</h3>
    <label for="short-code-input">Link rút gọn hoặc Short Code:</label>
    <input type="text" id="short-code-input" placeholder="https://spoo.me/example hoặc example">

    <label for="stats-password-input">Mật khẩu (nếu có):</label>
    <input type="text" id="stats-password-input" placeholder="Mật khẩu của link">
    
    <div class="row">
        <button id="get-stats-btn" class="btn"><i class="ph-bold ph-chart-bar"></i> Xem Thống kê</button>
    </div>

    <div id="stats-result-area" style="display: none; margin-top: 20px;">
        <h4>Kết quả Thống kê</h4>
        <div id="stats-grid" class="result-grid"></div>

        <div class="row" style="margin-top: 20px; align-items: flex-end;">
            <div style="flex: 1;">
                <label for="export-format-select">Xuất dữ liệu:</label>
                <select id="export-format-select">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                </select>
            </div>
            <button id="export-stats-btn" class="btn ghost"><i class="ph-bold ph-download-simple"></i> Xuất file</button>
        </div>
    </div>
  `;
}

export function initLinkShortener() {
    const longUrlInput = document.getElementById('long-url-input');
    const aliasInput = document.getElementById('alias-input');
    const passwordInput = document.getElementById('password-input');
    const maxClicksInput = document.getElementById('max-clicks-input');
    const blockBotsCheckbox = document.getElementById('block-bots-checkbox');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultArea = document.getElementById('result-area');
    const shortUrlOutput = document.getElementById('short-url-output');
    const copyShortUrlBtn = document.getElementById('copy-short-url-btn');

    shortenBtn.addEventListener('click', async () => {
        const longUrl = longUrlInput.value.trim();
        if (!longUrl) {
            showToast('Vui lòng nhập URL cần rút gọn.', 'warning');
            return;
        }
        shortenBtn.disabled = true;
        shortenBtn.textContent = 'Đang xử lý...';
        resultArea.style.display = 'none';
        try {
            const bodyParams = new URLSearchParams({ url: longUrl });
            const alias = aliasInput.value.trim();
            if (alias) bodyParams.append('alias', alias);
            const password = passwordInput.value.trim();
            if (password) bodyParams.append('password', password);
            const maxClicks = maxClicksInput.value;
            if (maxClicks && parseInt(maxClicks, 10) > 0) bodyParams.append('max-clicks', maxClicks);
            if (blockBotsCheckbox.checked) bodyParams.append('block-bots', 'true');

            const response = await fetch('https://spoo.me/', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
                body: bodyParams
            });
            const data = await response.json();
            if (response.ok) {
                shortUrlOutput.href = data.short_url;
                shortUrlOutput.textContent = data.short_url;
                resultArea.style.display = 'block';
                showToast('Tạo link thành công!', 'success');
            } else {
                throw new Error(data.message || 'API trả về lỗi không xác định.');
            }
        } catch (error) {
            showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            shortenBtn.disabled = false;
            shortenBtn.textContent = 'Rút gọn';
        }
    });

    copyShortUrlBtn.addEventListener('click', () => {
        const urlToCopy = shortUrlOutput.textContent;
        if (urlToCopy) {
            navigator.clipboard.writeText(urlToCopy).then(() => showToast('Đã sao chép link!', 'success'));
        }
    });

    const shortCodeInput = document.getElementById('short-code-input');
    const statsPasswordInput = document.getElementById('stats-password-input');
    const getStatsBtn = document.getElementById('get-stats-btn');
    const exportBtn = document.getElementById('export-stats-btn');
    const exportFormatSelect = document.getElementById('export-format-select');
    const statsResultArea = document.getElementById('stats-result-area');
    const statsGrid = document.getElementById('stats-grid');

    const getShortCode = () => {
        let code = shortCodeInput.value.trim();
        if (code.includes('/')) {
            code = code.substring(code.lastIndexOf('/') + 1);
        }
        return code;
    };

    getStatsBtn.addEventListener('click', async () => {
        const shortCode = getShortCode();
        if (!shortCode) {
            showToast('Vui lòng nhập link hoặc short code.', 'warning');
            return;
        }
        getStatsBtn.disabled = true;
        getStatsBtn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Đang tải...';
        statsResultArea.style.display = 'none';
        statsGrid.innerHTML = '';
        try {
            const bodyParams = new URLSearchParams();
            if (statsPasswordInput.value.trim()) {
                bodyParams.append('password', statsPasswordInput.value.trim());
            }
            const response = await fetch(`https://spoo.me/stats/${shortCode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: bodyParams
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Lỗi không xác định.');

            const statsObject = data.stats || data;

            for (const [key, value] of Object.entries(statsObject)) {
                const gridItem = document.createElement('div');
                gridItem.className = 'grid-item';
                let displayValue = value;
                if ((key === 'created_at' || key === 'expires_at') && value) {
                    displayValue = new Date(value).toLocaleString('vi-VN');
                }
                gridItem.innerHTML = `<span class="grid-item-label">${key.replace(/_/g, ' ').toUpperCase()}</span><p class="grid-item-value">${displayValue || 'N/A'}</p>`;
                statsGrid.appendChild(gridItem);
            }
            statsResultArea.style.display = 'block';
        } catch (error) {
            showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            getStatsBtn.disabled = false;
            getStatsBtn.innerHTML = '<i class="ph-bold ph-chart-bar"></i> Xem Thống kê';
        }
    });

    exportBtn.addEventListener('click', async () => {
        const shortCode = getShortCode();
        const format = exportFormatSelect.value;
        if (!shortCode) {
            showToast('Vui lòng nhập link hoặc short code.', 'warning');
            return;
        }
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Đang xuất...';
        try {
            const bodyParams = new URLSearchParams();
            if (statsPasswordInput.value.trim()) {
                bodyParams.append('password', statsPasswordInput.value.trim());
            }
            const response = await fetch(`https://spoo.me/export/${shortCode}/${format}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: bodyParams
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể xuất file.');
            }
            const blob = await response.blob();
            downloadBlob(blob, `${shortCode}-stats.${format}`);
            showToast('Xuất file thành công!', 'success');
        } catch (error) {
            showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="ph-bold ph-download-simple"></i> Xuất file';
        }
    });
}