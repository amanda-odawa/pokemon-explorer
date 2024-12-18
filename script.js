document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const pokemonModal = document.getElementById('pokemon-modal');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const viewFavoritesButton = document.getElementById('view-favorites');
    const filterTypeSelect = document.getElementById('filter-type');
    const searchField = document.getElementById('search');
    const suggestionsBox = document.createElement('div');
    suggestionsBox.classList.add('suggestions-box');
    searchField.parentNode.appendChild(suggestionsBox);

    // To store all Pokémon names and URLs
    let allPokemons = []; 
    
    // Fetch Pokémon data
    fetch('https://pokeapi.co/api/v2/pokemon?limit=200')
        .then(response => response.json())
        .then(data => {
            // Store all Pokémon data
            allPokemons = data.results;

            // Display random Pokémon on load
            const randomPokemons = getRandomPokemons(data.results, 48);

            randomPokemons.forEach(pokemon => {
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(pokemonDetails => {
                        renderPokemonCard(pokemonDetails);
                    });
            });
        });

    // Input event to display suggestions as the user types
    searchField.addEventListener('input', () => {
        const input = searchField.value.toLowerCase();
        if (input) {
            const filtered = allPokemons.filter(pokemon => pokemon.name.includes(input));
            renderSuggestions(filtered.slice(0, 5)); // Limit to top 5 suggestions
        } 
        else {
            suggestionsBox.innerHTML = '';
        }
    });

    // Function to render suggestions
    function renderSuggestions(suggestions) {
        suggestionsBox.innerHTML = '';
        if (suggestions.length === 0) return;

        suggestions.forEach(pokemon => {
            const suggestionItem = document.createElement('div');
            suggestionItem.textContent = pokemon.name;
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.addEventListener('click', () => {
                searchField.value = pokemon.name;
                suggestionsBox.innerHTML = '';
                searchPokemon(pokemon.name);
            });
            suggestionsBox.appendChild(suggestionItem);
        });
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchField.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.innerHTML = '';
        }
    });

    // Get random Pokémon
    function getRandomPokemons(pokemonArray, count) {
        let selectedPokemons = [];
        while (selectedPokemons.length < count) {
            const randomIndex = Math.floor(Math.random() * pokemonArray.length);
            if (!selectedPokemons.includes(pokemonArray[randomIndex])) {
                selectedPokemons.push(pokemonArray[randomIndex]);
            }
        }
        return selectedPokemons;
    }

    // Open details modal
    function openModal(pokemon) {
        document.getElementById('modal-title').textContent = pokemon.name;
        document.getElementById('modal-body').innerHTML =
        `
        <span id="close-modal" class="close">&times;</span>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>Type:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <p><strong>Height:</strong> ${(pokemon.height / 10).toFixed(2)} m</p>
        <p><strong>Weight:</strong> ${(pokemon.weight / 10).toFixed(2)} kg</p>
        <p><strong>Abilities:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
        <p><strong>Base Stats:</strong></p>
        <ul>
            ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>
        <button id="back-to-main" class="back-button">Back</button>
        `;
        pokemonModal.style.display = 'flex';
    }

    // Back button logic
    document.getElementById('modal-body').addEventListener('click', (e) => {
        if (e.target.id === 'back-to-main') {
            pokemonModal.style.display = 'none';
        }
    });

    // Toggle dark/light mode
    toggleThemeButton.addEventListener('click', () => {
    // Toggle dark mode on the body element
    document.body.classList.toggle('dark-mode');

    // Change the icon depending on the current theme
    if (document.body.classList.contains('dark-mode')) {
        toggleThemeButton.textContent = '\u263D'; 
    } else {
        toggleThemeButton.textContent = '\u2600'; 
    }
});

    // Toggle favorite
    function toggleFavorite(pokemon, starButton) {
        const isFavorited = localStorage.getItem(pokemon.id);
        if (isFavorited) {
            localStorage.removeItem(pokemon.id);
            starButton.classList.remove('favorited');
        } else {
            localStorage.setItem(pokemon.id, JSON.stringify(pokemon));
            starButton.classList.add('favorited');
        }
    }    

    // View favorites
    viewFavoritesButton.addEventListener('click', () => {
        const favorites = Object.values(localStorage)
            .map(item => JSON.parse(item));
        pokemonList.innerHTML = '';
        favorites.forEach(fav => {
            renderPokemonCard(fav);
        });
    });

    // Trigger search on 'Enter' or button click
    searchField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchPokemon(searchField.value.toLowerCase());
        }
    });

    document.getElementById('search-btn').addEventListener('click', () => {
        searchPokemon(searchField.value.toLowerCase());
    });

    // Function to search for a Pokémon and display it
    function searchPokemon(query) {
        const pokemon = allPokemons.find(p => p.name === query);
        if (pokemon) {
            pokemonList.innerHTML = ''; // Clear the list
            fetch(pokemon.url)
                .then(response => response.json())
                .then(pokemonDetails => {
                    renderPokemonCard(pokemonDetails);
                });
        } else {
            pokemonList.innerHTML = '<p style="text-align:center;">Pokémon not found.</p>';
        }
    }

    // Filter by type
    filterTypeSelect.addEventListener('change', () => {
        const selectedType = filterTypeSelect.value;

        if (selectedType === 'all') {
            // If 'All Types' is selected, display random Pokémon
            pokemonList.innerHTML = '';
            const randomPokemons = getRandomPokemons(allPokemons, 16);
            randomPokemons.forEach(pokemon => {
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(pokemonDetails => renderPokemonCard(pokemonDetails));
            });
        } else {
            // Fetch Pokémon by type
            fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
                .then(response => response.json())
                .then(data => {
                    pokemonList.innerHTML = ''; // Clear current list
                    data.pokemon.forEach(({ pokemon }) => {
                        fetch(pokemon.url)
                            .then(response => response.json())
                            .then(pokemonDetails => renderPokemonCard(pokemonDetails));
                    });
                });
        }
    });

    // Function to render a Pokémon card
    function renderPokemonCard(pokemonDetails) {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.innerHTML = `
            <img src="${pokemonDetails.sprites.front_default}" alt="${pokemonDetails.name}">
            <h3>${pokemonDetails.name}</h3>
            <button class="star-btn" data-id="${pokemonDetails.id}"><span>\u2764</span></button>
        `;
    
        card.addEventListener('click', () => openModal(pokemonDetails));
        pokemonList.appendChild(card);
    
        // Check if favorited
        const starButton = card.querySelector('.star-btn');
        if (localStorage.getItem(pokemonDetails.id)) {
            starButton.classList.add('favorited');
        }
    
        // Toggle favorite
        starButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(pokemonDetails, starButton);
        });
    }
    
});
