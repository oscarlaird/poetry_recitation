<script>
    export let difficulty = 3;
    import { test_difficulty_settings } from './test_difficulty_settings.js';
    $: settings = test_difficulty_settings[difficulty - 1];
    let letters = "ouamdwipwawomaqacvoflwinnnstcataosogrramcd";
    // take the first 25 letters
    letters = letters.slice(0, 21);
</script>


<div class="container">
    <div class="stars_box">
        {#each Array.from({ length: 5 }) as _, i}
            <div class="star" class:filled={i < difficulty}
                on:click={() => difficulty = i + 1}
            />
        {/each}
    </div>
    <div class="settings_grid">
        <div class="grid_cell">
            Words Required
        </div>
        <div class="grid_cell">
            <progress value={settings.words_required} max={1}></progress>
        </div>
        <div class="grid_cell">
            Question Marks
        </div>
        <div class="grid_cell">
            <progress value={settings.percent_question_mark} max={1}></progress>
        </div>
        <div class="grid_cell">
            Lives
        </div>
        <div class="grid_cell">
            {"❤️".repeat(settings.lives)}
        </div>
    </div>
    <br>

    <div class="letter_grid">
        {#each letters as letter}
            <div class="letter"
                class:we_speak={Math.random() < settings.words_required} 
            >{Math.random() < settings.percent_question_mark ? '?' : letter}</div>
        {/each}
    </div>
</div>

<style>
    .container {
        width: 100%;
        aspect-ratio: 1/1;
        border: 1px solid black;
        padding: 20px;
        font-family: 'Times New Roman', Times, serif;
    }
    .settings_grid {
        display: grid;
        /* 2x3 grid */
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        font-size: 1.4rem;
    }
    .letter_grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        margin-right: 9%;
        gap: 0.3rem;
    }
    .letter {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2rem;
        border: 1px solid black;
        aspect-ratio: 1/1;
        color: gray;
        border-color: gray;
    }
    .we_speak {
        color: black;
        border-color: black;
    }
    .stars_box {
        height: 15%;
        display: flex;
        flex-direction: row;
        justify-content: left;
        margin-bottom: 25px;
    }
    .star {
        height: 80%;
        aspect-ratio: 1/1;
        margin: 3%;
        border: 1px solid black;
        transform: rotate(45deg);
        background-color: lightgray;
        cursor: pointer;
    }
    .star:hover {
        background-color: gray;
    }
    .filled {
        background-color: black;
    }
    .filled:hover {
        background-color: black;
    }
    progress {
        width: 50%;
    }
    input[type=range] {
        width: 100%;
    }
</style>