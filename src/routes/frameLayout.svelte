<script>
    import { stanza } from "./stores.js";
    import { fade, draw } from 'svelte/transition';
    import { sineOut, expoOut, quadOut } from 'svelte/easing';
</script>


<div class="mainbox">

    <img src="/frame.png" class="goldframe" />
    <div class="topbar bar">
        <div class="topbar_inner">
            <slot name="topbar"></slot>
        </div>
    </div>
    <div class="inner_image_container">
        <slot ></slot>  <!-- Default Slot -->
    </div>
    <div class="bottombar bar"
    >
        <div class="bottombar_inner">
            <slot name="bottombar"></slot>
        </div>
    </div>
</div> 

<style>
    .mainbox {
        position: relative;
        margin: 0 auto;
        max-width: 1024px;
        max-height: 90vh;
        aspect-ratio: 1/1;
        overflow: hidden;
    }
    .goldframe {
        position: absolute;
        width: 100%;
        height: auto;
        object-fit: cover;
        z-index: -1;
    }
    .inner_image_container {
        position: relative;
        height: 65%;
        max-height: 65%;
        aspect-ratio: 1/1;
        margin: 0 17.5%;
        overflow: hidden;
    }
    .bar {
        height: 18%;
        display: block;
    }
    .topbar {
        padding: 8% 19% 4% 19%;
        box-sizing: border-box;
    }
    .bottombar {
        padding: 3% 10% 10% 10%;
        box-sizing: border-box;
    }
    .topbar_inner, .bottombar_inner {
        height: 100%;
        background-color: white;
        box-shadow: 0 0 15px 15px white;
        /* backdrop-filter: contrast(0.4) saturate(0.0) brightness(1.5); */
        position: relative;
        /* font */
        text-align: center;
        font-size: 2em;
        border-radius: 5px;
    }
    @media (max-width: 768px) {
        /* don't show the gold frame on mobile */
        .mainbox {
            aspect-ratio: auto;
            height: 100vh;
            min-height: 100vh;
            width: 100vw;
        }
        .goldframe {
            display: none;
            position: relative;
        }
        .inner_image_container {
            /* height: 100vw; */
            width: 100vw;
            min-height: calc(100vh - 120px);
            margin: 0;
        }
        .topbar, .bottombar {
            padding: 0;
        }
        .topbar.bar, .bottombar.bar {
            height: 60px;
        }
        .topbar_inner, .bottombar_inner {
            box-shadow: none;
        }
    }
</style>