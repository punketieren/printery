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
		// Привязка кнопок форматирования
const formatBtn = (id, cmd, markName = null) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
        const { state, dispatch } = window.editorView;
        if (cmd === 'toggleMark' && markName) {
            const mark = state.schema.marks[markName];
            if (mark) window.ProseMirror.toggleMark(mark)(state, dispatch);
        } else if (cmd === 'wrapIn') {
            const nodeType = state.schema.nodes[markName];
            if (nodeType) window.ProseMirror.wrapIn(nodeType)(state, dispatch);
        } else if (cmd === 'setBlockType') {
            const nodeType = state.schema.nodes[markName];
            if (nodeType) window.ProseMirror.setBlockType(nodeType)(state, dispatch);
        }
        window.editorView.focus();
    });
};

// Жирный Курсив Зачёркнутый Код Подсветка
formatBtn('bold', 'toggleMark', 'strong'); 
formatBtn('italic', 'toggleMark', 'em'); 
formatBtn('strike', 'toggleMark', 'strike'); 
formatBtn('code-inline', 'toggleMark', 'code'); 
formatBtn('highlight', 'toggleMark', 'mark'); 
// Маркированный список Нумерованный список Цитата Блок кода
formatBtn('ul', 'wrapIn', 'bullet_list'); 
formatBtn('ol', 'wrapIn', 'ordered_list'); 
formatBtn('quote', 'wrapIn', 'blockquote'); 
formatBtn('code-block', 'setBlockType', 'code_block');
// Параграф
formatBtn('paragraph', 'setBlockType', 'paragraph'); 
// Кнопки изменения уровня заголовка (отдельно, потому что нужно передать атрибут level)
const headingUpBtn = document.getElementById('heading-up');
const headingDownBtn = document.getElementById('heading-down'); 
if (headingUpBtn) {
    headingUpBtn.addEventListener('click', () => {
        const { state, dispatch } = window.editorView;
        const { $from } = state.selection;
        const node = $from.node($from.depth);
        if (node.type.name === 'heading') {
            const newLevel = Math.min(6, node.attrs.level + 1);
            window.ProseMirror.setBlockType(state.schema.nodes.heading, { level: newLevel })(state, dispatch);
        } else if (node.type.name === 'paragraph') {
            window.ProseMirror.setBlockType(state.schema.nodes.heading, { level: 2 })(state, dispatch);
        }
        window.editorView.focus();
    }); } 
if (headingDownBtn) {
    headingDownBtn.addEventListener('click', () => {
        const { state, dispatch } = window.editorView;
        const { $from } = state.selection;
        const node = $from.node($from.depth);
        if (node.type.name === 'heading') {
            const newLevel = Math.max(1, node.attrs.level - 1);
            if (newLevel === 1) {
                window.ProseMirror.setBlockType(state.schema.nodes.paragraph)(state, dispatch);
            } else {
                window.ProseMirror.setBlockType(state.schema.nodes.heading, { level: newLevel })(state, dispatch);
            }
        }
        window.editorView.focus();
    });
}
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
            // ---- ОТПРАВКА MARKDOWN В КАРТУ ПРИ ИЗМЕНЕНИЯХ ----
    if (window.editorView) {
        const originalDispatch = window.editorView.dispatch;
        window.editorView.dispatch = (tr) => {
            originalDispatch(tr);
            const markdown = window.ProseMirror.defaultMarkdownSerializer.serialize(window.editorView.state.doc);
            const iframe = document.getElementById('mapFrame');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'updateMap', markdown }, '*');
            }
        };
    }

    // ---- ОТПРАВКА НАЧАЛЬНОГО MARKDOWN (ДЛЯ СТРАХОВКИ) ----
    setTimeout(() => {
        if (window.editorView) {
            const markdown = window.ProseMirror.defaultMarkdownSerializer.serialize(window.editorView.state.doc);
            const iframe = document.getElementById('mapFrame');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'updateMap', markdown }, '*');
            }
        }
    }, 500)
 
        ;  } })();
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