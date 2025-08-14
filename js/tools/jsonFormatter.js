function getJsonFormatterHtml() {
  return `
    <h3>JSON Formatter & Validator</h3>
    <p>Dán chuỗi JSON của bạn vào ô dưới đây. Công cụ sẽ tự động định dạng và kiểm tra tính hợp lệ.</p>
    <textarea id="json-input" placeholder='{"name":"John Doe","age":30,"isStudent":false,"courses":[{"name":"History"},{"name":"Math"}]}' style="height: 300px; font-family: monospace;"></textarea>
    <div class="result" id="json-status" style="text-align:left;">Chờ nhập liệu...</div>
  `;
}

function initJsonFormatter() {
  const inputArea = document.getElementById('json-input');
  const statusArea = document.getElementById('json-status');

  inputArea.addEventListener('input', () => {
    const jsonString = inputArea.value.trim();

    if (!jsonString) {
      statusArea.textContent = 'Chờ nhập liệu...';
      statusArea.style.borderColor = 'var(--border-color)';
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonString);
      const formattedJson = JSON.stringify(parsedJson, null, 2);

      if (inputArea.value !== formattedJson) {
        const currentCursor = inputArea.selectionStart;
        inputArea.value = formattedJson;
        inputArea.selectionStart = inputArea.selectionEnd = currentCursor;
      }

      statusArea.innerHTML = '<i class="ph-fill ph-check-circle" style="color: #198754;"></i> JSON hợp lệ!';
      statusArea.style.borderColor = '#198754';
    } catch (err) {
      statusArea.innerHTML = `<i class="ph-fill ph-x-circle" style="color: #dc3545;"></i> JSON không hợp lệ: ${err.message}`;
      statusArea.style.borderColor = '#dc3545';
    }
  });
}