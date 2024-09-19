import { get_all_slopes } from './keyframes.js';
import { parsed_stanzas, timestamps, timestamps_filename, words_filename, audio_filename, logo, keyframes_filename, fulltext_filename, logo_filename, keyframes, slopes, settings, all_words, timestamps_filename_from_stanza, keyframes_filename_from_stanza } from '../stores.js';
import { get } from 'svelte/store';
import * as Vosk from 'vosk-browser';


async function load_logo() {
    // load logo from the json file
    fetch(get(logo_filename))
        .then(response => response.json())
        .then(data => {
            logo.set(data);
    });
}

async function load_keyframes() {
    // load keyframes from the json file
    await fetch(get(keyframes_filename))
        .then(response => response.json())
        .then(data => {
            console.log("loaded keyframes:", data);
            keyframes.set(data);
            slopes.set(get_all_slopes(data));   
    });
}
async function fetch_keyframes_for_stanza(stanza) {
    let keyframes_filename = keyframes_filename_from_stanza(stanza);
    let keyframes = null;
    let slopes = null;
    await fetch(keyframes_filename)
        .then(response => response.json())
        .then(data => {
            keyframes = data;
            slopes = get_all_slopes(data);
    });
    return {keyframes: keyframes, slopes: slopes};
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
    // Return {word: "tis", written: "’Tis "}
    // A word_segment includes all punctuation and whitespace before the next word
    let word_segments = verse.match(/\b\w+(?:'\w+)?\W*/g)
    console.log("word_segments:", word_segments)
    
    // The first word_segment should also include any leading punctuation
    let nonword_prefix = verse.match(/^\W*/)
    
    // Trim leading whitespace
    nonword_prefix = nonword_prefix ? nonword_prefix[0].trim() : ""
    word_segments[0] = nonword_prefix + word_segments[0]
    
    // The words should be lowercase, allowing for contractions
    let words = word_segments.map(word => word.match(/\b\w+(?:'\w+)?/)[0].toLowerCase())

    // Remove apostrophes from the words for recognition in Vosk
    words = words.map(word => word.match(/\w+/)[0]) // remove apostrophes and trailing s
    
    // Zip words and their corresponding written segments
    return words.map((word, i) => {
        return {word: word, written: word_segments[i]}
    })
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
            let initial = word.word[0];
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
async function load_stanzas() {
    // load the mp3, png, and json for the stanza
    // load stanza[number]_words.json into the all_words store
    // from /poems/$poem/stanza[number]_words.json
    let stanzas;
    await fetch(get(fulltext_filename))
        .then(response => response.text())
        .then(data => {
            stanzas = parse_poem(data);
    });

    let speaker_cycle = get(settings).speaker_cycle;  // the user speaks every n chunks
    let cycle_idx = Math.floor(Math.random() * speaker_cycle); // init cycle_idx to a random number between 0 and speaker_cycle - 1

    // set the speaker and initials for each word
    for (let stanza of stanzas) {
        // measure the length (in words) of each verse
        let verse_lengths = [0];
        let current_verse = 0;
        for (let word of stanza) {
            if (word.verse !== current_verse) {
                current_verse += 1;
                verse_lengths.push(0);
            }
            verse_lengths[current_verse] += 1;
        }
        console.log("verse_lengths:", verse_lengths);
        // measure the length (in words) of each chunk
        // a verse is split into two chunks if it is more than 5 words long
        let chunk_lengths = [];
        for (let verse_len of verse_lengths) {
            if (verse_len <= 5) {
                chunk_lengths.push(verse_len);
            } else {
                let first_chunk_len = Math.ceil(verse_len / 2);
                chunk_lengths.push(first_chunk_len);
                chunk_lengths.push(verse_len - first_chunk_len);
            }
        }
        console.log("chunk_lengths:", chunk_lengths);
        // assert that the sum of the chunk lengths is equal to the length of the stanza
        let sum_chunk_lengths = chunk_lengths.reduce((a, b) => a + b, 0);
        if (sum_chunk_lengths !== stanza.length) {
            console.log("sum_chunk_lengths:", sum_chunk_lengths);
            console.log("stanza.length:", stanza.length);
        }
        for (let word of stanza) {
            // set the speaker
            word.speaker = cycle_idx % speaker_cycle === 0 ? 1 : 0;  // speaker=0 for narrator, speaker=1 for user
            // set initials
            if (Math.random() < get(settings).percent_question_mark && word.speaker === 1) {
                word.initial = "?";
            }
            // decrement the number of words remaining in our current chunk
            chunk_lengths[0] -= 1;
            // if we have finished our current chunk, move to the next speaker and pop the chunk
            if (chunk_lengths[0] === 0) {
                cycle_idx += 1;
                chunk_lengths.shift();
            }
        }
    }

    parsed_stanzas.set(stanzas);
    console.log("loaded parsed_stanzas:", get(parsed_stanzas));
}
async function load_timestamps() {
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
            console.assert(data.length === get(all_words).length, "timestamps and all_words should have the same length but have lengths", data.length, get(all_words).length);
            // check that they agree in every word
            for (let i = 0; i < data.length; i++) {
                if (get(all_words)[i].word !== data[i].word) {
                    console.error('word mismatch at index', i, get(all_words)[i], data[i]);
                }
                break;
            }
            timestamps.set(data);
    });
}
async function fetch_timestamps_for_stanza(stanza) {
    let timestamps_filename = timestamps_filename_from_stanza(stanza);
    let stanza_words = get(parsed_stanzas)[stanza-1];
    let timestamps = null;
    await fetch(timestamps_filename)
        .then(response => response.json())
        .then(data => {
            console.assert(data.length === stanza_words.length, "timestamps and all_words should have the same length but have lengths", data.length, stanza_words.length, data, stanza_words);
            // check that they agree in every word
            for (let i = 0; i < data.length; i++) {
                if (data[i].word !== stanza_words[i].word) {
                    console.error('word mismatch at index', i, stanza_words[i], data[i]);
                }
                break;
            }
            timestamps = data;
    });
    return timestamps;
}

let modelPromise = null;

function loadModel() {
  if (!modelPromise) {
    modelPromise = Vosk.createModel('model.tar.gz')
  }
  // Always return the promise, either already resolving or still pending
  return modelPromise;
}


export { load_keyframes, load_stanzas, load_timestamps, loadModel, load_logo, fetch_timestamps_for_stanza, fetch_keyframes_for_stanza };