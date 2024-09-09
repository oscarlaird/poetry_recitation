<script>
    import { level, victory } from "../stores";
    import { goto } from "$app/navigation";
    import { fade } from "svelte/transition";
    $: message = $victory===-1 ? "Try Again" : $level<5 ? `Next Level (${$level+1}/5)` : "Play Again";
    function play_again() {
        if ($victory===1 && $level<5) level.update(n => n+1);
        goto("/settings");
    }
    function home() {
        goto("/choose");
    }

</script>

<div class="container">
    <button on:click={home}>
        <svg viewBox="0 0 24 24" class="home_icon">
            <rect x="3" y="12" width="12" height="2" fill="black" />
            <polygon points="15,10 24,13 15,16" fill="black" />
        </svg>
        <div class="text">
            Home
        </div>
    </button>
    <button on:click={play_again}>
        <div class="text">
            {message}
        </div>
        <svg viewBox="0 0 24 24">
            <rect x="3" y="12" width="12" height="2" fill="black" />
            <polygon points="15,10 24,13 15,16" fill="black" />
        </svg>
    </button>
</div>

<style>
    .container {
        display: flex;
        justify-content: space-around;
        background-color: black;
        height: 100%;
    }
    button {
        font-family: 'Times New Roman', Times, serif;
        background-color: white;
        cursor: pointer;
        flex: 1;
        display: flex;
        justify-content: center;
        border: 2px solid black;
    }
    button:hover {
        transform: scale(1.15);
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

