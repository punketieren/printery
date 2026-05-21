// Инициализация ProseMirror и связь с картой
(function() { 
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {      init();
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
    })   }); 
        // Сохраняем глобально (для доступа из других скриптов)
        window.editorView = view; 
		// Undo / Redo (если кнопки существуют)
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');

if (undoBtn) {
    undoBtn.addEventListener('click', () => {
        if (window.ProseMirror.undo) window.ProseMirror.undo(window.editorView.state, window.editorView.dispatch);
    });
}
if (redoBtn) {
    redoBtn.addEventListener('click', () => {
        if (window.ProseMirror.redo) window.ProseMirror.redo(window.editorView.state, window.editorView.dispatch);
    });
}

// Сохранение в файл .md
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const markdown = window.ProseMirror.defaultMarkdownSerializer.serialize(window.editorView.state.doc);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        a.click();
        URL.revokeObjectURL(url);
    });
}

// Загрузка из файла .md
const loadBtn = document.getElementById('load-btn');
if (loadBtn) {
    loadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            const { defaultMarkdownParser, mySchema } = window.ProseMirror;
            
            // Пробуем распарсить
            let doc = defaultMarkdownParser.parse(text);
            
            // Если парсер вернул пустой документ — вставляем текст как параграф
            if (!doc || doc.content.size === 0) {
                const lines = text.split('\n');
                const paragraphs = lines.filter(l => l.trim()).map(line => 
                    mySchema.node('paragraph', null, mySchema.text(line))
                );
                if (paragraphs.length === 0) paragraphs.push(mySchema.node('paragraph', null, mySchema.text('')));
                doc = mySchema.node('doc', null, paragraphs);
            }
            
            const tr = window.editorView.state.tr.replaceWith(0, window.editorView.state.doc.content.size, doc);
            window.editorView.dispatch(tr);
        };
        input.click();
    });
}
        // ---- Отправка Markdown в карту ----
        const iframe = document.getElementById('mapFrame');
        if (!iframe) return;

        function sendMarkdownToMap(markdown) {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'updateMap',
                    markdown: markdown
      }, '*');  } } 
        // Ждём готовности карты
        window.addEventListener('message', function(event) {
            if (event.source === iframe.contentWindow && event.data.type === 'mapReady') {
                console.log('Карта готова, отправляем Markdown...'); 
                sendMarkdownToMap('# Главная идея\n## Первая ветка\n### Подпункт 1.1');
   }  });  } })();
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
  }  }); })(); 