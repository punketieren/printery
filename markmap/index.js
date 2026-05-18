import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import { defaultMarkdownSerializer, defaultMarkdownParser } from 'prosemirror-markdown';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

const mySchema = addListNodes(schema, 'paragraph block*', 'block');

let view = null;
let currentMarkmap = null;

function getMarkdown() {
  return defaultMarkdownSerializer.serialize(view.state.doc);
}

function updateMarkmap() {
  const md = getMarkdown();
  const container = document.getElementById('markmap-container');
  if (!container) return;
  try {
    const transformer = new Transformer();
    const { root } = transformer.transform(md || '# Пусто');
    while (container.firstChild) container.removeChild(container.firstChild);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    container.appendChild(svg);
    if (currentMarkmap) currentMarkmap.destroy?.();
    currentMarkmap = Markmap.create(svg, null, root);
  } catch(e) { console.warn(e); }
}

function format(command, value = null) {
  const { state, dispatch } = view;
  const { toggleMark, setBlockType, wrapIn } = require('prosemirror-commands');
  const { schema } = state;
  switch(command) {
    case 'bold': toggleMark(schema.marks.strong)(state, dispatch); break;
    case 'italic': toggleMark(schema.marks.em)(state, dispatch); break;
    case 'strike': toggleMark(schema.marks.strike)(state, dispatch); break;
    case 'code': toggleMark(schema.marks.code)(state, dispatch); break;
    case 'heading': setBlockType(schema.nodes.heading, { level: value })(state, dispatch); break;
    case 'paragraph': setBlockType(schema.nodes.paragraph)(state, dispatch); break;
    case 'bullet_list': wrapIn(schema.nodes.bullet_list)(state, dispatch); break;
    case 'ordered_list': wrapIn(schema.nodes.ordered_list)(state, dispatch); break;
    case 'blockquote': wrapIn(schema.nodes.blockquote)(state, dispatch); break;
    case 'code_block': setBlockType(schema.nodes.code_block)(state, dispatch); break;
    case 'horizontal_rule':
      const tr = state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create());
      dispatch(tr);
      break;
    case 'link':
      const url = prompt('Введите URL:');
      if (url) toggleMark(schema.marks.link, { href: url })(state, dispatch);
      break;
  }
  updateMarkmap();
}

const initialDoc = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Центральная идея' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Начните писать...' }] }
  ]
};

const state = EditorState.create({
  schema: mySchema,
  doc: mySchema.nodeFromJSON(initialDoc),
  plugins: [history(), keymap(baseKeymap)]
});

view = new EditorView(document.getElementById('editor'), {
  state,
  dispatchTransaction(tr) {
    const newState = view.state.apply(tr);
    view.updateState(newState);
    updateMarkmap();
  }
});

updateMarkmap();

window.format = format;