<script>
    import { stanza } from "../stores";
    import { lose_word, parsed_stanzas } from "../stores";
    import { backOut, cubicOut, elasticOut, expoOut, linear, quadInOut, quadOut, sineInOut} from "svelte/easing";
    import {lose_words} from "$lib/lose_words.js";
    let bad_word = lose_words[Math.floor(Math.random() * lose_words.length)];

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
    {bad_word.word}!
<pre>losing: {$lose_word.word}
stanza: {$lose_word.stanza}
 verse: {$lose_word.verse}
 words: {$lose_word.id}</pre>

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
        flex-direction: column;
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
    pre {
        font-size: 1.5rem;
        font-weight: normal;
        color: black;
        text-shadow: 2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white;
        margin: 0;
        margin-top: 20px;
    }
</style>