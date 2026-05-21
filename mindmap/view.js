// ==================== view.js (исправленный, без ошибок) ====================

// Отдельный обработчик для скругления правой панели
(function() {
    const leftPanel = document.getElementById('editor-panel');
    const rightPanel = document.getElementById('viewer-panel');
    if (!leftPanel || !rightPanel) return;

    function updateRightPanelRounding() {
        if (leftPanel.classList.contains('collapsed')) {
            rightPanel.classList.add('left-collapsed');
        } else {
            rightPanel.classList.remove('left-collapsed');
        }
    }

    const observer = new MutationObserver(() => updateRightPanelRounding());
    observer.observe(leftPanel, { attributes: true, attributeFilter: ['class'] });
    updateRightPanelRounding();
})();

// Сворачивание левой панели
(function() {
    const panel = document.getElementById('editor-panel');
    const btn = document.getElementById('collapse-editor');
    if (!panel || !btn) return;
    btn.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        btn.textContent = panel.classList.contains('collapsed') ? '▶' : '◀';
    });
})();

// Ресайзер (с блокировкой iframe)
(function() {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('editor-panel');
    const iframe = document.getElementById('mapFrame');
    if (!resizer || !leftPanel) return;

    let startX, startWidth;
    let isDragging = false;

    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = leftPanel.offsetWidth;
        isDragging = true;
        if (iframe) iframe.style.pointerEvents = 'none';
        leftPanel.style.transition = 'none';
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newWidth = startWidth + (e.clientX - startX);
        newWidth = Math.min(Math.max(newWidth, 200), window.innerWidth * 0.9);
        leftPanel.style.width = newWidth + 'px';
        localStorage.setItem('panelWidth', newWidth);
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            if (iframe) iframe.style.pointerEvents = 'auto';
            leftPanel.style.transition = '';
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
})();

// Выпадающие меню по клику
(function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('button');
        const content = dropdown.querySelector('.dropdown-content');
        if (!btn || !content) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdowns.forEach(d => {
                const c = d.querySelector('.dropdown-content');
                if (c && c !== content) c.classList.remove('show');
            });
            content.classList.toggle('show');
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content.show').forEach(c => c.classList.remove('show'));
        }
    });
})();

// Управление картой (кнопки collapse / expand)
(function() {
    const iframe = document.getElementById('mapFrame');
    const collapseBtn = document.getElementById('collapse');
    const expandBtn = document.getElementById('expand');
    let currentLevel = 6;

    function setLevel(delta) {
        currentLevel = Math.min(9, Math.max(1, currentLevel + delta));
        if (iframe?.contentWindow?.collapseLevel) {
            iframe.contentWindow.collapseLevel(currentLevel);
        }
        const span = document.getElementById('map-level');
        if (span) span.textContent = currentLevel;
    }

    if (collapseBtn) collapseBtn.onclick = () => setLevel(-1);
    if (expandBtn) expandBtn.onclick = () => setLevel(+1);
})();

// Кнопка Fit
(function() {
    const iframe = document.getElementById('mapFrame');
    const fitBtn = document.getElementById('fit-btn');
    if (fitBtn) {
        fitBtn.onclick = () => {
            if (iframe?.contentWindow?.currentMap) {
                iframe.contentWindow.currentMap.fit();
            }
        };
    }
})();

// Кнопка Fullscreen (развернуть правую панель)
(function() {
    const iframe = document.getElementById('mapFrame');
    const fullscreenBtn = document.getElementById('fullscreen-map');
    if (fullscreenBtn) {
        fullscreenBtn.onclick = () => {
            const panel = document.getElementById('viewer-panel');
            panel.classList.toggle('fullscreen');
            setTimeout(() => {
                if (iframe?.contentWindow?.currentMap) {
                    iframe.contentWindow.currentMap.fit();
                }
            }, 100);
        };
    }
})();