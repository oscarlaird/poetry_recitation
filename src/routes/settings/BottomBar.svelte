<script>
    import { goto } from '$app/navigation';
</script>

<div class="container">
    <button on:click={() => goto('../choose')}>
        <svg viewBox="0 0 24 24" class="home_icon">
            <rect x="3" y="12" width="12" height="2" fill="black" />
            <polygon points="15,10 24,13 15,16" fill="black" />
        </svg>
        <div class="text">
            Home
        </div>
    </button>
    <button on:click={() => goto('../recite')}>
        <div class="text">
            Start
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
        color: black;
        cursor: pointer;
        flex: 1;
        display: flex;
        justify-content: center;
        border: 2px solid black;
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