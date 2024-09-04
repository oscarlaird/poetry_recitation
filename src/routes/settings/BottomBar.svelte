<script>
    import { goto } from '$app/navigation';
</script>

<div class="bar">
    <button on:click={() => goto('../choose')}>Back</button>
    <button on:click={() => goto('../recite')}>Go</button>
</div>

<style>
    .bar {
        height: 100%;
        /* font */
        text-align: center;
        font-family: 'Times New Roman', Times, serif;
        /* centered text */
        text-justify: center;
    }
    button {
        font-size: 1.6em;
        width: 40%;
        border: 1px solid black;
        border-radius: 5px;
        cursor: pointer;
    }
    button:hover {
        background-color: lightgray;
    }
</style>