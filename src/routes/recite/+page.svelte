<script>
    import FrameLayout from "../frameLayout.svelte";
    import BottomBar from ".//BottomBar.svelte";
    import TopBar from "./TopBar.svelte";
    import InnerImage from "./InnerImage.svelte";
    import { stanza } from "../stores.js";


</script>

<FrameLayout>
    <div slot="topbar" class="topbar">
        <TopBar />
    </div>

    <div class="inner">
        {#key $stanza}
            <InnerImage />
        {/key}
    </div>

    <div slot="bottombar" class="bottombar">
        {#key $stanza}
            <BottomBar />
        {/key}
    </div>
</FrameLayout>


<style>
    div {
        height: 100%;
    }
    .inner {
        background: black;
    }
</style>