<script>
    import Frame from './+layout.svelte';
    // loop and autoplay "vocalise_from_imslp.mp3"
    import { onMount } from 'svelte';
    onMount(() => {
        let audio = new Audio('vocalise_from_imslp.mp3');
        audio.loop = true;
        audio.autoplay = true;
        audio.muted = false;
        audio.play();
        // set volume to 0.5
        audio.volume = 0.5;
    });
</script>