<script>
    import { lose_word } from "../stores";
    import { backOut, cubicOut, elasticOut, expoOut, linear, quadInOut, quadOut, sineInOut} from "svelte/easing";
    import {lose_words} from "$lib/lose_words.js";
    // let lose_word = lose_words[Math.floor(Math.random() * lose_words.length)];

    function spin(node, { delay = 0, duration = 4000, initial_angle = 180, final_angle = 720, easing = elasticOut }) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const angle_delta = final_angle - initial_angle;
        return {
            delay,
            duration,
            css: t => {
                const eased = easing(t);
                return `
                    transform: ${transform} rotate(${initial_angle + eased*angle_delta}deg) scale(${eased});
                `;
            }
        };
    }
</script>

<div class="level_completed_box"
    in:spin={{duration: 1000, easing: backOut}}
>
    &iexcl{$lose_word.word}!
    <div class="background"></div>
</div>

<style>
    .level_completed_box {
        position: absolute;
        padding: 20px;
        left: 50%;
        top: 50%;
        z-index: 2;
        /* rotate 45deg */
        transform: translate(-50%, -50%) rotate(20deg);
        color: red;
        font-weight: bold;
        border: 4px solid red;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2.5rem;
        /* outline font/text in white */
        text-shadow: 2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white;
        /* background: white; */
    }
    .background {
        position: absolute;
        width: 100%;
        height: 100%;
        background: white;
        z-index: -2;
        opacity: 0.8;
    }
</style>