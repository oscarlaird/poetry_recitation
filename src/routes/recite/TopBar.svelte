<script>
    import { onMount } from "svelte";
    import { poem_store, lives } from "../stores.js";
    import textfit from 'textfit';
    let title_element;
    let bar_element;
    onMount (() => {
        // get the height in px of the bar element
        let bar_dims = bar_element.getBoundingClientRect();
        title_element.style.height = `${bar_dims.height * 0.9}px`;
        title_element.style.width = `${bar_dims.width - 100}px`;
        // set the font size of the title element to 90% of the bar height
        textfit(title_element, {
            alignHoriz: true,
            alignVert: true,
            multiLine: false,
            detectMultiLine: false,
            // alignVertWithFlexbox: true,
        });
    });

</script>


<div class="bar" bind:this={bar_element} >

    <div class="poem_title" bind:this={title_element}>{$poem_store.title}</div>

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
    .fade {
        animation: fadeGreenToBlack 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    .bar {
        height: 100%;
        min-height: 100%;
        /* flex */
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 0 10px;
    }
    .poem_title {
        font-family: 'Kingthings Calligraphica 2';
    }
</style>