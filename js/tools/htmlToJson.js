import { showToast } from '../ui.js';

export function getHtmlToJsonHtml() {
    return `
    <h3>HTML/XML to JSON Converter</h3>
    <p>Dán mã HTML hoặc XML vào ô bên dưới để chuyển đổi sang định dạng JSON.</p>

    <label for="source-input">Mã nguồn HTML/XML:</label>
    <textarea id="source-input" rows="10" placeholder="<root><item id='1'>Hello</item></root>"></textarea>

    <div class="row">
        <div class="radio-options-group">
            <input type="radio" id="type-html" name="parser-type" value="text/html" checked>
            <label for="type-html">HTML</label>
            <input type="radio" id="type-xml" name="parser-type" value="application/xml">
            <label for="type-xml">XML</label>
        </div>
        <button id="convert-btn" class="btn">Chuyển đổi</button>
    </div>

    <label for="json-result">Kết quả JSON:</label>
    <pre id="json-result" class="result" style="min-height: 100px;"></pre>
  `;
}

export function initHtmlToJson() {
    const convertBtn = document.getElementById('convert-btn');
    const sourceInput = document.getElementById('source-input');
    const resultPre = document.getElementById('json-result');

    const domNodeToJson = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            return text ? { type: 'text', content: text } : null;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const obj = {
            type: 'element',
            tagName: node.tagName.toLowerCase(),
            attributes: {},
            children: []
        };

        for (let attr of node.attributes) {
            obj.attributes[attr.name] = attr.value;
        }

        for (let child of node.childNodes) {
            const childJson = domNodeToJson(child);
            if (childJson) {
                obj.children.push(childJson);
            }
        }

        if (obj.children.length === 1 && obj.children[0].type === 'text') {
            return { ...obj, content: obj.children[0].content, children: [] };
        }

        return obj;
    };

    convertBtn.addEventListener('click', () => {
        try {
            const sourceText = sourceInput.value;
            const parserType = document.querySelector('input[name="parser-type"]:checked').value;
            const parser = new DOMParser();
            const doc = parser.parseFromString(sourceText, parserType);

            const parseError = doc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Lỗi cú pháp XML: ' + parseError.innerText);
            }

            const rootElement = parserType === 'application/xml' ? doc.documentElement : doc.body;
            const jsonObject = domNodeToJson(rootElement);

            if (parserType === 'text/html' && jsonObject.children.length > 0) {
                resultPre.textContent = JSON.stringify(jsonObject.children, null, 2);
            } else {
                resultPre.textContent = JSON.stringify(jsonObject, null, 2);
            }

        } catch (error) {
            showToast('Không thể chuyển đổi. Vui lòng kiểm tra lại mã nguồn.', 'error');
            resultPre.textContent = error.message;
        }
    });
}