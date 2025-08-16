import { showToast } from '../ui.js';

export function getCodeMinifierHtml() {
    return `
    <h3>Minify / Unminify Code (JS, CSS, HTML)</h3>
    <div class="row">
        <select id="code-lang-select" class="btn ghost" style="padding: 10px; border-radius: 8px;">
            <option value="js">JavaScript</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
        </select>
    </div>
    <div class="row" style="gap: 16px; align-items: stretch;">
        <div style="flex: 1; display: flex; flex-direction: column;">
            <label for="code-input">Input</label>
            <textarea id="code-input" placeholder="Dán code của bạn vào đây..." style="height: 300px; flex-grow: 1;"></textarea>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column;">
            <label for="code-output">Output</label>
            <textarea id="code-output" readonly placeholder="Kết quả sẽ hiển thị ở đây..." style="height: 300px; flex-grow: 1; background-color: var(--input-bg-color);"></textarea>
        </div>
    </div>
    <div class="row">
        <button class="btn" id="minify-btn"><i class="ph-bold ph-arrow-circle-down"></i> Minify</button>
        <button class="btn" id="unminify-btn"><i class="ph-bold ph-magic-wand"></i> Unminify</button>
        <button class="btn ghost" id="copy-btn"><i class="ph-bold ph-copy"></i> Copy Output</button>
    </div>
  `;
}

export function initCodeMinifier() {
    const minifyBtn = document.getElementById('minify-btn');
    const unminifyBtn = document.getElementById('unminify-btn');
    const copyBtn = document.getElementById('copy-btn');
    const langSelect = document.getElementById('code-lang-select');
    const codeInput = document.getElementById('code-input');
    const codeOutput = document.getElementById('code-output');

    minifyBtn.addEventListener('click', async () => {
        const lang = langSelect.value;
        const input = codeInput.value;
        if (!input.trim()) {
            showToast('Vui lòng nhập code để minify.', 'warning');
            return;
        }
        try {
            if (lang === 'js') {
                const result = await Terser.minify(input);
                if (result.error) throw result.error;
                codeOutput.value = result.code;
            } else {
                let minifiedCode = input
                    .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1')
                    .replace(/\s+/g, ' ')
                    .replace(/ ?([;{}:,]) ?/g, '$1')
                    .trim();
                codeOutput.value = minifiedCode;
            }
            showToast('Minify thành công!', 'success');
        } catch (err) {
            codeOutput.value = `Lỗi: ${err.message}`;
            showToast('Có lỗi xảy ra khi minify.', 'error');
            console.error(err);
        }
    });

    unminifyBtn.addEventListener('click', () => {
        const lang = langSelect.value;
        const input = codeInput.value;
        if (!input.trim()) {
            showToast('Vui lòng nhập code để unminify.', 'warning');
            return;
        }
        try {
            let unminifiedCode = '';
            const options = { indent_size: 2, space_in_empty_paren: true };
            if (lang === 'js') {
                unminifiedCode = js_beautify(input, options);
            } else if (lang === 'css') {
                unminifiedCode = css_beautify(input, options);
            } else if (lang === 'html') {
                unminifiedCode = html_beautify(input, options);
            }
            codeOutput.value = unminifiedCode;
            showToast('Unminify thành công!', 'success');
        } catch (err) {
            codeOutput.value = `Lỗi: ${err.message}`;
            showToast('Có lỗi xảy ra khi unminify.', 'error');
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!codeOutput.value) {
            showToast('Không có gì để sao chép.', 'warning');
            return;
        }
        navigator.clipboard.writeText(codeOutput.value).then(() => {
            showToast('Đã sao chép vào clipboard!', 'success');
        }, () => {
            showToast('Không thể sao chép.', 'error');
        });
    });
}