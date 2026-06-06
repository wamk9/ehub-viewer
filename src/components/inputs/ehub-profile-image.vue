<template>
    <div class="ratio mb-3 preview-wrapper" :class="`ratio-${ratio} ${(roundImage ? 'rounded-border' : '')}`"
        ref="dropArea">
        <img v-if="modelValue" :src="modelValue" :id="dropFileElementId" class="preview-image"
            :style="(roundImage ? 'border-radius: 50%' : '')" alt="Profile Image Preview" />
        <div v-else-if="fallbackName" class="preview-initials-wrapper">
            <InitialsAvatar
                :name="fallbackName"
                :type="fallbackType"
                :size="initialsSize"
                :rounded="roundImage"
            />
        </div>
        <img v-else :src="'https://placehold.co/400'" :id="dropFileElementId" class="preview-image"
            :style="(roundImage ? 'border-radius: 50%' : '')" alt="Profile Image Preview" />

        <div class="border-overlay" :style="(roundImage ? 'border-radius: 50%' : '')"></div>
        <span class="drop-text" :style="(roundImage ? 'border-radius: 50%' : '')">{{ dropLabel }}</span>
    </div>

    <form class="my-form">
        <input type="file" :id="inputFileElementId" accept="image/*" @change="uploadByButton($event)">
        <label class="btn w-100 btn-secondary" :for="inputFileElementId">{{ buttonLabel }}</label>
    </form>
</template>

<script>
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';

export default {
    components: { InitialsAvatar },
    props: {
        modelValue: {
            type: String,
        },
        id: {
            type: [Number, String],
            default: Math.floor(Math.random() * 9999),
        },
        buttonLabel: {
            type: String,
            default: "Click to upload your image"
        },
        dropLabel: {
            type: String,
            default: "Drop to upload"
        },
        ratio: {
            type: String,
            default: "1x1"
        },
        roundImage: {
            type: Boolean,
            default: true
        },
        fallbackName: {
            type: String,
            default: '',
        },
        fallbackType: {
            type: String,
            default: 'user',
        },
        initialsSize: {
            type: Number,
            default: 120,
        },
    },
    mounted() {
        this.$refs.dropArea.addEventListener('dragenter', this.handlerFunction, false);
        this.$refs.dropArea.addEventListener('dragleave', this.handlerFunction, false);
        this.$refs.dropArea.addEventListener('dragover', this.handlerFunction, false);
        this.$refs.dropArea.addEventListener('drop', this.handlerFunction, false);

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.$refs.dropArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.$refs.dropArea.addEventListener(eventName, this.highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.$refs.dropArea.addEventListener(eventName, this.unhighlight, false);
        });

        this.$refs.dropArea.addEventListener('drop', this.handleDrop, false);
    },
    computed: {
        inputFileElementId() {
            return this.id + "_file_input";
        },
        dropFileElementId() {
            return this.id + "_drop_area";
        }
    },

    /* Can add validation here
    watch: {
      value: {
        handler(newValue, oldValue) {
  
        },
      },
    }, */
    methods: {
        onInput(event) {
            // Can add validation here
            this.$emit('update:modelValue', event.target.value);
        },
        uploadByButton(event) {
            [...event.target.files].forEach(this.convertToBase64);
        },
        convertToBase64(file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onloadend = () => {
                this.$emit('update:modelValue', reader.result);
            };

            reader.onerror = (error) => {
                console.error(error);
            };
        },
        handleFiles(files) {
            [...files].forEach(this.convertToBase64)
        },
        handleDrop(e) {
            let dt = e.dataTransfer
            let files = dt.files

            this.handleFiles(files)
        },
        preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        },
        highlight(e) {
            this.$refs.dropArea.classList.add('highlight')
        },
        unhighlight(e) {
            this.$refs.dropArea.classList.remove('highlight')
        },
    },
}
</script>

<style scoped>
/* div[id$=_drop_area] {
    border: 2px dashed #ccc;
    border-radius: 20px;
    width: 100%;
    font-family: sans-serif;
    margin: auto;
    padding: 20px;
} */
.border-overlay {
    position: absolute;
    inset: 0;
    border: 5px solid #ff0066;
    opacity: 0;
    pointer-events: none;
    z-index: 2;
    border-radius: inherit;
    /* keeps rounded shape if needed */
}

.preview-wrapper.highlight .border-overlay {
    animation: fade 2s linear infinite;
}

@keyframes fade {
    0% {
        opacity: 0;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

.drop-text {
    position: absolute;
    inset: 0;
    /* fill wrapper */
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #007bff;
    font-weight: bold;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.6);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 1;
}

.preview-wrapper.highlight .drop-text {
    opacity: 1;
}

.rounded-border::before {
    border-radius: 50%;
    animation: spin 2s linear infinite !important;
    border-top-color: #ff0066;
    border-bottom-color: transparent;
    border-left-color: transparent;
    border-right-color: transparent;

}

.preview-wrapper::before {
    content: "";
    position: relative;
    inset: 0;
    border-color: #ff0066;
    border: 5px solid transparent;
    animation: fade 2s linear infinite;
    z-index: 2;
    opacity: 0;
}

.preview-wrapper img {
    object-fit: cover;
    display: block;
    z-index: 1;
}

.preview-wrapper.highlight::before {
    opacity: 1;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}


p {
    margin-top: 0;
}

.my-form {
    margin-bottom: 10px;
}

input[id$=_file_input] {
    display: none;
}

.preview-initials-wrapper {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.preview-initials-wrapper :deep(.initials-avatar) {
    width: 100% !important;
    height: 100% !important;
    border-radius: inherit !important;
}

.preview-image {
    object-fit: cover;
    border-width: 4px;
    border-style: solid;
    border-color: gray;
    background-color: gray;
    margin-bottom: 2rem;
}
</style>