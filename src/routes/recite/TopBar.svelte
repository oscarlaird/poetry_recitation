<script>
    import { stanza, verse, poem_store, lives } from "../stores.js";
</script>


<div class="bar">
    <div class="poem_title">{$poem_store.title}</div>
    <!--
    <span class="by">by</span>
    <span class="author">Edgar Allan Poe</span>
    -->
    <div class="lives">
        {#each Array.from({ length: 3 }) as _, i}
            <span>◆ ️</span>
        {/each}
    </div>
    <div class="stanza_verse">
        {#key $stanza}<span class:fade={$stanza>1}>{$stanza}</span>{/key}
        :
        {#key $verse}<span class:fade={$verse>0}>{$verse+1}</span>{/key}
    </div>
</div>

<style>
    @font-face {
        font-family: 'Kingthings Calligraphica 2';
        src: url('/fonts/kingthings-calligraphica.2.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    @keyframes fadeGreenToBlack {
        0% {
            color: green;
            transform: scale(1.5);
        }
        100% {
            color: inherit;
            transform: scale(1);
        }
    }
    .bar {
        height: 100%;
        background-color: white;
        box-shadow: 0 0 15px 15px white;
        position: relative;
        /* font */
        text-align: center;
        font-size: 2em;
        /* flex */
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
    .poem_title {
        font-family: 'Kingthings Calligraphica 2';
    }
    .by {
        font-family: 'Times New Roman';
        font-style: italic;
        font-size: 0.5em;
        margin: 0 10px;
    }
    .author {
        font-family: 'Times New Roman';
        font-size: 0.75em;
    }
    .lives {
        position: absolute;
        left: 10px;
        font-family: 'Times New Roman';
        font-size: 0.9em;
    }
    .stanza_verse {
        position: absolute;
        right: 10px;
        font-family: 'Times New Roman';
        font-size: 0.8em;
    }
    .stanza_verse span {
        display: inline-block;
    }
    .fade {
        animation: fadeGreenToBlack 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }

    @media (max-width: 768px) {
        .bar {
            font-size: 1.5em;
        }
    }
</style>