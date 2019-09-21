(function clock(){
    const animationDuration = 300;
    const hourHand = document.querySelector(".clock__hand--hour");
    const minuteHand = document.querySelector(".clock__hand--minute");
    const secondHand = document.querySelector(".clock__hand--second");

    setInterval(function updateClock(){
        const time = new Date();


        setHand( (time.getSeconds() / 60) * 360, secondHand);
        setHand( (time.getMinutes() / 60) * 360, minuteHand);
        setHand( ((time.getHours() % 12) / 12) * 360, hourHand);

    }, 1000);

    function setHand(degree, hand){
        if(degree === 0 ){
            // prevent visual bug when hand go from max value to 0
            degree = 360;
        }
        hand.style.transform = `translateY(-50%) rotate(${degree}deg)`;
        if(degree === 360){
            setTimeout(function back360DegreeWithoutAnimation(){
                hand.classList.remove("clock__hand--animated");
                hand.style.transform = `translateY(-50%) rotate(0deg)`;
                setTimeout(function(){
                    hand.classList.add("clock__hand--animated");
                }, 100);
            },animationDuration);
        }
    }
})();