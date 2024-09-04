<script>
    // A component for listening to the user's voice
    // A grammar can be passed to the component (these are the words that the user is expected to say)
    // The component will emit partial and final results

    import * as Vosk from 'vosk-browser';
    import { loadModel } from './loaders.js';
    export let mic_audioContext;
    export let mute_gain_node;
    export let grammar;
    export let source;
    const sampleRate = 16000;
    $: grammar_string = JSON.stringify(['[unk]', ...grammar]);
    // event emitter
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    import { onMount } from 'svelte';
    async function init() {
        const model = await loadModel();
        source.connect(mute_gain_node);
        
        const recognizer = new model.KaldiRecognizer(sampleRate, grammar_string);
        
        recognizer.on("result", (message) => {
            const result = message.result;
            // console.log(JSON.stringify(result, null, 2));
            // emit the final result
            console.log("final");
            dispatch('result', result);
            // TODO: update the grammar
        });
        recognizer.on("partialresult", (message) => {
            let partial_words;
            const partial = message.result.partial;
            // console.log(message);
            dispatch('partial', partial);
            // partial_words = partial.split(" ");
            // reveal every word that is in the partial result
            // for (let word of test_words) {
                // if (partial_words.includes(word.word)) {
                    // revealWord(word);
                // }
            // }
            // console.log(JSON.stringify(message.result, null, 2));
        });
        const recognizerNode = mic_audioContext.createScriptProcessor(4096, 1, 1)
        recognizerNode.onaudioprocess = (event) => {
            try {
                // don't listen unless it is the user's turn to speak
                recognizer.acceptWaveform(event.inputBuffer)
            } catch (error) {
                console.error('acceptWaveform failed', error)
            }
        }
        // source.connect(recognizerNode);
        mute_gain_node.connect(recognizerNode);
    }

    onMount(init);
</script>