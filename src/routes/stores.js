import { writable, derived } from 'svelte/store';

const stanza = writable(3); // 1-indexed
const verse = writable(0); // 0-indexed
const leading_idx = writable(0); // 0-indexed
const parsed_stanzas = writable([]);
const timestamps = writable(null);
const poem_store = writable({name: "raven", title: "The Raven", author: "Edgar Allan Poe", stanzas: 18});
const keyframes = writable(null);
const slopes = writable(null);
const video_prog_value = writable(0.0);

//
const lives = writable(1);
const victory = writable(0); // -1 = lose, 0 = ongoing, 1 = win
const settings = writable({lives: 1, words_required: 0.4, percent_question_mark: 0.15});

// derived
const all_words = derived([parsed_stanzas, stanza], ([$parsed_stanzas, $stanza]) => $parsed_stanzas[$stanza - 1]);
const n_words = derived(all_words, $all_words => $all_words ? $all_words.length : 0);
const next_word = derived([leading_idx, all_words], ([$leading_idx, $all_words]) => $all_words ? $all_words[$leading_idx] : null);

// filenames
const audio_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}.mp3`);
const image_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}.png`);
const image_trash_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}_trash.png`);
const words_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}_words.json`);
const keyframes_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}_keyframes.json`);
const timestamps_filename = derived([poem_store, stanza], ([$poem_store, $stanza]) =>  `/poems/${$poem_store.name}/stanza${$stanza}_timestamps.json`);
const fulltext_filename = derived([poem_store], ([$poem_store]) =>  `/poems/${$poem_store.name}/fulltext.txt`);

// export
export { stanza, verse, leading_idx, parsed_stanzas, timestamps, poem_store, keyframes, slopes, video_prog_value,
    lives, victory, settings,
    n_words, next_word, all_words,
    audio_filename, image_filename, image_trash_filename, words_filename, keyframes_filename, timestamps_filename, fulltext_filename };