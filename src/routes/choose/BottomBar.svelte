<script>
    import { goto } from '$app/navigation';
    let sort_options = ["Author", "Genre", "Best", "Search"]
    let sort_option = null;
    function sort_by(option) {
        sort_option = option;
    }
</script>

<div class="container">
    {#each sort_options as option}
        <button on:click={() => sort_by(option)}>
            <div class="text">
                {option}
            </div>
        </button>
    {/each}
</div>

<style>
    .container {
        display: flex;
        justify-content: space-around;
        background-color: black;
        height: 100%;
    }
    button {
        margin-left: -2px;
        font-family: 'Times New Roman', Times, serif;
        background-color: white;
        color: black;
        cursor: pointer;
        flex: 1;
        display: flex;
        justify-content: center;
        border: 2px solid black;
        box-sizing: content-box;
    }
    @media (hover: hover) {
        button:hover {
            transform: scale(1.15);
        }
    }
    .text {
        font-size: 1.4rem;
        font-style: italic;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    svg {
        height: 100%;
        aspect-ratio: 1/1;
    }
    .home_icon {
        transform: scaleX(-1);
    } 
</style>