const launchpad = (function Launchpad(){
    const container = document.querySelector(".launchpad");
    container.addEventListener("click", function TODO(event){
        var button = getButtonFromTarget(event.target);
        if(button == null) return;

        { let dataCode;
            dataCode = button.getAttribute("data-code");
            playSound(dataCode);
        }

    })
    var publicAPI = {

    };
    return publicAPI;

    /* private functions */

    function getButtonFromTarget(target){
        if(target.tagName == "ARTICLE") {
            return null;
        }else if(target.tagName == "BUTTON"){
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