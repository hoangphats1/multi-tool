function getCurrencyConverterHtml() {
    return `
    <h3>Công cụ đổi tiền</h3>
    <p>Chuyển đổi giá trị giữa các loại tiền tệ khác nhau.</p>
    <div class="row">
        <div style="flex:2"><label for="currency-amount">Số tiền</label><input type="number" id="currency-amount" value="1"></div>
        <div style="flex:1"><label for="currency-from">Từ</label><select id="currency-from"></select></div>
        <div style="flex:1"><label for="currency-to">Sang</label><select id="currency-to"></select></div>
    </div>
    <div class="row">
        <button class="btn" id="currency-convert-btn"><i class="ph-bold ph-arrows-clockwise"></i> Chuyển đổi</button>
        <button class="btn ghost" id="currency-swap-btn"><i class="ph-bold ph-arrows-left-right"></i> Đảo ngược</button>
    </div>
    <div class="result" id="currency-result" style="text-align:center; font-size: 1.2em; font-weight: 600;"></div>
    <p id="currency-rate-info" style="text-align:center; font-size: 13px; color: var(--text-color-light);"></p>
  `;
}

async function initCurrencyConverter() {
    const fromSelect = document.getElementById('currency-from');
    const toSelect = document.getElementById('currency-to');
    const convertBtn = document.getElementById('currency-convert-btn');
    const swapBtn = document.getElementById('currency-swap-btn');
    const resultDiv = document.getElementById('currency-result');
    const rateInfo = document.getElementById('currency-rate-info');

    let conversionRates = {};

    const apiUrl = 'https://open.er-api.com/v6/latest/USD';

    try {
        resultDiv.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Đang tải tỷ giá...';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.result === 'success') {
            conversionRates = data.rates;
            const currencies = Object.keys(conversionRates);

            currencies.forEach(currency => {
                fromSelect.innerHTML += `<option value="${currency}">${currency}</option>`;
                toSelect.innerHTML += `<option value="${currency}">${currency}</option>`;
            });

            fromSelect.value = 'USD';
            toSelect.value = 'VND';
            resultDiv.textContent = 'Sẵn sàng chuyển đổi.';
        } else {
            throw new Error('Không thể tải dữ liệu tỷ giá.');
        }
    } catch (error) {
        resultDiv.textContent = 'Lỗi khi tải tỷ giá.';
        showToast(error.message, 'error');
    }

    function convert() {
        const amount = parseFloat(document.getElementById('currency-amount').value);
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;

        if (isNaN(amount)) {
            showToast('Vui lòng nhập số tiền hợp lệ.', 'error');
            return;
        }

        const rateFrom = conversionRates[fromCurrency];
        const rateTo = conversionRates[toCurrency];

        const result = (amount / rateFrom) * rateTo;

        resultDiv.textContent = `${amount.toLocaleString()} ${fromCurrency} = ${result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCurrency}`;
        rateInfo.textContent = `1 ${fromCurrency} = ${(rateTo / rateFrom).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${toCurrency}`;
    }

    convertBtn.addEventListener('click', convert);
    swapBtn.addEventListener('click', () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        convert();
    });
}