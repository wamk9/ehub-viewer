<template>
  <div class="rte" :class="{ focused, over: maxChars && textLength > maxChars }">
    <div v-if="editor" class="rte-toolbar">
      <div class="rte-group">
        <button type="button" :class="{ active: editor.isActive('bold') }" :title="$t('common.editor.bold')" @click="run((c) => c.toggleBold())"><font-awesome-icon :icon="['fas', 'bold']" /></button>
        <button type="button" :class="{ active: editor.isActive('italic') }" :title="$t('common.editor.italic')" @click="run((c) => c.toggleItalic())"><font-awesome-icon :icon="['fas', 'italic']" /></button>
        <button type="button" :class="{ active: editor.isActive('underline') }" :title="$t('common.editor.underline')" @click="run((c) => c.toggleUnderline())"><font-awesome-icon :icon="['fas', 'underline']" /></button>
        <button type="button" :class="{ active: editor.isActive('strike') }" :title="$t('common.editor.strike')" @click="run((c) => c.toggleStrike())"><font-awesome-icon :icon="['fas', 'strikethrough']" /></button>
      </div>
      <span class="rte-sep"></span>
      <div class="rte-group">
        <button type="button" class="txt" :class="{ active: editor.isActive('heading', { level: 2 }) }" @click="run((c) => c.toggleHeading({ level: 2 }))">H2</button>
        <button type="button" class="txt" :class="{ active: editor.isActive('heading', { level: 3 }) }" @click="run((c) => c.toggleHeading({ level: 3 }))">H3</button>
      </div>
      <span class="rte-sep"></span>
      <div class="rte-group">
        <button type="button" :class="{ active: editor.isActive('bulletList') }" :title="$t('common.editor.bullets')" @click="run((c) => c.toggleBulletList())"><font-awesome-icon :icon="['fas', 'list-ul']" /></button>
        <button type="button" :class="{ active: editor.isActive('orderedList') }" :title="$t('common.editor.numbers')" @click="run((c) => c.toggleOrderedList())"><font-awesome-icon :icon="['fas', 'list-ol']" /></button>
        <button type="button" :class="{ active: editor.isActive({ textAlign: 'center' }) }" :title="$t('common.editor.center')" @click="toggleCenter"><font-awesome-icon :icon="['fas', 'align-center']" /></button>
      </div>
      <span class="rte-sep"></span>
      <div class="rte-group">
        <button type="button" :class="{ active: editor.isActive('link') }" :title="$t('common.editor.link')" @click="toggleLink"><font-awesome-icon :icon="['fas', 'link']" /></button>
        <button type="button" :title="$t('common.editor.clear')" @click="run((c) => c.unsetAllMarks().clearNodes())"><font-awesome-icon :icon="['fas', 'eraser']" /></button>
      </div>
    </div>
    <EditorContent :editor="editor" class="rte-content" :style="{ '--rte-min': minHeight + 'px' }" />
    <div v-if="maxChars" class="rte-count">{{ textLength }}/{{ maxChars }}</div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

/**
 * Rich text input (tiptap) that emits HTML. The character limit counts the
 * visible text, not the markup. Always sanitize the HTML when rendering it
 * (helpers/General/sanitizeHtml.js).
 */
export default {
  name: 'EhubRichTextEditor',
  components: { EditorContent },
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    maxChars: { type: Number, default: 0 },
    minHeight: { type: Number, default: 120 },
  },
  emits: ['update:modelValue'],
  data() {
    return { editor: null, focused: false, textLength: 0 };
  },
  watch: {
    modelValue(v) {
      if (this.editor && v !== this.editor.getHTML()) this.editor.commands.setContent(v || '', { emitUpdate: false });
    },
  },
  mounted() {
    this.editor = new Editor({
      content: this.modelValue || '',
      extensions: [
        StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false }, codeBlock: false, code: false }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: this.placeholder }),
      ],
      onUpdate: ({ editor }) => {
        this.textLength = editor.getText().length;
        // An empty editor emits "" instead of "<p></p>".
        this.$emit('update:modelValue', editor.isEmpty ? '' : editor.getHTML());
      },
      onFocus: () => { this.focused = true; },
      onBlur: () => { this.focused = false; },
    });
    this.textLength = this.editor.getText().length;
  },
  beforeUnmount() {
    this.editor?.destroy();
  },
  methods: {
    run(fn) {
      fn(this.editor.chain().focus()).run();
    },
    toggleCenter() {
      const center = this.editor.isActive({ textAlign: 'center' });
      this.run((c) => (center ? c.unsetTextAlign() : c.setTextAlign('center')));
    },
    toggleLink() {
      if (this.editor.isActive('link')) {
        this.run((c) => c.unsetLink());
        return;
      }
      const url = window.prompt(this.$t('common.editor.link_prompt'), 'https://');
      if (!url || url === 'https://') return;
      if (!/^https?:\/\//i.test(url)) return;
      this.run((c) => c.extendMarkRange('link').setLink({ href: url, target: '_blank' }));
    },
  },
};
</script>

<style scoped>
.rte { border: 1px solid var(--ehub-line); border-radius: 10px; background: var(--ehub-field-bg); transition: border-color .15s, box-shadow .15s; }
.rte.focused { border-color: var(--ehub-primary); box-shadow: 0 0 0 3px var(--ehub-primary-focus); }
.rte.over { border-color: #e23b3b; }
.rte-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--ehub-line); }
.rte-group { display: flex; gap: 2px; }
.rte-sep { width: 1px; height: 18px; background: var(--ehub-line); margin: 0 4px; }
.rte-toolbar button { background: none; border: 0; color: var(--ehub-muted); width: 28px; height: 28px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: .78rem; cursor: pointer; transition: background .12s, color .12s; }
.rte-toolbar button.txt { font-weight: 800; font-size: .72rem; }
.rte-toolbar button:hover { background: var(--ehub-card); color: var(--ehub-ink); }
.rte-toolbar button.active { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.rte-content { padding: 10px 14px; color: var(--ehub-ink); font-size: .9rem; }
.rte-content :deep(.ProseMirror) { outline: none; min-height: var(--rte-min); }
.rte-content :deep(.ProseMirror p) { margin: 0 0 .5em; }
.rte-content :deep(.ProseMirror h2) { font-size: 1.15rem; font-weight: 800; margin: .6em 0 .3em; }
.rte-content :deep(.ProseMirror h3) { font-size: 1rem; font-weight: 700; margin: .6em 0 .3em; }
.rte-content :deep(.ProseMirror ul), .rte-content :deep(.ProseMirror ol) { padding-left: 1.3em; margin: 0 0 .5em; }
.rte-content :deep(.ProseMirror a) { color: var(--ehub-primary); text-decoration: underline; }
.rte-content :deep(.ProseMirror p.is-editor-empty:first-child::before) { content: attr(data-placeholder); color: var(--ehub-muted); opacity: .7; pointer-events: none; float: left; height: 0; }
.rte-count { font-size: .73rem; color: var(--ehub-muted); text-align: right; padding: 0 10px 6px; }
.rte.over .rte-count { color: #e23b3b; }
</style>
