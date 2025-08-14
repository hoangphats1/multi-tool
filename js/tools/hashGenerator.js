function getHashGeneratorHtml() {
  return `
    <h3>Trình tạo Hash (MD5/SHA)</h3>
    <p>Nhập văn bản hoặc chọn file để tính toán mã hash.</p>
    <textarea id="hash-input" placeholder="Nhập văn bản ở đây..."></textarea>
    <label for="hash-file-input">Hoặc chọn file:</label>
    <input type="file" id="hash-file-input" style="margin-top:8px;">
    <div class="row">
        <button class="btn" id="hash-generate-btn"><i class="ph-bold ph-lightning"></i> Tạo Hash</button>
    </div>
    <div id="hash-results"></div>
  `;
}

function initHashGenerator() {
    document.getElementById('hash-generate-btn').addEventListener('click', generateHashes);
}

function generateHashes() {
    const textInput = document.getElementById('hash-input');
    const fileInput = document.getElementById('hash-file-input');
    const resultsDiv = document.getElementById('hash-results');
    resultsDiv.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Đang tính toán...';

    if (textInput.value.trim()) {
        const text = textInput.value;
        displayHashes(text);
    } else if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
            displayHashes(wordArray);
        };
        reader.readAsArrayBuffer(file);
    } else {
        showToast('Vui lòng nhập văn bản hoặc chọn file.', 'error');
        resultsDiv.innerHTML = '';
    }
}

function displayHashes(data) {
    const resultsDiv = document.getElementById('hash-results');
    resultsDiv.innerHTML = `
        <label>MD5</label><pre class="result">${CryptoJS.MD5(data)}</pre>
        <label>SHA-1</label><pre class="result">${CryptoJS.SHA1(data)}</pre>
        <label>SHA-256</label><pre class="result">${CryptoJS.SHA256(data)}</pre>
        <label>SHA-512</label><pre class="result">${CryptoJS.SHA512(data)}</pre>
    `;
    showToast('Tính toán hash thành công!', 'success');
}