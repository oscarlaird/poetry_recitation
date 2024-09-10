<script>
    import { level, poem_store, logo, image_filename, settings, victory, leading_idx, stanza, verse } from '../stores.js';
    export let highest_completed_level = 2;

    import { tweened } from 'svelte/motion';
    import { onMount } from 'svelte';
    import { load_logo } from '../recite/loaders.js';

    let perc_qmarks = tweened(0, { duration: 500 });
    let perc_words = tweened(0, { duration: 500 });
    $:  perc_words.set($settings.words_required);
    $:  perc_qmarks.set($settings.percent_question_mark);

    let letters = "ouamdwipwawomaqacvoflwinnnstcataosogrramcd";
    letters = letters.slice(0, 3 * 7);

    import { expoOut, linear, quadIn, quadOut } from 'svelte/easing';
    import { draw, fade, slide } from 'svelte/transition';

    let title_element;
    // TODO: get the strokes from the poem_store (or perhaps metadata)
    let logo_promise;
    onMount(() => {
        // reset the game when we go to settings
        victory.set(0);
        leading_idx.set(0);
        stanza.set(1);  // 1-indexed 
        verse.set(0);
        logo_promise = load_logo();
    });

</script>

<div class="container"
>
    <div class="image_bg"
         style={`background-image: url("${$image_filename}"); background-size: cover;`}
    />
    <div class="poem_info_box">
        <div class="title_box" bind:this={title_element}>{$poem_store.title}</div>
        {#await logo_promise}
        {:then}
        <svg class="icon" viewBox={$poem_store.logo_viewbox} >
                {#each $logo as d}
                <path d={d} fill=none stroke=black stroke-width=3
                    in:fade={{duration: 1000, delay: 0, easing: quadOut}}
                    />
                    <!-- in:draw|global={{delay: 500, duration: 3000, easing: expoOut }} -->
                {/each} 
        </svg>
        {/await}
    </div>


    <div class="stars_box" in:fade|global={{duration: 1000, axis: 'x'}}>
        <div>Level {$level}</div>
        {#each Array.from({ length: 5 }) as _, i}
            <svg class="star" 
                on:click={() => $level = i + 1}
                viewBox="0 -2 115 115" >
                <path d="M 22.882456,109.22232 29.737531,70.253487 1.5221917,42.51442 40.702083,36.991954 58.364484,1.5857291 75.723914,37.141484 114.85522,42.9983 86.404044,70.495431 92.926117,109.52137 57.982896,90.959775 22.882456,109.22232"
                    stroke={i === $level-1 ? "red" : "black"}
                    stroke-width={i === $level-1 ? 10 : 4}
                    fill={i <= highest_completed_level-1 ? "gold" : (i <= $level-1 ? "lightyellow" : "rgba(0,0,0,0)")}
                    />
            </svg>
        {/each}
    </div>
    <div class="settings_stats">
        <div class="openboxes">
            <center>You Speak</center>
            <div>
                <div class=progress 
                style:background={`linear-gradient(to right, red ${$perc_words * 100}%, transparent 0%)`}
                ></div>
            </div>
        </div>
        <div class="questionboxes">
            <center>Question Marks</center>
            <div>
                <div class=progress
                style:background={`linear-gradient(to right, red ${$perc_qmarks * 100}%, transparent 0%)`}
                ></div>
            </div>
        </div>
    </div>

    {#key $level}
    <div class="letter_grid"
    >
    {#each letters as letter}
        <div class="letter"
                class:we_speak={Math.random() < $settings.words_required} 
            >{Math.random() < $settings.percent_question_mark ? '?' : letter}</div>
    {/each}
    </div>
    {/key}
</div>

<style>
    .container {
        height: 100%;
        font-family: 'Times New Roman', Times, serif;
        font-weight: bold;
    }
    .image_bg {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.4;
        filter: blur(2px) contrast(0.7) saturate(0.8);
    }
    /* poem info */
    .poem_info_box {
        height: 33%;
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
    }
    .title_box {
        height: 100%;
        padding: 8px;
        box-sizing: border-box;
        flex: 1;
        font-size: 1.7rem;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        color: black;
        font-weight: bold;
        text-shadow: 2px 2px 2px rgb(243, 243, 243);
    }
    .icon {
        height: 100%;
        aspect-ratio: 1/1;
    }
    /* difficulty stars and difficulty stats */
    .stars_box {
        height: 11%;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        font-size: 1.2rem;
        padding-left: 10px;
    }
    .star {
        height: 75%;
        max-height: 75%;
        cursor: pointer;
    }
    .star:hover {
        transform: scale(1.2);
    }
    .star path:hover {
        stroke: red;
        stroke-width: 10;
    }
    .star path {
        stroke-linecap: round;
    }
    .settings_stats {
        height: 16%;
        box-sizing: border-box;
        padding-top: 6px;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-around;
        align-items: center;
        font-size: 1rem;
    }
    .openboxes, .questionboxes {
        flex: 0;
        font-weight: bold;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 1.1em;
    }
    .openboxes div, .questionboxes div {
        height: 1em;
    }
    center {
        white-space: nowrap;
    }
    .progress {
        width: 100%;
        margin: 0.3em 0;
        max-height: 0.4em;
        border-radius: 5px;
        border: 2px solid black;
        box-sizing: border-box;
    }
    /* letter grid */
    .letter_grid {
        height: 35%;
        display: grid;
        columns: auto;
        /* 3 x 7 grid */
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: repeat(3, 1fr);
        margin: 1%;
        gap: 1%;
    }
    .letter {
        border: 1px solid;
        color: rgb(31, 31, 31);
        border-color: rgb(31, 31, 31);
        /* center the text horizontally and vertically */
        display: flex;
        justify-content: center;
        align-items: center;
        border-width: 2px;
        font-weight: bold;
        filter: blur(1px);
        font-size: 1.3rem;
    }
    .we_speak {
        border-width: 3px;
        color: black;
        border-color: black;
        filter: none;
        /* background-color: rgba(255, 255, 255, 0.6); */
        filter: none;
        backdrop-filter: brightness(1.2);
    }
    @media (min-width: 500px)  {
        .title_box {
            font-size: 2.4rem;
        }
        .stars_box {
            font-size: 1.5rem;
        }
        .settings_stats {
            font-size: 1.2rem;
        }
        .letter {
            font-size: 1.4rem;
        }
        .letter_grid {
            margin: 2%;
            gap: 2%;
        }
    }
    @media (min-width: 768px) {
        .title_box {
            padding: 10px;
            font-size: 3rem;
        }
        .settings_stats {
            font-size: 1.5rem;
        }
        .letter {
            font-size: 2.6rem;
        }
    }
    @media (min-width: 1024px) {
        .settings_stats {
            font-size: 1.7rem;
        }
        .stars_box {
            font-size: 2rem;
        }
    }
</style>