/* constants */

const selectors = {
    container: '.player',
    video: '.player__video',
    menu: '.player__menu',
    backdrop: '.player__loader',
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
function Player(containerSelector) {
    /* fields */
    const a11y = AccessibilityHandler(containerSelector);
    const loader = Backdrop(`${containerSelector} ${selectors.backdrop}`);
    const progressBar = SliderUI(selectors.videoTime);
    const playerBtn = ToggleUI(selectors.playBtn, 'active');
    const volumeSlider = SliderUI(selectors.volume);
    const speedSlider = SliderUI(selectors.speed);
    const skipBtn = ButtonUI(selectors.skipBtn);
    const rewindBtn = ButtonUI(selectors.rewindBtn);

    const video = Video(selectors.video);

    let progressBarIntervalID;

    /* constructor */
    a11y.hide();

    video.getInfo().then( (info) => {
        setVideoDetails(info);
        a11y.show();
        loader.hide();
    })
    .catch( () => {
        loader.displayError();
    })

    progressBar.subscribe((value)=>{
        video.setTime(value);
    });

    volumeSlider.subscribe((value)=>{
        video.setVolume(value);
    })

    speedSlider.subscribe((value)=>{
        video.setPlaybackRate(value);
    })

    skipBtn.subscribe( () => {
        progressBar.increaseValue(10);
        video.setTime(video.getTime() + 10);
    });

    rewindBtn.subscribe(() => {
        progressBar.decreaseValue(10);
        video.setTime(video.getTime() - 10);
    });

    playerBtn.subscribe(() => {
        video.play();
        progressBar.updateValue(video.getTime());
        progressBarIntervalID = setInterval(() => progressBar.translateValue( video.getPlaybackRate() ),1000)
    }, 'enabled');

    playerBtn.subscribe(() => {
        video.pause();
        clearInterval(progressBarIntervalID);
    }, 'disabled');

    video.subscribeEnded(() => {
        video.pause();
        clearInterval(progressBarIntervalID);
        playerBtn.setState('disabled');
    })

    window.addEventListener('resize', () => {
        progressBar.updateWidth();
        volumeSlider.updateWidth();
        speedSlider.updateWidth();
    });


    /* private methods */
    function setVideoDetails(options){
        let defaultSettings = {
            startTime: 0, endTime: 60, currentTime: 0, videoStep: 10,
            minSpeed: 0.25, maxSpeed: 2, currentSpeed: 1, speedStep: 0.25,
            minVolume: 0, maxVolume: 1, currentVolume: 0.25, volumeStep: 0.1
        };

        let settings = {...defaultSettings, ...options};

        progressBar.updateMinValue(settings.startTime);
        progressBar.updateValue(settings.currentTime);
        progressBar.updateMaxValue(settings.endTime);
        progressBar.setStep(settings.videoStep);

        volumeSlider.updateMinValue(settings.minVolume);
        volumeSlider.updateValue(settings.currentVolume);
        volumeSlider.updateMaxValue(settings.maxVolume);
        volumeSlider.setStep(settings.volumeStep);

        speedSlider.updateMinValue(settings.minSpeed);
        speedSlider.updateValue(settings.currentSpeed);
        speedSlider.updateMaxValue(settings.maxSpeed);
        speedSlider.setStep(settings.speedStep);        
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

function ToggleUI(selector, classOnActive) {
    /* fields */
    let subscribers = [];
    let button = document.querySelector(selector);
    let state = 'disabled'; // 0 or 1
    /* constructor */
    button.addEventListener('click', function notifySubscribers (){
        state = (state === 'disabled') ? 'enabled' : 'disabled';
        button.classList.toggle(classOnActive);  
        toNotify = subscribers.filter( ([subscriber, targetedState]) =>  targetedState === state );
        toNotify.forEach( ([subscriber]) => subscriber() )
    });
    /* public API */
    return { 
        subscribe, setState 
    };
    /* methods */
    function subscribe(fn, state) {
        if(typeof fn !== 'function') return;
        if(state !== 'disabled' && state !== 'enabled') return;

        subscribers.push([fn, state]);
    }
    function setState(newState){
        if(state !== 'disabled' && state !== 'enabled') return;

        state = newState;
        if(state === 'disabled'){
            button.classList.remove(classOnActive);
        } else {
            button.classList.add(classOnActive);
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
        setStep, updateWidth
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
        range = maxValue - minValue;
        updateIndicatorPosition();
        
        function isNotCorrect(newMaxValue) {
            return newMaxValue < value || newMaxValue < minValue;
        }
    }
    function updateMinValue(newMinValue) {
        if(isNotCorrect(newMinValue)) return;

        minValue = newMinValue;
        slider.setAttribute('aria-valuemin', minValue);
        range = maxValue - minValue;
        updateIndicatorPosition();
        
        function isNotCorrect(newMinValue) {
            return newMinValue > value || newMinValue > maxValue;
        }
    }
    function setStep(newStep){
        step = newStep;
    }
    function updateWidth(){
        width = slider.getBoundingClientRect().width;
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
        subscribers.forEach( subscriber => subscriber(value, minValue, maxValue) );
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

function Video(selector) {
    let subscribers = [];
    let vid = document.querySelector(selector);

    vid.addEventListener('ended', (event) => {
        for(let subscriber of subscribers){
            subscriber(event);
        }
      });

    return { 
        getInfo, 
        setTime, setVolume, setPlaybackRate,
        getTime, getPlaybackRate,
        subscribeEnded,
        play, pause
    };

    function subscribeEnded(observer){
        subscribers.push(observer);
    }

    function getInfo(){
        return new Promise(function(resolve, reject) {
            let counter = 0;
            let intervalTime = 100;

            let interval = setInterval(() => {
                if(Number.isNaN(vid.duration)){
                    counter ++;
                    if(counter > 30){
                        clearInterval(interval); 
                        reject(`Time out: ${intervalTime * counter}s`);     
                    }
                } else {
                    resolve({
                        endTime: vid.duration, 
                        currentTime: vid.currentTime,
                        currentVolume: vid.volume, 
                    });

                }
            }, intervalTime);
        });
    }

    function getTime(){
        return vid.currentTime;
    }

    function setTime(time){
        if(time > vid.duration || time < 0) return;

        vid.currentTime = time;
    }

    function setVolume(vol){
        if(vol > 1 || vol < 0) return;

        vid.volume = vol;
    }

    function setPlaybackRate(ratio){
        vid.playbackRate = ratio;
    }

    function getPlaybackRate(){
        return vid.playbackRate;
    }

    function play() {
        vid.play();
    }

    function pause() {
        vid.pause();
    }
}

function AccessibilityHandler(selector){
    const container = document.querySelector(selector);
    const menu = container.querySelector(selectors.menu);
    const tabbable = Array.from( container.querySelectorAll(selectors.allTabbableElements) );

    container.addEventListener('focusin', handleExpansibility, {useCapute: true});
    container.addEventListener('focusout', handleExpansibility, {useCapute: true});

    return {
        hide, show
    };

    function handleExpansibility({target, type}){
        // *** Is there a better solution ? *** //
        if(type === 'focusin'){
            if(tabbable.includes(target)){
                container.classList.add('show-menu');
            }
        } else if(type === 'focusout'){
            container.classList.remove('show-menu');
        }
    }

    function hide(){
        menu.classList.add('hide');
    }

    function show(){
        menu.classList.remove('hide');
    }
}

function Backdrop(selector){
    const container = document.querySelector(selector);

    return {
        displayError, hide
    }

    function displayError(){
        container.classList.add('error');
    }

    function hide() {
        container.classList.add('hide');
    }
}

var x = Player(selectors.container);