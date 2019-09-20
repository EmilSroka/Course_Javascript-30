(function Launchpad(){
    const container = document.querySelector('.launchpad');

    container.addEventListener('click', function playSoundWhenButton(event){
        var button = getButtonFromTarget(event.target);
        if(button == null) return;

        { let dataCode;
            dataCode = button.getAttribute('data-code');
            playSound(dataCode);
        }
    });
    window.addEventListener('keydown', function  playSoundWhenCorrectKey(event){
        var button = container.querySelector(`.launchpad__btn[data-code="${event.keyCode}"]`);
        if(button){
            button.classList.contains('active') ? button.classList.remove('active') : button.classList.add('active');
            playSound(event.keyCode);
        }
    })
    container.addEventListener('transitionend', function removeTransitionEffectFromButton(event){
        if(event.target.tagName == 'BUTTON' && event.propertyName == 'box-shadow'){
            event.target.classList.remove('active');
        }
    });

    function getButtonFromTarget(target){
        if(target.tagName == 'ARTICLE') {
            return null;
        }else if(target.tagName == 'BUTTON'){
            return target;
        } else{
            return target.parentNode;
        }
    }

    function playSound(dataCode){
        var audioElement = container.querySelector(`.launchpad__audio[data-code="${dataCode}"]`);
        audioElement.currentTime = 0;
        audioElement.play();
    }


})();