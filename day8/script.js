(function Paint(canvasSelector){
    const canvas = document.querySelector(canvasSelector);
    const ctx = canvas.getContext('2d');
    const color = colorFactory(0);
    const size = sizeFactory(2,1,40);
    const mouse = mouseFactory();
    setCanvasContext();

    /* canvas mechanics */
    function drawLine(startingPoint, endingPoint){
        const {X: startingX, Y: startingY} = startingPoint,
              {X: endingX, Y: endingY} = endingPoint;
        ctx.lineWidth = size.get();
        ctx.strokeStyle = color.get();
        ctx.beginPath();
        ctx.moveTo(startingX, startingY);
        ctx.lineTo(endingX, endingY);
        ctx.stroke();
    }

    function setCanvasContext(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = size.get();
        ctx.strokeStyle = color.get();
    }

    /* event handling */
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', function updateMouse(event) {
        const {offsetX, offsetY} = event;
        mouse.updatePosition(offsetX, offsetY);
        mouse.isPressed = true;
    });
    document.addEventListener('mouseup', () => mouse.isPressed = false);
    document.addEventListener('mouseout', () => mouse.isPressed = false);
    window.addEventListener('resize', setCanvasContext); 

    function handleMouseMove(event){
        if(!mouse.isPressed ) return;
        const {offsetX, offsetY} = event;
        mouse.updatePosition(offsetX, offsetY);
        drawLine(mouse.getPreviousPosition(), mouse.getPosition());
        size.next();
        color.next();
    }

    /* factories */
    function colorFactory(startingHue){
        let hue = startingHue;
        return{ get, next };
    
        function get() {
            return `hsl(${hue}, 100%, 50%)`;
        }
    
        function next() {
            hue = (hue + 1) % 361;
        }
    }

    function sizeFactory(startingSize, minSize, maxSize, isIncreasing = true){
        let value = between(startingSize, minSize, maxSize) ?  startingSize : minSize + 1;
        return { get, next };

        function get(){
            return value;
        }

        function next(){
            if( !between(value, minSize, maxSize) ) {
                isIncreasing = !isIncreasing;
            } 

            isIncreasing ? value++ : value--;
        }
    }

    function mouseFactory(){
        let previousX= 0,
        previousY = 0,
        currentX = 0,
        currentY = 0,
        isPressed = false;
        return { updatePosition, isPressed, getPosition, getPreviousPosition };

        function updatePosition(X,Y){
            previousX = currentX;
            previousY = currentY;
            currentX = X;
            currentY = Y;
        }

        function getPosition(){
            return {X: currentX, Y: currentY};
        }

        function getPreviousPosition(){
            return {X: previousX, Y: previousY};
        }

    }

    /* utilities */

    function between(number, intervalStart, intervalEnd){
        return number > intervalStart && number < intervalEnd 
    }

})('#canvas');