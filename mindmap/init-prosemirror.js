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

        const { EditorState, EditorView, mySchema } = window.ProseMirror;

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