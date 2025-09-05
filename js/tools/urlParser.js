export function getUrlParserHtml() {
  return `
    <h3>Bộ phân tích & giải mã URL</h3>
    <p>Dán một URL đầy đủ vào ô dưới đây để xem các thành phần của nó.</p>
    
    <label for="url-input">URL đầy đủ</label>
    <textarea id="url-input" placeholder="https://example.com:8080/path/to/page?query=search&id=123#section" style="height: 150px;"></textarea>
    
    <div id="url-output-container" style="margin-top: 24px; display: none;">
      
      <h4>Các thành phần chính</h4>
      <div class="result-grid">
        <div class="grid-item">
          <span class="grid-item-label">Protocol</span>
          <pre id="url-protocol" class="grid-item-value"></pre>
        </div>
        <div class="grid-item">
          <span class="grid-item-label">Hostname</span>
          <pre id="url-hostname" class="grid-item-value"></pre>
        </div>
        <div class="grid-item">
          <span class="grid-item-label">Port</span>
          <pre id="url-port" class="grid-item-value"></pre>
        </div>
        <div class="grid-item">
          <span class="grid-item-label">Pathname</span>
          <pre id="url-pathname" class="grid-item-value"></pre>
        </div>
         <div class="grid-item">
          <span class="grid-item-label">Hash</span>
          <pre id="url-hash" class="grid-item-value"></pre>
        </div>
      </div>

      <h4 style="margin-top: 24px;">Tham số truy vấn (Query Parameters)</h4>
      <div id="url-params-container">
        <p class="info-box">URL này không có tham số truy vấn.</p>
      </div>
    </div>
    <div id="url-error-container" class="result" style="color: var(--error-color); margin-top: 16px; display: none;"></div>
  `;
}

export function initUrlParser() {
    const urlInput = document.getElementById('url-input');
    const outputContainer = document.getElementById('url-output-container');
    const errorContainer = document.getElementById('url-error-container');

    const protocolEl = document.getElementById('url-protocol');
    const hostnameEl = document.getElementById('url-hostname');
    const portEl = document.getElementById('url-port');
    const pathnameEl = document.getElementById('url-pathname');
    const hashEl = document.getElementById('url-hash');
    const paramsContainer = document.getElementById('url-params-container');

    const parseUrl = () => {
        const urlString = urlInput.value.trim();

        if (!urlString) {
            outputContainer.style.display = 'none';
            errorContainer.style.display = 'none';
            return;
        }

        try {
            const url = new URL(urlString);

            protocolEl.textContent = url.protocol;
            hostnameEl.textContent = url.hostname;
            portEl.textContent = url.port || '(mặc định)';
            pathnameEl.textContent = url.pathname;
            hashEl.textContent = url.hash || '(không có)';

            const params = url.searchParams;
            if (params.toString()) {
                let paramsTable = '<table class="result-table"><thead><tr><th>Key</th><th>Value (đã giải mã)</th></tr></thead><tbody>';
                for (const [key, value] of params.entries()) {
                    paramsTable += `<tr><td>${key}</td><td>${value}</td></tr>`;
                }
                paramsTable += '</tbody></table>';
                paramsContainer.innerHTML = paramsTable;
            } else {
                paramsContainer.innerHTML = '<p>URL này không có tham số truy vấn.</p>';
            }

            outputContainer.style.display = 'block';
            errorContainer.style.display = 'none';

        } catch (error) {
            outputContainer.style.display = 'none';
            errorContainer.textContent = 'URL không hợp lệ. Vui lòng kiểm tra lại.';
            errorContainer.style.display = 'block';
        }
    };

    urlInput.addEventListener('input', parseUrl);

    parseUrl();
}