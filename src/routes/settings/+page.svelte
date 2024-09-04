<script>
    import FrameLayout from "../frameLayout.svelte";
    import TopBar from "./TopBar.svelte";
    import Difficulty from "../Difficulty.svelte";
    import BottomBar from "./BottomBar.svelte";
</script>

<FrameLayout>
    <TopBar slot="topbar" />
    <Difficulty />
    <BottomBar slot="bottombar" />
</FrameLayout>