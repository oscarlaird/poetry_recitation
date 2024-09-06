<script>
    import FrameLayout from "../frameLayout.svelte";
    import BottomBar from ".//BottomBar.svelte";
    import TopBar from "./TopBar.svelte";
    import InnerImage from "./InnerImage.svelte";
    import { stanza } from "../stores.js";
    import { tweened } from "svelte/motion";
    import { onMount } from 'svelte';
    import * as Tone from 'tone';
    import { quartInOut } from "svelte/easing";

    let detune = tweened(0, {});
    let pr = tweened(1, {});
    let pitchShift;
    let player;

    onMount(() => {
        console.log('mounted');
        pitchShift = new Tone.PitchShift(0);
        pitchShift.toDestination();
        player = new Tone.Player("vocalise_from_imslp.mp3").connect(pitchShift);
        player.loop = true;
        player.autostart = true;
        player.volume.value = -6;
        player.muted = false;

    });

    function devils() {
        // playbackRate = 2;   raise one octave (12 semitones)
        // pitch = -18;        lower 18 semitones
        // net = -6 semitones (devils interval)
        let update = detune.update(() => -18, { duration: 5000, easing: quartInOut });
        let unsub = detune.subscribe(value => {
            pitchShift.pitch = value;
            console.log(value);
        });
        update.then(() => {
            unsub();
        });
        // 
        let pr_update = pr.update(() => 2, { duration: 5000, easing: quartInOut });
        let pr_unsub = pr.subscribe(value => {
            player.playbackRate = value;
            console.log(value);
        });
        pr_update.then(() => {
            pr_unsub();
        });
    }

</script>

<button on:click={devils}>Devils</button>

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