(function() {
    const panel = document.getElementById('editor-panel');
    const collapseBtn = document.getElementById('collapse-editor');
    const globalStatus = document.getElementById('global-status');
    const inlineStatus = document.getElementById('editor-inline-status');
    const wysiwygRadio = document.querySelector('input[value="wysiwyg"]');
    const markdownRadio = document.querySelector('input[value="markdown"]');
    const viewerPanel = document.getElementById('viewer-panel');
    const fitBtn = document.getElementById('fit-btn');
    const fullscreenBtn = document.getElementById('fullscreen-map');
    const savePngBtn = document.getElementById('save-png');

    collapseBtn.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        collapseBtn.textContent = panel.classList.contains('collapsed') ? '▶' : '◀';
        setTimeout(() => { if (window.currentMarkmap && window.currentMarkmap.fit) window.currentMarkmap.fit(); }, 200);
    });

    if (wysiwygRadio && markdownRadio) {
        wysiwygRadio.addEventListener('change', () => {
            if (wysiwygRadio.checked && window.switchToWysiwyg) {
                window.switchToWysiwyg();
                inlineStatus.textContent = 'Режим WYSIWYG';
            }
        });
        markdownRadio.addEventListener('change', () => {
            if (markdownRadio.checked && window.switchToMarkdown) {
                window.switchToMarkdown();
                inlineStatus.textContent = 'Режим Markdown';
            }
        });
    }

    function fitMap() {
        if (window.currentMarkmap && window.currentMarkmap.fit) {
            window.currentMarkmap.fit();
            globalStatus.textContent = '✅ Карта подогнана';
            setTimeout(() => globalStatus.textContent = 'Готов', 1500);
        }
    }

    function toggleFullscreen() {
        viewerPanel.classList.toggle('fullscreen');
        fullscreenBtn.textContent = viewerPanel.classList.contains('fullscreen') ? '✕' : '⛶';
        setTimeout(() => fitMap(), 100);
    }

    function saveAsPNG() {
        const svg = document.querySelector('#markmap-container svg');
        if (!svg) { globalStatus.textContent = '❌ Нет карты для сохранения'; return; }
        const clone = svg.cloneNode(true);
        const bbox = svg.getBBox();
        const width = bbox.width || 800;
        const height = bbox.height || 600;
        clone.setAttribute('width', width);
        clone.setAttribute('height', height);
        clone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(clone);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const png = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = png;
            a.download = 'mindmap.png';
            a.click();
            globalStatus.textContent = '✅ Карта сохранена';
            setTimeout(() => globalStatus.textContent = 'Готов', 1500);
        };
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr);
    }

    fitBtn.onclick = fitMap;
    fullscreenBtn.onclick = toggleFullscreen;
    savePngBtn.onclick = saveAsPNG;

    function updateHeadingLevelDisplay(level) {
        const span = document.getElementById('heading-level');
        if (span) span.textContent = (level === 0) ? '-' : 'H' + level;
    }

    const bind = (id, method, arg = null) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.onclick = () => {
            if (arg !== null && window[method]) window[method](arg);
            else if (window[method]) window[method]();
            if (method === 'saveToFile') globalStatus.textContent = '✅ Сохранено';
            else if (method === 'loadFromFile') globalStatus.textContent = '✅ Загружено';
            setTimeout(() => { if (globalStatus.textContent !== 'Готов') globalStatus.textContent = 'Готов'; }, 1500);
        };
    };

    bind('undo', 'undo');
    bind('redo', 'redo');
    bind('heading-up', 'changeHeading', 1);
    bind('heading-down', 'changeHeading', -1);
    bind('bold', 'format', 'bold');
    bind('italic', 'format', 'italic');
    bind('code-inline', 'format', 'code');
    bind('highlight', 'format', 'highlight');
    bind('ul', 'format', 'bullet_list');
    bind('ol', 'format', 'ordered_list');
    bind('quote', 'format', 'blockquote');
    bind('code-block', 'format', 'code_block');
    bind('strike', 'format', 'strike');
    bind('link', 'format', 'link');
    bind('hr', 'format', 'horizontal_rule');
    bind('save-btn', 'saveToFile');
    bind('load-btn', 'loadFromFile');

    window.updateHeadingLevelDisplay = updateHeadingLevelDisplay;
    window.addEventListener('resize', () => fitMap());
})();