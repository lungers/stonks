<template>
    <transition-group tag="div" name="roller" class="roller">
        <component
            :is="t !== '\n' ? 'div' : 'br'"
            class="roller__wrapper"
            v-for="(t, idx) in text.split('')"
            :key="getIndex(t, idx)"
        >
            <ul
                v-if="t !== '\n'"
                class="roller__char rollerBlock"
                :style="{
                    top: `${isRollStart ? findCharIndex(t) * -100 : 0}%`,
                    height: `${charList.length * 100}%`,
                    transition: `0.5s`,
                }"
            >
                <li
                    class="roller__char__item"
                    :class="{ copyable: t === char }"
                    v-for="char in findCharIndex(t, true) !== -1
                        ? charList
                        : [t]"
                    :key="char"
                    :style="{ opacity: char === ' ' ? 0 : 1 }"
                >
                    {{ char === ' ' ? '-' : char }}
                </li>
            </ul>
        </component>
    </transition-group>
</template>

<script>
export default {
    props: {
        text: {
            default: '0000',
            type: String,
            required: true,
        },
    },

    data() {
        return {
            isRollStart: false,
            isAnimationEnd: false,
            charList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        };
    },

    mounted() {
        setTimeout(() => {
            this.isRollStart = true;

            setTimeout(() => {
                this.isAnimationEnd = true;
            }, 0.5 * 1000 + 200);
        }, 200);
    },

    methods: {
        getIndex(t, idx) {
            if (this.charList.indexOf(t) === -1) {
                return `${t}${idx}`;
            }

            return idx.toString();
        },

        findCharIndex(t, isOriginal = false) {
            let idx = this.charList.indexOf(t);
            return idx === -1 && !isOriginal ? 0 : idx;
        },
    },
};
</script>

<style lang="scss" scoped>
.roller-leave-active,
.roller-enter-active {
    transition: top 0.75s, opacity 0.75s, width 0.75s;
}
.roller-leave-active {
    position: absolute;
}
.roller-item {
    transition: 0.5s;
}
.roller-move {
    transition: 0.5s;
}
.roller-enter {
    opacity: 0;
    .roller__char {
        top: 100% !important;
    }
}
.roller-enter-to {
    opacity: 1;
}
.roller-leave {
    opacity: 1;
    width: 1em;
}
.roller-leave-to {
    opacity: 0;
    width: 0;
    .roller__char {
        top: 100% !important;
    }
}
.roller {
    display: inline-block;
    .roller__wrapper {
        display: inline-flex;
        position: relative;
        height: 1.5em !important;
        overflow: hidden;
        mask-image: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(0, 0, 0, 1) 25%,
            rgba(0, 0, 0, 1) 75%,
            rgba(255, 255, 255, 0) 100%
        );
        -webkit-mask-image: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(0, 0, 0, 1) 25%,
            rgba(0, 0, 0, 1) 75%,
            rgba(255, 255, 255, 0) 100%
        );
    }
    /* hr.roller__wrapper {
		margin-left: 100%;
		height: 0 !important;
		border: none;
	} */
    .roller__char {
        display: inline-flex;
        line-height: 1.5em;
        transition: 0.5s;
        position: relative;
        list-style: none;
        flex-direction: column;
        .roller__char__item {
            user-select: none;
            flex: 1;
        }
        .copyable {
            user-select: all;
        }
    }
}
.block {
    padding: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
}
</style>