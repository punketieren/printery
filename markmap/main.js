import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { cursor } from '@milkdown/plugin-cursor';

let editor = null;

async function getMarkdown() {
    if (!editor) return '';
    const doc = editor.get();
    if (!doc) return '';
    const markdown = await editor.action((ctx) => {
        const transformer = ctx.get('transformer');
        return transformer.toMarkdown(doc);
    });
    return markdown || '';
}

async function loadMarkdown(content) {
    if (!editor || !content) return;
    try {
        await editor.action((ctx) => {
            const transformer = ctx.get('transformer');
            const doc = transformer.toHTML(content);
            editor.set(doc);
        });
        document.getElementById('status-text') && (document.getElementById('status-text').innerText = '✅ Загружено');
    } catch (err) {
        console.error(err);
    }
}

const container = document.getElementById('editor-container');

editor = await Editor
    .make()
    .config(nord)
    .use(commonmark)
    .use(history)
    .use(cursor)
    .create(container);

const initialContent = `# Центральная идея
## Основной раздел 1
### Деталь 1.1
## Основной раздел 2
### Деталь 2.1
- Список 1
- Список 2
**Жирный** и *курсив*`;
await loadMarkdown(initialContent);

document.getElementById('save-btn').onclick = async () => {
    const md = await getMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
};

document.getElementById('load-btn').onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            await loadMarkdown(ev.target.result);
        };
        reader.readAsText(file);
    };
    input.click();
};