<script>
    import FrameLayout from "../frameLayout.svelte";
    import TopBar from "./TopBar.svelte";
    import Chooser from "./Chooser.svelte";
    import BottomBar from "./BottomBar.svelte";
</script>

<FrameLayout>
    <TopBar slot="topbar" />
    <Chooser />
    <BottomBar slot="bottombar" />
</FrameLayout>