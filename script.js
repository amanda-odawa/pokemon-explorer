document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const pokemonModal = document.getElementById('pokemon-modal');
    const closeModal = document.getElementById('close-modal');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const viewFavoritesButton = document.getElementById('view-favorites');

    //Fetch Pokémon data
    fetch('https://pokeapi.co/api/v2/pokemon?limit=200')
        .then(response => response.json())
        .then(data => {
            const randomPokemons = getRandomPokemons(data.results, 15);

            randomPokemons.forEach(pokemon => {
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(pokemonDetails => {
                        const card = document.createElement('div');
                        card.classList.add('pokemon-crad');
                        card.innerHTML = 
                        `
                        <img src="${pokemonDetails.sprites.front_default}" alt="${pokemonDetails.name}">
                        <h3>${pokemonDetails.name}</h3>
                        <button class="star-btn" data-id="${pokemonDetails.id}">\u2B50</button>
                        `;
                        card.addEventListener('click', () => openModal(pokemonDetails));
                        pokemon.appendChild(card);

                        //Check if favorited
                        const starButton = card.querySelector('.star-btn');
                        if(localStorage.getItem(pokemonDetails.id)) {
                            starButton.textContent = "\u2605";
                        }

                        //Toggle favorite
                        starButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            toggleFavorite(pokemonDetails, starButton);
                        });
                    });
            });
        })
    
    //Get random Pokémon
    function getRandomPokemons(pokemonArray, count) {
        let selectedPokemons = [];
        while(selectedPokemons.length < count) {
            const randomIndex = Math.floor(Math.random() * pokemonArray.length);
            if(!selectedPokemons.includes(pokemonArray[randomIndex])) {
                selectedPokemons.push(pokemonArray[randomIndex]);
            }
        }
        return selectedPokemons;
    }

    //Open details modal
    function openModal(pokemon) {
        document.getElementById('modal-title').textContent = pokemon.name;
        document.getElementById('modal-body').innerHTML =
        `
        <p>Height: ${pokemon.height}</p>
        <p>Weight: ${pokemon.weight}</p>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        `;
        pokemonModal.style.display = 'flex';
    }

    //Close modal 
    closeModal.addEventListener('click', () => {
        pokemonModal.style.display = 'none';
    });

    //Toggle dark/light mode
    toggleThemeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    //Toggle favorite
    function toggleFavorite(pokemon, starButton) {
        const isFavorited = localStorage.getItem(pokemon.id);
        if(isFavorited) {
            localStorage.removeItem(pokemon.id);
            starButton.textContent = '\u2B50';
        }
        else {
            localStorage.setItem(pokemon.id, JSON.stringify(pokemon));
            starButton.textContent = '\u2605';
        }
    }
})