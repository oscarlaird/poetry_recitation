<script>
    import { poems_metadata } from "$lib/poems_metadata.js";
    import Card from "./Card.svelte";
    let sort_options = ["Author", "Genre", "Best", "Classic"]

</script>

<div class="card_grid">
    {#each poems_metadata as poem, idx}
        <Card poem={{idx: idx, ...poem}} />
    {/each}
</div>


<style>
    .sort_buttons_box {
        margin-top: 2%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 0;
    }
    .sort_button {
        font-family: 'Times New Roman', Times, serif;
        font-size: 2em;
        border: 1px solid black;
        cursor: pointer;
    }
    .sort_button:hover {
        background-color: lightgray;
    }
    .sort_buttons_box .sort_button:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
    }
    .sort_buttons_box .sort_button:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
    }
    .card_grid {
        display: grid;
        /* 3 columns, as many rows as needed */
        grid-template-columns: repeat(2, 1fr);
        margin: 10px;
        gap: 10px;
    }

    @media (max-width: 768px) {
        .sort_button {
            font-size: 1.4em;
        }
    }
</style>
