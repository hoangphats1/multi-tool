import { showToast, setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getVideoThumbnailHtml() {
    return `
    <h3>Video → Thumbnail</h3>
    <div class="drop-zone">
      <p>Kéo và thả file video vào đây, hoặc bấm để chọn file</p>
      <input type="file" id="vid-file" accept="video/*" class="hidden-input">
    </div>
    <label for="vid-time">Thời điểm trích xuất (giây)</label>
    <input id="vid-time" type="number" value="1" step="0.1" min="0">
    <label for="thumb-w">Chiều rộng ảnh (px)</label>
    <input id="thumb-w" type="number" value="640" min="16">
    <div class="row">
      <button class="btn" id="makeThumbBtn"><i class="ph-bold ph-camera"></i> Tạo & Tải thumbnail</button>
      <button class="btn ghost" id="previewThumbBtn"><i class="ph-bold ph-eye"></i> Xem trước</button>
    </div>
    <div class="result" id="vid-result">Chưa có kết quả</div>
  `;
}
export function initVideoThumbnail() {
    document.getElementById('makeThumbBtn').addEventListener('click', () => processVideoFrame(true));
    document.getElementById('previewThumbBtn').addEventListener('click', () => processVideoFrame(false));
    setupDragDrop(panel, 'vid-file', null, MAX_FILE_SIZE);
}
async function processVideoFrame(shouldDownload = false) {
    const f = document.getElementById('vid-file').files[0];
    if (!f) return showToast('Vui lòng chọn file video.', 'error');
    const time = parseFloat(document.getElementById('vid-time').value) || 0;
    const targetW = parseInt(document.getElementById('thumb-w').value) || 640;
    const out = document.getElementById('vid-result');
    const url = URL.createObjectURL(f);
    out.innerHTML = 'Đang xử lý video...';
    try {
        const imgDataUrl = await extractFrameFromVideo(url, time, targetW);
        out.innerHTML = `<div>${shouldDownload ? 'Đã tạo thumbnail' : 'Xem trước'} (tại ${time}s)</div><img class="preview" src="${imgDataUrl}">`;
        showToast('Tạo thumbnail thành công!', 'success');
        if (shouldDownload) {
            const blob = dataURLtoBlob(imgDataUrl);
            downloadBlob(blob, (f.name.replace(/\.[^.]+$/, '') || 'thumb') + '_thumb.png');
        }
    } catch (err) {
        showToast('Lỗi khi tạo thumbnail: ' + err.message, 'error');
        out.innerText = 'Lỗi: ' + err.message;
        console.error(err);
    } finally {
        URL.revokeObjectURL(url);
    }
}
function extractFrameFromVideo(videoUrl, timeSec = 1, targetW = 640) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.src = videoUrl;
        video.playsInline = true;
        video.addEventListener('error', (e) => reject(new Error('Không thể tải video.')));
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = Math.min(Math.max(0, timeSec), video.duration || timeSec);
            video.addEventListener('seeked', () => {
                const ratio = video.videoHeight / video.videoWidth;
                const h = Math.round(targetW * ratio);
                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, targetW, h);
                try {
                    resolve(canvas.toDataURL('image/png'));
                } catch (err) {
                    reject(err);
                }
            }, { once: true });
        });
    });
}