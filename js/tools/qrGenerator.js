import { showToast } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getQrGeneratorHtml() {
    return `
    <h3>Tạo mã QR</h3>
    <label for="qr-text">Nội dung (link, text, SĐT...)</label>
    <textarea id="qr-text" placeholder="https://www.google.com"></textarea>
    <div class="row">
      <div style="flex:1"><label for="qr-size">Kích thước (px)</label><input id="qr-size" type="number" value="256" min="64" max="1024"></div>
      <div style="flex:1"><label for="qr-color-dark">Màu chính</label><input id="qr-color-dark" type="color" value="#000000" style="padding:4px;height:42px;"></div>
      <div style="flex:1"><label for="qr-color-light">Màu nền</label><input id="qr-color-light" type="color" value="#ffffff" style="padding:4px;height:42px;"></div>
    </div>
    <div class="row">
      <button class="btn" id="makeQrBtn"><i class="ph-bold ph-qr-code"></i> Tạo mã</button>
      <button class="btn ghost" id="downloadQrBtn" style="display:none;"><i class="ph-bold ph-download"></i> Tải về (PNG)</button>
    </div>
    <div class="result" id="qr-result" style="padding: 20px;">Chưa có mã QR</div>
  `;
}
export function initQrGenerator() {
    document.getElementById('makeQrBtn').addEventListener('click', generateQRCode);
}
function generateQRCode() {
    const text = document.getElementById('qr-text').value;
    if (!text.trim()) return showToast('Vui lòng nhập nội dung cho mã QR.', 'error');
    
    const size = parseInt(document.getElementById('qr-size').value);
    const colorDark = document.getElementById('qr-color-dark').value;
    const colorLight = document.getElementById('qr-color-light').value;
    const resultDiv = document.getElementById('qr-result');
    
    resultDiv.innerHTML = '';
    
    const options = {
        text: text,
        width: size,
        height: size,
        colorDark: colorDark,
        colorLight: colorLight,
        correctLevel: QRCode.CorrectLevel.H,
    };

    const qrcode = new QRCode(resultDiv, options);

    const downloadBtn = document.getElementById('downloadQrBtn');
    downloadBtn.style.display = 'inline-flex';
    
    downloadBtn.onclick = () => {
        const canvas = resultDiv.querySelector('canvas'); 
        
        if (canvas) {
            downloadBlob(dataURLtoBlob(canvas.toDataURL('image/png')), 'qrcode.png');
        } else {
            showToast('Không tìm thấy canvas để tải về.', 'error');
        }
    };
    
    showToast('Đã tạo mã QR thành công!');
}