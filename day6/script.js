const endpoint = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
const search = (function searchModule(apiUrl, outputClassName, inputIdName, numberOfCharsToShowInput){    
    /* private state */
    var cities = [];  
    var output = document.querySelector(`.${outputClassName}`);
    var input = document.getElementById(inputIdName);
    
    /* public methods and state */
    var publicAPI = {
        getData, setEventListener
    }
    return publicAPI;

    /* private methods */
    function getData(){
        fetch(apiUrl)
        .then(convertToJSON)
        .then(saveOnlyNecessaryData); // in cities

        function convertToJSON(promise){
            if(promise.ok){
                return promise.json();
            } else {
                throw Error(response.statusText);
            }
        }

        function saveOnlyNecessaryData(promise){
            cities = promise.map(function makeSimplerObject(city){
                return {
                    name: city.city,
                    state: city.state,
                    population: city.population
                }
            });
        }
    }

    function displayResults(results, searchInput){
        output.innerHTML = results.map(makeHTMLforResult).join(' ');

        function makeHTMLforResult(result){
            const citiName = markMatches(searchInput, result.name);
            const stateName = markMatches(searchInput, result.state);
            const population = result.population; // TODO - formatting 123,456,789,012 ...
            return  `<li class="result">
                        <p class="city">${citiName}, ${stateName}</p>
                        <p class="population">${population}</p>
                    </li>`;
        }

        function markMatches(worldToMatch, source){
            const regex = new RegExp(worldToMatch, 'gi');
            return source.replace(regex, `<mark>${worldToMatch}</mark>`);
        }
    }

    function setEventListener(){
        input.addEventListener('keyup', function TODO(){
            const searchInput = this.value;
            if(searchInput.length < numberOfCharsToShowInput) {
                output.innerHTML = '';
                return;
            }

            const results = cities.filter(isMatch);
            displayResults(results, searchInput);

            function isMatch(city){
                const regex = new RegExp(searchInput, 'gi');
                return city.name.match(regex) || city.state.match(regex);
            }
        }); 
    }

    

})(endpoint, 'results', 'search', 3);

console.log(search.getData())
search.setEventListener();