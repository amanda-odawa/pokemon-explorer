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
    const refreshHeading = document.getElementById('refresh-heading');
    refreshHeading.addEventListener('click', () => {
        location.reload();
    });

    let allPokemons = [];

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

    function openModal(pokemon) {
        const imageSrc =
            pokemon.sprites.other.dream_world.front_default ||
            pokemon.sprites.other['official-artwork'].front_default ||
            pokemon.sprites.front_default;

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
        pokemonModal.style.display = 'flex';
    }

    document.getElementById('modal-body').addEventListener('click', (e) => {
        if (e.target.id === 'back-to-main') {
            pokemonModal.style.display = 'none';
        }
    });

    toggleThemeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleThemeButton.textContent = document.body.classList.contains('dark-mode') ? '\u263D' : '\u2600';
    });

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

    function renderPokemonCard(pokemonDetails) {
        const imageSrc =
            pokemonDetails.sprites.other.dream_world.front_default ||
            pokemonDetails.sprites.other['official-artwork'].front_default ||
            pokemonDetails.sprites.front_default;

        const card = document.createElement('div');
        card.classList.add('pokemon-card');
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

