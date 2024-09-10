<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { tick } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut, linear, quadIn, quadOut, sineInOut, } from 'svelte/easing';
    import { lose_word, partial_vosk_result, stanza, verse, leading_idx, audio_filename, audio_filename_from_stanza, all_words, timestamps, parsed_stanzas, n_words, next_word, video_prog_value, lives, victory, settings, keyframes, slopes } from '../stores.js';
    import { make_spring, reset_spring, tick_spring } from "./spring_velocity_control";
    import { fetch_timestamps_for_stanza, load_stanzas, load_timestamps, load_keyframes, loadModel, fetch_keyframes_for_stanza } from './loaders';
    import { crossfade, fade, } from "svelte/transition";
    import { flip } from 'svelte/animate';
    const [send, receive] = crossfade({
        duration: d => Math.sqrt(d * 200)
    });
    // reset lives and victory
    lives.set(3);
    victory.set(0);
    // time
    let time = new Date();
    let start_time = time.getTime();
    $: elapsed_seconds = (time.getTime() - start_time) / 1000;
    let time_per_word = 6000; // 6 seconds
    let show_timer_threshold = 3000; // 3 seconds
    const remaining_time = tweened(time_per_word, { duration: time_per_word, easing: linear });
    // narrator audio ctx
    let narrator_audioContext;
    let narrator_audioBuffer;
    let narrator_source;
    // video_prog controls the position of the video
    // it is supposed to smooth out the discrete steps of $leading_idx
    // we have two objectives: be near to the user's position; stay near the user's average velocity
    // over a six second period we shift to simply using the user's average velocity
    // $: user_velocity_weight = (elapsed_seconds > 6.0) ? 1.0 : (elapsed_seconds / 6.0);
    let audio_duration = 30.0;
    $: user_velocity = $leading_idx / (elapsed_seconds + 0.1);
    $: recording_velocity = $n_words * 1.0 / audio_duration;
    $: user_velocity_weight = Math.min(1.0, elapsed_seconds / 6.0);
    $: target_velocity = user_velocity_weight * user_velocity + (1 - user_velocity_weight) * recording_velocity;
    $: target_video_prog = $leading_idx * 1.0;
    let video_prog = make_spring(0.3, 0.1, 0, 0); // must be manually animated with tick_spring
    // send value to the store
    $: video_prog_value.set($video_prog?.value || 0);
    //
    //
    function animate_spring() {
        if (video_prog !== null) {
            tick_spring(video_prog);
            video_prog.set(target_video_prog, target_velocity);
        }
        requestAnimationFrame(animate_spring);
    }
    async function revealNextWord() {
        let old_speaker = $next_word.speaker;
        // $next_word.revealed = true;
        // we can't mutate the store directly
        // and we don't want to replace w/ a copied dict since
        // we want to mutate the underlying all_words
        leading_idx.update(i => i + 1);
        remaining_time.update((target_val, t) => {return time_per_word}, { duration: 0 }); // reset the timer to full.
        // reached end of stanza
        if ($leading_idx >= $n_words) {
            // allow for the revealed word to transition before moving to the next stanza
            await tick();
            verse.update(v => v + 1);
            // exit to main menu if we have reached the end of the poem
            if ($stanza >= $parsed_stanzas.length) {
                console.log('victory');
                victory.set(1);
                return;
            }
            load_stanza($stanza + 1); // fetches data before moving to the next stanza
            return;  // we are done with the current stanza; don't do anything else
        }
        // move to the next line if the verse has changed or if we have reach the end of the stanza
        if ($next_word.verse !== $verse) {
            // allow for the revealed word to transition before moving to the next line
            await tick();
            // sleep 200ms before advancing to the next verse
            await new Promise(resolve => setTimeout(resolve, 200));
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
                lives.update(l => l - 1);
                if ($lives === 0) {
                    lose_word.set($next_word);
                    victory.set(-1);
                }
                // we'd like to just change the upcoming word's speaker to 0 and run the narrator's turn
                revealNextWord();
            });
        }
    }
    async function handlePartial(partial) {
        let partial_words;
        partial_words = partial.split(" ");
        let spoken;
        // reveal up to ten leading word(s) if they have been spoken
        for (let i = 0; i < 10; i++) {
            spoken = $next_word && partial_words.includes($next_word.word);
            // spoken = spoken || $timestamps?.[leading_idx]?.alternatives?.some(a => partial_words.includes(a.word));
            spoken = spoken || ($timestamps && $timestamps.length > $leading_idx && $timestamps[$leading_idx]?.alternatives?.some(a => partial_words.includes(a)));
            console.log($timestamps, $leading_idx, $timestamps[$leading_idx]);
            if (!spoken) {
                break;
            }
            if ($next_word.speaker === 0) {
                // stop if it is the narrator's turn
                break;
            }
            await revealNextWord();
        }
    }
    $: handlePartial($partial_vosk_result); // trigger when vosk's partial result changes
    $: console.log($partial_vosk_result);
    //
    async function play_clip(start_word_idx, stop_word_idx) {
        // play the audio from start_word_idx to stop_word_idx
        // wait for the audio to finish
        let start_time = $timestamps[start_word_idx].start - 0.02;
        let stop_time = $timestamps[stop_word_idx].end;
        // console.log('playing from', start_time, 'to', stop_time);
        narrator_source = narrator_audioContext.createBufferSource();
        narrator_source.buffer = narrator_audioBuffer;
        narrator_source.connect(narrator_audioContext.destination);
        narrator_source.start(0, start_time, stop_time - start_time);
        // pause the audio after stop_time
        // mute the audio after stop_time
        // don't resolve until the audio is done playing
        let finish_promise = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, (stop_time - start_time)*1000);
        });
        // reveal the words as they are spoken
        for (let i = start_word_idx; i <= stop_word_idx; i++) {
            setTimeout(async () => {
                await revealNextWord();
            }, ($timestamps[i].start - start_time)*1000);
        }
        return finish_promise;
    }
    async function narrator_turn() {
        if ($victory === -1) {
            return; // don't narrate if the user has lost
        }
        // first we assert that next_word.speaker === 0
        console.assert($next_word.speaker === 0, 'It is not the narrator\'s turn');
        // turn off the user's microphone
        // calculate start and stop words
        let start_word_idx = $leading_idx;
        let stop_word_idx = $leading_idx + 1;
        while (stop_word_idx < $n_words && $all_words[stop_word_idx].speaker === 0) {
            stop_word_idx += 1;
        }
        stop_word_idx -= 1; // we don't want to include the first word of the next turn
        // stop_word_idx is the last word that should be spoken
        // play the clip and wait for it to finish
        await play_clip(start_word_idx, stop_word_idx);
    }
    let load_promise = new Promise((resolve) => {});

    async function load_stanza(next_stanza) {
        // load audio and timestamps and start the narrator's turn
        console.log('loading stanza', $stanza);
        let load_stanza_start_time = new Date().getTime();
        let next_stanza_audio_filename = audio_filename_from_stanza(next_stanza);
        // narrator audio ctx
        narrator_audioBuffer = await fetch(next_stanza_audio_filename)
            .then(response => response.arrayBuffer())
            .then(buffer => narrator_audioContext.decodeAudioData(buffer));
        audio_duration = narrator_audioBuffer.duration;
        // TODO, perform these in parallel
        let new_timestamps = await fetch_timestamps_for_stanza(next_stanza);
        let new_keyframes_and_new_slopes = await fetch_keyframes_for_stanza(next_stanza);
        $stanza = next_stanza;
        $leading_idx = 0;
        $verse = 0;
        timestamps.set(new_timestamps);
        keyframes.set(new_keyframes_and_new_slopes.keyframes);
        slopes.set(new_keyframes_and_new_slopes.slopes);
        await tick(); // wait for target_video_prog to be updated (should be 0, target velocity should be ~2-4 words per second)
        reset_spring(video_prog, target_video_prog, target_velocity);
        let load_stanza_end_time = new Date().getTime();
        console.log('loaded stanza', $stanza, 'in', load_stanza_end_time - load_stanza_start_time, 'ms');
        // sleep to make sure we wait at least 1000ms between stanzas
        if (load_stanza_end_time - load_stanza_start_time < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - (load_stanza_end_time - load_stanza_start_time)));
        }
        if ($next_word.speaker === 0) {
            narrator_turn();
        }
    }
    onMount(async () => {
        await load_stanzas();
        narrator_audioContext = new AudioContext();
        load_promise = load_stanza(1);
        // manually run the updates for velocity controlled spring
        animate_spring();
        // refresh the time to trigger reactive updates of time (used for the timer)
        const interval = setInterval(() => {
            time = new Date();
        }, 50);
        return () => clearInterval(interval);
    });
</script>

{#await load_promise}
{:then _}
    <div class="bar"
    >
        {#if $remaining_time < show_timer_threshold}
            <progress class="timer" value={$remaining_time} max={show_timer_threshold}></progress>
        {/if}
        <!--
            <progress class="word_count" value={$leading_idx} max={$n_words}></progress>
        -->

        <div class="right_box box" 
        >
            {#each $all_words.slice($leading_idx, $n_words).filter(w => !w.revealed && w.verse === $verse) as word (word.id)}
                <div class="letterbox" class:we_speak={word.speaker===1} class:they_speak={word.speaker===0}
                    animate:flip={{duration: 350}}
                    out:send={{key: word.id}}
                    in:fade={{duration: 300, easing: quadOut}}
                    aria-label="Reveal"
                    role="button"
                    tabindex="0"
                    on:click={async () => await revealNextWord()}
                    on:keydown={async (e) => e.key === 'Enter' && await revealNextWord()}
                >
                    {word.initial}
                </div>
            {/each}
            <!-- invisible place holder letter box to maintain the height of this div -->
            <div class="letterbox" style="visibility: hidden;">
                A
            </div>
        </div>
        <div class="left_box box"
         >    
            {#each $all_words.slice(0, $leading_idx).filter(w => w.verse === $verse) as word (word.id)}
                <div class="wordbox"
                    in:receive={{key: word.id}}
                    out:fade={{duration: 300, easing: quadIn}}
                >
                    {@html word.written.replace(/ /g, '&nbsp;')}
                </div>
            {/each}
        </div>
    </div>
{/await}

<style>
    @font-face {
        font-family: 'Kingthings Calligraphica 2';
        src: url('/fonts/kingthings-calligraphica.2.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    .bar {
        font-size: 2rem;
        height: 100%;
        position: relative;
        /* font */
        text-align: center;
        font-family: 'Kingthings Calligraphica 2'; 
        /* flex */
        display: flex;
        /* flex-direction: row; */
        flex-direction: column;
        /* justify-content: right; */
        align-items: center;
        /* centered text */
        text-justify: center;
        z-index: 3;  /* above the image */
    }
    .box {
        display: flex;
    }
    .left_box {
        position: absolute;
        width: 100%;
        justify-content: left;
        align-content: flex-end;
        flex-wrap: wrap;
        padding: 0 4px;
        box-sizing: border-box;
        transform: translateY(-100%);
        backdrop-filter: brightness(3.0) blur(1.5px) contrast(0.6);
    }
    .right_box {
       /* position: absolute; */
       height: 100%;
       position: relative;
       width: 100%;
       justify-content: left; 
       align-content: center;
       display: flex;
       flex-flow :row nowrap;
    }
    .letterbox {
        border: 1px solid black;
        box-sizing: border-box;
        height: 48px;
        font-size: 1.3em;
        min-width: 1.3em;
        aspect-ratio: 1/1;
        margin: 5px 5px;
        /* Center text horizontally and vertically; */
        display: flex;
        justify-content: center;
        align-items: center;
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
        margin: 4px 0;
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
    }
    .timer::-webkit-progress-value,
    .timer::-moz-progress-bar {
        background-color: rgb(148, 57, 57);
    }
    /* set the color of the progress bar for the timer */
    @media (min-width: 768px) {
        /* smaller font on tablet since now we have the frame */
        .bar {
            font-size: 1.5rem;
        }
        /* Put the words and letters on the same line */
        .left_box {
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            justify-content: left;
            align-content: center;
            transform: none;
            backdrop-filter: none;
        }
        .right_box {
            height: 100%;
            position: absolute;
            right: 0;
            top: 0;
            justify-content: right;
            align-content: center;
            /* border: 5px solid red; */
        }
        .right_box .letterbox:last-child {
            /* hide the placeholder letterbox since we are putting everything on the same line */
            display: none;
        }
        .letterbox {
            height: 100%;
            margin: 0 5px 0 0;
        }
    }
    @media (min-width: 1024px) {
        /* We again increase the font size for desktop */
        .bar {
            font-size: 2rem;
        }
    }


</style>