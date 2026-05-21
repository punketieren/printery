// Инициализация ProseMirror и связь с картой
(function() {
    // Ждём загрузки DOM и бандла
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Проверяем, что бандл загрузился
        if (!window.ProseMirror) {
            console.error('prosemirror.bundle.js не загружен');
            return;
        }

        const { EditorState, EditorView, mySchema, keymap, baseKeymap, history } = window.ProseMirror;

        // Начальный документ
        const initialDoc = mySchema.node('doc', null, [
            mySchema.node('paragraph', null, mySchema.text('Начните писать...'))
        ]);

        // Создаём редактор
        const view = new EditorView(document.getElementById('editor'), {
            state: EditorState.create({
                schema: mySchema,
                doc: initialDoc,
				plugins: [
				history(),
				keymap(baseKeymap)
				]
            })
        });

        // Сохраняем глобально (для доступа из других скриптов)
        window.editorView = view;

        // ---- Отправка Markdown в карту ----
        const iframe = document.getElementById('mapFrame');
        if (!iframe) return;

        function sendMarkdownToMap(markdown) {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'updateMap',
                    markdown: markdown
                }, '*');
            }
        }

        // Ждём готовности карты
        window.addEventListener('message', function(event) {
            if (event.source === iframe.contentWindow && event.data.type === 'mapReady') {
                console.log('Карта готова, отправляем Markdown...');
                // TODO: заменить на реальный Markdown из редактора
                sendMarkdownToMap('# Главная идея\n## Первая ветка\n### Подпункт 1.1');
            }
        });
    }
})();
// ----- Фикс для fit-btn, fullscreen-map, ресайзера (чтобы работали постоянно) -----
(function() {
    const iframe = document.getElementById('mapFrame');
    if (!iframe) return;

    // Кнопка Fit
    const fitBtn = document.getElementById('fit-btn');
    if (fitBtn && !fitBtn._fixed) {
        fitBtn._fixed = true;
        fitBtn.onclick = () => {
            if (iframe.contentWindow?.currentMap) {
                iframe.contentWindow.currentMap.fit();
            } else {
                console.warn('Карта ещё не загружена');
            }
        };
    }

    // Кнопка Fullscreen
    const fullscreenBtn = document.getElementById('fullscreen-map');
    if (fullscreenBtn && !fullscreenBtn._fixed) {
        fullscreenBtn._fixed = true;
        fullscreenBtn.onclick = () => {
            const panel = document.getElementById('viewer-panel');
            panel.classList.toggle('fullscreen');
            setTimeout(() => {
                if (iframe.contentWindow?.currentMap) iframe.contentWindow.currentMap.fit();
            }, 100);
        };
    }

    // Ресайзер — если он уже работает, но вдруг его обработчик слетает
    const resizer = document.getElementById('resizer');
    if (resizer && !resizer._fixed) {
        resizer._fixed = true;
        // Ресайзер уже должен иметь свой обработчик, этот — на случай, если его перезапишут
        resizer.addEventListener('mousedown', (e) => {
            // Здесь дублировать логику ресайзера не нужно, она уже есть в другом месте.
            // Просто убеждаемся, что событие не заблокировано.
            e.stopPropagation();
        });
    }
})();