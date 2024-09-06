import { get_all_slopes } from './keyframes.js';
import { parsed_stanzas, timestamps, timestamps_filename, words_filename, audio_filename, keyframes_filename, fulltext_filename, keyframes, slopes, settings, all_words } from '../stores.js';
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
// parsing the words from the poem
function split_stanzas(poem) {
    // split on arbitrary number of newline separators
    return poem.split(/\n\s*\n/);
}
function split_verses(stanza) {
    // split on newline separators
    return stanza.split(/\n/);
}
function parse_verse(verse) {
    // return {word: "tis", written: "’Tis "}
    // a word_segment includes all punctuation and whitespace before the next word
    let word_segments = verse.match(/\w+\W*/g)
    // the first word_segment should also include any leading punctuation
    let nonword_prefix = verse.match(/^\W*/)
    // trim leading whitespace
    nonword_prefix = nonword_prefix ? nonword_prefix[0].trim() : ""
    word_segments[0] = nonword_prefix + word_segments[0]
    // the words should be lowercase
    let words = word_segments.map(word => word.match(/\w+/)[0].toLowerCase())
    // zip
    return words.map((word, i) => {return {word: word, written: word_segments[i]}})
    
}
function parse_poem(poem) {
    let stanzas = [];
    let stanza_no = 0;
    let verse_no = 0;
    let word_id = 0;
    for (let stanza of split_stanzas(poem)) {
      let stanza_words = [];
      let current_speaker = 0; // Start with the narrator
      for (let verse of split_verses(stanza)) {
        let words = parse_verse(verse);
        for (let word of words) {
            // set question marks
            let initial = Math.random() < get(settings).percent_question_mark && current_speaker === 1 ? "?" : word.word[0];
            stanza_words.push({stanza: stanza_no, verse: verse_no, id: word_id, speaker: current_speaker, initial: initial, ...word});
            word_id += 1;
            // alternate speakers
            if (Math.random() < 0.2) { 
                current_speaker = 1 - current_speaker;
            }
        }
        verse_no += 1;
      }
      stanzas.push(stanza_words);
      stanza_no += 1;
      verse_no = 0;
    }
    return stanzas;
}
async function load_stanza() {
    // load the mp3, png, and json for the stanza
    // load stanza[number]_words.json into the all_words store
    // from /poems/$poem/stanza[number]_words.json
    let stanzas;
    await fetch(get(fulltext_filename))
        .then(response => response.text())
        .then(data => {
            stanzas = parse_poem(data);
    });

    for (let stanza of stanzas) {
        const transition_prob = 0.3;
        let current_speaker = 0; // Start with the narrator
        for (let i = 0; i < stanza.length; i++) {
            stanza[i].speaker = current_speaker;
            // TEST: 
            stanza[i].speaker = 0;
            if (Math.random() < transition_prob) { // TODO: we need to achieve settings.words_required
                current_speaker = 1 - current_speaker;
            }
            // set initials
            if (Math.random() < get(settings).percent_question_mark && stanza[i].speaker === 1) {
                stanza[i].initial = "?";
            }
        }
    }

    parsed_stanzas.set(stanzas);
    console.log("loaded parsed_stanzas:", get(parsed_stanzas));
}
async function load_mp3() {
    // get the buffer for this file
    // const response = await fetch(get(audio_filename));
    // const buffer = await response.arrayBuffer();
    // read the tags
    // const m = new MP3Tag2(buffer, true);
    // m.read();
    // let lyrics = m.tags.v2.SYLT[0].data;
    // timestamps.set(lyrics);
    // console.log(lyrics);

    // simply read the lyrics from the timestamps file
    await fetch(get(timestamps_filename))
        .then(response => response.json())
        .then(data => {
            timestamps.set(data);
    });
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