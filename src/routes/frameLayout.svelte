<script>
    import { stanza } from "./stores.js";
</script>


<div class="mainbox">
    <img src="/frame.png" class="goldframe" />
    <div class="topbar bar">
        <slot name="topbar"></slot>
    </div>
    <div class="inner_image_container">
        <slot ></slot>  <!-- Default Slot -->
    </div>
    <div class="bottombar bar"
    >
        <slot name="bottombar" />
    </div>
</div> 

<style>
    .mainbox {
        position: relative;
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 1/1;
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
        height: 66%;
        max-height: 66%;
        aspect-ratio: 1/1;
        margin: 0 17%;
        overflow: hidden;
    }
    .bar {
        height: 17%;
    }
    .topbar {
        padding: 10% 19% 4% 19%;
        box-sizing: border-box;
    }
    .bottombar {
        padding: 3% 10% 10% 10%;
        box-sizing: border-box;
    }
</style>