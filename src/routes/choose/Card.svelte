<script>
    import { goto } from '$app/navigation';
    import { poem_idx } from '../stores.js';
    export let poem;
    function select_poem() {
        console.log(poem);
        poem_idx.set(poem.idx);
        goto(`../settings`);

    }
</script>

<button class="card" on:click={select_poem}>
    <div class="poem_title"
    >{poem.title}</div>
    <div class="poem_author"><i>
{poem.author}
    </i></div>
</button>

<style>
    button {
        color: black;
    }
    .card {
        height: 100%;
        background-color: white;
        border: 1px solid black;
        cursor: pointer;
        font-size: 1.4em;
        border-radius: 3px;
    }
    @media (hover: hover) {
        .card:hover {
            transform: scale(1.05);
        }
    }
    @media (max-width: 768px) {
        .card {
            font-size: 1em;
        }
    }
    .poem_title {
        font-family: 'Times New Roman', Times, serif;
        font-size: 1.3em;
    }
    .poem_author {
        font-size: 1em;
    }
</style>