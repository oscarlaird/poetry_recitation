<script>
    import { stanza, image_filename, image_trash_filename, keyframes, slopes, video_prog_value, victory } from '../stores.js';
    import { interpolate_all } from './keyframes.js';
    import { load_keyframes } from './loaders.js';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { tweened } from 'svelte/motion';
    import { linear, quadIn, sineInOut } from 'svelte/easing';
    // $: pos = interpolate_all($video_prog.value, $keyframes, $slopes);
    // guard against null values
    $: pos = $keyframes && $slopes ? interpolate_all($video_prog_value, $keyframes, $slopes) : {x: 0, y: 0, z: 0};
    // let pos = {x: 1024, y: 1024, z: 1024};

    // overrides
    let zoom_override = null;
    let x_override = null;
    let y_override = null;

    let max_x = 2048;

    $: z = (zoom_override && $zoom_override) || pos.z;
    $: x = (x_override && $x_override) || pos.x;
    $: y = (y_override && $y_override) || pos.y;


    $: frame_width = z;
    $: x_frames = x / frame_width;
    $: y_frames = y / frame_width;
    $: max_x_frames = max_x / frame_width;
    function clamp(x, min, max) {
        return Math.max(min, Math.min(x, max));
    }
    //  center shouldn't be w/in half a frame of the edge
    $: x_frames_clamped = clamp(x_frames, 0.5, max_x_frames - 0.5);
    $: y_frames_clamped = clamp(y_frames, 0.5, max_x_frames - 0.5);

    let keyframe_promise = new Promise(() => {});
    onMount(async () => {
        keyframe_promise = load_keyframes();
    });

    $: if ($victory === -1 && !zoom_override) { // why do I need the guard?
        console.log("setting zoom override", $victory);
        zoom_override = tweened(pos.z, {duration: 4000, easing: sineInOut});
        x_override = tweened(pos.x, {duration:    4000, easing: sineInOut});
        y_override = tweened(pos.y, {duration:    4000, easing: sineInOut});
        zoom_override.set(2048);
        x_override.set(1024);
        y_override.set(1024);
    }
</script>

{#await keyframe_promise}
{:then data}
    {#key $image_filename}
    <div class="image_box" 
        style={`background-image: url("${$image_filename}")`}
        style:left={-(x_frames_clamped-0.5) * 100 + "%"}
        style:top={- (y_frames_clamped-0.5) * 100 + "%"}
        style:height={max_x_frames * 100 + "%"}
        in:fade|global={{duration: 600, easing: quadIn}}
    />
    {/key}
    {#if $victory===-1}
    <div class="image_box" 
        style={`background-image: url("${$image_trash_filename}")`}
        style:left={-(x_frames_clamped-0.5) * 100 + "%"}
        style:top={- (y_frames_clamped-0.5) * 100 + "%"}
        style:height={max_x_frames * 100 + "%"}
        in:fade={{duration: 4000, easing: sineInOut}}
    />
    {/if}
{/await}

<style>
    .image_box {
        position: absolute;
        aspect-ratio: 1 / 1;
        background-size: cover;
        z-index: 1;
    }
</style>