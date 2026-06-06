/**
* @component Whiteboard
* @description A draggable and zoomable whiteboard area.
* @prop {Date} key - Used to re-render whiteboard on reuse, use Date.now() in this situation
*/

<template>
    <div ref="containerRef" class="whiteboard-container" @wheel.prevent="onWheel" @mousedown="onMouseDown"
        @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp" @touchstart="onTouchStart"
        @touchmove="onTouchMove" @touchend="onTouchEnd">
        <div ref="whiteboardRef" class="whiteboard-content" :style="contentStyle">
            <!-- Slot content wrapper -->
            <div ref="slotWrapperRef" class="slot-wrapper">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Whiteboard",
    data() {
        return {
            scale: 1,
            pos: { x: 0, y: 0 },
            isDragging: false,
            lastMouse: { x: 0, y: 0 },
            slotSize: { w: 0, h: 0 },
            containerSize: { w: 0, h: 0 },
            isRendered: false,
            timestamp: 0
        };
    },
    computed: {
        contentStyle() {
            if (!this.isRendered) return {};

            return {
                transform: `translate(${this.pos.x}px, ${this.pos.y}px) scale(${this.scale})`,
                transformOrigin: "0 0"
            };
        }
    },
    mounted() {
        if (this.$refs.slotWrapperRef) {
            const observer = new ResizeObserver(() => {
                this.measureContainer();
                this.measureSlot();
                this.centerContent();
                this.timestamp = Date.now();
                this.isRendered = true;
            });
            observer.observe(this.$refs.slotWrapperRef);
            this._slotObserver = observer;
        }
    },
    beforeUnmount() {
        this.scale = 1;
        this.pos = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.slotSize = { w: 0, h: 0 };
        this.containerSize = { w: 0, h: 0 };

        if (this._slotObserver) this._slotObserver.disconnect();
    },
    methods: {
        centerContent() {
            const scaledW = this.slotSize.w * this.scale;
            const scaledH = this.slotSize.h * this.scale;

            this.pos.x = (this.containerSize.w - scaledW) / 2;
            this.pos.y = (this.containerSize.h - scaledH) / 2;
        },
        measureSlot() {
            if (this.$refs.slotWrapperRef) {
                const rect = this.$refs.slotWrapperRef.getBoundingClientRect();
                this.slotSize.w = rect.width;
                this.slotSize.h = rect.height;
                console.log("Slot content size:", this.slotSize);
            }
        },
        measureContainer() {
            if (this.$refs.containerRef) {
                const rect = this.$refs.containerRef.getBoundingClientRect();
                this.containerSize.w = rect.width;
                this.containerSize.h = rect.height;
                console.log("Container content size:", this.containerSize);
            }
        },
        onWheel(e) {
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const minScale = Math.min(
                this.containerSize.w / this.slotSize.w,
                this.containerSize.h / this.slotSize.h
            )

            console.log(minScale);
            this.scale = Math.min(Math.max(minScale, this.scale + delta), 2); // clamp 1x-2x
            this.clampPosition();
        },
        onMouseDown(e) {
            this.isDragging = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
        },
        onMouseMove(e) {
            if (!this.isDragging) return;
            const dx = e.clientX - this.lastMouse.x;
            const dy = e.clientY - this.lastMouse.y;
            this.pos.x += dx;
            this.pos.y += dy;
            this.lastMouse = { x: e.clientX, y: e.clientY };
            this.clampPosition();
        },
        onMouseUp() {
            this.isDragging = false;
        },
        clampPosition() {
            const containerW = this.$refs.containerRef.offsetWidth;
            const containerH = this.$refs.containerRef.offsetHeight;
            const scaledW = this.slotSize.w * this.scale;
            const scaledH = this.slotSize.h * this.scale;

            let minX, maxX, minY, maxY;

            if (scaledW <= containerW) {
                // Content smaller → lock to center horizontally
                minX = maxX = (containerW - scaledW) / 2;
            } else {
                minX = containerW - scaledW;
                maxX = 0;
            }

            if (scaledH <= containerH) {
                // Content smaller → lock to center vertically
                minY = maxY = (containerH - scaledH) / 2;
            } else {
                minY = containerH - scaledH;
                maxY = 0;
            }

            this.pos.x = Math.min(Math.max(this.pos.x, minX), maxX);
            this.pos.y = Math.min(Math.max(this.pos.y, minY), maxY);
        }
    }
};
</script>

<style scoped>
.whiteboard-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    background: transparent;
    cursor: grab;
    user-select: none;
}

.whiteboard-container:active {
    cursor: grabbing;
}

.whiteboard-content {
    background: transparent;
}

.slot-wrapper {
    display: inline-block;
}
</style>
