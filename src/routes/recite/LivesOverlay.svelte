<script>
    import { quadIn } from 'svelte/easing';
    import { lives } from '../stores.js';
    import { tweened } from 'svelte/motion';
    import { fade } from 'svelte/transition';

    let tweened_lives = tweened($lives, { duration: 300, easing: quadIn });
    let tweened_promise = new Promise(resolve => {resolve();});
    $: tweened_promise = tweened_lives.set($lives)

</script>


        <!-- {#each Array.from({ length: 3 }) as _, i}
        <svg viewBox="-3 -3 73 73" >
            <path d="M 55.538727,2.5013793 C 62.852607,5.7954098 64.717147,17.321224 63.422767,25.237539 60.709317,41.832788 42.528937,47.541787 32.575357,65.153987 22.621771,47.460247 4.463432,41.742226 1.727932,25.156002 0.42859202,17.277654 2.200245,5.7823108 9.4740818,2.4886863 17.039308,-0.93688074 28.080327,3.4771943 32.506407,11.986918 36.932487,3.4898873 47.968097,-0.90828874 55.538727,2.5013793 Z"
                stroke="black" stroke-width="8" fill={i < $lives ? "red" : "none"} />
        </svg>
        {/each} -->
                {#if $lives !== $tweened_lives}
    <div class="lives"
        out:fade={{duration: 1000, easing: quadIn}}
    >
                {#each Array.from({ length: 3 }) as _, i}
                <svg viewBox="-3 -3 73 73" width="100%" height="100%" >
                    <defs>
                        <linearGradient id={i}grad x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset={($tweened_lives-i)/1.0 * 100}% style="stop-color:rgb(255,0,0);stop-opacity:1" />
                            <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M 55.538727,2.5013793 C 62.852607,5.7954098 64.717147,17.321224 63.422767,25.237539 60.709317,41.832788 42.528937,47.541787 32.575357,65.153987 22.621771,47.460247 4.463432,41.742226 1.727932,25.156002 0.42859202,17.277654 2.200245,5.7823108 9.4740818,2.4886863 17.039308,-0.93688074 28.080327,3.4771943 32.506407,11.986918 36.932487,3.4898873 47.968097,-0.90828874 55.538727,2.5013793 Z"
                        stroke="black" stroke-width="8" fill={`url(#${i}grad)`}
                    />
                </svg>
                {/each}
    </div>
                {/if}

<style>
    .lives {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        height: 60px;
        font-family: 'Times New Roman';
        /* // flex */
        display: flex;
        flex-direction: row;
        gap: 4%;
        z-index: 10;
    }
    .lives svg {
        height: 100%;
    }
</style>