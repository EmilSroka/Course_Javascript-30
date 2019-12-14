/* constants */

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

/* View */

function PlayerView(containerSelector) {
    /* fields */
    const container = document.querySelector(containerSelector);
    const tabbable = Array.from( document.querySelectorAll(selectors.allTabbableElements) );
    /* constructor */
    container.addEventListener('focusin', handleMenuVisibility, {useCapute: true});
    container.addEventListener('focusout', handleMenuVisibility, {useCapute: true});

    return {};
    /* methods */
    function handleMenuVisibility({target, type}){
        // *** Is there a better solution ? *** //
        if(type === 'focusin'){
            if(tabbable.includes(target)){
                container.classList.add('show-menu');
            }
        } else if(type === 'focusout'){
            container.classList.remove('show-menu');
        }
    }
}


/* UI classes */
function ButtonUI(selector) {
    /* fields */
    let subscribers = [];
    let DOM = document.querySelector('selector');
    /* constructor */
    DOM.addEventListener('click', function notifySubscribers (){
        subscribers.forEach( subscriber => subscriber() );
    });
    /* public API */
    return {
        subscribe
    };
    /* methods */
    function subscribe(fn) {
        if(typeof fn !== 'function') return;

        subscribers.push(fn);
    }    
}


function SliderUI(selector) {
    /* fields */
    let subscribers = [];
    let step = 1;
    let DOM = document.querySelector(selector);
    let indicator = document.querySelector(`${selector} .menu__progress__indicator`);
    let filled = document.querySelector(`${selector} .menu__progress__filled`);
    let minValue = DOM.getAttribute('aria-valuemin');
    let maxValue = DOM.getAttribute('aria-valuemax');
    let value = DOM.getAttribute('aria-valuenow');

    /* constructor */
    DOM.addEventListener('click', function notifySubscribers (){
        subscribers.forEach( subscriber => subscriber() );
    });
    /* public API */
    return {
        subscribe, 
        updateValue, translateValue, increaseValue, decreaseValue, updateMaxValue, updateMinValue,
        setStep
    };
    /* methods */
    function updateValue(newValue) {
        if(isNotCorrect(newValue)) return;

        value = newValue;
        DOM.setAttribute('aria-valuenow', value);
        updateIndicatorPosition();
        
        function isNotCorrect(newValue) {
            return newValue > maxValue || newValue < minValue;
        }
    }
    function translateValue(step) { /* increase or decrease */
        if(Math.sign(step) > 0) {
            increaseValue(step);
        } else {
            decreaseValue(-step);
        }
    }
    function increaseValue(step) {
        if(value < 0) return;
        if(value + step < maxValue) {
            updateValue(value + step);
        } else { 
            updateValue(maxValue); 
        }
    }
    function decreaseValue(step) {
        if(value < 0) return;
        if(value - step > minValue) {
            updateValue(value - step);
        } else { 
            updateValue(minValue); 
        }
    }
    function updateMaxValue(newMaxValue) {
        if(isNotCorrect(newMaxValue)) return;

        maxValue = newMaxValue;
        DOM.setAttribute('aria-valuemax', maxValue);
        updateIndicatorPosition();
        
        function isNotCorrect(newMaxValue) {
            return newMaxValue < value || newMaxValue < minValue;
        }
    }
    function updateMinValue(newMinValue) {
        if(isNotCorrect(newMinValue)) return;

        minValue = newMinValue;
        DOM.setAttribute('aria-valuemin', minValue);
        updateIndicatorPosition();
        
        function isNotCorrect(newMinValue) {
            return newMinValue > value || newMinValue > maxValue;
        }
    }
    function setStep(newStep){
        step = newStep;
    }
    /* private methods */
    function handleKeyboardNavigation(event) {
        let hasValueChanged = true;

        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
                decreaseValue(step);
                break;
            case 'ArrowRight':
            case 'ArrowUp':
                increaseValue(step);
                break;
            case 'Home':
                updateValue(minValue);
                break;
            case 'End':
                updateValue(maxValue);
                break;
            default:
                hasValueChanged = false;
                break;
        }
        if(hasValueChanged) {
            notifySubscribers();
        }
    }
    function notifySubscribers(){
        subscribers.forEach( subscriber => subscriber(minValue, value, maxValue) );
    }
    function updateIndicatorPosition(){
        let position = calculatePosition();
        position = toPercentages(position);
        position = toString(position);
        
        if(indicator){
            indicator.style.setProperty('left', position);
        }
        if(filled) {
            filled.style.setProperty('width', position);
        }

        function  calculatePosition() { 
            let range = maxValue - minValue;
            let fixedValue = value - minValue;
            let position = (fixedValue / range);
            return position;
        }

        function toPercentages(number) {
            return number * 100;
        }

        function toString(number) {
            let asString = number.toFixed(2);
            return `${asString}%`;
        }
    } 
}

var x = PlayerView(selectors.container);