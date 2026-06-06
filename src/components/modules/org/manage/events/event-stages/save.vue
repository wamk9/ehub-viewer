<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import SystemVars from '@/helpers/General/SystemVars';
import ehubMultiInputs from '@/components/inputs/ehub-multi-inputs.vue';
import ehubProfileImage from '@/components/inputs/ehub-profile-image.vue';
import ehubModal from '@/components/modals/ehub-modal.vue';
import EventBracket from '@/components/modules/event-bracket.vue';
import Whiteboard from '@/components/modules/whiteboard.vue';
import ehubSocket from '@/helpers/communication/Socket.js';
</script>

<template>
    <ehubModal id="edit-stage" v-if="show" :showModal="show" :title="SaveStageTitle" :closeOnFooter="true"
        closeOnFooterTitle="Cancel" :buttons="[{ text: 'Save', action: () => { SaveStage(); } }]"
        @closingModal="() => { CloseSave(); }">

        <div class="row" v-if="!!stageData">
            <div class="col-12 col-md-4">
                <div class="form-label text-start w-100">Stage picture</div>
                <ehubProfileImage v-model="stageData.image" ratio="16x9" :roundImage="false" />
                <span class="text-muted small">{{ $t("pages.organization.create.tips.image") }}</span>
            </div>

            <div class="col-12 col-md-8 text-start">
                <label for="stage-name" class="form-label">Stage name</label>
                <ehubInput v-model="stageData.name" type="text" />

                <label for="stage-identifier" class="form-label">Stage identifier</label>
                <ehubInput v-model="stageData.endpoint" type="text" />

                <label for="stage-date" class="form-label">Start datetime</label>
                <ehubInput v-model="stageData.startDateTime" type="datetime-local" />

                <label for="stage-description" class="form-label">Description</label>
                <ehubInput v-model="stageData.description" type="textarea" />
            </div>
        </div>

        <hr class="my-4" />

        <p>Choose a type of stage and we will show options based on your category event.</p>

        <div class="d-flex gap-2 w-100 justify-content-center my-3">
            <input type="radio" class="btn-check" name="options-outlined" id="success-outlined" autocomplete="off"
                :checked="IsStagePoints" @click="() => { stageData.type.id = 'points'; }">
            <label class="btn btn-outline-success" for="success-outlined">Points</label>

            <input type="radio" class="btn-check" name="options-outlined" id="danger-outlined" autocomplete="off"
                :checked="IsStageBracket" @click="() => { stageData.type.id = 'bracket' }">
            <label class="btn btn-outline-success" for="danger-outlined">Bracket</label>
        </div>

        <div class="col-12 col-md-6 offset-md-3">
            <p v-if="IsStagePoints">When 'points' is selected, you can attribute value by position on
                finished
                stage, much used in championships to determine a champion by constance.</p>
            <p v-else-if="IsStageBracket">When 'bracket' is selected, eHub will
                randomize
                the
                participants to
                face
                an opponent, the winner will go to next step of stage to face another opponent, loser will go off... The
                stage's winner will be choise when they don't have anybody to defeat.</p>
            <p v-else>Choose a stage type...</p>
        </div>

        <hr class="my-5" />

        <div v-if="stageData.type.id == 'points'">
            <p>To use points type, you need download a model in JSON format and modify that like you want, maintein the
                struct, often we can't read and pass it for your event stage.</p>
            <div class="row">
                <div class="col-12 col-md-6 text-md-end">
                    <ehubButton :text="textDownloadJsonPoints" @click="downloadPointsJsonModel()" />
                </div>
                <div class="col-12 col-md-6 text-md-start">
                    <input type="file" accept="application/json" @change="uploadPointsJsonFile($event)"
                        style="display: none" ref="jsonPointsfileInput" />
                    <ehubButton text="Upload JSON modifications" @click="openPointsJsonFileDialog" />
                </div>
            </div>

            <div class="row mt-5" v-if="jsonPointsAlert.message.length > 0">
                <div class="alert alert-dismissible fade show" role="alert"
                    :class="(jsonPointsAlert.success ? 'alert-success' : 'alert-danger')">
                    {{ jsonPointsAlert.message }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"
                        @click="() => jsonPointsAlert.message = ''"></button>
                </div>
            </div>

            <div class="row my-5" v-if="stageData.points.length > 0">
                <div class="col-12 col-md-6 ">
                    <p class="text-center" style="font-size: 1.2rem;">Stage Points</p>
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Position</th>
                                <th scope="col">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pos in stageData.points" :class="pos.value < 0 ? 'table-danger' : ''">
                                <th scope="row">{{ pos.number }}º</th>
                                <td>{{ pos.value }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-12 col-md-6 ">
                    <p class="text-center" style="font-size: 1.2rem;">Extra Points</p>
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Description</th>
                                <th scope="col">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pos in stageData.extraPoints" :class="pos.value < 0 ? 'table-danger' : ''">
                                <th scope="row">{{ pos.name }}</th>
                                <td>{{ pos.value }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-else-if="stageData.type.id.startsWith('bracket')">
            <p>What bracket type do you want to use?</p>
            <select v-model="stageData.type.id" class="form-select form-select-lg ">
                <option value="bracket-random">Random</option>
                <option value="bracket-entry">By entry</option>
                <option value="bracket-top-8">Top of a stage (8 participants)</option>
                <option value="bracket-top-16">Top of a stage (16 participants)</option>
                <option value="bracket-top-32">Top of a stage (32 participants)</option>
                <option value="bracket-top-64">Top of a stage (64 participants)</option>
            </select>

            <div class="my-3">
                <p v-if="stageData.type.id == 'bracket-random'">With this bracket type, eHub will randomize
                    confrontations
                    on
                    first step</p>
                <p v-else-if="stageData.type.id == 'bracket-entry'">With this bracket type, confrontations will happen
                    by
                    registration entry on first step</p>
                <div v-else-if="stageData.type.id.startsWith('bracket-top')">
                    <p>
                        With this bracket type, confrontations will happen only with the top {{
                            stageData.type.id.split('-', 3).pop()
                        }}
                        participants with more points, in this situation you need a stage of points type.
                    </p>

                    <select v-model="stageData.type.referenceStage" class="form-select form-select-lg ">
                        <option v-for="stageToLink in stagesToLink" :value="stageToLink.endpoint">{{ stageToLink.name }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
    </ehubModal>
</template>

<script>
export default {
    props: {
        creating: {
            type: Boolean,
            default: false
        },
        stage: {
            type: Object,
            default: null
        },
        show: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            stagesToLink: [
                { endpoint: 'teste', name: 'Stage Test' }
            ],
            jsonPointsAlert: {
                message: '',
                success: true
            },
            stageData: {},
            internalShow: false,
            modelPoints: {
                points: [
                    { number: 1, value: 0 },
                    { number: 2, value: 0 },
                    { number: 3, value: 0 },
                    { number: 4, value: 0 },
                    { number: 5, value: 0 },
                    { number: 6, value: 0 },
                    { number: 7, value: 0 },
                    { number: 8, value: 0 },
                    { number: 9, value: 0 },
                    { number: 10, value: 0 },
                    { number: 11, value: 0 },
                    { number: 12, value: 0 },
                    { number: 13, value: 0 },
                    { number: 14, value: 0 },
                    { number: 15, value: 0 },
                    { number: 16, value: 0 },
                    { number: 17, value: 0 },
                    { number: 18, value: 0 },
                    { number: 19, value: 0 },
                    { number: 20, value: 0 },
                    { number: 21, value: 0 }
                ],
                extraPoints: [
                    {
                        name: 'Extra',
                        description: 'Used only for example, you can use negative values for penality too in extra points.',
                        value: 0
                    }
                ]
            }
        }
    },
    computed: {
        IsStagePoints() {
            const id = this.stageData.type.id || '';
            return id.startsWith('points');
        },
        IsStageBracket() {
            const id = this.stageData.type.id || '';
            return id.startsWith('bracket');
        },
        SaveStageTitle() {
            return (this.creating ? `Creating stage` : `Editing ${this.stageData?.name ?? 'stage'}`);
        },
        textDownloadJsonPoints() {
            return this.stageData.points.length > 0 ? `Download JSON stage points` : `Download JSON Model`;
        },
        filterEventsMenu() {
            return this.event.registrations > 0 ? this.eventMenus : [...this.eventMenus, { title: "Remove", action: "remove", canSee: true }];
        },
        cardColClass() {
            return "col-12 col-md-6 col-lg-4 mb-4";
        },
        filterEvents() {
            const search = this.searchEventWord.toLowerCase();

            // Step 1: filter by search word
            let events = this.searchEventWord.length > 0
                ? this.items.filter(x =>
                    x.title.toLowerCase().includes(search) ||
                    x.description.toLowerCase().includes(search) ||
                    x.tags.some(y => y.title.toLowerCase().includes(search))
                )
                : this.items;

            // Step 2: filter by free/paid toggles
            // if neither is true, show all
            if (this.showFreeEvents && this.showPaidEvents) return events;

            return events.filter(x =>
                x.tags.some(y =>
                    (this.showFreeEvents && y.title.toLowerCase() === 'free') ||
                    (this.showPaidEvents && y.title.toLowerCase().startsWith('paid'))
                )
            );
        }

    },
    methods: {
        CloseSave() {
            this.$emit('update:show', false);
        },
        downloadPointsJsonModel() {
            // Convert object to JSON string
            const jsonString = JSON.stringify(this.stageData.points.length > 0 ? this.stageData.points : this.modelPoints, null, 2)

            // Create a Blob
            const blob = new Blob([jsonString], { type: "application/json" })
            const url = URL.createObjectURL(blob)

            // Create an anchor, but never attach it to the DOM
            const link = document.createElement("a")
            link.href = url
            link.download = `${this.$route.params.eventRoute}-${this.stageData.endpoint.length > 0 ? this.stageData.endpoint : 'stage'}-points.json`
            link.click()

            URL.revokeObjectURL(url)
        },
        openPointsJsonFileDialog() {
            this.$refs.jsonPointsfileInput.click()
        },
        uploadPointsJsonFile(event) {
            const file = event.target.files[0]
            if (!file) return

            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    this.stageData = { ...this.stageData, ...JSON.parse(e.target.result) }
                    this.jsonPointsAlert.message = `New stage points is been uploaded!`
                    this.jsonPointsAlert.success = true;
                } catch (error) {
                    this.jsonPointsAlert.message = `Invalid JSON file: ${error}`
                    this.jsonPointsAlert.success = false;
                }
            }

            reader.readAsText(file)
        },
        SaveStage() {
            if (this.event.initialized) return;

            // TODO: API Call

            this.CloseSave();
        },
    },
    mounted() {
    },
    beforeUnmount() {
    },
    watch: {
        // Watch the prop stage and update stageData dynamically
        stage: {
            immediate: true,
            handler(newStage) {
                if (!this.creating) {
                    this.stageData = { ...newStage }; // copy values
                    // Creating a new stage
                } else {
                    // Editing an existing stage
                    this.stageData = { ...this.stageData, ...newStage }; // copy values
                }
            }
        }
    }
}
</script>

<style scoped></style>

<style></style>