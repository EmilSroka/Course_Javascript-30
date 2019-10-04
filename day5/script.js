window.addEventListener('DOMContentLoaded', function TODO(){
    const panelsContainer = document.querySelector(".panels");
    // if(panelsContainer == null) return //-> hanlde error

    panelsContainer.addEventListener('click', function TODO(event){
        const panel = getPanelElemet(event.target);
        // if(panel == null) return //-> hanlde error
        panel.classList.toggle('active');
    }, false);

    panelsContainer.addEventListener('transitionend', function TODO(event){
        if(event.propertyName != 'font-size') return;
        const panel = getPanelElemet(event.target);
        // if(panel == null) return //-> hanlde error
        panel.classList.contains('active') ? panel.classList.add('open') : panel.classList.remove('open');
    }, false);


    function  getPanelElemet(dom){
        if(dom.tagName == 'P'){
            return dom.parentNode;
        }  else if(dom.tagName == 'DIV' && dom.classList.contains('panel')){
            return dom;
        } else {
            return null;
        }
    }
}, false);