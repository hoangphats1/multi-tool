function getImageConverterHtml() {
    return `
    <h3>Chuyển đổi & Resize Ảnh</h3>
    <div class="drop-zone">
      <p>Kéo và thả file ảnh vào đây, hoặc bấm để chọn file</p>
      <input type="file" id="img-file" accept="image/*" class="hidden-input">
    </div>
    <div class="row">
        <div style="flex:1"><label for="img-w">Chiều rộng (px)</label><input id="img-w" type="number" placeholder="Giữ nguyên"></div>
        <div style="flex:1"><label for="img-h">Chiều cao (px)</label><input id="img-h" type="number" placeholder="Giữ nguyên"></div>
    </div>
    <div class="row" style="margin-top: 5px;"><input type="checkbox" id="img-aspect" checked style="width:auto;"><label for="img-aspect" style="margin-top:0;">Giữ tỉ lệ khung hình</label></div>
    <label for="img-format">Định dạng xuất</label>
    <select id="img-format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WEBP</option></select>
    <label for="img-quality">Chất lượng (JPEG/WEBP)</label>
    <input id="img-quality" type="number" value="0.9" step="0.05" min="0.1" max="1">
    <div class="row"><button class="btn" id="convertImgBtn"><i class="ph-bold ph-arrows-clockwise"></i> Convert & Tải</button></div>
    <div class="result" id="img-result">Chưa có ảnh</div>
  `;
}
function initImageConverter() {
    document.getElementById('convertImgBtn').addEventListener('click', convertImage);
    document.getElementById('img-file').addEventListener('change', previewImage);
    setupDragDrop(document.getElementById('panel'), 'img-file', file => showToast(`Đã nhận file: ${file.name}`));
}
function previewImage() {
    const f = document.getElementById('img-file').files[0];
    const out = document.getElementById('img-result');
    if (!f) {
        out.innerHTML = 'Chưa có ảnh';
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        out.innerHTML = `<div>Xem trước:</div><img class="preview" src="${e.target.result}">`;
    };
    reader.readAsDataURL(f);
}
function convertImage() {
    const f = document.getElementById('img-file').files[0];
    if (!f) return showToast('Vui lòng chọn một file ảnh.', 'error');
    const format = document.getElementById('img-format').value;
    const quality = parseFloat(document.getElementById('img-quality').value) || 0.9;
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            let targetW = parseInt(document.getElementById('img-w').value);
            let targetH = parseInt(document.getElementById('img-h').value);
            const keepAspect = document.getElementById('img-aspect').checked;
            if (!targetW && !targetH) {
                targetW = img.width;
                targetH = img.height;
            } else if (keepAspect) {
                const ratio = img.width / img.height;
                if (targetW && !targetH) targetH = Math.round(targetW / ratio);
                else if (!targetW && targetH) targetW = Math.round(targetH * ratio);
            } else {
                targetW = targetW || img.width;
                targetH = targetH || img.height;
            }
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const dataUrl = canvas.toDataURL(format, quality);
            const blob = dataURLtoBlob(dataUrl);
            const ext = format.split('/')[1].split(';')[0];
            const name = (f.name.replace(/\.[^.]+$/, '') || 'image') + '.' + ext;
            downloadBlob(blob, name);
            document.getElementById('img-result').innerHTML = `<div>Đã chuyển và tải: <strong>${name}</strong></div><img class="preview" src="${dataUrl}">`;
            showToast('Chuyển đổi ảnh thành công!', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(f);
}