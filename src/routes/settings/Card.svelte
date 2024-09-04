<script>
    export let poem;
</script>

<button class="card">
    <div class="poem_title">{poem.title}</div>
    <div class="poem_author">{poem.author}</div>
</button>

<style>
    .card {
        height: 100%;
        background-color: white;
        border: 1px solid black;
        cursor: pointer;
        font-size: 1.4em;
    }
    .card:hover {
        background-color: lightgray;
    }
    @media (max-width: 768px) {
        .card {
            font-size: 1em;
        }
    }
</style>