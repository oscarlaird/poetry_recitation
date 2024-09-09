<script>
    import FrameLayout from "../frameLayout.svelte";
    import BottomBar from ".//BottomBar.svelte";
    import TopBar from "./TopBar.svelte";
    import InnerImage from "./InnerImage.svelte";
    import VictoryBox from "./VictoryBox.svelte";
    import DefeatBox from "./DefeatBox.svelte";
    import { stanza, level, victory, music_filename } from "../stores.js";
    import { tweened } from "svelte/motion";
    import { onMount } from 'svelte';
    import * as Tone from 'tone';
    import { quartInOut } from "svelte/easing";
    import GameOverBottomBar from "./GameOverBottomBar.svelte";

    let detune = tweened(0, {});
    let pr = tweened(1, {});
    let pitchShift;
    let player;
    let detuned = false;

    onMount(() => {
        pitchShift = new Tone.PitchShift(0);
        pitchShift.toDestination();
        player = new Tone.Player($music_filename).connect(pitchShift);
        player.loop = true;
        player.autostart = true;
        player.volume.value = -6;
        player.muted = false;
        victory.subscribe(value => {
            if (value === -1) {
                devils();
            } 
        });
        return () => {
            // stop the music when we leave the recite page
            player.stop();
            pitchShift.dispose();
        }
    });


    function devils() {
        // playbackRate = 2;   raise one octave (12 semitones)
        // pitch = -18;        lower 18 semitones
        // net = -6 semitones (devils interval)
        const duration = 5000;
        const easing = quartInOut;
        // update returns a promise that resolves when the tweening is done
        let update = detune.update(() => -18, { duration: duration, easing: easing });
        // subscribe accepts a callback and returns the unsubscribe function
        let unsub = detune.subscribe(value => {
            pitchShift.pitch = value;
        });
        update.then(() => {
            unsub();
        });
        // 
        let pr_update = pr.update(() => 2, { duration: duration, easing: easing });
        let pr_unsub = pr.subscribe(value => {
            player.playbackRate = value;
        });
        pr_update.then(() => {
            pr_unsub();
        });
    }

</script>

<FrameLayout>
    <div slot="topbar" class="topbar">
        <TopBar />
    </div>

    <div class="inner">
        {#if $victory === 1}
            <VictoryBox />
        {/if}
        {#if $victory === -1}
            <DefeatBox />
        {/if}
        <InnerImage />
    </div>

    <div slot="bottombar" class="bottombar">
        {#if $victory !== 0}
            <GameOverBottomBar 
            />
        {:else}
            <BottomBar />
        {/if}

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