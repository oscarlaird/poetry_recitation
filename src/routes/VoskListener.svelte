<script>
    // A component for listening to the user's voice
    // A grammar can be passed to the component (these are the words that the user is expected to say)
    // The component will emit partial and final results

    import { onMount } from 'svelte';
    import { loadModel } from './recite/loaders.js';
    import { mute, grammar, partial_vosk_result } from './stores.js';
    // const sampleRate = 48000; This was the old sample rate for the recognizer; did I need this?
    onMount(async () => {
        // set up the microphone
        const sampleRate = 16000;
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                channelCount: 1,
                sampleRate
            },
        });
        let mic_audioContext = new AudioContext();
        let source = mic_audioContext.createMediaStreamSource(mediaStream);  // the microphone source
        const recognizerNode = mic_audioContext.createScriptProcessor(4096, 1, 1)
        // create a mute node
        let mute_gain_node = mic_audioContext.createGain();
        source.connect(mute_gain_node);
        mute_gain_node.connect(recognizerNode);
        // reactively mute when $mute changes
        let mute_subscriber_unsub = mute.subscribe(value => {
            mute_gain_node.gain.setValueAtTime(value, mic_audioContext.currentTime);
        });

        // load the model (the loadModel function makes sure we only load the model once)
        const model = await loadModel();
        let recognizer;

        // setup the recognizer
        let grammar_unsub = grammar.subscribe(value => {
            let start_time = Date.now();
            console.log("updating grammar");
            // cleanup the old recognizer
            if (recognizer) {
                recognizer.remove();
                recognizerNode.onaudioprocess = null;
            }
            // create a new recognizer for the grammar
            let grammar_string = JSON.stringify(['[unk]', ...value]);
            let new_recognizer = new model.KaldiRecognizer(sampleRate, grammar_string);
            // event emitters
            // new_recognizer.on("result", (message) => { dispatch('result', message.result); });
            new_recognizer.on("partialresult", (message) => { partial_vosk_result.set(message.result.partial); });
            recognizerNode.onaudioprocess = (event) => {
                try {
                    new_recognizer.acceptWaveform(event.inputBuffer);
                } catch (error) {
                    console.error('acceptWaveform failed', error)
                }
            }
            recognizer = new_recognizer;
            console.log("grammar update time", Date.now() - start_time);
        })


        return () => {
            mute_subscriber_unsub();
            grammar_unsub();
            // disconnect nodes
            recognizerNode.disconnect(); // I don't think this was ever connected
            mute_gain_node.disconnect();
            source.disconnect();
            // free the model
            recognizer.remove();
            // close the audio context
            mic_audioContext.close();
        }
    });

</script>