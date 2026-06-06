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
</script>

<template>
    <ehubModal id="advice-start-event" :showModal="showStartEventModal" title="Initialize event?" :closeOnFooter="true"
        closeOnFooterTitle="No, i need edit some things..." :buttons="[{
            text: 'Yes, i want start!', action: () => {
                const stage = stageToManage;
                showStartEventModal = false;
                event.initialized = true;
                console.log(stage);
                ManageStage(stage);
            }
        }]" @closingModal="() => { stageToManage = ''; showStartEventModal = false; }">
        <p class="my-5">
            After you start your event, you can't be edit or delete any event stages, do you want to continue?
        </p>
    </ehubModal>

    <ehubModal id="remove-event-stage" :showModal="showRemoveStageModal" title="Remove event stage?"
        :closeOnFooter="true" closeOnFooterTitle="No"
        :buttons="[{ text: 'Yes, remove it!', action: () => { showRemoveStageModal = false; stageToRemove = ''; RemoveStage(stageToManage, true) } }]"
        @closingModal="() => { stageToRemove = ''; showRemoveStageModal = false; }">
        <p class="my-5">
            If you remove that stage, you can't recover that, are you sure?
        </p>
    </ehubModal>

    <ehubModal id="manage-event-stage" :showModal="showManageStageModal" title="Manage stage" :closeOnFooter="true"
        closeOnFooterTitle="No"
        :buttons="[{ text: 'Save', action: () => { showManageStageModal = false; stageToManage = ''; ManageStage(stageToManage) } }]"
        @closingModal="() => { stageToManage = ''; showManageStageModal = false; }">
        <div class="row">

            <div class="col-12" v-if="stageChoosed.type == 'points'">
                <p>
                    On below you can set informations of this stage, eHub will be update positions by your order choose
                    after you insert the information on input.
                </p>
                <p>
                    DNF (Does Not Finished) will be ordered on bottom of list, if points/time is the same, eHub will
                    order by name.
                </p>
                <p>
                <div class="d-flex gap-2 w-100 justify-content-center my-3">
                    <input type="radio" class="btn-check" name="options-outlined" id="success-outlined"
                        autocomplete="off" :checked="stageChoosed.orderParticipantsBy == 'points'"
                        @click="stageChoosed.orderParticipantsBy = 'points'; sortParticipants;">
                    <label class="btn btn-outline-success" for="success-outlined">Points</label>

                    <input type="radio" class="btn-check" name="options-outlined" id="danger-outlined"
                        autocomplete="off" :checked="stageChoosed.orderParticipantsBy == 'timeless'"
                        @click="stageChoosed.orderParticipantsBy = 'timeless'; sortParticipants;">
                    <label class="btn btn-outline-success" for="danger-outlined">Timeless</label>
                </div>
                </p>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Position</th>
                            <th scope="col">Points</th>
                            <th scope="col">Time Finished</th>
                            <th scope="col">Points Made</th>
                            <th scope="col">DNF</th>
                            <th scope="col" v-if="stageChoosed.points.values.extraPoints.length > 0">Extra Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(participant, index) in stageChoosed.participants" :key="participant.id"
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
                            <td v-if="stageChoosed.points.values.extraPoints.length > 0">
                                <input @click="() => { console.log(participant.id); }" type="checkbox"
                                    v-for="extraPoint in stageChoosed.points.values.extraPoints">
                                {{ extraPoint.description }}
                                </input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-12" style="height: 75vh" v-if="stageChoosed.type == 'bracket'">
                <Whiteboard :key="Date.now()">
                    <EventBracket :players="players" @winnerSelected="onWinnerSelected" />
                </Whiteboard>
            </div>
        </div>
    </ehubModal>

    <ehubModal id="edit-stage" :showModal="showEditStageModal" title="Stage" :closeOnFooter="true"
        closeOnFooterTitle="Cancel" :buttons="[{ text: 'Save', action: () => SaveStage(stageToManage) }]"
        @closingModal="() => { stageToManage = ''; showEditStageModal = false; }">

        <div class="row">
            <div class="col-12 col-md-4">
                <div class="form-label text-start w-100">Stage picture</div>
                <ehubProfileImage v-model="stage.logo_image" ratio="16x9" :roundImage="false" />
                <span class="text-muted small">{{ $t("pages.organization.create.tips.image") }}</span>
            </div>

            <div class="col-12 col-md-8 text-start">
                <label for="stage-name" class="form-label">Stage name</label>
                <ehubInput type="text" />

                <label for="stage-identifier" class="form-label">Stage identifier</label>
                <ehubInput type="text" />

                <label for="stage-date" class="form-label">Start datetime</label>
                <ehubInput type="datetime-local" />

                <label for="stage-description" class="form-label">Description</label>
                <ehubInput type="textarea" />
            </div>
        </div>

        <hr class="my-4" />

        <p>Choose a type of stage and we will show options based on your category event.</p>

        <div class="d-flex gap-2 w-100 justify-content-center my-3">
            <input type="radio" class="btn-check" name="options-outlined" id="success-outlined" autocomplete="off"
                :checked="stage.type == 'points'" @click="stage.type = 'points'">
            <label class="btn btn-outline-success" for="success-outlined">Points</label>

            <input type="radio" class="btn-check" name="options-outlined" id="danger-outlined" autocomplete="off"
                :checked="stage.type == 'bracket'" @click="stage.type = 'bracket'">
            <label class="btn btn-outline-success" for="danger-outlined">Bracket</label>
        </div>

        <div class="col-12 col-md-6 offset-md-3">
            <p v-if="stage.type == 'points'">When 'points' is selected, you can attribute value by position on finished
                stage, much used in championships to determine a champion by constance.</p>
            <p v-else-if="stage.type == 'bracket'">When 'bracket' is selected, eHub will randomize the participants to
                face
                an opponent, the winner will go to next step of stage to face another opponent, loser will go off... The
                stage's winner will be choise when they don't have anybody to defeat.</p>
            <p v-else>Choose a stage type...</p>
        </div>

        <hr class="my-5" />

        <div v-if="stage.type == 'points'">
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

            <div class="row my-5" v-if="stage.points.values.positionPoints.length > 0">
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
                            <tr v-for="pos in stage.points.values.positionPoints"
                                :class="pos.value < 0 ? 'table-danger' : ''">
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
                            <tr v-for="pos in stage.points.values.extraPoints"
                                :class="pos.value < 0 ? 'table-danger' : ''">
                                <th scope="row">{{ pos.description }}</th>
                                <td>{{ pos.value }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-else-if="stage.type == 'bracket'">
            <p>What bracket type do you want to use?</p>
            <select v-model="stage.bracket.type" class="form-select form-select-lg ">
                <option value="random">Random</option>
                <option value="entry">By entry</option>
                <option value="8">Top of a stage (8 participants)</option>
                <option value="16">Top of a stage (16 participants)</option>
                <option value="32">Top of a stage (32 participants)</option>
                <option value="64">Top of a stage (64 participants)</option>
            </select>

            <div class="my-3">
                <p v-if="stage.bracket.type == 'random'">With this bracket type, eHub will randomize confrontations
                    on
                    first step</p>
                <p v-else-if="stage.bracket.type == 'entry'">With this bracket type, confrontations will happen by
                    registration entry on first step</p>
                <div v-else>
                    <p>
                        With this bracket type, confrontations will happen only with the top {{ stage.bracket.type
                        }}
                        participants with more points, in this situation you need a stage of points type.
                    </p>

                    <select v-model="stage.bracket.stageLink" class="form-select form-select-lg ">
                        <option value="evento1">Stage 1</option>
                    </select>
                </div>
            </div>
        </div>

    </ehubModal>

    <h1 class="display-4">Events Management</h1>
    <p class="text-muted">Manage your organization's events!</p>
    <button class="btn btn-link mx-auto" @click="$emit('update:modelValue', '')">
        Back to organization menu
    </button>

    <hr class="my-4" />

    <div class="row justify-content-center" v-if="eventToManage == ''">

        <div class="col-12 col-md-6 text-center justify-content-center justify-content-lg-start">
            <div class="mx-auto mx-lg-0 float-lg-start d-flex align-items-center">
                <ehubInput v-model="searchEventWord" placeholder="Search a event" @change="onSearch" />
            </div>
        </div>

        <div class="col-12 col-md-6 text-center justify-content-center justify-content-lg-end">
            <div class="mx-auto mx-lg-0 float-lg-end d-flex align-items-center">
                <div class="form-check form-switch d-flex align-items-center gap-2">
                    <input type="checkbox" class="btn-check" id="search-finished" autocomplete="off"
                        v-model="showFinishedEvents">
                    <label class="btn btn-outline-secondary" for="search-finished">Finished</label>

                    <input type="checkbox" class="btn-check" id="search-free" autocomplete="off"
                        v-model="showFreeEvents">
                    <label class="btn btn-outline-secondary" for="search-free">Free</label>

                    <input type="checkbox" class="btn-check" id="search-paid" autocomplete="off"
                        v-model="showPaidEvents">
                    <label class="btn btn-outline-secondary" for="search-paid">Paid</label>

                    <ehubButton buttonClass="btn-primary" text="Create a new event" @click="" />
                </div>
            </div>
        </div>

        <div v-if="filterEvents.length == 0" class="my-5">
            <p class="display-6">Ops! We don't found a event with the filter setted...</p>
            <p class="text-muted">Should you, maybe... Want to create a <a href="#">new event</a>?</p>
        </div>

        <div class="row d-flex">
            <div v-for="(item, index) in filterEvents" :key="index" :class="cardColClass">
                <div class="card h-100">
                    <div class="ratio ratio-16x9">
                        <img class="card-img-top" :src="item.image" :alt="item.title">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">{{ item.title }}</h5>
                        <div display="inline-block mb-2">
                            <span class="badge rounded-pill me-2" :class="getTagColorClass(tag.color)"
                                v-for="tag in item.tags">
                                {{ tag.title }}
                            </span>
                        </div>
                        <p class="card-text">{{ item.description }}</p>
                    </div>
                    <button @click="seeEvent(item.endpoint)" class="btn btn-primary">Manage</button>
                </div>
            </div>
        </div>
    </div>


    <div class="row" v-else>
        <div class="col-12 col-md-6 col-lg-3 text-center">
            <ul class="nav nav-underline flex-column">
                <li class="nav-item mx-auto" v-for="menu in eventMenus" v-show="menu.canSee" :key="menu.action">
                    <button class="nav-link" :class="(menu.action == actualMenu ? 'active' : '')"
                        @click="goToEventMenu(menu.action)">{{ menu.title }}</button>
                </li>
            </ul>
        </div>

        <div class="col-12 col-md-6 col-lg-9" v-if="actualEventMenu == 'notifications'">
            <h2 class="display-6 text-start">Notifications</h2>
            <p class="text-muted text-start mb-5">Here you can see notifications about what is happen in your event.
            </p>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col" class="col-4 col-md-2">Type</th>
                            <th scope="col" class="col-4 col-md-8">Description</th>
                            <th scope="col" class="col-4 col-md-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Registration</td>
                            <td>User Fernando will go participate on your event.</td>
                            <td>03/09/2025</td>
                        </tr>
                        <tr>
                            <td>Registration</td>
                            <td>User Carlos will go participate on your event.</td>
                            <td>03/09/2025</td>
                        </tr>
                        <tr>
                            <td>Protest</td>
                            <td>User Ricardo send a protest in event stage "Interlagos".</td>
                            <td>03/09/2025</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="col-12 col-md-6 col-lg-9" v-if="actualEventMenu == 'info'">
            <h2 class="display-6 text-start">Event Information</h2>
            <p class="text-muted text-start mb-5">Here you can see notifications about what is happen in your event.
            </p>

            <div class="row align-items-center mb-5">
                <div class="col-12 col-md-4">
                    <ehubProfileImage v-model="eventForm.logo_image" />
                    <span class="text-muted small">Tip:</span>

                </div>
                <div class="col-12 col-md-8 text-md-start ps-5" style="font-size: 1.1rem">
                    <p class="mb-1"><b>Event name:</b> Evento 1</p>
                    <p class="mb-1"><b>Category:</b> IRL > Automotive > Rally</p>
                    <p class="mb-1"><b>Event created at:</b> 20/05/2025</p>
                    <p class="mb-1"><b>Registration fee:</b> Free</p>
                    <p class="mb-1"><b>Actual registrations:</b> 10</p>
                    <p class="mb-1"><b>Max registrations:</b> 20</p>
                    <p><b>Starts at:</b> 25/05/2025 (First event stage date)</p>
                </div>
            </div>

            <div class="row">
                <div class="col-12 text-md-start">
                    <label>Short description</label>
                    <ehubInput v-model="event.shortDescription" type="text" />

                    <label>Description</label>
                    <ehubInput v-model="event.description" type="textarea" style="height: 100px;" />

                    <ehubButton text="Save event data" buttonClass="w-100 mt-5" @click="eventToManage = ''" />
                </div>
            </div>
        </div>

        <div class="col-12 col-md-6 col-lg-9" v-if="actualEventMenu == 'stages'">
            <h2 class="display-6 text-start d-flex d-flex justify-content-between">
                <span class="d-flex">Event Stages</span>
                <ehubButton buttonClass="btn-primary" containerClass="" text="Create stage" @click="() => EditStage('')"
                    :disabled="event.initialized" />
            </h2>
            <p class="text-muted text-start mb-5">Work with points, bracket or both, after the event started you
                can't
                modify the stages!</p>

            <div v-if="stage.length == 0" class="my-5">
                <p class="display-6">Ops! We don't found a event stage setted...</p>
                <p class="text-muted">Should you, maybe... Want to <a href="#">create one</a>?</p>
            </div>

            <div class="row d-flex">
                <div v-for="(item, index) in stage" :key="index" :class="cardColClass">
                    <div class="card h-100">
                        <div class="ratio ratio-16x9">
                            <img class="card-img-top" :src="item.image" :alt="item.name">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">{{ item.name }}</h5>
                            <p class="card-text">
                            <p class="mb-0">Start at: {{ item.startDateTime }}</p>
                            <p>Type: {{ item.type }}</p>
                            </p>
                        </div>
                        <div class="d-flex flex-row btn-group" role="group">
                            <button @click="() => EditStage(item.endpoint)" class="btn btn-primary"
                                :disabled="event.initialized">
                                Edit
                            </button>
                            <button @click="() => ManageStage(item.endpoint)" class="btn btn-primary" :disabled="(index !== 0 && !event.initialized) ||
                                (index !== 0 && !stage[index - 1].finished)">
                                {{ (item.finished ? 'Results' : 'Manage') }}
                            </button>
                            <button @click="() => RemoveStage(item.endpoint)" class="btn btn-danger"
                                :disabled="event.initialized">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 col-md-6 col-lg-9" v-if="actualEventMenu == 'registrations'">
            <h2 class="display-6 text-start">Registered Users</h2>
            <p class="text-muted text-start mb-5">Here you can see the participants of your event.
            </p>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col" class="col-4 col-md-8">Name</th>
                            <th scope="col" class="col-4 col-md-2">Registration Date</th>
                            <th scope="col" class="col-4 col-md-2">Payment Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in event.registrations">
                            <td>{{ user.name }}</td>
                            <td>{{ user.registrationDate }}</td>
                            <td>{{ user.paymentStatus }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="col-12 col-md-6 col-lg-9" v-else-if="actualEventMenu == 'remove'">
            <div class="col-12">
                <h2 class="display-6 text-start">Remove event from eHub</h2>
                <p class="text-muted text-start mb-5">Need remove this event? So click on button below... But caution
                    because after
                    confirmation we don't can recovery anything about this! (This option appears because event don't
                    have any registered user)</p>
                <div class="form-check my-4">
                    <input class="form-check-input" type="checkbox" value="" id="remove-event-confirmation"
                        v-model="removeEventConfirmation">
                    <label class="form-check-label" for="remove-event-confirmation">
                        Yes, i want to remove completally this event!
                    </label>
                </div>
                <ehubButton text="Remove this event" buttonClass="btn-danger" :disabled="!removeEventConfirmation" />
            </div>
        </div>
    </div>

</template>

<script>
export default {
    props: {
        modelValue: {
            type: String,
        },

    },
    data() {
        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        return {
            showStartEventModal: false,
            showEditStageModal: false,
            showRemoveStageModal: false,
            stageToManage: '',
            stage: [
                {
                    name: 'Stage 1',
                    startDateTime: '03/09/2025 09:00',
                    description: '',
                    image: "https://cdn.pixabay.com/photo/2015/10/27/11/20/rally-1008817_640.jpg",
                    finished: false,
                    endpoint: 'stage1',
                    type: 'points',
                    bracket: {
                        type: "random",
                        stageLink: ''
                    },
                    points: {
                        values: {
                            positionPoints: [],
                            extraPoints: []
                        },
                        model: {
                            positionPoints: [
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
                                { description: "Fair Play", value: 1 },
                                { description: "Penality", value: -1 },
                            ]
                        }

                    },
                    orderParticipantsBy: 'points',
                    participants: [
                        { id: generateUUID(), name: "Carlos", number: 99, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Fernando", number: 73, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Ana", number: 12, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Beatriz", number: 45, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Diego", number: 87, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Eduardo", number: 56, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Fabiana", number: 22, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Gustavo", number: 14, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Helena", number: 39, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Igor", number: 61, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Juliana", number: 9, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Kleber", number: 33, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Larissa", number: 78, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Marcelo", number: 5, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Natalia", number: 47, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Otavio", number: 91, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Patricia", number: 18, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Quintino", number: 64, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Rafaela", number: 7, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Sergio", number: 52, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Tatiana", number: 26, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Ulisses", number: 88, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Valeria", number: 43, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Wagner", number: 30, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Ximena", number: 10, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Yuri", number: 66, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Zara", number: 21, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Alex", number: 77, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Bruno", number: 3, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Carla", number: 55, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Daniel", number: 68, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Eliana", number: 11, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false },
                        { id: generateUUID(), name: "Felipe", number: 36, totalTime: "", extraPoints: [], position: 0, pointsMade: 0, dnf: false }
                    ]

                },
                {
                    name: 'Stage 2',
                    startDateTime: '03/09/2025 09:00',
                    image: "https://cdn.pixabay.com/photo/2015/10/27/11/20/rally-1008817_640.jpg",
                    description: '',
                    finished: false,
                    endpoint: 'stage2',
                    type: 'bracket',
                    bracket: {
                        type: "random",
                        stageLink: ''
                    },
                    points: {
                        values: {
                            positionPoints: [],
                            extraPoints: []
                        },
                        model: {
                            positionPoints: [
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
                                { description: "Fair Play", value: 1 },
                                { description: "Penality", value: -1 },
                            ]
                        }

                    }

                }
            ],
            eventForm: {
                name: '',
                description: '',
                route: '',
                logo_image: '',
            },
            actualEventMenu: '',
            hasRegisteredUsers: false,
            removeEventConfirmation: false,
            eventToManage: '',
            event: {
                initialized: false,
                endpoint: '',
                shortDescription: '',
                description: '',
                registrations: [
                    {
                        name: "Carlos",
                        registrationDate: "03/09/2025 19:00",
                        paymentStatus: "Paid"
                    },
                    {
                        name: "Fernando",
                        registrationDate: "03/09/2025 19:00",
                        paymentStatus: "Paid"
                    },
                ]
            },
            eventMenus: [
                { title: "Notifications", action: "notifications", canSee: true },
                { title: "Informations", action: "info", canSee: true },
                { title: "Event Stages", action: "stages", canSee: true },
                { title: "Registered Users", action: "registrations", canSee: true },
            ],
            items: [
                {
                    title: "Evento 1",
                    tags: [
                        { title: "Rally", color: "gray" },
                        { title: "FREE", color: "blue" },
                        { title: "1/20 Registered", color: "gray" }
                    ],
                    description: "Rally event on Maquiné/RS in 31/02/2026",
                    image: "https://cdn.pixabay.com/photo/2015/10/27/11/20/rally-1008817_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 2",
                    tags: [
                        { title: "Horse", color: "gray" },
                        { title: "FREE", color: "blue" },
                        { title: "19/20 Registered", color: "yellow" }
                    ],
                    description: "",
                    image: "https://cdn.pixabay.com/photo/2017/12/11/10/24/horse-3011858_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 3",
                    tags: [
                        { title: "Kart", color: "gray" },
                        { title: "FREE", color: "blue" },
                        { title: "10/10 Registered", color: "red" }
                    ],
                    description: "Kart event with friends, fell free to appears!",
                    image: "https://cdn.pixabay.com/photo/2019/07/02/10/32/kart-4312122_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 4",
                    tags: [
                        { title: "Kayak", color: "gray" },
                        { title: "FREE", color: "blue" },
                        { title: "3/20 Registered", color: "gray" }
                    ],
                    description: "Starting on Barra do João Pedro on Maquiné/RS",
                    image: "https://cdn.pixabay.com/photo/2020/03/04/08/59/rower-4900991_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 5",
                    tags: [
                        { title: "Soccer", color: "gray" },
                        { title: "FREE", color: "blue" },
                        { title: "20/22 Registered", color: "yellow" }
                    ],
                    description: "Tournament will happen in Capão da Canoa/RS",
                    image: "https://cdn.pixabay.com/photo/2016/08/11/06/59/football-stadium-1584910_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 6",
                    tags: [
                        { title: "Surf", color: "gray" },
                        { title: "FREE", color: "blue" },
                        { title: "9/20 Registered", color: "gray" }
                    ],
                    description: "Yeah! Another surf event!",
                    image: "https://cdn.pixabay.com/photo/2016/03/27/16/29/surf-1283039_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 7",
                    tags: [
                        { title: "Skateboard", color: "gray" },
                        { title: "Paid (U$$ 10,00)", color: "green" },
                        { title: "1/20 Registered", color: "gray" }
                    ],
                    description: "",
                    image: "https://cdn.pixabay.com/photo/2018/06/17/20/14/skateboard-3481338_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 8",
                    tags: [
                        { title: "Handball", color: "gray" },
                        { title: "Paid (U$$ 5,00)", color: "green" },
                        { title: "4/20 Registered", color: "gray" }
                    ],
                    description: "",
                    image: "https://cdn.pixabay.com/photo/2021/04/01/18/48/woman-6143052_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 9",
                    tags: [
                        { title: "Bike", color: "gray" },
                        { title: "Paid (U$$ 2,00)", color: "green" },
                        { title: "6/10 Registered", color: "gray" }
                    ],
                    description: "",
                    image: "https://cdn.pixabay.com/photo/2015/01/26/22/31/children-613196_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 10",
                    tags: [
                        { title: "Motocross", color: "gray" },
                        { title: "Paid (U$$ 15,00)", color: "green" },
                        { title: "3/20 Registered", color: "gray" }
                    ],
                    description: "",
                    image: "https://cdn.pixabay.com/photo/2016/11/29/10/21/dirt-bike-1868996_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 11",
                    tags: [
                        { title: "Tennis", color: "gray" },
                        { title: "Paid (U$$ 90,00)", color: "green" },
                        { title: "20/22 Registered", color: "yellow" }
                    ],
                    description: "",
                    image: "https://cdn.pixabay.com/photo/2016/05/09/11/09/tennis-1381230_640.jpg",
                    endpoint: "event1"
                },
                {
                    title: "Evento 12",
                    tags: [
                        { title: "Racing", color: "gray" },
                        { title: "Paid (U$$ 200,00)", color: "green" },
                        { title: "9/20 Registered", color: "gray" }
                    ],
                    description: "",
                    image: "https://cdn.pixabay.com/photo/2023/07/19/12/16/car-8136751_640.jpg",
                    endpoint: "event1"
                },
            ],
            searchEventWord: '',
            showFinishedEvents: false,
            showFreeEvents: true,
            showPaidEvents: true,
            aboutOrg: {
                general: {
                    orgName: '',
                    orgShortDescritpion: '',
                    orgAbout: ''
                },
                social: {
                    instagram: '',
                    facebook: '',
                    x: '',
                    website: ''
                },
                contact: {
                    phoneNumber: '',
                    mail: ''
                }
            },
            staffUsers: {
                admin: [{ mail: 'teste@teste.com', canBeEdited: true }, { mail: 'you@teste.com', canBeEdited: false }],
                eventManager: [{ mail: 'teste@teste.com', canBeEdited: true }, { mail: 'you@teste.com', canBeEdited: false }],
                marketing: [{ mail: 'teste@teste.com', canBeEdited: true }, { mail: 'you@teste.com', canBeEdited: false }],
                financial: [{ mail: 'teste@teste.com', canBeEdited: true }, { mail: 'you@teste.com', canBeEdited: false }]
            },
            integrations: {
                paypal: {
                    clientId: '',
                    clientSecret: '',
                },
                mercadoPago: {
                    publicKey: '',
                    accessToken: ''
                }
            },
            menus: [
                { title: "Information", action: "about", canSee: true },
                { title: "Event Stages", action: "about", canSee: true },
                { title: "Results", action: "staff", canSee: true },
                { title: "Protests", action: "about", canSee: true },
                { title: "", action: "integrations", canSee: true },
            ],
            actualMenu: '',
            showManageStageModal: false,
            jsonPointsAlert: {
                message: '',
                success: false
            },
            players: [
                "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Sophia",
                "James", "Isabella", "William", "Mia", "Benjamin", "Charlotte", "Lucas", "Amelia",
                "Henry", "Harper", "Alexander", "Evelyn", "Michael", "Abigail", "Daniel", "Emily",
                "Matthew", "Ella", "Joseph", "Elizabeth", "David", "Camila", "Jackson", "Luna",
                "Samuel", "Sofia", "Sebastian", "Avery", "Jack", "Mila", "Owen", "Aria",
                "Theodore", "Scarlett", "Leo", "Penelope", "Julian", "Layla", "Aiden", "Chloe",
                "Ethan", "Victoria", "Grayson", "Madison", "Wyatt", "Eleanor", "Carter", "Grace",
                "Isaac", "Nora", "Jayden", "Riley", "Gabriel", "Zoey", "Anthony", "Hannah",
                "Dylan", "Hazel", "Andrew", "Lily", "Joshua", "Ellie", "Christopher", "Paisley",
                "Ezra", "Addison", "Hudson", "Stella", "Maverick", "Natalie", "Miles", "Zoe",
                "Colton", "Leah", "Elias", "Savannah", "Luke", "Audrey", "Mason", "Brooklyn",
                "Asher", "Bella", "Caleb", "Claire", "Levi", "Skylar", "Isaiah", "Lucy",
                "Nathan", "Anna", "Thomas", "Caroline", "Charles", "Genesis", "Josiah", "Aaliyah",
                "Dominic", "Kennedy", "Hunter", "Kinsley", "Ezekiel", "Allison", "Aaron", "Maya",
                "Adrian", "Sarah", "Jonathan", "Madelyn", "Nolan", "Cora", "Christian", "Ruby",
                "Cameron", "Eva", "Connor", "Serenity", "Landon", "Autumn", "Roman", "Adeline"
            ],
        }
    },
    computed: {
        sortParticipants() {
            if (!this.stageChoosed) return;

            // Create a copy for display
            let ordered = [...this.stageChoosed.participants];

            if (this.stageChoosed.orderParticipantsBy === 'points') {
                ordered.sort((a, b) => {
                    // Sort by points descending
                    if (b.pointsMade !== a.pointsMade) return b.pointsMade - a.pointsMade;

                    // Tiebreaker: alphabetical by name
                    return a.name.localeCompare(b.name);
                });
            } else if (this.stageChoosed.orderParticipantsBy === 'timeless') {
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
            const changed = ordered.some((p, i) => p.id !== this.stageChoosed.participants[i].id);
            if (changed) {
                this.stageChoosed.participants = ordered;
            }

            return ordered;
        },
        stageChoosed() {
            // ensure stage is loaded and stageToManage exists
            if (!Array.isArray(this.stage) || this.stageToManage == '') return {};

            // filter and get first
            const filtered = this.stage.find(x => x.endpoint === this.stageToManage) ?? {};
            return filtered;
        },
        textDownloadJsonPoints() {
            return this.stage.points.values.positionPoints.length > 0 ? `Download JSON stage points` : `Download JSON Model`;
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
        downloadPointsJsonModel() {
            // Convert object to JSON string
            const jsonString = JSON.stringify(this.stage.points.values.positionPoints.length > 0 ? this.stage.points.values : this.stage.points.values, null, 2)

            // Create a Blob
            const blob = new Blob([jsonString], { type: "application/json" })
            const url = URL.createObjectURL(blob)

            // Create an anchor, but never attach it to the DOM
            const link = document.createElement("a")
            link.href = url
            link.download = `${this.event.endpoint}-${this.stage.endpoint.length > 0 ? this.stage.endpoint : 'stage'}-points.json`
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
                    this.stage.points.values = JSON.parse(e.target.result)
                    this.stage.points.hasValuesModified = true;
                    this.jsonPointsAlert.message = `New stage points is been uploaded!`
                    this.jsonPointsAlert.success = true;
                } catch (error) {
                    this.jsonPointsAlert.message = `Invalid JSON file: ${error}`
                    this.jsonPointsAlert.success = false;
                }
            }

            reader.readAsText(file)
        },
        SaveStage(endpoint) {
            this.stageToManage = endpoint;
            this.showEditStageModal = false;
        },
        EditStage(endpoint) {
            if (this.event.initialized) return;
            this.stageToManage = endpoint;
            this.showEditStageModal = true;
        },
        ManageStage(endpoint) {
            if (!this.event.initialized) {
                this.stageToManage = endpoint;
                this.showStartEventModal = true;
            } else {
                this.stageToManage = endpoint;
                this.showManageStageModal = true;
            }
        },
        RemoveStage(endpoint, removeFromAPI) {
            if (this.event.initialized) return;

            if (removeFromAPI) {

            } else {
                this.showRemoveStageModal = true;
                this.stageToRemove = endpoint;
            }
        },
        goToEventMenu(action) {
            this.actualEventMenu = action;
        },
        seeEvent(eventRoute) {
            console.log(eventRoute);
            this.event.endpoint = eventRoute;
            this.eventToManage = eventRoute;
        },
        getTagColorClass(color) {
            switch (color) {
                case 'blue':
                    return 'bg-primary text-white';
                case 'green':
                    return 'bg-success text-white';
                case 'gray':
                    return 'bg-secondary text-white';
                case 'yellow':
                    return 'bg-warning text-white';
                case 'red':
                    return 'bg-danger text-white';
                default:
                    return 'bg-secondary text-white';
            }
        }
    },
    mounted() {
    },
    beforeUnmount() {
    }
}
</script>

<style scoped></style>

<style></style>