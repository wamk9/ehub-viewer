<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import SystemVars from '@/helpers/General/SystemVars';
import ehubModal from '@/components/modals/ehub-modal.vue';
import EventBracket from '@/components/modules/event-bracket.vue';
import Whiteboard from '@/components/modules/whiteboard.vue';
</script>

<template>
    <ehubModal id="advice-start-event" :showModal="internalAdviceShow" title="Initialize event?" :closeOnFooter="true"
        closeOnFooterTitle="No, i need edit some things..." :buttons="[{
            text: 'Yes, i want start!', action: () => { ShowManage(); }
        }]" @closingModal="() => { CloseAdvice(); }">
        <p class="my-5">
            After you start your event, you can't be edit or delete any event stages, do you want to continue?
        </p>
    </ehubModal>

    <ehubModal v-if="internalShow" id="manage-event-stage" :showModal="internalShow"
        :title="`Manage ${stageToManage.name}`" :closeOnFooter="true" closeOnFooterTitle="Close"
        :buttons="[{ text: 'Finish Stage', action: () => { FinishStage(); } }]" @closingModal="() => { CloseManage(); }"
        :enableFullScreen="true">
        <div class="row">

            <div class="col-12" v-if="stageToManage.type.id == 'points'">
                <p>
                    On below you can set informations of this stage, eHub will be update positions by your order choose
                    after you insert the information on input.
                </p>
                <p>
                    DNF (Does Not Finished) will be ordered on bottom of list, if points/time is the same, eHub will
                    order by name.
                </p>

                <div class="d-flex gap-2 w-100 justify-content-center my-3">
                    <input type="radio" class="btn-check" name="options-outlined" id="success-outlined"
                        autocomplete="off" :checked="stageToManage.orderParticipantsBy == 'points'"
                        @click="stageToManage.orderParticipantsBy = 'points'; sortParticipants;">
                    <label class="btn btn-outline-success" for="success-outlined">Points</label>

                    <input type="radio" class="btn-check" name="options-outlined" id="danger-outlined"
                        autocomplete="off" :checked="stageToManage.orderParticipantsBy == 'timeless'"
                        @click="stageToManage.orderParticipantsBy = 'timeless'; sortParticipants;">
                    <label class="btn btn-outline-success" for="danger-outlined">Timeless</label>
                </div>

                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Position</th>
                            <th scope="col">Points</th>
                            <th scope="col">Time Finished</th>
                            <th scope="col">Points Made</th>
                            <th scope="col">DNF</th>
                            <th scope="col" v-if="stageToManage.extraPoints.length > 0">Extra Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(participant, index) in stageToManage.participants" :key="participant.id"
                            :class="participant.dnf ? 'table-danger' : ''">
                            <td scope="row">{{ (index + 1) }}º</td>
                            <td>{{ participant.name }} (#{{ participant.number }})</td>
                            <td>
                                <ehubInput type="text" class="w-100" v-model="participant.totalTime"
                                    @blur="() => { $nextTick(() => { sortParticipants; }) }" />
                            </td>
                            <td>
                                <ehubInput type="text" class="w-100" v-model="participant.pointsMade"
                                    @blur="() => { $nextTick(() => { sortParticipants; }) }" />
                            </td>
                            <td>
                                <input type="checkbox"
                                    @click="(e) => { participant.dnf = e.target.checked; sortParticipants; }"></input>
                            </td>
                            <td v-if="stageToManage.extraPoints.length > 0">
                                <input @click="() => { alert('not implemented'); }" type="checkbox"
                                    v-for="extraPoint in stageToManage.extraPoints">
                                {{ extraPoint.name }}
                                </input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-12" style="height: 75vh" v-if="stageToManage.type.id.startsWith('bracket')">
                <Whiteboard :key="Date.now()">
                    <EventBracket :players="stageToManage.participants" @winnerSelected="onWinnerSelected" />
                </Whiteboard>
            </div>
        </div>
    </ehubModal>
</template>

<script>
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';

export default {
    props: {
        stage: {
            type: Object,
            default: null
        },
        show: {
            type: Boolean,
            required: true
        },
        eventInitialized: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            internalAdviceShow: false,
            internalShow: false,
            stageToManage: {},
            _pollTimer: null,
        }
    },
    computed: {
        sortParticipants() {
            // Create a copy for display
            let ordered = [...this.stageToManage.participants];

            if (this.stageToManage.orderParticipantsBy === 'points') {
                ordered.sort((a, b) => {
                    // Sort by points descending
                    if (b.pointsMade !== a.pointsMade) return b.pointsMade - a.pointsMade;

                    // Tiebreaker: alphabetical by name
                    return a.name.localeCompare(b.name);
                });
            } else if (this.stageToManage.orderParticipantsBy === 'timeless') {
                ordered.sort((a, b) => {
                    const aSort = this.timeToSortable(a);
                    const bSort = this.timeToSortable(b);

                    // Compare by order (timed → unset → DNF)
                    if (aSort.order !== bSort.order) return aSort.order - bSort.order;

                    // Compare by value (time or points)
                    if (aSort.value !== bSort.value) return aSort.value - bSort.value;

                    // Tiebreaker: compare by name
                    return a.name.localeCompare(b.name);
                });
            }

            // Only update array if the order changed
            const changed = ordered.some((p, i) => p.id !== this.stageToManage.participants[i].id);
            if (changed) {
                this.stageToManage.participants = ordered;
            }

            return ordered;
        },
    },
    methods: {
        CloseAdvice() {
            this.internalAdviceShow = false;
            this.$emit('update:show', this.internalAdviceShow);
        },
        CloseManage() {
            this._stopPolling();
            this.internalShow = false;
            this.$emit('update:show', this.internalShow);
        },
        ShowManage() {
            if (this.internalAdviceShow) {
                this.CloseAdvice();
            }

            // TODO: API setting event initialization
            this.$emit('update:show', true);
        },
        timeToSortable(participant) {
            const time = participant.totalTime;
            if (participant.dnf || time === "DNF") return { order: 2, value: Infinity }; // DNF → last
            if (!time) return { order: 1, value: 0 }; // unset → after timed
            if (time && time !== "DNF") {
                // Timed participants → normal seconds
                const parts = time.split(":").map(Number);
                if (parts.length === 3) return { order: 0, value: parts[0] * 3600 + parts[1] * 60 + parts[2] };
                if (parts.length === 2) return { order: 0, value: parts[0] * 60 + parts[1] };
                return { order: 1, value: 0 }; // fallback
            }
        },
        onWinnerSelected(data) {
            console.log("Winner advanced:", data);
        },
        FinishStage(confirmation) {
            if (!confirmation) {
                //TODO: Create modal to confirm action
            } else {
                //TODO: Do API call
                this._stopPolling();
                this.internalShow = false;
                this.stageToManage.finished = true;
            }
        },
        _startPolling() {
            if (this._pollTimer) return;
            this._fetchStageData();
            this._pollTimer = setInterval(() => this._fetchStageData(), 5000);
        },
        _stopPolling() {
            if (this._pollTimer) {
                clearInterval(this._pollTimer);
                this._pollTimer = null;
            }
        },
        async _fetchStageData() {
            if (!this.stageToManage.endpoint) return;
            const result = await OrganizationEvent.show(
                this.$route.params.orgRoute,
                this.$route.params.eventRoute
            );
            if (result.code !== 200 || !result.data?.stages) return;
            const fresh = result.data.stages.find(s => s.endpoint === this.stageToManage.endpoint);
            if (!fresh) return;
            this.stageToManage = { ...this.stageToManage, ...fresh };
        },
    },
    watch: {
        stage: {
            handler(newUpdates) {
                this.stageToManage = { ...this.stageToManage, ...newUpdates };
            },
            deep: true
        },
        show: {
            handler(newValue) {
                if (this.eventInitialized) {
                    this.internalAdviceShow = false;
                    this.internalShow = newValue;
                    if (newValue) this._startPolling();
                    else this._stopPolling();
                } else {
                    this.internalAdviceShow = newValue;
                    this.internalShow = false;
                }
            },
            deep: true
        }
    },
    mounted() {
        if (!this.eventInitialized) {
            this.internalAdviceShow = this.show;
        } else {
            this.internalShow = this.show;
            if (this.show) this._startPolling();
        }
    },
    beforeUnmount() {
        this._stopPolling();
    }
}
</script>

<style scoped></style>

<style></style>
