import { showToast } from '../ui.js';

export function getLoremIpsumGeneratorHtml() {
    return `
    <h3>Lorem Ipsum Generator</h3>
    <p>Tạo văn bản giả để sử dụng trong thiết kế.</p>

    <div class="row">
        <div>
            <label for="lorem-count">Số lượng</label>
            <input type="number" id="lorem-count" value="5" min="1" style="width: 100px;">
        </div>
        <div class="radio-options-group">
            <input type="radio" id="type-p" name="lorem-type" value="paragraphs" checked>
            <label for="type-p">Đoạn văn</label>
            <input type="radio" id="type-s" name="lorem-type" value="sentences">
            <label for="type-s">Câu</label>
            <input type="radio" id="type-w" name="lorem-type" value="words">
            <label for="type-w">Từ</label>
        </div>
    </div>

    <div class="row">
        <button id="generate-lorem-btn" class="btn">Tạo văn bản</button>
        <button id="copy-lorem-btn" class="btn ghost"><i class="ph-bold ph-copy"></i> Sao chép</button>
    </div>

    <label for="lorem-result">Kết quả:</label>
    <textarea id="lorem-result" rows="12" readonly placeholder="Kết quả sẽ hiển thị ở đây..."></textarea>
  `;
}

export function initLoremIpsumGenerator() {
    const generateBtn = document.getElementById('generate-lorem-btn');
    const copyBtn = document.getElementById('copy-lorem-btn');
    const resultTextarea = document.getElementById('lorem-result');

    const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'praesent', 'aliquam', 'diam', 'in', 'nisl', 'euismod', 'at', 'consequat', 'urna', 'auctor', 'sed', 'vitae', 'nunc', 'a', 'magna', 'porta', 'accumsan', 'quisque', 'vel', 'libero', 'nec', 'lectus', 'rhoncus', 'elementum', 'etiam', 'tristique', 'mauris', 'ac', 'sapien', 'pellentesque', 'vestibulum', 'ante', 'primis', 'faucibus', 'orci', 'luctus', 'ultrices', 'posuere', 'cubilia', 'curae', 'donec', 'congue', 'erat', 'id', 'varius', 'commodo', 'nulla', 'facilisi', 'phasellus', 'eget', 'tortor', 'maximus', 'tincidunt', 'felis', 'ut', 'semper', 'nibh', 'maecenas', 'efficitur', 'metus', 'non', 'ex', 'fringilla', 'finibus', 'vivamus', 'sodales', 'gravida', 'mollis', 'integer', 'blandit', 'arcu', 'eu', 'purus', 'hendrerit', 'interdum', 'duis', 'volutpat', 'tellus', 'tempus', 'sollicitudin', 'cras', 'ornare', 'eros', 'sed', 'fermentum'];

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const generateWords = (count) => {
        let result = [];
        for (let i = 0; i < count; i++) {
            result.push(loremWords[getRandomInt(0, loremWords.length - 1)]);
        }
        return result.join(' ');
    };

    const generateSentences = (count) => {
        let result = [];
        for (let i = 0; i < count; i++) {
            const wordsInSentence = getRandomInt(8, 15);
            let sentence = generateWords(wordsInSentence);
            sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
            result.push(sentence);
        }
        return result.join(' ');
    };

    const generateParagraphs = (count) => {
        let result = [];
        for (let i = 0; i < count; i++) {
            const sentencesInParagraph = getRandomInt(5, 8);
            result.push(generateSentences(sentencesInParagraph));
        }
        return result.join('\n\n');
    };

    generateBtn.addEventListener('click', () => {
        const count = parseInt(document.getElementById('lorem-count').value, 10);
        const type = document.querySelector('input[name="lorem-type"]:checked').value;
        let result = '';

        switch (type) {
            case 'words':
                result = generateWords(count);
                break;
            case 'sentences':
                result = generateSentences(count);
                break;
            case 'paragraphs':
                result = generateParagraphs(count);
                break;
        }
        resultTextarea.value = result;
    });

    copyBtn.addEventListener('click', () => {
        const text = resultTextarea.value;
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => showToast('Đã sao chép!', 'success'))
                .catch(() => showToast('Lỗi khi sao chép.', 'error'));
        } else {
            showToast('Chưa có gì để sao chép.', 'warning');
        }
    });

    generateBtn.click();
}