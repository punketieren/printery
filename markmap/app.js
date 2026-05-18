// app.js – отладка без пересборки бандла
(function() {
    // Создаём панель отладки на странице
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: #1e1e1e; color: #0f0; font-family: monospace; font-size: 11px; padding: 8px; border-radius: 8px; z-index: 9999; max-width: 400px; max-height: 200px; overflow: auto; opacity: 0.9; pointer-events: none;';
    document.body.appendChild(debugPanel);

    function log(msg, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const line = `[${time}] ${msg}`;
        console.log(`%c${line}`, type === 'error' ? 'color: red; font-weight: bold' : 'color: #0f0');
        const div = document.createElement('div');
        div.textContent = line;
        div.style.color = type === 'error' ? '#f66' : '#0f0';
        debugPanel.appendChild(div);
        if (debugPanel.children.length > 15) debugPanel.removeChild(debugPanel.children[0]);
    }

    log('🚀 app.js загружен');

    // --- Поиск элементов ---
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
    const collapseLevel2Btn = document.getElementById('collapse-level2');
    const expandAllMapBtn = document.getElementById('expand-all-map');

    log(`Элементы найдены: editor-panel=${!!panel}, collapse-btn=${!!collapseBtn}, wysiwygRadio=${!!wysiwygRadio}, markdownRadio=${!!markdownRadio}, fit-btn=${!!fitBtn}`);

    // --- Проверка глобальных функций из bundle.js ---
    setTimeout(() => {
        log(`Проверка window функций: format=${typeof window.format}, changeHeading=${typeof window.changeHeading}, undo=${typeof window.undo}, redo=${typeof window.redo}, saveToFile=${typeof window.saveToFile}, loadFromFile=${typeof window.loadFromFile}, collapseLevel=${typeof window.collapseLevel}, expandAll=${typeof window.expandAll}, switchToWysiwyg=${typeof window.switchToWysiwyg}, switchToMarkdown=${typeof window.switchToMarkdown}`);
    }, 500);

    // --- Сворачивание панели ---
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            log('Кнопка сворачивания панели нажата');
            panel.classList.toggle('collapsed');
            collapseBtn.textContent = panel.classList.contains('collapsed') ? '▶' : '◀';
            log(`Панель ${panel.classList.contains('collapsed') ? 'свёрнута' : 'развёрнута'}`);
            setTimeout(() => {
                if (window.currentMarkmap && window.currentMarkmap.fit) {
                    log('Вызов fit() после сворачивания');
                    window.currentMarkmap.fit();
                } else {
                    log('currentMarkmap.fit не найден', 'error');
                }
            }, 200);
        });
    } else {
        log('collapse-editor не найден', 'error');
    }

    // --- Переключение режимов редактора ---
    if (wysiwygRadio && markdownRadio) {
        wysiwygRadio.addEventListener('change', () => {
            if (wysiwygRadio.checked) {
                log('Переключение на режим WYSIWYG');
                if (window.switchToWysiwyg) {
                    window.switchToWysiwyg();
                    if (inlineStatus) inlineStatus.textContent = 'Режим WYSIWYG';
                } else {
                    log('window.switchToWysiwyg не определена', 'error');
                }
            }
        });
        markdownRadio.addEventListener('change', () => {
            if (markdownRadio.checked) {
                log('Переключение на режим Markdown');
                if (window.switchToMarkdown) {
                    window.switchToMarkdown();
                    if (inlineStatus) inlineStatus.textContent = 'Режим Markdown';
                } else {
                    log('window.switchToMarkdown не определена', 'error');
                }
            }
        });
    } else {
        log('Радиокнопки режимов не найдены', 'error');
    }

    // --- Работа с картой ---
    function fitMap() {
        log('Кнопка Fit нажата');
        if (window.currentMarkmap && window.currentMarkmap.fit) {
            window.currentMarkmap.fit();
            if (globalStatus) globalStatus.textContent = '✅ Карта подогнана';
            log('fit выполнен');
        } else {
            log('currentMarkmap или fit не найден', 'error');
            if (globalStatus) globalStatus.textContent = '❌ Карта не подогнана';
        }
    }

    function toggleFullscreen() {
        log('Кнопка Fullscreen нажата');
        viewerPanel.classList.toggle('fullscreen');
        const isFull = viewerPanel.classList.contains('fullscreen');
        if (fullscreenBtn) fullscreenBtn.textContent = isFull ? '✕' : '⛶';
        log(`Полноэкранный режим ${isFull ? 'включён' : 'выключен'}`);
        setTimeout(() => fitMap(), 100);
    }

    function saveAsPNG() {
        log('Кнопка Save PNG нажата');
        const svg = document.querySelector('#markmap-container svg');
        if (!svg) {
            log('SVG не найден для сохранения', 'error');
            if (globalStatus) globalStatus.textContent = '❌ Нет карты для сохранения';
            return;
        }
        log('SVG найден, начинаем экспорт');
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
            log('PNG сохранён');
            if (globalStatus) globalStatus.textContent = '✅ Карта сохранена';
        };
        img.onerror = () => {
            log('Ошибка загрузки SVG в Image', 'error');
        };
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr);
    }

    function collapseLevel(level) {
        log(`Кнопка Collapse Level ${level} нажата`);
        if (window.collapseLevel) {
            window.collapseLevel(level);
            if (globalStatus) globalStatus.textContent = `✅ Узлы свернуты до уровня ${level}`;
        } else {
            log('window.collapseLevel не определена', 'error');
        }
    }

    function expandAll() {
        log('Кнопка Expand All нажата');
        if (window.expandAll) {
            window.expandAll();
            if (globalStatus) globalStatus.textContent = '✅ Все узлы развернуты';
        } else {
            log('window.expandAll не определена', 'error');
        }
    }

    if (fitBtn) fitBtn.onclick = fitMap;
    else log('fit-btn не найден', 'error');
    if (fullscreenBtn) fullscreenBtn.onclick = toggleFullscreen;
    else log('fullscreen-map не найден', 'error');
    if (savePngBtn) savePngBtn.onclick = saveAsPNG;
    else log('save-png не найден', 'error');
    if (collapseLevel2Btn) collapseLevel2Btn.onclick = () => collapseLevel(2);
    else log('collapse-level2 не найден', 'error');
    if (expandAllMapBtn) expandAllMapBtn.onclick = expandAll;
    else log('expand-all-map не найден', 'error');

    // --- Обновление отображения уровня заголовка ---
    function updateHeadingLevelDisplay(level) {
        const span = document.getElementById('heading-level');
        if (span) span.textContent = (level === 0) ? '-' : 'H' + level;
        log(`Уровень заголовка обновлён: ${span ? span.textContent : 'span не найден'}`);
    }

    // --- Привязка кнопок редактора (если функции уже есть в window) ---
    const bind = (id, method, arg = null) => {
        const btn = document.getElementById(id);
        if (!btn) {
            log(`Кнопка ${id} не найдена`, 'error');
            return;
        }
        btn.onclick = () => {
            log(`Клик по кнопке ${id}, вызов ${method}${arg !== null ? ` с аргументом ${arg}` : ''}`);
            if (arg !== null && window[method]) window[method](arg);
            else if (window[method]) window[method]();
            else log(`window.${method} не определена`, 'error');
            if (method === 'saveToFile' && globalStatus) globalStatus.textContent = '✅ Сохранено';
            else if (method === 'loadFromFile' && globalStatus) globalStatus.textContent = '✅ Загружено';
            setTimeout(() => { if (globalStatus && globalStatus.textContent !== 'Готов') globalStatus.textContent = 'Готов'; }, 1500);
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
    window.addEventListener('resize', () => {
        log('Окно изменено, вызываем fitMap');
        fitMap();
    });

    log('app.js инициализация завершена');
})();