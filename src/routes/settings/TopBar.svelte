<script>
    import { stanza, verse, poem_store } from "../stores.js";
</script>

<div class="bar">
    <div class="poem_title">Choose Level</div>
</div>

<style>
    .bar {
        height: 100%;
        background-color: white;
        box-shadow: 0 0 15px 15px white;
        position: relative;
        /* font */
        text-align: center;
        font-size: 2em;
        /* flex */
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
    .poem_title {
        font-family: 'Times New Roman';
    }
    @media (max-width: 768px) {
        .bar {
            font-size: 1.5em;
        }
    }
</style>