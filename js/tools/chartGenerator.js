import Papa from 'papaparse';
import { Chart, registerables } from 'chart.js/auto';
import { showToast } from '../ui.js';

Chart.register(...registerables);

export function getChartGeneratorHtml() {
  return `
    <h3>Tạo biểu đồ từ dữ liệu CSV</h3>
    <p>Dán dữ liệu CSV vào ô bên dưới, chọn loại biểu đồ và xem kết quả trực quan.</p>

    <div class="tool-section">
      <h4>1. Dữ liệu CSV</h4>
      <textarea id="csv-input" rows="10" placeholder="VÍ DỤ:\nTháng,Doanh thu,Lợi nhuận\nTháng 1,1500,400\nTháng 2,2200,750\nTháng 3,1800,600"></textarea>
      
      <div class="row" style="margin-top: 16px; align-items: center; gap: 20px;">
        <div class="col">
          <label for="chart-type">Loại biểu đồ</label>
          <select id="chart-type">
            <option value="bar">Biểu đồ cột (Bar)</option>
            <option value="line">Biểu đồ đường (Line)</option>
            <option value="pie">Biểu đồ tròn (Pie)</option>
            <option value="doughnut">Biểu đồ tròn (Doughnut)</option>
          </select>
        </div>
        <div class="col checkbox-group">
          <input type="checkbox" id="has-header" checked>
          <label for="has-header">Dòng đầu tiên là tiêu đề</label>
        </div>
      </div>
      <button id="generate-chart-btn" class="btn primary" style="margin-top: 16px;"><i class="ph-bold ph-chart-line-up"></i> Vẽ biểu đồ</button>
    </div>

    <hr style="margin: 24px 0;">

    <div class="tool-section">
      <h4>2. Kết quả biểu đồ</h4>
      <div id="chart-container" style="position: relative; height:60vh; width:100%">
        <canvas id="chart-canvas"></canvas>
      </div>
      <p id="chart-message" style="text-align: center; margin-top: 20px;">Chưa có dữ liệu để vẽ biểu đồ.</p>
    </div>
  `;
}

export function initChartGenerator() {
    const csvInput = document.getElementById('csv-input');
    const chartTypeSelect = document.getElementById('chart-type');
    const hasHeaderCheckbox = document.getElementById('has-header');
    const generateBtn = document.getElementById('generate-chart-btn');
    const chartContainer = document.getElementById('chart-container');
    const chartCanvas = document.getElementById('chart-canvas').getContext('2d');
    const chartMessage = document.getElementById('chart-message');

    let myChart = null;

    generateBtn.addEventListener('click', () => {
        const csvText = csvInput.value.trim();
        if (!csvText) {
            showToast('Vui lòng nhập dữ liệu CSV.', 'warning');
            return;
        }
        
        if (myChart) {
            myChart.destroy();
        }

        chartMessage.style.display = 'none';

        Papa.parse(csvText, {
            header: hasHeaderCheckbox.checked,
            skipEmptyLines: true,
            complete: (results) => {
                const data = processDataForChart(results.data);
                if (data) {
                    myChart = new Chart(chartCanvas, {
                        type: chartTypeSelect.value,
                        data: data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Biểu đồ được tạo từ dữ liệu CSV'
                                }
                            }
                        }
                    });
                }
            },
            error: (err) => {
                 showToast(`Lỗi phân tích CSV: ${err.message}`, 'error');
                 chartMessage.textContent = 'Không thể phân tích dữ liệu CSV. Vui lòng kiểm tra lại.';
                 chartMessage.style.display = 'block';
            }
        });
    });

    function processDataForChart(data) {
        if (!data || data.length === 0) {
            showToast('Dữ liệu CSV rỗng hoặc không hợp lệ.', 'error');
            return null;
        }

        const hasHeader = hasHeaderCheckbox.checked;
        const headers = hasHeader ? Object.keys(data[0]) : data[0].map((_, i) => `Cột ${i + 1}`);
        const labels = data.map(row => hasHeader ? row[headers[0]] : row[0]);
        
        const datasets = headers.slice(1).map((header, index) => {
            const datasetData = data.map(row => parseFloat(hasHeader ? row[header] : row[index + 1]));
            const backgroundColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
            const borderColor = backgroundColor.replace('0.5', '1');

            return {
                label: header,
                data: datasetData,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            };
        });

        return { labels, datasets };
    }
}