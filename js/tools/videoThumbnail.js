import { showToast, setupDragDrop } from '../ui.js';
import { downloadBlob, dataURLtoBlob } from '../utils.js';

export function getVideoThumbnailHtml() {
    return `
    <h3>Video → Thumbnail</h3>
    <div class="drop-zone">
      <p>Kéo và thả file video vào đây, hoặc bấm để chọn file</p>
      <input type="file" id="vid-file" accept="video/*" class="hidden-input">
    </div>
    <div id="video-controls" style="display:none; margin-top: 15px;">
      <label for="vid-time">Thời điểm trích xuất (giây)</label>
      <input id="vid-time" type="number" value="1" step="0.1" min="0">
      <label for="thumb-w">Chiều rộng ảnh (px)</label>
      <input id="thumb-w" type="number" value="640" min="16">
      <div class="row">
        <button class="btn" id="makeThumbBtn"><i class="ph-bold ph-camera"></i> Tạo & Tải thumbnail</button>
        <button class="btn ghost" id="previewThumbBtn"><i class="ph-bold ph-eye"></i> Xem trước</button>
      </div>
    </div>
    <div class="result" id="vid-result" style="margin-top: 15px;">Chưa có kết quả</div>
  `;
}

export function initVideoThumbnail() {
    const MAX_VIDEO_SIZE_MB = 50;
    const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

    const panel = document.getElementById('panel');
    const controls = document.getElementById('video-controls');
    const resultDiv = document.getElementById('vid-result');

    let currentFile = null;

    const handleFileSelect = (file) => {
        currentFile = file;
        controls.style.display = 'block';
        resultDiv.innerHTML = `Đã chọn file: <strong>${file.name}</strong>. Hãy chọn thời điểm và tạo thumbnail.`;
    };

    setupDragDrop(panel, 'vid-file', handleFileSelect, MAX_VIDEO_SIZE_BYTES);

    const processVideoFrame = async (shouldDownload = false) => {
        if (!currentFile) {
            return showToast('Vui lòng chọn file video.', 'error');
        }
        const time = parseFloat(document.getElementById('vid-time').value) || 0;
        const targetW = parseInt(document.getElementById('thumb-w').value) || 640;
        const url = URL.createObjectURL(currentFile);

        resultDiv.innerHTML = '<div class="spinner-container"><i class="ph-bold ph-spinner ph-spin"></i> Đang xử lý video...</div>';

        try {
            const imgDataUrl = await extractFrameFromVideo(url, time, targetW);
            resultDiv.innerHTML = `<div>${shouldDownload ? 'Đã tạo thumbnail' : 'Xem trước'} (tại ${time}s)</div><img class="preview" src="${imgDataUrl}">`;
            showToast('Tạo thumbnail thành công!', 'success');

            if (shouldDownload) {
                const blob = dataURLtoBlob(imgDataUrl);
                downloadBlob(blob, `${currentFile.name.replace(/\.[^.]+$/, '') || 'thumb'}_thumb.png`);
            }
        } catch (err) {
            showToast(`Lỗi khi tạo thumbnail: ${err.message}`, 'error');
            resultDiv.innerText = 'Lỗi: ' + err.message;
        } finally {
            URL.revokeObjectURL(url);
        }
    };

    document.getElementById('makeThumbBtn').addEventListener('click', () => processVideoFrame(true));
    document.getElementById('previewThumbBtn').addEventListener('click', () => processVideoFrame(false));
}

function extractFrameFromVideo(videoUrl, timeSec = 1, targetW = 640) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.src = videoUrl;
        video.playsInline = true;

        video.addEventListener('error', () => reject(new Error('Không thể tải video. File có thể bị lỗi hoặc không được hỗ trợ.')));

        video.addEventListener('loadedmetadata', () => {
            if (timeSec > video.duration) {
                reject(new Error(`Thời điểm trích xuất (${timeSec}s) vượt quá thời lượng video (${video.duration.toFixed(1)}s).`));
                return;
            }
            video.currentTime = timeSec;
        });

        video.addEventListener('seeked', () => {
            const ratio = video.videoHeight / video.videoWidth;
            const h = Math.round(targetW * ratio);
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, targetW, h);
            resolve(canvas.toDataURL('image/png'));
        }, { once: true });
    });
}