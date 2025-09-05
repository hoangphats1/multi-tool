import { faker } from '@faker-js/faker';
import { showToast } from '../ui.js';

export function getFakeDataGeneratorHtml() {
  return `
    <h3>Fake Data Generator</h3>
    <p>Tạo dữ liệu giả (mock data) một cách nhanh chóng cho việc testing và prototyping.</p>

    <div class="tool-section">
      <h4>1. Cấu hình</h4>
      <div class="row">
        <div class="col">
          <label for="record-count">Số lượng bản ghi</label>
          <input type="number" id="record-count" value="10" min="1" max="1000">
        </div>
        <div class="col">
          <label for="output-format">Định dạng</label>
          <select id="output-format">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 16px;">
        <label for="fields-definition">Định nghĩa các trường</label>
        <p class="help-text">Mỗi dòng một trường theo định dạng: <code>tên_trường : a.b.c</code>. Ví dụ: <code>fullName : person.fullName</code>. <a href="https://fakerjs.dev/api/" target="_blank">Xem tất cả API của Faker.js</a></p>
        <textarea id="fields-definition" rows="8" placeholder="VÍ DỤ:\n\nid : string.uuid\nfullName : person.fullName\nemail : internet.email\ncountry : location.country\nbirthday : date.past\ncompany : company.name">${'id : string.uuid\nfullName : person.fullName\nemail : internet.email\ncountry : location.country'}</textarea>
      </div>

      <button id="generate-data-btn" class="btn primary" style="margin-top: 16px;"><i class="ph-bold ph-play"></i> Tạo dữ liệu</button>
    </div>

    <hr style="margin: 24px 0;">

    <div class="tool-section">
      <h4>2. Kết quả</h4>
      <textarea id="data-output" placeholder="Kết quả sẽ được hiển thị ở đây..." rows="12" readonly></textarea>
      <button id="copy-data-btn" class="btn" style="margin-top: 8px;"><i class="ph-bold ph-copy"></i> Sao chép kết quả</button>
    </div>
  `;
}

export function initFakeDataGenerator() {
    const recordCountInput = document.getElementById('record-count');
    const formatSelect = document.getElementById('output-format');
    const fieldsDefinitionInput = document.getElementById('fields-definition');
    const generateBtn = document.getElementById('generate-data-btn');
    const dataOutput = document.getElementById('data-output');
    const copyBtn = document.getElementById('copy-data-btn');

    generateBtn.addEventListener('click', () => {
        try {
            const count = parseInt(recordCountInput.value, 10);
            const format = formatSelect.value;
            const definitions = fieldsDefinitionInput.value.trim().split('\n');

            if (count <= 0 || count > 1000) {
                showToast('Số lượng bản ghi phải từ 1 đến 1000.', 'warning');
                return;
            }

            const fields = definitions.map(line => {
                const parts = line.split(':');
                if (parts.length !== 2) return null;
                const key = parts[0].trim();
                const fakerPath = parts[1].trim();
                return { key, fakerPath };
            }).filter(Boolean);

            if (fields.length === 0) {
                showToast('Định nghĩa trường không hợp lệ.', 'warning');
                return;
            }

            const results = [];
            for (let i = 0; i < count; i++) {
                const record = {};
                for (const field of fields) {
                    const fakerFunc = field.fakerPath.split('.').reduce((obj, key) => obj && obj[key], faker);
                    if (typeof fakerFunc === 'function') {
                        record[field.key] = fakerFunc();
                    } else {
                        record[field.key] = `Lỗi: '${field.fakerPath}' không hợp lệ`;
                    }
                }
                results.push(record);
            }

            if (format === 'json') {
                dataOutput.value = JSON.stringify(results, null, 2);
            } else if (format === 'csv') {
                const headers = fields.map(f => f.key).join(',');
                const rows = results.map(record => {
                    return fields.map(field => {
                        let value = record[field.key];
                        if (typeof value === 'string' && value.includes(',')) {
                            return `"${value}"`; // Bọc giá trị có dấu phẩy trong nháy kép
                        }
                        return value;
                    }).join(',');
                });
                dataOutput.value = `${headers}\n${rows.join('\n')}`;
            }

        } catch (error) {
            dataOutput.value = `Đã xảy ra lỗi: ${error.message}`;
            showToast('Tạo dữ liệu thất bại!', 'error');
        }
    });

    copyBtn.addEventListener('click', () => {
        if (dataOutput.value) {
            navigator.clipboard.writeText(dataOutput.value);
            showToast('Đã sao chép kết quả!', 'success');
        }
    });
}