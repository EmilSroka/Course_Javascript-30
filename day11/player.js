/* constants */

const selectors = {
    container: '.player',
    video: '.player__video',
    menu: '.player__menu',
    progress: '.menu__progress',
    progressIndicator: '.menu__progress__indicator',
    progressFilled: '.menu__progress__filled',
    videoTime: '#video-time',
    volume: '#player-volume',
    speed: '#player-speed',
    playBtn: '.menu__status',
    volumeSlider: '.menu__volume',
    speedSlider: '.menu__speed',
    skipBtn: '.menu__skip',
    rewindBtn: '.menu__rewind',
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
    let button = document.querySelector(selector);
    /* constructor */
    button.addEventListener('click', function notifySubscribers (){
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

function toggleUI(selector, classOnActive) {
    /* fields */
    let subscribers = [];
    let button = document.querySelector(selector);
    let state = 0; // 0 or 1
    /* constructor */
    button.addEventListener('click', function notifySubscribers (){
        state = !state;
        button.classList.toggle(classOnActive);  
        subscribers.forEach( ({subscriber}) => subscriber(state) );
    });
    /* public API */
    return { 
        subscribe, setState 
    };
    /* methods */
    function subscribe(fn, state) {
        if(typeof fn !== 'function') return;
        if(state !== 1 && state !== 0) return;

        subscribers.push([fn, state]);
    }
    function setState(newState){
        if(state !== 1 && state !== 0) return;

        state = newState;
        if(state){
            button.remove(classOnActive);
        } else {
            button.add(classOnActive);
        }
    }
}

function SliderUI(selector) {
    /* fields */
    /* refactor fields */
    let subscribers, 
    slider, indicator, filled, 
    minValue, maxValue, range, value, step, 
    width;
    
    let drag = {
        previousPosition: 0,
        inProgress: false,
        intervalFinished: true, // intervals should prevent throttling
        updateInterval: 17 // 1000 / 17 = 58,8 ~ 60 fps
    }

    /* constructor */
    setDefaultValues();
    setDragAndDrop();
    slider.addEventListener('keydown', handleKeyboardNavigation);
    /* public API */
    return {
        subscribe, 
        updateValue, translateValue, increaseValue, decreaseValue, updateMaxValue, updateMinValue,
        setStep
    };
    /* methods */
    function subscribe(fn) { /* notify only when user change value */
        if(typeof fn !== 'function') return;

        subscribers.push(fn);
    }
    function updateValue(newValue) {
        if(isNotCorrect(newValue)) return;

        value = newValue;
        slider.setAttribute('aria-valuenow', value);
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
        slider.setAttribute('aria-valuemax', maxValue);
        updateIndicatorPosition();
        
        function isNotCorrect(newMaxValue) {
            return newMaxValue < value || newMaxValue < minValue;
        }
    }
    function updateMinValue(newMinValue) {
        if(isNotCorrect(newMinValue)) return;

        minValue = newMinValue;
        slider.setAttribute('aria-valuemin', minValue);
        updateIndicatorPosition();
        
        function isNotCorrect(newMinValue) {
            return newMinValue > value || newMinValue > maxValue;
        }
    }
    function setStep(newStep){
        step = newStep;
    }
    /* private methods */
    function setDefaultValues() {
        subscribers = [];
        slider = document.querySelector(selector);
        indicator = document.querySelector(`${selector} ${selectors.progressIndicator}`);
        filled = document.querySelector(`${selector} ${selectors.progressFilled}`);
        minValue = Number( slider.getAttribute('aria-valuemin') );
        maxValue = Number( slider.getAttribute('aria-valuemax') );
        range = maxValue - minValue;
        value = Number( slider.getAttribute('aria-valuenow') );
        step = 1;
        width = slider.getBoundingClientRect().width;
    }
    function setDragAndDrop() {
        indicator.addEventListener('mousedown', startDragAndDrop );
        document.addEventListener('mousemove', handleMouseMovement);
        document.addEventListener('mouseup', endDragAndDrop);
    }
    function startDragAndDrop(event) {
        event.preventDefault(); // prevent default drag and drop API
        drag.inProgress = true;
        drag.previousPosition = event.screenX;
    }
    function handleMouseMovement(event) {
        if(drag.intervalFinished && drag.inProgress) {
            let deltaValue = calculateValueChange();
            translateValue(deltaValue);
            notifySubscribers();
            drag.previousPosition = event.screenX;
            startInterval();
            setTimeout(finishInterval, drag.updateInterval);
        }

        function calculateValueChange(){
            let deltaPosition = event.screenX - drag.previousPosition;
            return (deltaPosition / width) * range;
        }
        function finishInterval() {
            drag.intervalFinished = true
        }
        function startInterval() {
            drag.intervalFinished = false;
        }
    }
    function endDragAndDrop() {
        if(drag.inProgress) {
            // TO DO: add class show-menu to menu ?
            drag.inProgress = false;
        }
    }
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