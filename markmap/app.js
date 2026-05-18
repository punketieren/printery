// app.js – Полноценный редактор для GitHub Pages (без зависимости от bundle.js)

(function() {
    console.log('🚀 app.js загружен - инициализация редактора...');
    
    // Создаём панель отладки
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
    
    function updateStatus(msg) {
        const globalStatus = document.getElementById('global-status');
        const inlineStatus = document.getElementById('editor-inline-status');
        if (globalStatus) globalStatus.textContent = msg;
        if (inlineStatus) inlineStatus.textContent = msg;
        log(msg);
    }

    // --- Проверяем, есть ли уже редактор от bundle.js ---
    let existingEditor = false;
    setTimeout(() => {
        if (window.view && window.view.state) {
            log('✅ Обнаружен существующий редактор от bundle.js');
            existingEditor = true;
            updateStatus('Редактор загружен (ProseMirror + коллаборация)');
        } else {
            log('⚠️ Редактор не найден, создаём свой...');
            initStandaloneEditor();
        }
    }, 1000);
    
    // --- Создаём собственный редактор (если bundle.js не сработал) ---
    function initStandaloneEditor() {
        log('📝 Создаём автономный редактор ProseMirror...');
        
        // Проверяем, загружены ли нужные библиотеки
        if (typeof ProseMirror === 'undefined') {
            // Загружаем ProseMirror динамически
            loadProseMirror(() => createEditor());
        } else {
            createEditor();
        }
    }
    
    function loadProseMirror(callback) {
        log('Загрузка ProseMirror с CDN...');
        
        const styles = [
            'https://prosemirror.net/css/editor.css'
        ];
        const scripts = [
            'https://unpkg.com/prosemirror-model@1/dist/index.js',
            'https://unpkg.com/prosemirror-state@1/dist/index.js',
            'https://unpkg.com/prosemirror-view@1/dist/index.js',
            'https://unpkg.com/prosemirror-schema-basic@1/dist/index.js',
            'https://unpkg.com/prosemirror-schema-list@1/dist/index.js',
            'https://unpkg.com/prosemirror-commands@1/dist/index.js',
            'https://unpkg.com/prosemirror-keymap@1/dist/index.js',
            'https://unpkg.com/prosemirror-history@1/dist/index.js',
            'https://unpkg.com/prosemirror-markdown@1/dist/index.js'
        ];
        
        let loaded = 0;
        
        styles.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        });
        
        scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loaded++;
                if (loaded === scripts.length) {
                    log('✅ Все библиотеки ProseMirror загружены');
                    callback();
                }
            };
            script.onerror = () => log(`Ошибка загрузки ${src}`, 'error');
            document.head.appendChild(script);
        });
    }
    
    function createEditor() {
        // Ждём загрузки всех модулей
        setTimeout(() => {
            try {
                const { schema } = window.prosemirrorSchemaBasic;
                const { EditorState } = window.prosemirrorState;
                const { EditorView } = window.prosemirrorView;
                const { baseKeymap } = window.prosemirrorCommands;
                const { keymap } = window.prosemirrorKeymap;
                const { history } = window.prosemirrorHistory;
                
                // Расширенная схема с поддержкой заголовков, списков и т.д.
                const customSchema = new window.prosemirrorModel.Schema({
                    nodes: {
                        doc: { content: "block+" },
                        paragraph: { group: "block", content: "inline*", parseDOM: [{ tag: "p" }], toDOM: () => ["p", 0] },
                        heading: { attrs: { level: { default: 1 } }, group: "block", content: "inline*", parseDOM: [
                            { tag: "h1", attrs: { level: 1 } }, { tag: "h2", attrs: { level: 2 } }, { tag: "h3", attrs: { level: 3 } }
                        ], toDOM: (node) => ["h" + node.attrs.level, 0] },
                        bullet_list: { group: "block", content: "list_item+", parseDOM: [{ tag: "ul" }], toDOM: () => ["ul", 0] },
                        ordered_list: { group: "block", content: "list_item+", parseDOM: [{ tag: "ol" }], toDOM: () => ["ol", 0] },
                        list_item: { content: "paragraph block*", defining: true, parseDOM: [{ tag: "li" }], toDOM: () => ["li", 0] },
                        blockquote: { group: "block", content: "block+", parseDOM: [{ tag: "blockquote" }], toDOM: () => ["blockquote", 0] },
                        code_block: { group: "block", content: "text*", parseDOM: [{ tag: "pre" }], toDOM: () => ["pre", ["code", 0]] },
                        horizontal_rule: { group: "block", parseDOM: [{ tag: "hr" }], toDOM: () => ["hr"] },
                        text: { group: "inline" }
                    },
                    marks: {
                        em: { parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }], toDOM: () => ["em", 0] },
                        strong: { parseDOM: [{ tag: "b" }, { tag: "strong" }], toDOM: () => ["strong", 0] },
                        code: { parseDOM: [{ tag: "code" }], toDOM: () => ["code", 0] },
                        link: { attrs: { href: {} }, parseDOM: [{ tag: "a[href]" }], toDOM: (node) => ["a", { href: node.attrs.href }, 0] },
                        strike: { parseDOM: [{ tag: "s" }, { tag: "del" }], toDOM: () => ["s", 0] }
                    }
                });
                
                // Начальный документ
                const initialDoc = customSchema.node('doc', null, [
                    customSchema.node('heading', { level: 1 }, customSchema.text('Добро пожаловать!')),
                    customSchema.node('paragraph', null, customSchema.text('Это редактор, работающий на GitHub Pages.')),
                    customSchema.node('paragraph', null, customSchema.text('Попробуйте кнопки форматирования на панели инструментов.'))
                ]);
                
                // Создаём состояние
                const state = EditorState.create({
                    schema: customSchema,
                    doc: initialDoc,
                    plugins: [
                        history(),
                        keymap(baseKeymap),
                        keymap({
                            "Mod-z": () => { window.undoStandalone(); return true; },
                            "Mod-y": () => { window.redoStandalone(); return true; },
                            "Mod-Shift-z": () => { window.redoStandalone(); return true; }
                        })
                    ]
                });
                
                // Создаём представление
                const editorElement = document.getElementById('editor');
                if (!editorElement) {
                    log('Контейнер #editor не найден!', 'error');
                    return;
                }
                
                editorElement.innerHTML = '';
                
                window.editorView = new EditorView(editorElement, {
                    state: state,
                    dispatchTransaction(tr) {
                        const newState = window.editorView.state.apply(tr);
                        window.editorView.updateState(newState);
                        updateStatus('Документ изменён');
                        updateHeadingLevel();
                    }
                });
                
                window.currentSchema = customSchema;
                window.currentView = window.editorView;
                
                // Определяем глобальные функции
                window.formatStandalone = (cmd, value = null) => {
                    const { state, dispatch } = window.editorView;
                    const { schema } = state;
                    
                    const commands = {
                        bold: () => toggleMark(schema.marks.strong),
                        italic: () => toggleMark(schema.marks.em),
                        strike: () => toggleMark(schema.marks.strike),
                        code: () => toggleMark(schema.marks.code),
                        link: () => {
                            const url = prompt('Введите URL:');
                            if (url) toggleMark(schema.marks.link, { href: url });
                        },
                        bullet_list: () => wrapIn(schema.nodes.bullet_list),
                        ordered_list: () => wrapIn(schema.nodes.ordered_list),
                        blockquote: () => wrapIn(schema.nodes.blockquote),
                        code_block: () => setBlockType(schema.nodes.code_block),
                        horizontal_rule: () => dispatch(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create())),
                        heading: () => setBlockType(schema.nodes.heading, { level: value || 1 }),
                        paragraph: () => setBlockType(schema.nodes.paragraph)
                    };
                    
                    function toggleMark(markType, attrs = null) {
                        if (state.selection.empty) return;
                        const mark = markType.create(attrs);
                        const { from, to } = state.selection;
                        let hasMark = false;
                        state.doc.nodesBetween(from, to, node => {
                            if (mark.isInSet(node.marks)) hasMark = true;
                        });
                        if (hasMark) dispatch(state.tr.removeMark(from, to, markType));
                        else dispatch(state.tr.addMark(from, to, mark));
                    }
                    
                    function wrapIn(nodeType) {
                        const { $from, $to } = state.selection;
                        const range = $from.blockRange($to);
                        if (range) {
                            const tr = state.tr.wrap(range, [{ type: nodeType, attrs: null }]);
                            dispatch(tr);
                        }
                    }
                    
                    function setBlockType(nodeType, attrs = null) {
                        const { $from, $to } = state.selection;
                        const tr = state.tr.setBlockType($from.pos, $to.pos, nodeType, attrs);
                        dispatch(tr);
                    }
                    
                    if (commands[cmd]) commands[cmd]();
                    updateStatus(`Форматирование: ${cmd}`);
                };
                
                window.undoStandalone = () => {
                    const { undo } = window.prosemirrorHistory;
                    undo(window.editorView.state, window.editorView.dispatch);
                    updateStatus('Отмена');
                };
                
                window.redoStandalone = () => {
                    const { redo } = window.prosemirrorHistory;
                    redo(window.editorView.state, window.editorView.dispatch);
                    updateStatus('Повтор');
                };
                
                window.changeHeadingStandalone = (delta) => {
                    const { state, dispatch } = window.editorView;
                    const { $from } = state.selection;
                    const node = $from.node($from.depth);
                    const currentLevel = node.type.name === 'heading' ? node.attrs.level : 0;
                    let newLevel = currentLevel + delta;
                    if (newLevel < 0) newLevel = 0;
                    if (newLevel > 6) newLevel = 6;
                    if (newLevel === 0) {
                        setBlockType(state.schema.nodes.paragraph);
                    } else {
                        setBlockType(state.schema.nodes.heading, { level: newLevel });
                    }
                    updateStatus(`Уровень заголовка: ${newLevel || 'параграф'}`);
                    
                    function setBlockType(nodeType, attrs = null) {
                        const tr = state.tr.setBlockType($from.pos, $from.pos + node.nodeSize, nodeType, attrs);
                        dispatch(tr);
                    }
                };
                
                window.saveToFileStandalone = () => {
                    const md = convertToMarkdown(window.editorView.state.doc);
                    const blob = new Blob([md], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'document.md';
                    a.click();
                    URL.revokeObjectURL(url);
                    updateStatus('Документ сохранён');
                };
                
                window.loadFromFileStandalone = () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.md,.txt';
                    input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            const md = ev.target.result;
                            const doc = parseMarkdown(md, window.currentSchema);
                            const tr = window.editorView.state.tr.replaceWith(0, window.editorView.state.doc.content.size, doc);
                            window.editorView.dispatch(tr);
                            updateStatus('Документ загружен');
                        };
                        reader.readAsText(file);
                    };
                    input.click();
                };
                
                function convertToMarkdown(doc) {
                    let md = '';
                    doc.content.forEach(node => {
                        if (node.type.name === 'heading') {
                            md += '#'.repeat(node.attrs.level) + ' ' + node.textContent + '\n\n';
                        } else if (node.type.name === 'paragraph') {
                            md += node.textContent + '\n\n';
                        } else if (node.type.name === 'bullet_list') {
                            node.content.forEach(item => {
                                md += '- ' + item.textContent + '\n';
                            });
                            md += '\n';
                        }
                    });
                    return md;
                }
                
                function parseMarkdown(md, schema) {
                    const lines = md.split('\n');
                    const content = [];
                    for (const line of lines) {
                        if (line.startsWith('# ')) {
                            content.push(schema.node('heading', { level: 1 }, schema.text(line.slice(2))));
                        } else if (line.startsWith('## ')) {
                            content.push(schema.node('heading', { level: 2 }, schema.text(line.slice(3))));
                        } else if (line.startsWith('- ')) {
                            const listItem = schema.node('list_item', null, schema.node('paragraph', null, schema.text(line.slice(2))));
                            content.push(schema.node('bullet_list', null, [listItem]));
                        } else if (line.trim()) {
                            content.push(schema.node('paragraph', null, schema.text(line)));
                        }
                    }
                    if (content.length === 0) {
                        content.push(schema.node('paragraph', null, schema.text('Введите текст...')));
                    }
                    return schema.node('doc', null, content);
                }
                
                function updateHeadingLevel() {
                    const { state } = window.editorView;
                    const { $from } = state.selection;
                    const node = $from.node($from.depth);
                    const level = node.type.name === 'heading' ? node.attrs.level : 0;
                    const span = document.getElementById('heading-level');
                    if (span) span.textContent = level === 0 ? '-' : `H${level}`;
                }
                
                window.editorView.dom.addEventListener('click', updateHeadingLevel);
                window.editorView.dom.addEventListener('keyup', updateHeadingLevel);
                
                log('✅ Автономный редактор ProseMirror создан и работает!');
                updateStatus('Редактор готов (автономный режим)');
                
            } catch (e) {
                log(`Ошибка создания редактора: ${e.message}`, 'error');
            }
        }, 500);
    }
    
    // --- Привязка кнопок (универсальная) ---
    function bindButtons() {
        const buttons = [
            { id: 'undo', fn: () => window.undoStandalone ? window.undoStandalone() : window.undo && window.undo() },
            { id: 'redo', fn: () => window.redoStandalone ? window.redoStandalone() : window.redo && window.redo() },
            { id: 'heading-up', fn: () => window.changeHeadingStandalone ? window.changeHeadingStandalone(1) : window.changeHeading && window.changeHeading(1) },
            { id: 'heading-down', fn: () => window.changeHeadingStandalone ? window.changeHeadingStandalone(-1) : window.changeHeading && window.changeHeading(-1) },
            { id: 'bold', fn: () => window.formatStandalone ? window.formatStandalone('bold') : window.format && window.format('bold') },
            { id: 'italic', fn: () => window.formatStandalone ? window.formatStandalone('italic') : window.format && window.format('italic') },
            { id: 'strike', fn: () => window.formatStandalone ? window.formatStandalone('strike') : window.format && window.format('strike') },
            { id: 'code-inline', fn: () => window.formatStandalone ? window.formatStandalone('code') : window.format && window.format('code') },
            { id: 'code-block', fn: () => window.formatStandalone ? window.formatStandalone('code_block') : window.format && window.format('code_block') },
            { id: 'highlight', fn: () => window.formatStandalone ? window.formatStandalone('highlight') : window.format && window.format('highlight') },
            { id: 'ul', fn: () => window.formatStandalone ? window.formatStandalone('bullet_list') : window.format && window.format('bullet_list') },
            { id: 'ol', fn: () => window.formatStandalone ? window.formatStandalone('ordered_list') : window.format && window.format('ordered_list') },
            { id: 'quote', fn: () => window.formatStandalone ? window.formatStandalone('blockquote') : window.format && window.format('blockquote') },
            { id: 'link', fn: () => window.formatStandalone ? window.formatStandalone('link') : window.format && window.format('link') },
            { id: 'hr', fn: () => window.formatStandalone ? window.formatStandalone('horizontal_rule') : window.format && window.format('horizontal_rule') },
            { id: 'save-btn', fn: () => window.saveToFileStandalone ? window.saveToFileStandalone() : window.saveToFile && window.saveToFile() },
            { id: 'load-btn', fn: () => window.loadFromFileStandalone ? window.loadFromFileStandalone() : window.loadFromFile && window.loadFromFile() }
        ];
        
        buttons.forEach(({ id, fn }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    log(`Кнопка ${id} нажата`);
                    fn();
                };
            } else {
                log(`Кнопка ${id} не найдена`, 'error');
            }
        });
    }
    
    // --- Сворачивание панели ---
    function initCollapse() {
        const panel = document.getElementById('editor-panel');
        const collapseBtn = document.getElementById('collapse-editor');
        if (collapseBtn && panel) {
            collapseBtn.onclick = () => {
                panel.classList.toggle('collapsed');
                collapseBtn.textContent = panel.classList.contains('collapsed') ? '▶' : '◀';
                log(`Панель ${panel.classList.contains('collapsed') ? 'свёрнута' : 'развёрнута'}`);
                setTimeout(() => {
                    if (window.currentMarkmap?.fit) window.currentMarkmap.fit();
                }, 200);
            };
        }
    }
    
    // --- Переключение режимов ---
    function initModeSwitch() {
        const wysiwygRadio = document.querySelector('input[value="wysiwyg"]');
        const markdownRadio = document.querySelector('input[value="markdown"]');
        
        if (wysiwygRadio && markdownRadio) {
            wysiwygRadio.onchange = () => {
                if (wysiwygRadio.checked) {
                    log('Переключение на WYSIWYG');
                    if (window.switchToWysiwyg) window.switchToWysiwyg();
                    else updateStatus('WYSIWYG режим активен');
                }
            };
            markdownRadio.onchange = () => {
                if (markdownRadio.checked) {
                    log('Переключение на Markdown');
                    if (window.switchToMarkdown) window.switchToMarkdown();
                    else updateStatus('Markdown режим (только просмотр)');
                }
            };
        }
    }
    
    // --- Инициализация ---
    bindButtons();
    initCollapse();
    initModeSwitch();
    
    log('✅ app.js инициализация завершена');
})();