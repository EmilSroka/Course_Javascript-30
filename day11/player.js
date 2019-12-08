const selectors = {
    container: '.player',
    video: '.player__video',
    menu: '.player__menu',
    progressA11y: '#player-progress',
    progress: '.menu__progress',
    playBtn: '.menu__status',
    volumeSlider: '.menu__volume',
    speedSlider: '.menu__speed',
    skipBtn: 'menu__skip',
    rewindBtn: 'menu__rewind',
    allTabbableElements: 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable], audio[controls], video[controls], summary, [tabindex^="0"], [tabindex^="1"], [tabindex^="2"], [tabindex^="3"], [tabindex^="4"], [tabindex^="5"], [tabindex^="6"], [tabindex^="7"], [tabindex^="8"], [tabindex^="9"]'
}

function Player(){
    const container = document.querySelector(selectors.container);
    const tabbable = Array.from( document.querySelectorAll(selectors.allTabbableElements) );

    container.addEventListener('focusin', handleMenuVisibility, {useCapute: true});
    container.addEventListener('focusout', handleMenuVisibility, {useCapute: true});

    function handleMenuVisibility({target, type}){
        //Is there better solution ?
        if(type === 'focusin'){
            if(tabbable.includes(target)){
                container.classList.add('show-menu');
            }
        } else if(type === 'focusout'){
            container.classList.remove('show-menu');
        }
    }
}

var tmp = Player();