import { get_all_slopes } from './keyframes.js';
import { all_words, timestamps, words_filename, audio_filename, keyframes_filename, keyframes, slopes, settings } from '../stores.js';
import { get } from 'svelte/store';
import MP3Tag2 from 'mp3tag.js';
import * as Vosk from 'vosk-browser';


async function load_keyframes() {
    // load keyframes from the json file
    fetch(get(keyframes_filename))
        .then(response => response.json())
        .then(data => {
            keyframes.set(data);
            slopes.set(get_all_slopes(data));   
    });
}

async function load_stanza() {
    // load the mp3, png, and json for the stanza
    // load stanza[number]_words.json into the all_words store
    // from /poems/$poem/stanza[number]_words.json
    const transition_prob = 0.3;
    await fetch(get(words_filename))
        .then(response => response.json())
        .then(data => {
            // set speakers
            let current_speaker = 0; // Start with the narrator
            for (let i = 0; i < data.length; i++) {
                data[i].speaker = current_speaker;
                if (Math.random() < transition_prob) { // TODO: we need to achieve settings.words_required
                    current_speaker = 1 - current_speaker;
                }
                // set initials
                if (Math.random() < get(settings).percent_question_mark && data[i].speaker === 1) {
                    data[i].initial = "?";
                }
            }
            all_words.set(data);
    });
    console.log("loaded all_words:", get(all_words));
}
async function load_mp3() {
    // get the buffer for this file
    const response = await fetch(get(audio_filename));
    const buffer = await response.arrayBuffer();
    // read the tags
    const m = new MP3Tag2(buffer, true);
    m.read();
    let lyrics = m.tags.v2.SYLT[0].data;
    timestamps.set(lyrics);
    console.log(lyrics);
}

let modelPromise = null;

function loadModel() {
  if (!modelPromise) {
    modelPromise = Vosk.createModel('model.tar.gz')
  }
  // Always return the promise, either already resolving or still pending
  return modelPromise;
}


export { load_keyframes, load_stanza, load_mp3, loadModel };