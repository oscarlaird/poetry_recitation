<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import VoskListener from './VoskListener.svelte';
    import { tick } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { linear } from 'svelte/easing';
    import { stanza, verse, leading_idx, audio_filename, all_words, timestamps, n_words, next_word, video_prog_value, lives, victory, settings } from '../stores.js';
    import { make_spring, tick_spring } from "./spring_velocity_control";
    import { load_stanza, load_mp3, loadModel } from './loaders';
    import { crossfade, fade, fly } from "svelte/transition";
    const [send, receive] = crossfade({
        duration: d => Math.sqrt(d * 200)
    });
    // time
    let time = new Date();
    let start_time = time.getTime();
    $: elapsed_seconds = (time.getTime() - start_time) / 1000;
    let time_per_word = 6000; // 6 seconds
    let show_timer_threshold = 3000; // 3 seconds
    const remaining_time = tweened(time_per_word, { duration: time_per_word, easing: linear });
    // microphone
    let mic_audioContext;  // audio context for the microphone for the vosk listener
    let mute_gain_node;  // gain node in between the microphone and the vosk listener
    let audio;
    let source;
    // video_prog controls the position of the video
    // it is supposed to smooth out the discrete steps of $leading_idx
    // we have two objectives: be near to the user's position; stay near the user's average velocity
    // over a six second period we shift to simply using the user's average velocity
    // $: user_velocity_weight = (elapsed_seconds > 6.0) ? 1.0 : (elapsed_seconds / 6.0);
    let audio_duration = 30.0;
    $: user_velocity = $leading_idx / (elapsed_seconds + 0.1);
    $: recording_velocity = $n_words * 1.0 / audio_duration;
    $: user_velocity_weight = 1.0;
    $: target_velocity = user_velocity_weight * user_velocity + (1 - user_velocity_weight) * recording_velocity;
    $: video_prog.set($leading_idx * 1.0, target_velocity);
    let video_prog = make_spring(0, 0.3, 0.1, 0, 0); // must be manually animated with tick_spring
    // send value to the store
    $: video_prog_value.set($video_prog.value);
    //
    //
    function animate_spring() {
        tick_spring(video_prog);
        video_prog.set($leading_idx * 1.0, target_velocity);
        requestAnimationFrame(animate_spring);
    }
    async function revealNextWord() {
        let old_speaker = $next_word.speaker;
        // $next_word.revealed = true;
        // we can't mutate the store directly
        // and we don't want to replace w/ a copied dict since
        // we want to mutate the underlying all_words
        all_words.update(words => {
            words[$leading_idx].revealed = true;
            return words;
        });
        leading_idx.update(i => i + 1);
        remaining_time.update((target_val, t) => {return time_per_word}, { duration: 0, easing: linear }); // reset the timer to full.
        // move to the next stanza
        if ($leading_idx >= $n_words) {
            // allow for the revealed word to transition before moving to the next stanza
            await tick();
            verse.update(v => v + 1);
            // allow for the verse to transition before updating the stanza
            await tick();
            stanza.update(s => s + 1);
            verse.update(v => 0);
            leading_idx.set(0);
            return;  // we are done with the current stanza; don't do anything else
        }
        // move to the next line if the verse has changed or if we have reach the end of the stanza
        if ($leading_idx >= $n_words || $next_word.verse !== $verse) {
            // allow for the revealed word to transition before moving to the next line
            await tick();
            verse.update(v => v + 1);
        }
        // start the narrator's turn if the user has finished speaking their last word
        if ($next_word.speaker === 0 && old_speaker === 1) {
            narrator_turn();
        }
        // set the timer
        if ($next_word?.speaker === 1 && $victory===0) {
            // remaining_time.update((target_val, t) => {return time_per_word}, { duration: 0, easing: linear });
            remaining_time.update((target_val, t) => {return 0}, { duration: time_per_word, easing: linear })
            .then(() => {
                revealNextWord();
                lives.update(l => l - 1);
                if ($lives === 0) {
                    console.log('game over');
                    victory.set(-1);
                }
            });
        }
    }
    async function handlePartial(e) {
        let partial_words;
        const partial = e.detail;
        partial_words = partial.split(" ");
        // reveal the leading word(s) if they have been spoken
        while (partial_words.includes($next_word.word)) {
            if ($next_word.speaker === 0) {
                // stop if it is the narrator's turn
                break;
            }
            await revealNextWord();
        }
    }
    //
    async function play_clip(start_word_idx, stop_word_idx) {
        // pull the SYLT tags from the mp3
        // play the audio from start_word_idx to stop_word_idx
        // wait for the audio to finish
        //
        let start_time = $timestamps[start_word_idx].time;
        let stop_time = stop_word_idx < $timestamps.length ? $timestamps[stop_word_idx].time : audio.duration * 1000;
        // play the audio from start_time to stop_time
        audio.currentTime = start_time / 1000.0 - 0.02;    
        stop_time -= 0.02;  // shave 20ms to avoid hearing the start of the next word
        audio.play();
        audio.muted = false;
        // pause the audio after stop_time
        console.log('playing from', start_time, 'to', stop_time);
        // reveal the words as they are spoken
        for (let i = start_word_idx; i < stop_word_idx; i++) {
            setTimeout(async () => {
                await revealNextWord();
            }, $timestamps[i].time - start_time);
        }
        // mute the audio after stop_time
        // don't resolve until the audio is muted
        return new Promise((resolve) => {
            setTimeout(() => {
                audio.muted = true;
                resolve();
            }, (stop_time - start_time));
        });
    }
    async function narrator_turn() {
        // first we assert that next_word.speaker === 0
        console.assert($next_word.speaker === 0, 'It is not the narrator\'s turn');
        // turn off the user's microphone
        // with audio source.disconnect();

        // calculate start and stop words
        let start_word_idx = $leading_idx;
        let stop_word_idx = $leading_idx + 1;
        while (stop_word_idx < $n_words && $all_words[stop_word_idx].speaker === 0) {
            stop_word_idx += 1;
        }
        // play the clip and wait for it to finish
        // mic_audioContext.suspend();
        mute_gain_node.gain.setValueAtTime(0.0, mic_audioContext.currentTime);
        await play_clip(start_word_idx, stop_word_idx);
        mute_gain_node.gain.setValueAtTime(1.0, mic_audioContext.currentTime);
        // mic_audioContext.resume();
        // reset the user's timer
    }
    async function load_mic() {
        // set up the microphone
        const sampleRate = 16000;
        console.log('A');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                channelCount: 1,
                sampleRate
            },
        });
        console.log('B');
        mic_audioContext = new AudioContext();
        source = mic_audioContext.createMediaStreamSource(mediaStream);
        mute_gain_node = mic_audioContext.createGain();
    }
    async function load_data() {
        await Promise.all([
            load_stanza(),
            load_mp3(),
            loadModel()
        ]);
        // assert that $all_words and $timestamps are the same length
        console.assert($n_words === $timestamps.length, 'The number of words and timestamps do not match', `n_words: ${$n_words}, timestamps: ${$timestamps.length}`);
        console.log('data loaded');
    }
    let load_promise = new Promise((resolve) => {});
    let mic_promise;
    onMount(async () => {
        audio = new Audio($audio_filename);
        audio.muted = true;
        // load the lyrics, timestamps, and vosk model
        load_promise = load_data();
        mic_promise = load_mic();
        // narrator's turn once the data is loaded (so we can see the words) and the mic is ready (so we can mute it)
        await Promise.all([load_promise, mic_promise]).then(
            () => {
                // if $stanza>1, then sleep two seconds
                if ($next_word.speaker === 0) {
                    if ($stanza > 1) {
                        setTimeout(() => {
                            narrator_turn();
                        }, 2000);
                    } else {
                        narrator_turn();
                    }
                }
                console.log('data and mic loaded');
            }
        )
        // manually run the updates for velocity controlled spring
        animate_spring();
        // refresh the time to trigger reactive updates
        const interval = setInterval(() => {
            time = new Date();
        }, 50);
        return () => clearInterval(interval);
    });
</script>

<!-- TODO why does the out:fade require this wrapper. It can't be on bar. -->
<div class="wrapper"
    out:fade={{delay: 0, duration: 400}}
>
{#await load_promise}
{:then data}
    <VoskListener grammar={$all_words.map(w => w.word)} bind:mic_audioContext bind:mute_gain_node bind:source
        on:partial={handlePartial}
    />
    <div class="bar"
        in:fade={{delay: $stanza>1 ? 2000 : 0, duration: 400}}
    >
        {#if $remaining_time < show_timer_threshold}
            <progress class="timer" value={$remaining_time} max={show_timer_threshold}></progress>
        {/if}
        <!--
            <progress class="word_count" value={$leading_idx} max={$n_words}></progress>
        -->

        {#key $verse}
        <div class="left_box box" out:fly={{delay: 400, duration: 400, x: 0, y: +60, easing: linear}} in:fly={{delay: 400, duration: 400, x: 0, y: -60, easing: linear}} >    
            {#each $all_words.filter(w => w.revealed && w.verse === $verse) as word (word.id)}
                <div class="wordbox"
                    in:receive={{key: word.id}}
                >
                    {@html word.written}
                </div>
            {/each}
        </div>
        <div class="right_box box" out:fly={{delay: 400, duration: 400, x: 0, y: +60, easing: linear}} in:fly={{delay: 400, duration: 400, x: 0, y: -60, easing: linear}} >
            {#each $all_words.filter(w => !w.revealed && w.verse === $verse) as word (word.id)}
                <div class="letterbox" class:we_speak={word.speaker===1} class:they_speak={word.speaker===0}
                    out:send={{key: word.id}}
                    aria-label="Reveal"
                    role="button"
                    tabindex="0"
                    on:click={async () => await revealNextWord()}
                    on:keydown={async (e) => e.key === 'Enter' && await revealNextWord()}
                >
                    {word.initial}
                </div>
            {/each}
        </div>
        {/key}
    </div>
    <!--
-->
{/await}
</div>

<style>
    @font-face {
        font-family: 'Kingthings Calligraphica 2';
        src: url('/fonts/kingthings-calligraphica.2.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    .wrapper {
        height: 100%;
    }
    .bar {
        height: 100%;
        background-color: white;
        box-shadow: 0 0 15px 15px white;
        position: relative;
        /* font */
        text-align: center;
        font-family: 'Kingthings Calligraphica 2'; 
        /* flex */
        display: flex;
        flex-direction: row;
        justify-content: right;
        align-items: center;
        /* centered text */
        text-justify: center;
    }
    .box {
        display: flex;
        position: absolute;
        margin: 10px;
    }
    .left_box {
        left: 0;
        justify-content: left;
        flex-wrap: nowrap;
    }
    .right_box {
       position: absolute;
       right: 0;
       justify-content: right; 
    }
    .letterbox {
        border: 1px solid black;
        font-size: 1.3em;
        width: 1em;
        margin: 3px;
        aspect-ratio: 1/1;
    }
    .we_speak {
        color: black;
        border-color: black;
    }
    .they_speak {
        color: gray;
        border-color: gray;
    }
    .wordbox {
        flex: 0 0 auto; /* don't shrink, even if we go past the end of the line */
    }
    @media (min-width: 320px) {
        .bar {
            font-size: 1em;
        }
    }
    @media (min-width: 768px) {
        .bar {
            font-size: 1.5em;
        }
    }
    progress {
        display: block;
        position: absolute;
        width: 100%;
        height: 3px;
        border-radius: 3px;
    }
    progress[value]::-webkit-progress-bar,
    progress[value]::-moz-progress-bar {
        border-radius: 3px;
    }
    .timer {
        top: 0;
        transform: translateY(-5px);
    }
    .word_count {
        bottom: 0;
        transform: translateY(+5px);
    }
    .timer::-webkit-progress-value,
    .timer::-moz-progress-bar {
        background-color: rgb(148, 57, 57);
    }
    .word_count::-webkit-progress-value,
    .word_count::-moz-progress-bar {
        background-color: rgb(63, 119, 58);
    }
    /* set the color of the progress bar for the timer */

</style>