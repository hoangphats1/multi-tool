function getFacebookUtilsHtml() {
    return `
    <h3>Tiện ích Facebook</h3>
    <h4>Lấy Avatar từ User ID</h4>
    <p>Nhập một User ID của Facebook để lấy ảnh đại diện chất lượng cao.</p>
    <label for="fb-id-input">Facebook User ID</label>
    <input type="text" id="fb-id-input" placeholder="Ví dụ: 4 (ID của Mark Zuckerberg)">
    <div class="row">
        <button class="btn" id="fb-get-avatar-btn"><i class="ph-bold ph-user"></i> Lấy Avatar</button>
    </div>
    <div class="result" id="fb-avatar-result" style="text-align:center;">Chưa có ảnh</div>
  `;
}

function initFacebookUtils() {
    document.getElementById('fb-get-avatar-btn').addEventListener('click', getFacebookAvatar);
}

async function getFacebookAvatar() {
    const userId = document.getElementById('fb-id-input').value.trim();
    const resultDiv = document.getElementById('fb-avatar-result');

    if (!userId) {
        showToast('Vui lòng nhập User ID.', 'error');
        return;
    }

    resultDiv.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Đang tải...';

    const apiUrl = `https://graph2.fb.me/${userId}/picture?type=large&access_token=2712477385668128|b429aeb53369951d411e1cae8e810640`;

    try {
        if (apiUrl) {
            resultDiv.innerHTML = `<img src="${apiUrl}" class="preview" alt="Avatar của ${userId}">`;
        } else {
            throw new Error('Không tìm thấy dữ liệu ảnh.');
        }
    } catch (error) {
        resultDiv.textContent = 'Không thể lấy avatar. ID có thể không đúng hoặc tài khoản này riêng tư.';
        showToast('Lấy avatar thất bại.', 'error');
    }
}