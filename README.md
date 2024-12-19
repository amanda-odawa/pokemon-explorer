# Pokémon Explorer
The application

## Table of Contents:
- [Technologies and Tools](#technologies-and-tools)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

### Technologies and Tools
- HHTML/CSS: Layout and styling.
- JavaScript: Core logic for interactivity.
- [PokéAPI](https://pokeapi.co/): The API to fetch Pokémon data.
- Local Storage: Persist the favorite Pokémon list.
- Event Listeners to handle user inputs and navigation:
    1. click (e.g., buttons like "Search")
    2. input (e.g., live search box)
    3. keyup (e.g., Enter key to trigger a search).

### Features
1. View random Pokémon on page load/reload.
2. Search Pokémon by name.
3. Filter Pokémon by type.
4. Add/Remove Pokémon to/from a Favorite List.
5. View Favorite List.
6. View Pokémon Details modal: image, name, type, abilities, stats, and evolution.
7. Toggle between Dark and Light Modes for better user experience.

### Demo
[View Live Demo](https://amanda-odawa.github.io/pokemon-explorer/)

### Installation
1. Fork and Clone the repository:
    ```bash
    git clone https://github.com/amanda-odawa/pokemon-explorer
    ```
2. Navigate to the project directory:
    ```bash
    cd week3-code-challenge
    ```
3. Ensure the API server is running at http://localhost:3000/films.
4. Open index.html in your web browser.

### Usage
Once the app is running, navigate to it in your browser. 
You can click on a card to view character details, favorite/unfavorite a character, and view favorite list. 
You can also search for a character by name on the search bar, and filter Pokémobn by type. 'Sun' button on the top right allows changing between dark and light modes.

### Contributing
Feel free to contribute! Please follow the steps below:
1. Fork the repository
2. Create a new branch
   ```bash
   git checkout -b Your-Feature-Name
    ```
3. Commit your changes
    ```bash
    git commit -m 'Add a new feature'
    ```
4. Push to the branch
    ```bash
    git push origin Your-Feature-Name
    ```
5. Open a Pull Request

### License
*Distributed under the MIT License.*