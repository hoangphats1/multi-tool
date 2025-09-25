import { showToast } from '../ui.js';

export function getPasswordGeneratorHtml() {
    return `
        <h3>Password Generator</h3>
        <p>Tạo mật khẩu mạnh và an toàn.</p>

        <div class="result-grid" style="grid-template-columns: 1fr auto; margin-bottom: 20px;">
            <div class="grid-item">
                <p id="password-output" class="grid-item-value" style="font-size: 1.2em;">Bấm nút để tạo</p>
            </div>
            <button id="copy-btn" class="btn ghost"><i class="ph-bold ph-copy"></i></button>
        </div>

        <label for="length-slider">Độ dài mật khẩu: <span id="length-value">16</span></label>
        <input type="range" id="length-slider" min="8" max="64" value="16" style="width: 100%;">

        <div class="checkbox-group" style="margin-top: 16px;">
            <input type="checkbox" id="include-uppercase" checked><label for="include-uppercase">Chữ hoa (A-Z)</label>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="include-lowercase" checked><label for="include-lowercase">Chữ thường (a-z)</label>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="include-numbers" checked><label for="include-numbers">Số (0-9)</label>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="include-symbols"><label for="include-symbols">Ký tự đặc biệt (!@#$)</label>
        </div>

        <div class="row" style="margin-top: 20px;">
            <button id="generate-btn" class="btn">Tạo mật khẩu mới</button>
        </div>
    `;
}

export function initPasswordGenerator() {
    const outputEl = document.getElementById('password-output');
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const options = {
        uppercase: document.getElementById('include-uppercase'),
        lowercase: document.getElementById('include-lowercase'),
        numbers: document.getElementById('include-numbers'),
        symbols: document.getElementById('include-symbols'),
    };
    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
    });

    const generatePassword = () => {
        const length = parseInt(lengthSlider.value, 10);
        let masterCharSet = '';
        let password = [];

        if (options.uppercase.checked) {
            masterCharSet += charSets.uppercase;
            password.push(charSets.uppercase[Math.floor(Math.random() * charSets.uppercase.length)]);
        }
        if (options.lowercase.checked) {
            masterCharSet += charSets.lowercase;
            password.push(charSets.lowercase[Math.floor(Math.random() * charSets.lowercase.length)]);
        }
        if (options.numbers.checked) {
            masterCharSet += charSets.numbers;
            password.push(charSets.numbers[Math.floor(Math.random() * charSets.numbers.length)]);
        }
        if (options.symbols.checked) {
            masterCharSet += charSets.symbols;
            password.push(charSets.symbols[Math.floor(Math.random() * charSets.symbols.length)]);
        }

        if (masterCharSet === '') {
            showToast('Vui lòng chọn ít nhất một loại ký tự.', 'warning');
            return;
        }

        for (let i = password.length; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * masterCharSet.length);
            password.push(masterCharSet[randomIndex]);
        }

        for (let i = password.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [password[i], password[j]] = [password[j], password[i]];
        }

        outputEl.textContent = password.join('');
    };

    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', () => {
        const password = outputEl.textContent;
        if (password && password !== 'Bấm nút để tạo') {
            navigator.clipboard.writeText(password)
                .then(() => showToast('Đã sao chép mật khẩu!', 'success'))
                .catch(() => showToast('Lỗi khi sao chép.', 'error'));
        }
    });

    generatePassword();
}