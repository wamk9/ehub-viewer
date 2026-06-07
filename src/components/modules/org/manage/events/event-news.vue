<script setup>
import { EditorContent } from '@tiptap/vue-3';
import SystemVars from '@/helpers/General/SystemVars';
</script>

<template>
    <div v-if="show" class="news-manage">

        <!-- Header -->
        <div class="gen-header mb-4">
            <button class="gen-back" @click="view === 'editor' ? view = 'list' : null">
                <font-awesome-icon :icon="['fas', 'arrow-left']" />
                {{ view === 'editor' ? $t('events.manage.menu.news.manage.back_to_articles') : '' }}
            </button>
            <h2 class="gen-title">
                {{ view === 'editor'
                    ? (editingArticle ? $t('events.manage.menu.news.manage.edit_article') : $t('events.manage.menu.news.manage.new_article'))
                    : $t('events.manage.menu.news.manage.title') }}
            </h2>
            <div></div>
        </div>

        <!-- List view -->
        <div v-if="view === 'list'">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="text-muted mb-0">
                    {{ articles.length }}
                    {{ articles.length !== 1 ? $t('events.manage.menu.news.manage.article_plural') : $t('events.manage.menu.news.manage.article_singular') }}
                </p>
                <button class="btn btn-primary btn-sm" @click="openCreate">
                    <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
                    {{ $t('events.manage.menu.news.manage.new_article') }}
                </button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
            </div>

            <div v-else-if="articles.length === 0" class="text-center py-5">
                <font-awesome-icon :icon="['fas', 'newspaper']" class="mb-3 text-muted" style="font-size:2.5rem" />
                <p class="text-muted">{{ $t('events.manage.menu.news.manage.empty') }}</p>
                <button class="btn btn-primary btn-sm" @click="openCreate">
                    {{ $t('events.manage.menu.news.manage.create_first') }}
                </button>
            </div>

            <div v-else class="article-list">
                <div v-for="article in articles" :key="article.id" class="article-row">
                    <div class="article-row__cover">
                        <img v-if="article.cover_image" :src="SystemVars.baseUrl + 'storage/' + article.cover_image" :alt="article.title" />
                        <div v-else class="article-row__cover-placeholder">
                            <font-awesome-icon :icon="['fas', 'newspaper']" />
                        </div>
                    </div>
                    <div class="article-row__body">
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge" :class="article.published_at ? 'bg-success' : 'bg-secondary'">
                                {{ article.published_at ? $t('events.manage.menu.news.manage.published') : $t('events.manage.menu.news.manage.draft') }}
                            </span>
                            <span class="article-row__date text-muted small">{{ formatDate(article.published_at || article.created_at) }}</span>
                        </div>
                        <h5 class="article-row__title mb-1">{{ article.title }}</h5>
                        <p v-if="article.excerpt" class="article-row__excerpt text-muted small mb-0">{{ article.excerpt }}</p>
                        <p v-if="article.author" class="text-muted small mb-0 mt-1">
                            {{ $t('events.manage.menu.news.manage.by') }} {{ article.author.name }}
                        </p>
                    </div>
                    <div class="article-row__actions">
                        <button class="btn btn-sm btn-outline-light" @click="openEdit(article)">
                            <font-awesome-icon :icon="['fas', 'pen']" />
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(article)">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Editor view -->
        <div v-else-if="view === 'editor'" class="article-editor">

            <!-- Cover image -->
            <div class="mb-3">
                <label class="form-label text-muted small">{{ $t('events.manage.menu.news.manage.cover_label') }}</label>
                <div class="cover-upload" @click="$refs.coverInput.click()">
                    <img v-if="form.cover_preview" :src="form.cover_preview" class="cover-upload__img" alt="cover" />
                    <div v-else class="cover-upload__placeholder">
                        <font-awesome-icon :icon="['fas', 'image']" class="me-2" />
                        {{ $t('events.manage.menu.news.manage.cover_hint') }}
                    </div>
                </div>
                <input ref="coverInput" type="file" accept="image/*" class="d-none" @change="onCoverChange" />
            </div>

            <!-- Title -->
            <div class="mb-3">
                <input v-model="form.title" type="text" class="form-control article-title-input"
                    :placeholder="$t('events.manage.menu.news.manage.title_placeholder')" />
            </div>

            <!-- Excerpt -->
            <div class="mb-3">
                <textarea v-model="form.excerpt" class="form-control"
                    :placeholder="$t('events.manage.menu.news.manage.excerpt_placeholder')"
                    rows="2" maxlength="500"></textarea>
                <div class="text-end text-muted small mt-1">
                    {{ (form.excerpt || '').length }}/500 {{ $t('events.manage.menu.news.manage.excerpt_chars') }}
                </div>
            </div>

            <!-- Toolbar -->
            <div class="editor-toolbar mb-1" v-if="editor">
                <div class="toolbar-group">
                    <button :class="{ active: editor.isActive('bold') }"        @click="editor.chain().focus().toggleBold().run()"><b>B</b></button>
                    <button :class="{ active: editor.isActive('italic') }"      @click="editor.chain().focus().toggleItalic().run()"><i>I</i></button>
                    <button :class="{ active: editor.isActive('underline') }"   @click="editor.chain().focus().toggleUnderline().run()"><u>U</u></button>
                    <button :class="{ active: editor.isActive('strike') }"      @click="editor.chain().focus().toggleStrike().run()"><s>S</s></button>
                </div>
                <div class="toolbar-sep"></div>
                <div class="toolbar-group">
                    <button :class="{ active: editor.isActive('heading', { level: 1 }) }" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
                    <button :class="{ active: editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
                    <button :class="{ active: editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
                </div>
                <div class="toolbar-sep"></div>
                <div class="toolbar-group">
                    <button :class="{ active: editor.isActive({ textAlign: 'left' }) }"   @click="editor.chain().focus().setTextAlign('left').run()"><font-awesome-icon :icon="['fas', 'align-left']" /></button>
                    <button :class="{ active: editor.isActive({ textAlign: 'center' }) }" @click="editor.chain().focus().setTextAlign('center').run()"><font-awesome-icon :icon="['fas', 'align-center']" /></button>
                    <button :class="{ active: editor.isActive({ textAlign: 'right' }) }"  @click="editor.chain().focus().setTextAlign('right').run()"><font-awesome-icon :icon="['fas', 'align-right']" /></button>
                </div>
                <div class="toolbar-sep"></div>
                <div class="toolbar-group">
                    <button :class="{ active: editor.isActive('bulletList') }"  @click="editor.chain().focus().toggleBulletList().run()"><font-awesome-icon :icon="['fas', 'list-ul']" /></button>
                    <button :class="{ active: editor.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()"><font-awesome-icon :icon="['fas', 'list-ol']" /></button>
                    <button :class="{ active: editor.isActive('blockquote') }"  @click="editor.chain().focus().toggleBlockquote().run()"><font-awesome-icon :icon="['fas', 'quote-left']" /></button>
                    <button :class="{ active: editor.isActive('codeBlock') }"   @click="editor.chain().focus().toggleCodeBlock().run()"><font-awesome-icon :icon="['fas', 'code']" /></button>
                </div>
                <div class="toolbar-sep"></div>
                <div class="toolbar-group">
                    <button @click="addLink"><font-awesome-icon :icon="['fas', 'link']" /></button>
                    <button @click="$refs.imgInput.click()" :disabled="uploadingImage">
                        <font-awesome-icon v-if="!uploadingImage" :icon="['fas', 'image']" />
                        <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                    <button @click="addYoutube"><font-awesome-icon :icon="['fab', 'youtube']" /></button>
                </div>
                <div class="toolbar-sep"></div>
                <div class="toolbar-group">
                    <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()"><font-awesome-icon :icon="['fas', 'rotate-left']" /></button>
                    <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()"><font-awesome-icon :icon="['fas', 'rotate-right']" /></button>
                </div>
            </div>

            <input ref="imgInput" type="file" accept="image/*" class="d-none" @change="onInlineImageChange" />

            <div class="editor-wrap">
                <editor-content :editor="editor" />
            </div>

            <div class="d-flex gap-2 mt-4 justify-content-end">
                <button class="btn btn-outline-secondary" @click="view = 'list'" :disabled="saving">
                    {{ $t('events.manage.menu.news.manage.cancel') }}
                </button>
                <button class="btn btn-outline-light" @click="save(false)" :disabled="saving">
                    <span v-if="saving && !publishing" class="spinner-border spinner-border-sm me-1"></span>
                    {{ $t('events.manage.menu.news.manage.save_draft') }}
                </button>
                <button class="btn btn-primary" @click="save(true)" :disabled="saving">
                    <span v-if="saving && publishing" class="spinner-border spinner-border-sm me-1"></span>
                    {{ $t('events.manage.menu.news.manage.publish') }}
                </button>
            </div>
        </div>

        <!-- Delete modal -->
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
            <div class="modal-card">
                <h5 class="mb-2">{{ $t('events.manage.menu.news.manage.delete.title') }}</h5>
                <p class="text-muted mb-4">« {{ deleteTarget.title }} » {{ $t('events.manage.menu.news.manage.delete.confirm') }}</p>
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-outline-secondary btn-sm" @click="deleteTarget = null">
                        {{ $t('events.manage.menu.news.manage.delete.cancel') }}
                    </button>
                    <button class="btn btn-danger btn-sm" @click="doDelete" :disabled="deleting">
                        <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
                        {{ $t('events.manage.menu.news.manage.delete.btn') }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import { Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import OrganizationEventArticle from '@/helpers/communication/OrganizationEventArticle.js';
import SystemVars from '@/helpers/General/SystemVars';
import { toast } from '@/helpers/toast.js';

export default {
    props: {
        show:     { type: Boolean, required: true },
        event:    { type: Object,  default: () => ({}) },
        orgRoute: { type: String,  required: true },
    },
    data() {
        return {
            view: 'list',
            loading: false,
            saving: false,
            publishing: false,
            deleting: false,
            uploadingImage: false,
            articles: [],
            editingArticle: null,
            deleteTarget: null,
            editor: null,
            form: { title: '', excerpt: '', cover_image: null, cover_preview: null },
        };
    },
    computed: {
        eventRoute() { return this.event?.route; },
    },
    watch: {
        show(val) {
            if (val && this.articles.length === 0) this.loadArticles();
        },
        'event.route'(newRoute) {
            if (newRoute) this.loadArticles();
        },
    },
    async mounted() {
        if (this.show && this.eventRoute) await this.loadArticles();
    },
    beforeUnmount() {
        this.editor?.destroy();
    },
    methods: {
        async loadArticles() {
            if (!this.eventRoute) return;
            this.loading = true;
            const result = await OrganizationEventArticle.getAll(this.orgRoute, this.eventRoute);
            if (result.code === 200) this.articles = result.data || [];
            this.loading = false;
        },
        openCreate() {
            this.editingArticle = null;
            this.form = { title: '', excerpt: '', cover_image: null, cover_preview: null };
            this.view = 'editor';
            this.$nextTick(() => this.initEditor(''));
        },
        async openEdit(article) {
            this.view = 'editor';
            const result = await OrganizationEventArticle.show(this.orgRoute, this.eventRoute, article.slug);
            const full = (result.code === 200 && result.data) ? result.data : article;
            this.editingArticle = full;
            this.form = {
                title:         full.title,
                excerpt:       full.excerpt || '',
                cover_image:   null,
                cover_preview: full.cover_image ? SystemVars.baseUrl + 'storage/' + full.cover_image : null,
            };
            this.$nextTick(() => this.initEditor(full.content || ''));
        },
        initEditor(content) {
            this.editor?.destroy();
            this.editor = new Editor({
                content,
                extensions: [
                    StarterKit.configure({ link: { openOnClick: false } }),
                    TextAlign.configure({ types: ['heading', 'paragraph'] }),
                    TiptapImage,
                    Youtube.configure({ controls: true }),
                    Placeholder.configure({ placeholder: this.$t('events.manage.menu.news.manage.title_placeholder') }),
                ],
            });
        },
        onCoverChange(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.form.cover_image   = ev.target.result;
                this.form.cover_preview = ev.target.result;
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        },
        async onInlineImageChange(e) {
            const file = e.target.files[0];
            if (!file || !this.editor) return;
            this.uploadingImage = true;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const result = await OrganizationEventArticle.uploadImage(this.orgRoute, this.eventRoute, ev.target.result);
                if (result.code === 200 && result.data) {
                    this.editor.chain().focus().setImage({ src: result.data }).run();
                }
                this.uploadingImage = false;
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        },
        addLink() {
            const url = window.prompt('URL:');
            if (!url) return;
            this.editor.chain().focus().setLink({ href: url }).run();
        },
        addYoutube() {
            const url = window.prompt('YouTube URL:');
            if (!url) return;
            this.editor.commands.setYoutubeVideo({ src: url });
        },
        async save(publish) {
            if (!this.form.title?.trim()) {
                toast.error(this.$t('events.manage.menu.news.manage.title_required'));
                return;
            }
            this.saving     = true;
            this.publishing = publish;

            const payload = {
                title:   this.form.title.trim(),
                excerpt: this.form.excerpt?.trim() || null,
                content: this.editor.getHTML(),
                publish,
            };
            if (this.form.cover_image) payload.cover_image = this.form.cover_image;

            let result;
            if (this.editingArticle) {
                result = await OrganizationEventArticle.update(this.orgRoute, this.eventRoute, this.editingArticle.id, payload);
            } else {
                result = await OrganizationEventArticle.create(this.orgRoute, this.eventRoute, payload);
            }
            this.saving = false;

            if (result.code === 200 || result.code === 201) {
                toast.success(this.$t('events.manage.menu.news.manage.save_success'));
                await this.loadArticles();
                this.view = 'list';
            } else {
                toast.error(this.$t('events.manage.menu.news.manage.save_error'));
            }
        },
        confirmDelete(article) { this.deleteTarget = article; },
        async doDelete() {
            this.deleting = true;
            const result = await OrganizationEventArticle.remove(this.orgRoute, this.eventRoute, this.deleteTarget.id);
            this.deleting = false;
            if (result.code === 200) {
                this.articles     = this.articles.filter(a => a.id !== this.deleteTarget.id);
                this.deleteTarget = null;
            }
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        },
    },
};
</script>

<style scoped>
.news-manage { position: relative; }
.gen-header { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1rem; }
.gen-back { background: none; border: none; color: rgba(255,255,255,0.6); font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; padding: 0; transition: color 0.15s; }
.gen-back:hover { color: rgba(255,255,255,0.95); }
.gen-title { text-align: center; font-size: 1.3rem; font-weight: 600; margin: 0; color: rgba(255,255,255,0.92); }
.article-list { display: flex; flex-direction: column; gap: 0.75rem; }
.article-row { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem 1rem; transition: background 0.15s; }
.article-row:hover { background: rgba(255,255,255,0.07); }
.article-row__cover { flex-shrink: 0; width: 80px; height: 50px; border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.06); }
.article-row__cover img { width: 100%; height: 100%; object-fit: cover; }
.article-row__cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.2); font-size: 1.2rem; }
.article-row__body { flex: 1; min-width: 0; }
.article-row__title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.article-row__excerpt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.article-row__actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
.cover-upload { border: 2px dashed rgba(255,255,255,0.15); border-radius: 8px; cursor: pointer; overflow: hidden; transition: border-color 0.15s; height: 180px; display: flex; align-items: center; justify-content: center; }
.cover-upload:hover { border-color: rgba(255,255,255,0.35); }
.cover-upload__img { width: 100%; height: 100%; object-fit: cover; }
.cover-upload__placeholder { color: rgba(255,255,255,0.35); font-size: 0.9rem; }
.article-title-input { font-size: 1.5rem; font-weight: 700; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.12); border-radius: 0; color: rgba(255,255,255,0.95); padding: 0.5rem 0; }
.article-title-input:focus { background: transparent; box-shadow: none; border-bottom-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.95); }
.editor-toolbar { display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-bottom: none; border-radius: 8px 8px 0 0; padding: 0.4rem 0.5rem; }
.toolbar-group { display: flex; gap: 0.2rem; }
.toolbar-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.12); margin: 0 0.2rem; }
.editor-toolbar button { background: none; border: none; color: rgba(255,255,255,0.55); padding: 0.25rem 0.45rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; line-height: 1; transition: background 0.12s, color 0.12s; }
.editor-toolbar button:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }
.editor-toolbar button.active { background: rgba(255,255,255,0.15); color: #fff; }
.editor-toolbar button:disabled { opacity: 0.3; cursor: default; }
.editor-wrap { min-height: 400px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 0 0 8px 8px; padding: 1rem 1.25rem; color: rgba(255,255,255,0.88); font-size: 0.95rem; line-height: 1.7; }
.editor-wrap:deep(.ProseMirror) { outline: none; min-height: 380px; }
.editor-wrap:deep(.ProseMirror p.is-editor-empty:first-child::before) { content: attr(data-placeholder); color: rgba(255,255,255,0.2); pointer-events: none; float: left; height: 0; }
.editor-wrap:deep(h1) { font-size: 1.9rem; font-weight: 700; margin: 1.2rem 0 0.5rem; }
.editor-wrap:deep(h2) { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.4rem; }
.editor-wrap:deep(h3) { font-size: 1.2rem; font-weight: 600; margin: 0.8rem 0 0.3rem; }
.editor-wrap:deep(blockquote) { border-left: 3px solid rgba(255,255,255,0.3); padding-left: 1rem; color: rgba(255,255,255,0.55); margin: 0.75rem 0; }
.editor-wrap:deep(pre) { background: rgba(0,0,0,0.4); border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.85rem; }
.editor-wrap:deep(a) { color: #7eabff; }
.editor-wrap:deep(img) { max-width: 100%; border-radius: 6px; margin: 0.5rem 0; }
.editor-wrap:deep(iframe) { max-width: 100%; border-radius: 6px; margin: 0.5rem 0; }
.editor-wrap:deep(ul), .editor-wrap:deep(ol) { padding-left: 1.5rem; }
.editor-wrap:deep(hr) { border-color: rgba(255,255,255,0.12); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1050; }
.modal-card { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 1.75rem; max-width: 400px; width: 90%; color: rgba(255,255,255,0.88); }
</style>
