<script>
    import FrameLayout from "../frameLayout.svelte";
    import TopBar from "./TopBar.svelte";
    import Chooser from "./Chooser.svelte";
</script>

<FrameLayout>
    <TopBar slot="topbar" />
    <Chooser />
</FrameLayout>