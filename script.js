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
    
})