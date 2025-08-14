function getCsvJsonConverterHtml() {
    return `
    <h3>Trình chuyển đổi CSV ↔ JSON</h3>
    <div class="row">
        <button class="btn" id="csv-mode-csv2json">CSV → JSON</button>
        <button class="btn ghost" id="csv-mode-json2csv">JSON → CSV</button>
    </div>
    <div id="csv-panel" style="margin-top:16px;"></div>
  `;
}

function initCsvJsonConverter() {
    const csv2jsonBtn = document.getElementById('csv-mode-csv2json');
    const json2csvBtn = document.getElementById('csv-mode-json2csv');
    const panel = document.getElementById('csv-panel');

    const loadCsvToJson = () => {
        csv2jsonBtn.classList.remove('ghost');
        json2csvBtn.classList.add('ghost');
        panel.innerHTML = `
            <textarea id="csv-input" placeholder="Dán dữ liệu CSV vào đây..." style="height: 200px;"></textarea>
            <div class="row"><button class="btn" id="csv-parse-btn">Chuyển đổi</button></div>
            <label>JSON Output</label>
            <pre class="result" id="csv-json-output" style="height: 200px; overflow-y:auto;"></pre>
        `;
        document.getElementById('csv-parse-btn').addEventListener('click', () => {
            const csvData = document.getElementById('csv-input').value;
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    document.getElementById('csv-json-output').textContent = JSON.stringify(results.data, null, 2);
                    showToast('Chuyển đổi CSV sang JSON thành công!', 'success');
                }
            });
        });
    };

    const loadJsonToCsv = () => {
        json2csvBtn.classList.remove('ghost');
        csv2jsonBtn.classList.add('ghost');
        panel.innerHTML = `
            <textarea id="json-csv-input" placeholder='[{"Name": "John", "Age": 30}, {"Name": "Jane", "Age": 28}]' style="height: 200px;"></textarea>
            <div class="row"><button class="btn" id="json-unparse-btn">Chuyển đổi & Tải về .csv</button></div>
        `;
        document.getElementById('json-unparse-btn').addEventListener('click', () => {
            try {
                const jsonData = JSON.parse(document.getElementById('json-csv-input').value);
                const csv = Papa.unparse(jsonData);
                downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'converted.csv');
            } catch (e) {
                showToast('Dữ liệu JSON không hợp lệ.', 'error');
            }
        });
    };

    csv2jsonBtn.addEventListener('click', loadCsvToJson);
    json2csvBtn.addEventListener('click', loadJsonToCsv);


    loadCsvToJson();
}