(function(){
    var body = document.querySelector('body');
    var controlsContainer = document.querySelector('.controls');

    controlsContainer.addEventListener('mousemove', updateCssVariables);
    controlsContainer.addEventListener('change', updateCssVariables);

    function updateCssVariables(event){
        var input = event.target;
        if(input.tagName != 'INPUT') return;

        let property = input.name;
        let suffix = input.dataset.unit || ''; // https://www.ecma-international.org/ecma-262/10.0/index.html#sec-binary-logical-operators-runtime-semantics-evaluation
        let value = input.value;

        body.style.setProperty(`--${property}`, `${value}${suffix}`)
    }

})();