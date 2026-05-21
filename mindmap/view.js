 
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

    // Наблюдаем за изменениями класса collapsed
    const observer = new MutationObserver(() => updateRightPanelRounding());
    observer.observe(leftPanel, { attributes: true, attributeFilter: ['class'] });

    // Запускаем при загрузке
    updateRightPanelRounding();
})();

// ==================================================
// 1. Ресайзер: клик — сворачивание/разворачивание, холд — ресайз
// ==================================================
(function() {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('editor-panel');
    if (!resizer || !leftPanel) return;

    let startX, startWidth;
    let mouseDownTime = 0;
    let isDragging = false;
    let dragStarted = false;

    function togglePanel() {
        const isCollapsed = leftPanel.classList.contains('collapsed');
        if (isCollapsed) {
            leftPanel.classList.remove('collapsed');
            const savedWidth = localStorage.getItem('panelWidth');
            if (savedWidth && !leftPanel.style.width) {
                leftPanel.style.width = savedWidth + 'px';
            }
        } else {
            const currentWidth = leftPanel.offsetWidth;
            localStorage.setItem('panelWidth', currentWidth);
            leftPanel.classList.add('collapsed');
        }
        localStorage.setItem('panelCollapsed', leftPanel.classList.contains('collapsed'));
    }

    // Восстановление состояния при загрузке
    if (localStorage.getItem('panelCollapsed') === 'true') {
        leftPanel.classList.add('collapsed');
    } else {
        const savedWidth = localStorage.getItem('panelWidth');
        if (savedWidth) leftPanel.style.width = savedWidth + 'px';
    }

    resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = leftPanel.offsetWidth;
        mouseDownTime = Date.now();
        isDragging = false;
        dragStarted = false;

        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';

        const onMouseMove = (e) => {
            if (!dragStarted && (Date.now() - mouseDownTime > 150 || Math.abs(e.clientX - startX) > 5)) {
                dragStarted = true;
                isDragging = true;
                if (leftPanel.classList.contains('collapsed')) {
                    leftPanel.classList.remove('collapsed');
                    localStorage.setItem('panelCollapsed', 'false');
                    const saved = localStorage.getItem('panelWidth');
                    if (saved) leftPanel.style.width = saved + 'px';
                    startWidth = leftPanel.offsetWidth;
                }
            }

            if (dragStarted) {
                let newWidth = startWidth + (e.clientX - startX);
                newWidth = Math.min(Math.max(newWidth, 300), window.innerWidth * 0.9);
                leftPanel.style.width = newWidth + 'px';
                localStorage.setItem('panelWidth', newWidth);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            if (!isDragging) {
                togglePanel();
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
})();
// 2. Выпадающие меню по клику (не конфликтуют)
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

document.getElementById('fullscreen-map').addEventListener('click', () => {
    const panel = document.getElementById('viewer-panel');
    panel.classList.toggle('fullscreen');
    
    // После изменения размера — подогнать карту
    const iframe = document.getElementById('mapFrame');
    if (iframe && iframe.contentWindow && iframe.contentWindow.currentMap) {
        setTimeout(() => iframe.contentWindow.currentMap.fit(), 100);
    }
});