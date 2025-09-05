import * as Diff from 'diff';

export function getDiffCheckerHtml() {
    return `
    <style>
      .diff-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        height: 60vh;
      }
      .diff-panel {
        display: flex;
        flex-direction: column;
      }
      .diff-panel textarea {
        flex-grow: 1;
        resize: none;
        font-family: var(--font-mono);
      }
      #diff-output {
        margin-top: 16px;
        padding: 0;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        font-family: var(--font-mono);
        max-height: 70vh;
        overflow-y: auto;
        background-color: var(--card-bg-color);
      }
      .diff-line {
        display: flex;
        width: 100%;
        font-size: 0.9em;
        transition: background-color 0.15s ease;
      }
      .diff-line:hover {
        background-color: rgba(128,128,128,0.1);
      }
      .line-gutter {
        display: flex;
        width: 100px;
        flex-shrink: 0;
        user-select: none;
        background-color: var(--bg-color);
        padding-right: 10px;
        border-right: 1px solid var(--border-color);
      }
      .line-numbers {
        width: 80px;
        text-align: right;
        color: var(--text-color-light);
        padding-right: 10px;
      }
      .line-numbers .line-num:first-child {
        border-right: 1px solid var(--border-color);
      }
      .line-prefix {
        width: 20px;
        text-align: center;
        font-weight: bold;
      }
      .line-content {
        flex-grow: 1;
        padding: 2px 15px;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .diff-added {
        background-color: rgba(46, 160, 67, 0.15);
      }
      .diff-added .line-prefix { color: #2ea043; }
      .diff-added .line-content {
        border-left: 3px solid #2ea043;
      }

      .diff-removed {
        background-color: rgba(248, 81, 73, 0.1);
      }
      .diff-removed .line-prefix { color: #f85149; }
      .diff-removed .line-content {
        border-left: 3px solid #f85149;
        text-decoration: line-through;
        opacity: 0.7;
      }
      
      body.dark-mode .diff-added { background-color: rgba(46, 160, 67, 0.15); }
      body.dark-mode .diff-removed { background-color: rgba(248, 81, 73, 0.15); }
    </style>

    <h3>Diff Checker (So sánh văn bản)</h3>
    <p>Dán hai đoạn văn bản hoặc code vào các ô dưới đây để xem sự khác biệt.</p>

    <div class="diff-container">
      <div class="diff-panel">
        <label for="diff-old">Văn bản gốc</label>
        <textarea id="diff-old" placeholder="Dán văn bản gốc vào đây..."></textarea>
      </div>
      <div class="diff-panel">
        <label for="diff-new">Văn bản mới</label>
        <textarea id="diff-new" placeholder="Dán văn bản đã thay đổi vào đây..."></textarea>
      </div>
    </div>
    <button id="compare-btn" class="btn primary" style="margin-top: 16px;"><i class="ph-bold ph-git-diff"></i> So sánh</button>

    <hr style="margin: 24px 0;">
    <h4>Kết quả so sánh</h4>
    <div id="diff-output"><p style="padding: 16px; color: var(--text-color-light);">Chưa có kết quả.</p></div>
  `;
}

export function initDiffChecker() {
    const oldInput = document.getElementById('diff-old');
    const newInput = document.getElementById('diff-new');
    const compareBtn = document.getElementById('compare-btn');
    const outputDiv = document.getElementById('diff-output');

    function escapeHtml(text) {
        return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    compareBtn.addEventListener('click', () => {
        const oldText = oldInput.value;
        const newText = newInput.value;

        const diff = Diff.diffLines(oldText, newText);
        const fragment = document.createDocumentFragment();

        if (diff.length === 1 && !diff[0].added && !diff[0].removed) {
            outputDiv.innerHTML = '<p style="padding: 16px; color: var(--text-color-light);">Hai văn bản giống hệt nhau.</p>';
            return;
        }

        let oldLineNum = 1;
        let newLineNum = 1;

        diff.forEach(part => {
            const lines = part.value.split('\\n').filter(line => line.length > 0);

            lines.forEach(line => {
                const div = document.createElement('div');
                div.className = 'diff-line';

                const lineNumbers = document.createElement('div');
                lineNumbers.className = 'line-numbers';
                const oldNumSpan = document.createElement('span');
                oldNumSpan.className = 'line-num';
                const newNumSpan = document.createElement('span');
                newNumSpan.className = 'line-num';

                const prefix = document.createElement('span');
                prefix.className = 'line-prefix';

                const content = document.createElement('span');
                content.className = 'line-content';
                content.textContent = line;

                if (part.added) {
                    div.classList.add('diff-added');
                    prefix.textContent = '+';
                    newNumSpan.textContent = newLineNum++;
                } else if (part.removed) {
                    div.classList.add('diff-removed');
                    prefix.textContent = '-';
                    oldNumSpan.textContent = oldLineNum++;
                } else {
                    oldNumSpan.textContent = oldLineNum++;
                    newNumSpan.textContent = newLineNum++;
                }

                lineNumbers.appendChild(oldNumSpan);
                lineNumbers.appendChild(newNumSpan);
                div.appendChild(lineNumbers);
                div.appendChild(prefix);
                div.appendChild(content);
                fragment.appendChild(div);
            });
        });

        outputDiv.innerHTML = '';
        outputDiv.appendChild(fragment);
    });
}