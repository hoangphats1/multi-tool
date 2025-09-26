import { showToast } from '../ui.js';

export function getJsonViewerHtml() {
    return `
    <h3>JSON Tree Viewer</h3>
    <p>Dán mã JSON của bạn vào ô bên dưới để xem dưới dạng cây thư mục có thể tương tác.</p>

    <div class="row" style="align-items: flex-start; gap: 20px;">
        <div style="flex: 1;">
            <label for="json-input">Mã nguồn JSON:</label>
            <textarea id="json-input" rows="20" placeholder='{ "message": "Hello World", "data": [1, 2, 3] }'></textarea>
            <button id="render-json-btn" class="btn" style="margin-top: 10px;">Hiển thị cây</button>
        </div>

        <div style="flex: 1;">
            <label>Dạng cây:</label>
            <div id="json-tree-output" class="result" style="min-height: 400px; max-height: 600px; overflow-y: auto;"></div>
        </div>
    </div>

    <style>
        .json-tree { padding-left: 0; margin: 0; list-style-type: none; font-family: var(--font-mono); font-size: 14px; }
        .json-tree li { position: relative; padding-left: 20px; }
        .json-tree .collapsible > .key::before {
            content: '▶';
            position: absolute;
            left: 0;
            top: 0;
            cursor: pointer;
            transition: transform 0.1s ease;
        }
        .json-tree .collapsible:not(.collapsed) > .key::before {
            transform: rotate(90deg);
        }
        .json-tree .collapsible.collapsed > ul {
            display: none;
        }
        .json-tree ul { padding-left: 20px; list-style-type: none; border-left: 1px dashed var(--border-color); }
        .json-tree .key { color: var(--primary-color); font-weight: 600; }
        .json-tree .value { margin-left: 8px; }
        .json-tree .value.string { color: #28a745; } /* Green */
        .json-tree .value.number { color: #fd7e14; } /* Orange */
        .json-tree .value.boolean { color: #dc3545; } /* Red */
        .json-tree .value.null { color: var(--text-color-light); font-style: italic; }
        .json-tree .item-count { color: var(--text-color-light); margin-left: 8px; font-style: italic; }
    </style>
  `;
}

export function initJsonViewer() {
    const inputArea = document.getElementById('json-input');
    const renderBtn = document.getElementById('render-json-btn');
    const outputDiv = document.getElementById('json-tree-output');

    const createTreeView = (data) => {
        const root = document.createElement('ul');
        root.className = 'json-tree';
        buildTree(data, root);
        return root;
    };

    const buildTree = (data, parentElement) => {
        const isArray = Array.isArray(data);
        for (const key in data) {
            const value = data[key];
            const li = document.createElement('li');

            const keySpan = document.createElement('span');
            keySpan.className = 'key';
            if (!isArray) {
                keySpan.textContent = `${key}: `;
            }
            li.appendChild(keySpan);

            if (typeof value === 'object' && value !== null) {
                li.classList.add('collapsible');
                const itemCount = document.createElement('span');
                itemCount.className = 'item-count';
                const childCount = Object.keys(value).length;
                itemCount.textContent = Array.isArray(value) ? `[${childCount}]` : `{${childCount}}`;
                keySpan.appendChild(itemCount);

                const nestedUl = document.createElement('ul');
                buildTree(value, nestedUl);
                li.appendChild(nestedUl);

                keySpan.addEventListener('click', () => {
                    li.classList.toggle('collapsed');
                });

            } else {
                const valueSpan = document.createElement('span');
                valueSpan.className = 'value';
                valueSpan.textContent = JSON.stringify(value);
                const valueType = value === null ? 'null' : typeof value;
                valueSpan.classList.add(valueType);
                li.appendChild(valueSpan);
            }
            parentElement.appendChild(li);
        }
    };

    renderBtn.addEventListener('click', () => {
        const jsonString = inputArea.value;
        if (!jsonString) {
            showToast('Vui lòng nhập mã JSON.', 'warning');
            return;
        }
        try {
            const jsonData = JSON.parse(jsonString);
            outputDiv.innerHTML = '';
            const treeView = createTreeView(jsonData);
            outputDiv.appendChild(treeView);
        } catch (error) {
            showToast('Mã JSON không hợp lệ.', 'error');
            outputDiv.innerHTML = `<span style="color: var(--error-color);">Lỗi: ${error.message}</span>`;
        }
    });
}