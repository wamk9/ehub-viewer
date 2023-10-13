<template>
    <div :id="dropFileElementId" class="mb-3" ref="dropArea">
        <form class="my-form">
            <p>Para fazer o upload de uma imagem, arraste-a até a região tracejada ou clique no botão abaixo de seleção de imagem</p>
            <input type="file" :id="inputFileElementId" accept="image/*" @change="uploadByButton($event)">
            <label class="button" :for="inputFileElementId">Selecione alguma imagem</label>
        </form>
    </div>
</template>
  
<script>
export default {
    props: {
      modelValue: {
        type: String,
      },
      id: {
        type: String,
        default: Math.floor(Math.random() * 9999),
      }
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
    div[id$=_drop_area] {
        border: 2px dashed #ccc;
        border-radius: 20px;
        width: 100%;
        font-family: sans-serif;
        margin: auto;
        padding: 20px;
    }
    div[id$=_drop_area].highlight {
        border-color: purple;
    }
    p {
        margin-top: 0;
    }
    .my-form {
        margin-bottom: 10px;
    }
    .button {
        display: inline-block;
        padding: 10px;
        background: #ccc;
        cursor: pointer;
        border-radius: 5px;
        border: 1px solid #ccc;
    }
    .button:hover {
        background: #ddd;
    }
    input[id$=_file_input] {
        display: none;
    }
</style>