import { showToast, setupDragDrop } from '../ui.js';

export function getHashGeneratorHtml() {
    return `
    <h3>Trình tạo Hash (MD5, SHA-1, SHA-256, SHA-512)</h3>
    <p>Nhập văn bản để tự động tính toán mã hash, hoặc kéo thả file vào ô bên dưới.</p>
    
    <label for="hash-input">Nhập văn bản:</label>
    <textarea id="hash-input" rows="6" placeholder="Văn bản sẽ được hash tự động khi bạn gõ..."></textarea>
    
    <label style="margin-top: 15px;">Hoặc chọn file:</label>
    <div class="drop-zone">
        <p>Kéo thả file vào đây, hoặc bấm để chọn file</p>
        <input type="file" id="hash-file-input" class="hidden-input">
    </div>

    <div id="hash-results-container" style="display: none; margin-top: 20px;">
        <h4>Kết quả Hash</h4>
        <div id="hash-results-grid" class="result-grid"></div>
    </div>
  `;
}

export function initHashGenerator() {
    const textInput = document.getElementById('hash-input');
    const panel = document.getElementById('panel');
    const resultsContainer = document.getElementById('hash-results-container');
    const resultsGrid = document.getElementById('hash-results-grid');

    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    let debounceTimer;

    const debounce = (func, delay) => {
        return function (...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    textInput.addEventListener('input', debounce(() => {
        const text = textInput.value;
        if (text.trim()) {
            displayHashes(text);
        } else {
            resultsContainer.style.display = 'none';
        }
    }, 300));

    const handleFile = (file) => {
        textInput.value = '';
        const reader = new FileReader();
        reader.onloadstart = () => {
            resultsContainer.style.display = 'block';
            resultsGrid.innerHTML = '<div class="spinner-container"><i class="ph-bold ph-spinner ph-spin"></i> Đang tính toán...</div>';
        };
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
            displayHashes(wordArray);
        };
        reader.onerror = () => {
            showToast('Không thể đọc file.', 'error');
            resultsGrid.innerHTML = '';
        };
        reader.readAsArrayBuffer(file);
    };

    setupDragDrop(panel, 'hash-file-input', handleFile, MAX_FILE_SIZE_BYTES);

    function displayHashes(data) {
        const hashes = {
            'MD5': CryptoJS.MD5(data),
            'SHA-1': CryptoJS.SHA1(data),
            'SHA-256': CryptoJS.SHA256(data),
            'SHA-512': CryptoJS.SHA512(data)
        };

        resultsGrid.innerHTML = '';
        for (const [name, hash] of Object.entries(hashes)) {
            const hashValue = hash.toString(CryptoJS.enc.Hex);
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.innerHTML = `
                <span class="grid-item-label">${name}</span>
                <div class="result-grid" style="grid-template-columns: 1fr auto; margin-top: 5px;">
                    <input type="text" class="grid-item-value" value="${hashValue}" readonly style="border: none; background: transparent; padding: 0;">
                    <button class="btn ghost copy-btn" data-hash="${hashValue}"><i class="ph-bold ph-copy"></i></button>
                </div>
            `;
            resultsGrid.appendChild(gridItem);
        }
        resultsContainer.style.display = 'block';

        resultsGrid.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const hashToCopy = button.getAttribute('data-hash');
                navigator.clipboard.writeText(hashToCopy)
                    .then(() => showToast(`Đã sao chép hash ${button.parentElement.parentElement.querySelector('.grid-item-label').textContent}!`, 'success'));
            });
        });
    }
}