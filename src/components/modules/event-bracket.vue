<template>
    <div class="d-flex flex-grow-1 min-h-0 gap-3">
        <!-- Left Bracket -->
        <div class="bracket-left">
            <div v-for="(round, rIndex) in roundsLeft" :key="rIndex" class="round">
                <div v-for="(match, mIndex) in round" :key="mIndex" class="match"
                    @click="selectWinner('left', rIndex, Math.floor(mIndex / 2), mIndex % 2)">
                    <span :class="{ empty: !match.name }">{{ match.name || "TBD" }}</span>
                </div>
            </div>
        </div>

        <!-- Right Bracket -->
        <div class="bracket-right">
            <div v-for="(round, rIndex) in roundsRight" :key="rIndex" class="round">
                <div v-for="(match, mIndex) in round" :key="mIndex" class="match"
                    @click="selectWinner('right', rIndex, Math.floor(mIndex / 2), mIndex % 2)">
                    <span :class="{ empty: !match.name }">{{ match.name || "TBD" }}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12">

        </div>
    </div>
</template>

<script>
export default {
    name: "event-bracket",
    props: {
        players: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            roundsLeft: [],
            roundsRight: [],
        };
    },
    beforeMount() {
        const n = this.players.length;
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(n)));
        const byes = nextPowerOf2 - n;

        console.log(`Participants: ${n}, Bracket size: ${nextPowerOf2}, Byes needed: ${byes}`);

        // Add "BYE" placeholders
        const allParticipants = [...this.players];
        for (let i = 0; i < byes; i++) allParticipants.push("BYE");

        const mid = allParticipants.length / 2;

        this.buildRounds(allParticipants.slice(0, mid), 'left');
        this.buildRounds(allParticipants.slice(mid), 'right');
    },
    methods: {
        buildRounds(players, side) {
            let rounds = [];
            let current = players.map(name => ({ name, winner: false }));

            while (current.length > 0) {
                rounds.push(current);
                if (current.length === 1) break;

                current = Array(Math.ceil(current.length / 2))
                    .fill(null)
                    .map(() => ({ name: null, winner: false }));
            }

            if (side === 'left') this.roundsLeft = rounds;
            else this.roundsRight = rounds;
        },

        selectWinner(side, roundIndex, matchIndex, playerIndex) {
            const rounds = side === 'left' ? this.roundsLeft : this.roundsRight;
            const currentMatch = rounds[roundIndex][matchIndex * 2 + playerIndex];
            if (!currentMatch?.name || currentMatch.name === 'BYE') return;

            const nextRound = rounds[roundIndex + 1];
            if (!nextRound) return;

            nextRound[matchIndex].name = currentMatch.name;

            this.$emit("winnerSelected", {
                side,
                round: roundIndex,
                match: matchIndex,
                player: currentMatch.name,
            });
        },
    },
};
</script>

<style scoped>
.bracket-left,
.bracket-right {
    display: flex;
    color: #000;
}

.bracket-left {
    flex-direction: row;
}

.bracket-right {
    flex-direction: row-reverse;
}

.round {
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-around;
}

.match {
    border: 1px solid #ccc;
    cursor: pointer;
    text-align: center;
    background: #f9f9f9;
    border-radius: 6px;
    min-width: 100px;
    margin: 4px 0;
    transition: background 0.2s;
}

.match:hover {
    background: #dbeafe;
}

.match:nth-child(2n-1) {
    margin-bottom: 1rem;
    /* applies to each pair */
}

.empty {
    color: #aaa;
}
</style>
