<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import SystemVars from '@/helpers/General/SystemVars';

</script>

<template>
    <div v-if="type == 'rules'">
        <template v-for="(value, index) in inputs" :key="index">
            <ehubInput :id="`${id}-${index}`" v-model="value.mail" type="text" :placeholder="placeholder"
                :disabled="!value.canBeEdited || false" @blur="checkRulesModelValue(index)" />
        </template>

        <ehubInput :id="`${id}-new`" v-model="newInput" type="text" :placeholder="placeholder"
            @blur="sendNewUserToModelValue()" />
    </div>

    <div v-else>
        <template v-for="(value, index) in inputs" :key="index">
            <ehubInput :id="`${id}-${index}`" v-model="inputs[index]" type="text" :placeholder="placeholder"
                @blur="checkModelValue(index)" />
        </template>

        <ehubInput :id="`${id}-new`" v-model="newInput" type="text" :placeholder="placeholder"
            @blur="sendNewValueToModelValue()" />
    </div>
</template>

<script>
export default {
    expose: ['forceValidate'],
    props: {
        id: {
            type: String,
            required: true
        },
        modelValue: {
            type: Array,
        },
        placeholder: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            inputs: [],
            newInput: '',
        }
    },
    computed: {
    },
    mounted() {
        this.inputs = this.modelValue;
    },
    methods: {
        forceValidate() {
            return true;
        },
        checkRulesModelValue(index) {
            if (this.inputs[index].mail?.length == 0) {
                this.$emit('update:modelValue', this.inputs.filter((value, idx) => idx != index));
            }
        },
        checkModelValue(index) {
            if (this.inputs[index].length == 0) {
                this.$emit('update:modelValue', this.inputs.filter((value, idx) => idx != index));
            }
        },
        sendNewUserToModelValue() {
            if (this.newInput == '') return;

            this.inputs = [...this.inputs, this.newInput];
            this.newInput = ''; // ← supposed to clear
            this.$emit('update:modelValue', this.inputs);
        },
        sendNewValueToModelValue() {
            if (this.newInput == '') return;

            this.inputs = [...this.inputs, this.newInput];
            this.newInput = ''; // ← supposed to clear
            this.$emit('update:modelValue', this.inputs);
        },
        goToMenu(action) {
            this.actualMenu = action;
        },
        convertButtonClass(color) {
            const baseClass = "ratio ratio-1x1 justify-content-center d-flex align-items-center";

            switch (color) {
                case "blue":
                    return `${baseClass} btn-primary`;
                case "gray":
                    return `${baseClass} btn-secondary`;
                case "yellow":
                    return `${baseClass} btn-warning`;
                case "green":
                    return `${baseClass} btn-success`;
                case "red":
                    return `${baseClass} btn-danger`;
                case "cian":
                    return `${baseClass} btn-info`;
                default:
                    return `${baseClass} btn-primary`;
            }
        }
    },
    watch: {
        inputs: {
            handler(newUpdates) {
                this.newInput = '';
                this.$emit('update:modelValue', newUpdates);
            },
            deep: true
        },
    }

    /*setup(props, { emit }) {
        const updatedVModel = computed({  // Use computed to wrap the object
           get: () => props.leagueData,
            set: (value) => emit('update:leagueData', value),
        });

        return { updatedVModel };
    }*/
}
</script>

<style scoped></style>

<style></style>