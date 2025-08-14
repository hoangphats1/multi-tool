document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;
    const panel = document.getElementById('panel');
    const toolButtons = document.querySelectorAll('#toolList button[data-tool]');

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('toolList');
    const backdrop = document.getElementById('backdrop');

    const themeToggle = document.getElementById('themeToggle');

    const applyTheme = (theme) => {
        if (theme === 'dark') { body.classList.add('dark-mode'); }
        else { body.classList.remove('dark-mode'); }
    };
    themeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    const openMenu = () => {
        sidebar.classList.add('open');
        backdrop.classList.add('open');
        body.classList.add('sidebar-is-open');
    };

    const closeMenu = () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
        body.classList.remove('sidebar-is-open');
    };

    hamburgerBtn.addEventListener('click', openMenu);
    closeSidebarBtn.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);

    const toolMapping = {
        'imgconv': { html: getImageConverterHtml, init: initImageConverter },
        'vidthumb': { html: getVideoThumbnailHtml, init: initVideoThumbnail },
        'qrgen': { html: getQrGeneratorHtml, init: initQrGenerator },
        'json': { html: getJsonFormatterHtml, init: initJsonFormatter },
        'watermark': { html: getWatermarkHtml, init: initWatermark },
        'base64file': { html: getBase64FileHtml, init: initBase64File },
        'jwt': { html: getJwtDecoderHtml, init: initJwtDecoder },
        'hash': { html: getHashGeneratorHtml, init: initHashGenerator },
        'csvjson': { html: getCsvJsonConverterHtml, init: initCsvJsonConverter },
        'fb-utils': { html: getFacebookUtilsHtml, init: initFacebookUtils },
        'image-editor': { html: getImageEditorHtml, init: initImageEditor },
        'currency': { html: getCurrencyConverterHtml, init: initCurrencyConverter }
    };

    function loadTool(name) {
        panel.classList.add('fade-out');
        setTimeout(() => {
            if (toolMapping[name]) {
                const tool = toolMapping[name];
                panel.innerHTML = tool.html();
                panel.scrollTop = 0;
                tool.init();
            } else {
                panel.innerHTML = `<h3>Chào mừng!</h3><p>Chọn một công cụ từ menu bên trái để bắt đầu.</p>`;
            }
            panel.classList.remove('fade-out');
        }, 200);
    }

    sidebar.addEventListener('click', (e) => {
        const toolButton = e.target.closest('button[data-tool]');
        if (toolButton) {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            toolButton.classList.add('active');
            loadTool(toolButton.dataset.tool);
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        }
    });

    loadTool('imgconv');
});