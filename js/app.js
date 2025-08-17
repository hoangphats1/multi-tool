document.addEventListener('DOMContentLoaded', () => {

    window.MAX_FILE_SIZE = 10 * 1024 * 1024;

    const body = document.body;
    const panel = document.getElementById('panel');
    const toolButtons = document.querySelectorAll('#toolList button[data-tool]');

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('toolList');
    const backdrop = document.getElementById('backdrop');

    const themeToggle = document.getElementById('themeToggle');

    const reloadBtn = document.getElementById('reloadBtn');

    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            location.reload();
        });
    }

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

    async function loadTool(name) {
        panel.classList.add('fade-out');
        
        try {
            const module = await import(`./tools/${name}.js`);
            
            const getHtmlFunctionName = Object.keys(module).find(key => key.startsWith('get') && key.endsWith('Html'));
            const initFunctionName = Object.keys(module).find(key => key.startsWith('init'));

            setTimeout(() => {
                if (getHtmlFunctionName && initFunctionName) {
                    panel.innerHTML = module[getHtmlFunctionName]();
                    panel.scrollTop = 0;
                    module[initFunctionName]();
                } else {
                     panel.innerHTML = `<h3>Lỗi</h3><p>Không thể tải công cụ.</p>`;
                }
                panel.classList.remove('fade-out');
            }, 200);

        } catch (error) {
            console.error("Lỗi tải tool:", error);
            panel.innerHTML = `<h3>Lỗi</h3><p>Không thể tải công cụ. Vui lòng kiểm tra lại đường dẫn file.</p>`;
            panel.classList.remove('fade-out');
        }
    }

    sidebar.addEventListener('click', (e) => {
        const toolButton = e.target.closest('button[data-tool]');
        if (toolButton) {
            const toolName = toolButton.dataset.tool;
            toolButtons.forEach(btn => btn.classList.remove('active'));
            toolButton.classList.add('active');
            loadTool(toolName); 
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        }
    });

    loadTool('imageConverter');
});