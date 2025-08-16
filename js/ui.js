['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});

/**
 * @param {string} message
 * @param {string} type
 */
export function showToast(message, type = 'success') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: type,
    title: message
  });
}

export function setupDragDrop(panelElement, fileInputId, onFileDropCallback, maxSizeInBytes) {
  const fileInput = panelElement.querySelector(`#${fileInputId}`);
  const dropZone = panelElement.querySelector('.drop-zone') || panelElement;
  const originalDropZoneText = dropZone.querySelector('p')?.innerHTML || 'Kéo thả file vào đây, hoặc bấm để chọn file';
  const dropZoneText = dropZone.querySelector('p');

  dropZone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'A') {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      if (maxSizeInBytes && file.size > maxSizeInBytes) {
        showToast(`File quá lớn. Vui lòng chọn file nhỏ hơn ${maxSizeInBytes / 1024 / 1024} MB.`, 'error');
        fileInput.value = '';
        if (dropZoneText) {
          dropZoneText.innerHTML = originalDropZoneText;
        }
        dropZone.classList.remove('has-file');
        return;
      }

      const fileName = file.name;
      if (dropZoneText) {
        dropZoneText.innerHTML = `<i class="ph-fill ph-file"></i> Tệp đã chọn: <strong>${fileName}</strong>`;
      }
      dropZone.classList.add('has-file');
      if (onFileDropCallback) onFileDropCallback(file);
    } else {
      if (dropZoneText) {
        dropZoneText.innerHTML = originalDropZoneText;
      }
      dropZone.classList.remove('has-file');
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.borderColor = 'var(--primary-color)';
  });
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.borderColor = 'var(--border-color)';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });
}