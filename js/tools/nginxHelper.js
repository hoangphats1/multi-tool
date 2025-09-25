import { showToast } from '../ui.js';

export function getNginxHelperHtml() {
    return `
    <h3>NGINX Config Helper</h3>
    <p>Tạo nhanh cấu hình NGINX cho các tác vụ phổ biến.</p>
    
    <label for="nginx-preset">Chọn kịch bản cấu hình:</label>
    <select id="nginx-preset">
        <option value="proxy">Reverse Proxy</option>
        <option value="static">Host trang web tĩnh</option>
        <option value="php">Host trang web PHP-FPM</option>
    </select>

    <div id="preset-options-proxy" class="preset-options">
        <div class="row">
            <div style="flex: 1;">
                <label for="nginx-proxy-servername">Server Name (domain)</label>
                <input type="text" id="nginx-proxy-servername" placeholder="yourdomain.com www.yourdomain.com">
            </div>
            <div style="flex: 1;">
                <label for="nginx-proxy-pass">Proxy Pass URL</label>
                <input type="text" id="nginx-proxy-pass" placeholder="http://localhost:3000">
            </div>
        </div>
    </div>

    <div id="preset-options-static" class="preset-options" style="display: none;">
         <div class="row">
            <div style="flex: 1;">
                <label for="nginx-static-servername">Server Name (domain)</label>
                <input type="text" id="nginx-static-servername" placeholder="yourdomain.com">
            </div>
            <div style="flex: 1;">
                <label for="nginx-static-root">Đường dẫn thư mục gốc (root)</label>
                <input type="text" id="nginx-static-root" placeholder="/var/www/yourdomain.com/html">
            </div>
        </div>
    </div>
    
    <div id="preset-options-php" class="preset-options" style="display: none;">
         <div class="row">
            <div style="flex: 1;">
                <label for="nginx-php-servername">Server Name (domain)</label>
                <input type="text" id="nginx-php-servername" placeholder="yourdomain.com">
            </div>
            <div style="flex: 1;">
                <label for="nginx-php-root">Đường dẫn thư mục gốc (root)</label>
                <input type="text" id="nginx-php-root" placeholder="/var/www/html">
            </div>
         </div>
         <label for="nginx-php-socket">PHP-FPM Socket/Address</label>
         <input type="text" id="nginx-php-socket" value="unix:/var/run/php/php8.2-fpm.sock">
    </div>

    <h4>Tùy chọn chung</h4>
    <div class="checkbox-group" style="margin-top: 16px;">
        <input type="checkbox" id="nginx-ssl">
        <label for="nginx-ssl">Kích hoạt SSL (HTTPS)</label>
        
        <input type="checkbox" id="nginx-websockets">
        <label for="nginx-websockets">Hỗ trợ WebSockets (chỉ cho Reverse Proxy)</label>
        
        <input type="checkbox" id="nginx-security-headers">
        <label for="nginx-security-headers">Thêm Security Headers cơ bản</label>
    </div>
    
    <div class="row">
         <button id="generate-nginx-btn" class="btn">Tạo cấu hình</button>
         <button id="copy-nginx-btn" class="btn ghost"><i class="ph-bold ph-copy"></i> Sao chép</button>
    </div>

    <pre id="nginx-result-wrapper" class="result" style="margin-top: 20px; display: none;"><code></code></pre>
  `;
}

export function initNginxHelper() {
    const presetSelect = document.getElementById('nginx-preset');
    const allOptionsDivs = document.querySelectorAll('.preset-options');
    const generateBtn = document.getElementById('generate-nginx-btn');
    const copyBtn = document.getElementById('copy-nginx-btn');
    const resultWrapper = document.getElementById('nginx-result-wrapper');
    const resultCode = resultWrapper.querySelector('code');
    const websocketsCheckbox = document.getElementById('nginx-websockets');

    presetSelect.addEventListener('change', () => {
        const selectedPreset = presetSelect.value;
        allOptionsDivs.forEach(div => div.style.display = 'none');
        document.getElementById(`preset-options-${selectedPreset}`).style.display = 'block';

        websocketsCheckbox.disabled = selectedPreset !== 'proxy';
        if (selectedPreset !== 'proxy') {
            websocketsCheckbox.checked = false;
        }
    });

    generateBtn.addEventListener('click', () => {
        const preset = presetSelect.value;
        let config = '';

        switch (preset) {
            case 'proxy':
                config = generateReverseProxyConfig();
                break;
            case 'static':
                config = generateStaticSiteConfig();
                break;
            case 'php':
                config = generatePhpFpmConfig();
                break;
        }

        resultCode.textContent = config.trim();
        resultWrapper.style.display = 'block';
    });

    copyBtn.addEventListener('click', () => {
        const code = resultCode.textContent;
        if (code) {
            navigator.clipboard.writeText(code)
                .then(() => showToast('Đã sao chép vào clipboard!', 'success'))
                .catch(err => showToast('Lỗi khi sao chép.', 'error'));
        } else {
            showToast('Chưa có gì để sao chép.', 'warning');
        }
    });

    function getGlobalOptions() {
        return {
            ssl: document.getElementById('nginx-ssl').checked,
            websockets: websocketsCheckbox.checked,
            securityHeaders: document.getElementById('nginx-security-headers').checked,
        };
    }

    function generateReverseProxyConfig() {
        const serverName = document.getElementById('nginx-proxy-servername').value.trim() || 'yourdomain.com';
        const proxyPass = document.getElementById('nginx-proxy-pass').value.trim() || 'http://localhost:3000';
        const options = getGlobalOptions();

        let ws_config = options.websockets ? `
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";` : '';

        let config = `
server {
    listen 80;
    server_name ${serverName};
    
    # Security Headers
    ${options.securityHeaders ? getSecurityHeaders() : ''}

    location / {
        proxy_pass ${proxyPass};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        ${ws_config}
    }
}`;
        return options.ssl ? applySsl(config, serverName) : config;
    }

    function generateStaticSiteConfig() {
        const serverName = document.getElementById('nginx-static-servername').value.trim() || 'yourdomain.com';
        const rootPath = document.getElementById('nginx-static-root').value.trim() || '/var/www/html';
        const options = getGlobalOptions();

        let config = `
server {
    listen 80;
    server_name ${serverName};
    root ${rootPath};
    index index.html index.htm;
    
    # Security Headers
    ${options.securityHeaders ? getSecurityHeaders() : ''}

    location / {
        try_files $uri $uri/ =404;
    }
}`;
        return options.ssl ? applySsl(config, serverName) : config;
    }

    function generatePhpFpmConfig() {
        const serverName = document.getElementById('nginx-php-servername').value.trim() || 'yourdomain.com';
        const rootPath = document.getElementById('nginx-php-root').value.trim() || '/var/www/html';
        const phpSocket = document.getElementById('nginx-php-socket').value.trim() || 'unix:/var/run/php/php8.2-fpm.sock';
        const options = getGlobalOptions();

        let config = `
server {
    listen 80;
    server_name ${serverName};
    root ${rootPath};
    index index.php index.html index.htm;

    # Security Headers
    ${options.securityHeaders ? getSecurityHeaders() : ''}

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass ${phpSocket};
    }
    
    location ~ /\.ht {
        deny all;
    }
}`;
        return options.ssl ? applySsl(config, serverName) : config;
    }

    function applySsl(config, serverName) {
        const sslConfig = `
server {
    listen 443 ssl http2;
    server_name ${serverName};

    ssl_certificate /etc/letsencrypt/live/${serverName.split(' ')[0]}/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/${serverName.split(' ')[0]}/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    
    ${config.substring(config.indexOf('{') + 1)}
`;
        const redirectConfig = `
# Chuyển hướng HTTP sang HTTPS
server {
    listen 80;
    server_name ${serverName};
    return 301 https://$host$request_uri;
}
`;
        return redirectConfig + sslConfig;
    }

    function getSecurityHeaders() {
        return `
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    # add_header Content-Security-Policy "default-src 'self'; ..." always; # Cần cấu hình cẩn thận
    `;
    }
}