document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const pokemonList = document.getElementById('pokemon-list');
    const pokemonModal = document.getElementById('pokemon-modal');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const viewFavoritesButton = document.getElementById('view-favorites');
    const filterTypeSelect = document.getElementById('filter-type');
    const searchField = document.getElementById('search');
    
    // Suggestions box
    const suggestionsBox = document.createElement('div');
    suggestionsBox.classList.add('suggestions-box');
    searchField.parentNode.appendChild(suggestionsBox);

    // Reload button
    const refreshHeading = document.getElementById('refresh-heading');
    refreshHeading.addEventListener('click', () => {
        location.reload();
    });

    let allPokemons = [];

    // Fetch Pokémon data
    fetch('https://pokeapi.co/api/v2/pokemon?limit=200')
        .then(response => response.json())
        .then(data => {
            allPokemons = data.results;

            const randomPokemons = getRandomPokemons(data.results, 48);
            randomPokemons.forEach(pokemon => {
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(pokemonDetails => {
                        renderPokemonCard(pokemonDetails);
                    });
            });
        });

    // Search functionality
    searchField.addEventListener('input', () => {
        const input = searchField.value.toLowerCase();
        if (input) {
            const filtered = allPokemons.filter(pokemon => pokemon.name.includes(input));
            renderSuggestions(filtered.slice(0, 5));
        } else {
            suggestionsBox.innerHTML = '';
        }
    });

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

    // Open modal
    function openModal(pokemon) {
        const imageSrc =
            pokemon.sprites.other.dream_world.front_default ||
            pokemon.sprites.other['official-artwork'].front_default ||
            pokemon.sprites.front_default;

        const backgroundColor = getTypeColor(pokemon.types[0].type.name);

        document.getElementById('modal-title').textContent = pokemon.name;
        document.getElementById('modal-body').innerHTML =
            `
            <button id="back-to-main" class="back-button">&times;</button>
            <img src="${imageSrc}" alt="${pokemon.name}">
            <p><strong>Type:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            <p><strong>Height:</strong> ${(pokemon.height / 10).toFixed(2)} m</p>
            <p><strong>Weight:</strong> ${(pokemon.weight / 10).toFixed(2)} kg</p>
            <p><strong>Abilities:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
            <p><strong>Base Stats:</strong></p>
            <ul>
                ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
        `;

        // Apply background color to modal
        const modalContent = document.querySelector('.modal-content');
        modalContent.style.backgroundColor = backgroundColor;

        pokemonModal.style.display = 'flex';
    }

    document.getElementById('modal-body').addEventListener('click', (e) => {
        if (e.target.id === 'back-to-main') {
            pokemonModal.style.display = 'none';
        }
    });

    // Toggle dark mode
    toggleThemeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleThemeButton.textContent = document.body.classList.contains('dark-mode') ? '\u263D' : '\u2600';
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

    viewFavoritesButton.addEventListener('click', () => {
        const favorites = Object.values(localStorage).map(item => JSON.parse(item));
        pokemonList.innerHTML = '';
        favorites.forEach(fav => {
            renderPokemonCard(fav);
        });
    });

    searchField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchPokemon(searchField.value.toLowerCase());
        }
    });

    document.getElementById('search-btn').addEventListener('click', () => {
        searchPokemon(searchField.value.toLowerCase());
    });

    // Search Pokémon
    function searchPokemon(query) {
        const pokemon = allPokemons.find(p => p.name === query);
        if (pokemon) {
            pokemonList.innerHTML = '';
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
            pokemonList.innerHTML = '';
            const randomPokemons = getRandomPokemons(allPokemons, 16);
            randomPokemons.forEach(pokemon => {
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(pokemonDetails => renderPokemonCard(pokemonDetails));
            });
        } else {
            fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
                .then(response => response.json())
                .then(data => {
                    pokemonList.innerHTML = '';
                    data.pokemon.forEach(({ pokemon }) => {
                        fetch(pokemon.url)
                            .then(response => response.json())
                            .then(pokemonDetails => renderPokemonCard(pokemonDetails));
                    });
                });
        }
    });

    // Get type color
    function getTypeColor(type) {
        const typeColors = {
            fire: '#F08030',
            water: '#6890F0',
            grass: '#78C850',
            electric: '#F8D030',
            psychic: '#F85888',
            ice: '#98D8D8',
            dragon: '#7038F8',
            dark: '#705848',
            fairy: '#EE99AC',
            normal: '#A8A878',
            fighting: '#C03028',
            flying: '#A890F0',
            poison: '#A040A0',
            ground: '#E0C068',
            rock: '#B8A038',
            bug: '#A8B820',
            ghost: '#705898',
            steel: '#B8B8D0'
        };

        return typeColors[type] || '#D3D3D3'; // Default to light gray if type isn't found
    }

    // Render Pokémon card
    function renderPokemonCard(pokemonDetails) {
        const imageSrc =
            pokemonDetails.sprites.other.dream_world.front_default ||
            pokemonDetails.sprites.other['official-artwork'].front_default ||
            pokemonDetails.sprites.front_default;

        const card = document.createElement('div');
        card.classList.add('pokemon-card');

        // Use the first type to determine the background color
        const backgroundColor = getTypeColor(pokemonDetails.types[0].type.name);
        card.style.backgroundColor = backgroundColor;

        card.innerHTML = `
            <div class="card-header">
                <h3>${pokemonDetails.name}</h3>
            </div>
            <img src="${imageSrc}" alt="${pokemonDetails.name}">
            <div class="card-footer">
                Type:<br> ${pokemonDetails.types.map(type => type.type.name).join(', ')}
                <button class="star-btn" data-id="${pokemonDetails.id}"><span>\u2764</span></button>
            </div>
        `;
        card.addEventListener('click', () => openModal(pokemonDetails));
        pokemonList.appendChild(card);

        const starButton = card.querySelector('.star-btn');
        if (localStorage.getItem(pokemonDetails.id)) {
            starButton.classList.add('favorited');
        }
        starButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(pokemonDetails, starButton);
        });
    }
});
