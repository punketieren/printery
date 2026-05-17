import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import { tooltip, Tooltip } from '@milkdown/plugin-toolbar';
import { history } from '@milkdown/plugin-history';
import { cursor } from '@milkdown/plugin-cursor';

export async function initEditor(container, onMarkdownChange) {
  const editor = await Editor
    .make()
    .config(nord)
    .config((ctx) => {
      ctx.set(tooltip.key, Tooltip);
    })
    .use(commonmark)
    .use(history)
    .use(cursor)
    .create(container);
  
  return editor;
}