import { get, writable, derived } from 'svelte/store';
import { poems_metadata } from '../lib/poems_metadata';
import { test_difficulty_settings } from './test_difficulty_settings';


const mute = writable(1.0);

const lives = writable(1);  // not used
const stanza = writable(1); 
const verse = writable(0); // 0-indexed
const leading_idx = writable(0); // 0-indexed
const parsed_stanzas = writable([]);
const timestamps = writable([]);
const poem_idx = writable(1);
const keyframes = writable(null);
const slopes = writable(null);
const video_prog_value = writable(0.0);
const lose_word = writable("lose");

//
const level = writable(1);
const victory = writable(0); // -1 = lose, 0 = ongoing, 1 = win
// const settings = writable({lives: 1, words_required: 0.4, percent_question_mark: 0.15});
const settings = derived(level, $level => test_difficulty_settings[$level - 1]);
//
const logo = writable([]);
//
const partial_vosk_result = writable("");
// derived
const poem_store = derived(poem_idx, $poem_idx => poems_metadata[$poem_idx]);
const all_words = derived([parsed_stanzas, stanza], ([$parsed_stanzas, $stanza]) => $parsed_stanzas[$stanza - 1]);
const n_words = derived(all_words, $all_words => $all_words ? $all_words.length : 0);
const next_word = derived([leading_idx, all_words], ([$leading_idx, $all_words]) => $all_words ? $all_words[$leading_idx] : null);
const grammar = derived([all_words], ([$all_words]) => { return $all_words ? $all_words.map(word => word.word) : [] });

// filenames
//  -- stanza based
const audio_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}.mp3`);
function audio_filename_from_stanza(stanza_no) {
    return `/poems/${get(poem_store).name}/stanza${stanza_no}.mp3`;
}
const image_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}.png`);
function image_filename_from_stanza(stanza_no) {
    return `/poems/${get(poem_store).name}/stanza${stanza_no}.png`;
}
const image_trash_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}_trash.png`);
const words_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}_words.json`);
const keyframes_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}_keyframes.json`);
function keyframes_filename_from_stanza(stanza_no) {
    return `/poems/${get(poem_store).name}/stanza${stanza_no}_keyframes.json`;
}  
const timestamps_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}_timestamps.json`);
function timestamps_filename_from_stanza(stanza_no) {
    return `/poems/${get(poem_store).name}/stanza${stanza_no}_timestamps.json`;
}
// -- poem level
const fulltext_filename = derived([poem_store], ([$poem_store]) =>  `/poems/${$poem_store.name}/fulltext.txt`);
const logo_filename = derived([poem_store], ([$poem_store]) =>  `/poems/${$poem_store.name}/logo.json`);
const music_filename = derived([poem_store], ([$poem_store]) =>  `/poems/${$poem_store.name}/background_music.mp3`);

// export
export { mute, 
    stanza, verse, leading_idx, parsed_stanzas, timestamps, keyframes, slopes, video_prog_value, poem_idx, lose_word,
    lives, victory, settings, level, 
    poem_store, all_words, n_words, next_word, grammar,
    logo,
    partial_vosk_result,
    audio_filename, image_filename, image_trash_filename, words_filename, keyframes_filename, timestamps_filename,
    audio_filename_from_stanza, timestamps_filename_from_stanza, keyframes_filename_from_stanza, image_filename_from_stanza,
    fulltext_filename, logo_filename, music_filename
};