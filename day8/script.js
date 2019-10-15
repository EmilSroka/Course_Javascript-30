(function Paint(canvasSelector){
    const canvas = document.querySelector(canvasSelector);
    const ctx = canvas.getContext('2d');
    var color = {
        hue: 0,
        get() {
            return `hsl(${this.hue}, 100%, 50%)`;
        },
        next() {
            this.hue = (this.hue + 1) % 361;
        }
    }
    var size = {
        isIncreasing: true,
        value: 2,
        get() {
            return this.value;
        },
        next() {

            if(this.value == 100 || this.value == 1) {
                this.isIncreasing = !this.isIncreasing;
            } 

            this.isIncreasing ? this.value++ : this.value--;
        }
    }
    var mouse = {
        previousX: 0,
        previousY: 0,
        currentX: 0,
        currentY: 0,
        isPressed: false
    }

    setContext(ctx);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', function TODO(event) {
        mouse.currentX = event.offsetX;
        mouse.currentY = event.offsetY;
        mouse.isPressed = true;
    });
    document.addEventListener('mouseup', () => mouse.isPressed = false);
    document.addEventListener('mouseout', () => mouse.isPressed = false);
    window.addEventListener('resize', setContext);

    function handleMouseMove(event){
        if(! mouse.isPressed) return;
        mouse.previousX = mouse.currentX;
        mouse.previousY = mouse.currentY;
        mouse.currentX = event.offsetX;
        mouse.currentY = event.offsetY;
        drawLine(mouse);
        size.next();
        color.next();
    }

    function drawLine(mouse){
        var {previousX, previousY, currentX, currentY} = mouse;
        ctx.lineWidth = size.get();
        ctx.strokeStyle = color.get();
        ctx.beginPath();
        ctx.moveTo(previousX, previousY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    }

    function setContext(ctx){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = size.get();
        ctx.strokeStyle = color.get();
    }

})('#canvas');