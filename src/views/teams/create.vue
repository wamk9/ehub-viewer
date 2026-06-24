<template>
  <main class="container py-4">
    <!-- Header -->
    <div class="row justify-content-center text-center mb-4">
      <div class="col-12 col-lg-8">
        <transition name="fade-title" mode="out-in">
          <h1 :key="form.name || '__default__'" class="display-4 fw-light mb-2">
            {{ form.name.trim() || $t('pages.teams.create.new_team') }}
          </h1>
        </transition>
        <p class="text-muted">{{ $t('pages.teams.create.page_title') }}</p>
      </div>
    </div>

    <!-- Step indicator -->
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-lg-10">
        <div class="d-flex align-items-center gap-0">
          <div
            v-for="(step, i) in steps"
            :key="step.key"
            class="d-flex align-items-center flex-grow-1"
          >
            <div class="d-flex flex-column align-items-center" style="min-width:80px">
              <div
                class="step-circle"
                :class="{
                  'active': currentStep === i,
                  'done': currentStep > i,
                }"
              >
                <font-awesome-icon v-if="currentStep > i" icon="check" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="step-label mt-1 text-center small" :class="currentStep === i ? 'text-primary fw-semibold' : 'text-muted'">
                {{ $t(`pages.teams.create.steps.${step.key}.name`) }}
              </span>
            </div>
            <div v-if="i < steps.length - 1" class="step-connector flex-grow-1" :class="{ 'done': currentStep > i }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step content -->
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <transition name="slide-step" mode="out-in">

          <!-- Step 1: Identity -->
          <div v-if="currentStep === 0" key="s1">
            <h5 class="fw-semibold mb-1">{{ $t('pages.teams.create.s1.title') }}</h5>
            <p class="text-muted small mb-4">{{ $t('pages.teams.create.s1.sub') }}</p>

            <div class="row g-4">
              <!-- Logo upload -->
              <div class="col-12 col-md-auto d-flex flex-column align-items-center gap-2">
                <div class="logo-upload-area" @click="triggerLogoInput" :style="logoBgStyle">
                  <img v-if="logoPreview" :src="logoPreview" class="logo-preview-img" alt="logo" />
                  <div v-else class="logo-upload-placeholder">
                    <font-awesome-icon icon="image" class="fs-2 text-muted" />
                    <small class="text-muted mt-1">{{ $t('pages.teams.create.s1.logo') }}</small>
                  </div>
                </div>
                <input ref="logoInput" type="file" accept="image/*" class="d-none" @change="onLogoChange" />
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary" @click="triggerLogoInput">
                    {{ $t('pages.teams.create.s1.logo_upload') }}
                  </button>
                  <button v-if="logoPreview" class="btn btn-sm btn-outline-danger" @click="removeLogo">
                    {{ $t('pages.teams.create.s1.logo_remove') }}
                  </button>
                </div>
                <small class="text-muted text-center" style="max-width:160px">{{ $t('pages.teams.create.s1.logo_hint') }}</small>
              </div>

              <!-- Fields -->
              <div class="col">
                <div class="row g-3">
                  <div class="col-12 col-sm-8">
                    <label class="form-label small fw-medium">{{ $t('pages.teams.create.s1.name') }}</label>
                    <input
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      :placeholder="$t('pages.teams.create.s1.name_ph')"
                      maxlength="60"
                    />
                    <div class="d-flex justify-content-end mt-1">
                      <small :class="charClass(form.name.length, 60)">{{ form.name.length }}/60</small>
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <label class="form-label small fw-medium">{{ $t('pages.teams.create.s1.tag') }}</label>
                    <input
                      v-model="form.tag"
                      type="text"
                      class="form-control text-uppercase"
                      :placeholder="$t('pages.teams.create.s1.tag_ph')"
                      maxlength="5"
                      @input="form.tag = form.tag.toUpperCase()"
                    />
                    <div class="d-flex justify-content-between mt-1">
                      <small class="text-muted">{{ $t('pages.teams.create.s1.tag_hint') }}</small>
                      <small :class="charClass(form.tag.length, 5)">{{ form.tag.length }}/5</small>
                    </div>
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-medium">{{ $t('pages.teams.create.s1.desc') }}</label>
                    <textarea
                      v-model="form.description"
                      class="form-control"
                      rows="3"
                      :placeholder="$t('pages.teams.create.s1.desc_ph')"
                      maxlength="280"
                    ></textarea>
                    <div class="d-flex justify-content-end mt-1">
                      <small :class="charClass(form.description.length, 280)">{{ form.description.length }}/280</small>
                    </div>
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-medium">{{ $t('pages.teams.create.s1.color') }}</label>
                    <div class="d-flex align-items-center gap-3">
                      <input type="color" v-model="form.color" class="form-control form-control-color" style="width:48px;height:38px;padding:2px" />
                      <div class="color-swatches d-flex gap-2 flex-wrap">
                        <button
                          v-for="swatch in colorSwatches"
                          :key="swatch"
                          class="color-swatch"
                          :style="{ background: swatch, outline: form.color === swatch ? '2px solid #fff' : 'none', outlineOffset: '2px' }"
                          @click="form.color = swatch"
                        ></button>
                      </div>
                      <span class="text-muted small font-monospace">{{ form.color }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Category -->
          <div v-else-if="currentStep === 1" key="s2">
            <h5 class="fw-semibold mb-1">{{ $t('pages.teams.create.s2.title') }}</h5>
            <p class="text-muted small mb-4">{{ $t('pages.teams.create.s2.sub') }}</p>

            <!-- Category search grid -->
            <div class="mb-4">
              <label class="form-label small fw-medium">{{ $t('pages.teams.create.s2.cat_label') }}</label>

              <div v-if="!form.category" class="cat-grid-wrap">
                <div class="input-group mb-3">
                  <span class="input-group-text"><font-awesome-icon icon="search" /></span>
                  <input v-model="catSearch" type="text" class="form-control" :placeholder="$t('pages.teams.create.s2.cat_search')" />
                </div>
                <div class="cat-grid">
                  <button
                    v-for="cat in filteredCategories"
                    :key="cat.route"
                    class="cat-card"
                    @click="form.category = cat.route"
                  >
                    <span class="cat-icon">{{ cat.icon || '🎮' }}</span>
                    <span class="cat-name small">{{ $t(`categories.names.${cat.route}`, cat.name) }}</span>
                  </button>
                  <p v-if="filteredCategories.length === 0" class="text-muted small col-span-all text-center py-3">
                    {{ $t('pages.teams.create.s2.cat_none') }}
                  </p>
                </div>
              </div>

              <div v-else class="d-flex align-items-center gap-3 p-3 border rounded">
                <span class="fs-3">{{ selectedCategoryIcon }}</span>
                <div class="flex-grow-1">
                  <div class="fw-medium">{{ $t(`categories.names.${form.category}`, form.category) }}</div>
                  <small class="text-muted">{{ $t('pages.teams.create.s2.cat_selected') }}</small>
                </div>
                <button class="btn btn-sm btn-outline-secondary" @click="form.category = ''">
                  {{ $t('pages.teams.create.s2.cat_change') }}
                </button>
              </div>
            </div>

            <!-- Skill level -->
            <div class="mb-4">
              <label class="form-label small fw-medium">{{ $t('pages.teams.create.s2.level_label') }}</label>
              <div class="row g-3">
                <div v-for="lvl in skillLevels" :key="lvl" class="col-12 col-sm-6">
                  <div
                    class="level-card"
                    :class="{ selected: form.skill_level === lvl }"
                    @click="form.skill_level = lvl"
                  >
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="level-icon">{{ levelIcons[lvl] }}</span>
                      <span class="fw-medium">{{ $t(`pages.teams.create.s2.levels.${lvl}.name`) }}</span>
                    </div>
                    <small class="text-muted">{{ $t(`pages.teams.create.s2.levels.${lvl}.desc`) }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div>
              <label class="form-label small fw-medium">{{ $t('pages.teams.create.s2.location_label') }}</label>
              <input
                v-model="form.location"
                type="text"
                class="form-control"
                :placeholder="$t('pages.teams.create.s2.location_ph')"
              />
            </div>
          </div>

          <!-- Step 3: Visibility & Members -->
          <div v-else-if="currentStep === 2" key="s3">
            <h5 class="fw-semibold mb-1">{{ $t('pages.teams.create.s3.title') }}</h5>
            <p class="text-muted small mb-4">{{ $t('pages.teams.create.s3.sub') }}</p>

            <div class="mb-4">
              <label class="form-label small fw-medium">{{ $t('pages.teams.create.s3.vis_label') }}</label>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <div class="option-card" :class="{ selected: form.visibility === 'public' }" @click="form.visibility = 'public'">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <font-awesome-icon icon="earth-americas" class="text-primary" />
                      <span class="fw-medium">{{ $t('pages.teams.create.s3.vis_public') }}</span>
                    </div>
                    <small class="text-muted">{{ $t('pages.teams.create.s3.vis_public_d') }}</small>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="option-card" :class="{ selected: form.visibility === 'private' }" @click="form.visibility = 'private'">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <font-awesome-icon icon="lock" class="text-warning" />
                      <span class="fw-medium">{{ $t('pages.teams.create.s3.vis_private') }}</span>
                    </div>
                    <small class="text-muted">{{ $t('pages.teams.create.s3.vis_private_d') }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="form-label small fw-medium">{{ $t('pages.teams.create.s3.rec_label') }}</label>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <div class="option-card" :class="{ selected: form.is_open === true }" @click="form.is_open = true">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <font-awesome-icon icon="door-open" class="text-success" />
                      <span class="fw-medium">{{ $t('pages.teams.create.s3.rec_open') }}</span>
                    </div>
                    <small class="text-muted">{{ $t('pages.teams.create.s3.rec_open_d') }}</small>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="option-card" :class="{ selected: form.is_open === false }" @click="form.is_open = false">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <font-awesome-icon icon="envelope" class="text-secondary" />
                      <span class="fw-medium">{{ $t('pages.teams.create.s3.rec_invite') }}</span>
                    </div>
                    <small class="text-muted">{{ $t('pages.teams.create.s3.rec_invite_d') }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div v-else-if="currentStep === 3" key="s4">
            <h5 class="fw-semibold mb-1">{{ $t('pages.teams.create.s4.title') }}</h5>
            <p class="text-muted small mb-4">{{ $t('pages.teams.create.s4.sub') }}</p>

            <div class="review-card mb-4">
              <!-- Preview header -->
              <div class="review-header" :style="{ background: `linear-gradient(135deg, ${form.color}22 0%, ${form.color}08 100%)`, borderLeft: `4px solid ${form.color}` }">
                <div class="d-flex align-items-center gap-3">
                  <div class="review-logo" :style="{ background: form.color + '33' }">
                    <img v-if="logoPreview" :src="logoPreview" class="w-100 h-100 object-fit-contain rounded" alt="logo" />
                    <font-awesome-icon v-else icon="shield-halved" :style="{ color: form.color }" class="fs-3" />
                  </div>
                  <div>
                    <div class="fw-bold fs-5">{{ form.name || '—' }}</div>
                    <div class="text-muted small">[{{ form.tag || '???' }}]</div>
                  </div>
                </div>
                <p v-if="form.description" class="text-muted small mt-3 mb-0">{{ form.description }}</p>
              </div>

              <!-- Summary grid -->
              <div class="review-grid">
                <div class="review-row">
                  <span class="review-label">{{ $t('pages.teams.create.s4.category') }}</span>
                  <span class="review-val">{{ form.category ? $t(`categories.names.${form.category}`, form.category) : $t('pages.teams.create.s4.not_set') }}</span>
                </div>
                <div class="review-row">
                  <span class="review-label">{{ $t('pages.teams.create.s4.level') }}</span>
                  <span class="review-val">{{ form.skill_level ? $t(`pages.teams.create.levels.${form.skill_level}`) : $t('pages.teams.create.s4.not_set') }}</span>
                </div>
                <div class="review-row">
                  <span class="review-label">{{ $t('pages.teams.create.s4.location') }}</span>
                  <span class="review-val">{{ form.location || $t('pages.teams.create.s4.not_set') }}</span>
                </div>
                <div class="review-row">
                  <span class="review-label">{{ $t('pages.teams.create.s4.visibility') }}</span>
                  <span class="review-val">{{ form.visibility === 'public' ? $t('pages.teams.create.vis.public') : $t('pages.teams.create.vis.private') }}</span>
                </div>
                <div class="review-row">
                  <span class="review-label">{{ $t('pages.teams.create.s4.recruitment') }}</span>
                  <span class="review-val">{{ form.is_open ? $t('pages.teams.create.rec.open') : $t('pages.teams.create.rec.invite') }}</span>
                </div>
              </div>
            </div>

            <!-- Publish mode -->
            <div>
              <label class="form-label small fw-medium">{{ $t('pages.teams.create.s4.pub_label') }}</label>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <div class="option-card" :class="{ selected: publishNow === true }" @click="publishNow = true">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <font-awesome-icon icon="rocket" class="text-primary" />
                      <span class="fw-medium">{{ $t('pages.teams.create.s4.pub_now') }}</span>
                    </div>
                    <small class="text-muted">{{ $t('pages.teams.create.s4.pub_now_d') }}</small>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="option-card" :class="{ selected: publishNow === false }" @click="publishNow = false">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <font-awesome-icon icon="floppy-disk" class="text-secondary" />
                      <span class="fw-medium">{{ $t('pages.teams.create.s4.pub_draft') }}</span>
                    </div>
                    <small class="text-muted">{{ $t('pages.teams.create.s4.pub_draft_d') }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </transition>

        <!-- Error message -->
        <div v-if="errorMsg" class="alert alert-danger mt-4 py-2 small">{{ errorMsg }}</div>

        <!-- Navigation -->
        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary" :disabled="currentStep === 0 || submitting" @click="prevStep">
            <font-awesome-icon icon="arrow-left" class="me-1" />
            {{ $t('pages.teams.create.act.back') }}
          </button>
          <button
            v-if="currentStep < steps.length - 1"
            class="btn btn-primary"
            @click="nextStep"
          >
            {{ $t('pages.teams.create.act.next') }}
            <font-awesome-icon icon="arrow-right" class="ms-1" />
          </button>
          <button
            v-else
            class="btn btn-primary"
            :disabled="submitting"
            @click="submit"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ submitting ? $t('pages.teams.create.act.creating') : $t('pages.teams.create.act.create') }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Teams from '@/helpers/communication/Teams.js';
import Tournament from '@/helpers/communication/Tournament.js';
import router from '@/router';
import { toast } from '@/helpers/toast.js';
import { i18n } from '@/helpers/i18n';

export default {
  data() {
    return {
      currentStep: 0,
      submitting: false,
      errorMsg: '',
      publishNow: true,
      catSearch: '',
      categories: [],
      logoPreview: null,
      steps: [
        { key: 'identity' },
        { key: 'category' },
        { key: 'members' },
        { key: 'review' },
      ],
      skillLevels: ['casual', 'semi', 'pro', 'academy'],
      levelIcons: { casual: '🎮', semi: '🏆', pro: '⭐', academy: '🌱' },
      colorSwatches: ['#0098D8', '#E83F5B', '#00B37E', '#F5A623', '#9B51E0', '#FF6B35', '#2D9CDB', '#FFFFFF'],
      form: {
        name: '',
        tag: '',
        description: '',
        category: '',
        skill_level: 'casual',
        location: '',
        color: '#0098D8',
        visibility: 'public',
        is_open: true,
        logo: '',
      },
    };
  },
  computed: {
    filteredCategories() {
      const q = this.catSearch.toLowerCase().trim();
      if (!q) return this.categories;
      return this.categories.filter(c =>
        c.name.toLowerCase().includes(q) || c.route.toLowerCase().includes(q)
      );
    },
    selectedCategoryIcon() {
      const cat = this.categories.find(c => c.route === this.form.category);
      return cat?.icon || '🎮';
    },
    logoBgStyle() {
      return this.logoPreview ? {} : { background: this.form.color + '22' };
    },
  },
  async mounted() {
    const result = await Tournament.getAllCategories();
    if (result.code === 200 && result.data) this.categories = result.data;
  },
  methods: {
    charClass(len, max) {
      if (len >= max) return 'text-danger';
      if (len >= max * 0.875) return 'text-warning';
      return 'text-muted';
    },
    triggerLogoInput() {
      this.$refs.logoInput.click();
    },
    onLogoChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        this.logoPreview = ev.target.result;
        this.form.logo = ev.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeLogo() {
      this.logoPreview = null;
      this.form.logo = '';
      this.$refs.logoInput.value = '';
    },
    nextStep() {
      this.errorMsg = '';
      if (this.currentStep === 0) {
        if (!this.form.name.trim() || !this.form.tag.trim()) {
          this.errorMsg = i18n.t('pages.teams.create.act.required');
          return;
        }
      }
      if (this.currentStep === 1) {
        if (!this.form.category) {
          this.errorMsg = i18n.t('pages.teams.create.act.required_cat');
          return;
        }
      }
      if (this.currentStep < this.steps.length - 1) this.currentStep++;
    },
    prevStep() {
      if (this.currentStep > 0) this.currentStep--;
      this.errorMsg = '';
    },
    async submit() {
      this.errorMsg = '';
      this.submitting = true;
      const payload = { ...this.form };
      if (!payload.logo) delete payload.logo;
      const res = await Teams.create(payload);
      this.submitting = false;
      if (res.code === 201 && res.data) {
        toast.success(i18n.t('pages.teams.create.act.create'));
        router.push('/my-teams');
      } else {
        this.errorMsg = res.message || i18n.t('pages.teams.create.act.error');
      }
    },
  },
};
</script>

<style scoped>
/* Step indicator */
.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--bs-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bs-secondary);
  background: var(--bs-body-bg);
  transition: all 0.2s;
}
.step-circle.active {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}
.step-circle.done {
  border-color: var(--bs-primary);
  background: var(--bs-primary);
  color: #fff;
}
.step-connector {
  height: 2px;
  background: var(--bs-border-color);
  margin-bottom: 18px;
  transition: background 0.3s;
}
.step-connector.done {
  background: var(--bs-primary);
}
.step-label {
  font-size: 0.7rem;
}

/* Logo upload */
.logo-upload-area {
  width: 128px;
  height: 128px;
  border-radius: 12px;
  border: 2px dashed var(--bs-border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}
.logo-upload-area:hover {
  border-color: var(--bs-primary);
}
.logo-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* Color swatches */
.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--bs-border-color);
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s;
}
.color-swatch:hover {
  transform: scale(1.2);
}

/* Category grid */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
}
.cat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 10px;
  border: 2px solid var(--bs-border-color);
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.cat-card:hover {
  border-color: var(--bs-primary);
  background: var(--bs-primary-bg-subtle, rgba(0,152,216,0.08));
}
.cat-icon {
  font-size: 1.5rem;
}
.cat-name {
  text-align: center;
  line-height: 1.2;
}

/* Level cards */
.level-card, .option-card {
  padding: 14px 16px;
  border-radius: 10px;
  border: 2px solid var(--bs-border-color);
  cursor: pointer;
  transition: all 0.15s;
}
.level-card:hover, .option-card:hover {
  border-color: var(--bs-primary);
}
.level-card.selected, .option-card.selected {
  border-color: var(--bs-primary);
  background: var(--bs-primary-bg-subtle, rgba(0,152,216,0.08));
}
.level-icon {
  font-size: 1.2rem;
}

/* Review card */
.review-card {
  border: 1px solid var(--bs-border-color);
  border-radius: 12px;
  overflow: hidden;
}
.review-header {
  padding: 20px;
}
.review-logo {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.review-grid {
  padding: 0;
}
.review-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid var(--bs-border-color);
  font-size: 0.875rem;
}
.review-label {
  color: var(--bs-secondary);
}
.review-val {
  font-weight: 500;
}

/* Transitions */
.fade-title-enter-active, .fade-title-leave-active { transition: opacity 0.2s ease; }
.fade-title-enter-from, .fade-title-leave-to { opacity: 0; }
.slide-step-enter-active, .slide-step-leave-active { transition: all 0.2s ease; }
.slide-step-enter-from { opacity: 0; transform: translateX(20px); }
.slide-step-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
