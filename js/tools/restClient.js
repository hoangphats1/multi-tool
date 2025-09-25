import { showToast } from '../ui.js';

export function getRestClientHtml() {
    return `
        <h3>REST API Client</h3>
        <p>Gửi yêu cầu HTTP/HTTPS và xem phản hồi. 
            <strong style="color: var(--error-color);">Lưu ý:</strong> Do giới hạn của trình duyệt (CORS), chỉ các API cho phép truy cập từ tên miền khác mới hoạt động.
        </p>

        <div class="row" style="align-items: stretch;">
            <select id="http-method" style="flex: 0 1 120px;">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
                <option>HEAD</option>
                <option>OPTIONS</option>
            </select>
            <input type="text" id="api-url" placeholder="https://api.example.com/data" style="flex: 1;">
            <button id="send-btn" class="btn">Gửi</button>
        </div>

        <div class="tabs-container" style="margin-top: 20px;">
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="req-body">Body</button>
                <button class="tab-btn" data-tab="req-headers">Headers</button>
            </div>
            <div class="tab-content">
                <div id="tab-req-body" class="tab-pane active">
                    <textarea id="request-body" rows="8" placeholder="{\n  \"key\": \"value\"\n}"></textarea>
                </div>
                <div id="tab-req-headers" class="tab-pane">
                    <div id="request-headers-container">
                        </div>
                    <button id="add-header-btn" class="btn ghost" style="margin-top: 10px;">+ Thêm Header</button>
                </div>
            </div>
        </div>

        <div id="response-area" style="margin-top: 20px; display: none;">
            <h4>Phản hồi</h4>
            <div id="response-status" style="margin-bottom: 10px;"></div>
            <div class="tabs-container">
                <div class="tab-buttons">
                    <button class="tab-btn active" data-tab="res-body">Body</button>
                    <button class="tab-btn" data-tab="res-headers">Headers</button>
                </div>
                <div class="tab-content">
                     <div id="tab-res-body" class="tab-pane active">
                        <pre id="response-body" class="result" style="margin-top:0;"></pre>
                     </div>
                     <div id="tab-res-headers" class="tab-pane">
                        <pre id="response-headers" class="result" style="margin-top:0;"></pre>
                     </div>
                </div>
            </div>
        </div>

        <div id="loading-indicator" class="spinner-container" style="display: none;">
            <i class="ph-bold ph-spinner ph-spin" style="font-size: 2em;"></i> <p>Đang gửi yêu cầu...</p>
        </div>

        <style>
            .tabs-container .tab-buttons { display: flex; border-bottom: 1px solid var(--border-color); }
            .tabs-container .tab-btn { background: none; border: none; padding: 10px 15px; cursor: pointer; color: var(--text-color-light); border-bottom: 2px solid transparent; }
            .tabs-container .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
            .tabs-container .tab-pane { display: none; padding-top: 15px; }
            .tabs-container .tab-pane.active { display: block; }
            .header-row { display: flex; gap: 10px; margin-bottom: 10px; }
            .header-row input { flex: 1; }
            .header-row button { flex-shrink: 0; }
        </style>
    `;
}

export function initRestClient() {
    const methodSelect = document.getElementById('http-method');
    const urlInput = document.getElementById('api-url');
    const sendBtn = document.getElementById('send-btn');
    const requestBody = document.getElementById('request-body');
    const addHeaderBtn = document.getElementById('add-header-btn');
    const requestHeadersContainer = document.getElementById('request-headers-container');
    const responseArea = document.getElementById('response-area');
    const responseStatus = document.getElementById('response-status');
    const responseBody = document.getElementById('response-body');
    const responseHeaders = document.getElementById('response-headers');
    const loadingIndicator = document.getElementById('loading-indicator');

    document.querySelectorAll('.tabs-container').forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-btn');
        const tabPanes = container.querySelectorAll('.tab-pane');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const tabName = button.getAttribute('data-tab');
                tabPanes.forEach(pane => {
                    if (pane.id === `tab-${tabName}`) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });
            });
        });
    });

    const addNewHeaderRow = () => {
        const row = document.createElement('div');
        row.className = 'header-row';
        row.innerHTML = `
            <input type="text" placeholder="Key" class="header-key">
            <input type="text" placeholder="Value" class="header-value">
            <button class="btn ghost remove-header-btn">&times;</button>
        `;
        row.querySelector('.remove-header-btn').addEventListener('click', () => row.remove());
        requestHeadersContainer.appendChild(row);
    };
    addHeaderBtn.addEventListener('click', addNewHeaderRow);
    addNewHeaderRow();

    const sendRequest = async () => {
        const url = urlInput.value.trim();
        if (!url) {
            showToast('Vui lòng nhập URL.', 'warning');
            return;
        }

        loadingIndicator.style.display = 'flex';
        responseArea.style.display = 'none';

        const method = methodSelect.value;
        const headers = new Headers();
        document.querySelectorAll('.header-row').forEach(row => {
            const key = row.querySelector('.header-key').value.trim();
            const value = row.querySelector('.header-value').value.trim();
            if (key) headers.append(key, value);
        });

        const options = { method, headers };
        const body = requestBody.value.trim();
        if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
            options.body = body;
            if (!headers.has('Content-Type')) {
                headers.append('Content-Type', 'application/json');
            }
        }

        try {
            const startTime = performance.now();
            const response = await fetch(url, options);
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            const statusClass = response.ok ? 'success-color' : 'error-color';
            responseStatus.innerHTML = `
                <strong>Trạng thái:</strong> <span style="color: var(--${statusClass});">${response.status} ${response.statusText}</span>
                &nbsp;&nbsp; <strong>Thời gian:</strong> ${duration} ms
            `;

            let headersText = '';
            for (const [key, value] of response.headers.entries()) {
                headersText += `${key}: ${value}\n`;
            }
            responseHeaders.textContent = headersText || 'Không có headers trả về.';

            const contentType = response.headers.get('content-type');
            let responseData;
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
                responseBody.textContent = JSON.stringify(responseData, null, 2);
            } else {
                responseData = await response.text();
                responseBody.textContent = responseData || 'Không có nội dung trả về.';
            }

            responseArea.style.display = 'block';

        } catch (error) {
            responseArea.style.display = 'block';
            responseStatus.innerHTML = `<strong>Trạng thái:</strong> <span style="color: var(--error-color);">Lỗi mạng</span>`;
            responseBody.textContent = `Không thể gửi yêu cầu.\n\nLỗi: ${error.message}\n\nĐây có thể là lỗi CORS. Hãy đảm bảo API bạn đang gọi cho phép truy cập từ tên miền này, hoặc sử dụng một tiện ích CORS trên trình duyệt để kiểm tra.`;
            showToast('Lỗi mạng hoặc CORS.', 'error');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    sendBtn.addEventListener('click', sendRequest);
}