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
    <div class="lives" >
        {#each Array.from({ length: 3 }) as _, i}
        <svg viewBox="-3 -3 73 73" >
            <path d="M 55.538727,2.5013793 C 62.852607,5.7954098 64.717147,17.321224 63.422767,25.237539 60.709317,41.832788 42.528937,47.541787 32.575357,65.153987 22.621771,47.460247 4.463432,41.742226 1.727932,25.156002 0.42859202,17.277654 2.200245,5.7823108 9.4740818,2.4886863 17.039308,-0.93688074 28.080327,3.4771943 32.506407,11.986918 36.932487,3.4898873 47.968097,-0.90828874 55.538727,2.5013793 Z"
                stroke="black" stroke-width="8" fill={i < $lives ? "red" : "white"} />
        </svg>
        {/each}
    </div>

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
    .bar {
        height: 100%;
        min-height: 100%;
        /* flex */
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
    }
    .poem_title {
        font-family: 'Kingthings Calligraphica 2';
    }
    .lives {
        height: 28px;
        font-family: 'Times New Roman';
        /* // flex */
        display: flex;
        flex-direction: row;
        gap: 4%;
    }
    .lives svg {
        height: 100%;
        width: 100%;
    }
    .fade {
        animation: fadeGreenToBlack 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
</style>