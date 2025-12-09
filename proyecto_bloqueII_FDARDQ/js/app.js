// Constante para el término de búsqueda por defecto
const DEFAULT_SEARCH_TERM = 'Cocktail'; 

document.addEventListener('DOMContentLoaded', () => {
    
    // --- NUEVAS Y EXISTENTES REFERENCIAS AL DOM ---
    const searchInput = document.querySelector('#search-input');
    const searchBtn = document.querySelector('#search-btn');
    const randomBtn = document.querySelector('#random-btn');
    const randomNav = document.querySelector('#random-nav');
    const resultsContainer = document.querySelector('#results-container');
    const errorMessage = document.querySelector('#error-message');
    const loaderContainer = document.querySelector('#loader-container'); 
    
    // NUEVA REFERENCIA: Contenedor para las letras
    const alphabetFilter = document.querySelector('#alphabet-filter'); 
    
    // Referencias menú hamburguesa
    const hamburgerBtn = document.querySelector('#hamburger-btn');
    const navMenu = document.querySelector('#nav-menu');
    const themeToggle = document.querySelector('#theme-toggle');
    const homeNav = document.querySelector('#home-nav'); // Referencia al botón Inicio

    // Instancia del modal de Bootstrap
    const myModal = new bootstrap.Modal(document.getElementById('cocktailModal'));

    // --- INICIALIZACIÓN ---
    generateAlphabetFilter(); // Genera los botones A-Z
    searchCocktails(DEFAULT_SEARCH_TERM); // Cargar resultados por defecto

    // --- EVENT LISTENERS (Control de eventos) ---

    // 1. Buscador normal
    searchBtn.addEventListener('click', () => {
        const term = searchInput.value.trim();
        if (term) searchCocktails(term);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });

    // 2. Navegación y Botón Aleatorio
    randomBtn.addEventListener('click', getRandomCocktail);
    randomNav.addEventListener('click', (e) => {
        e.preventDefault(); 
        getRandomCocktail();
        navMenu.classList.remove('active');
        hamburgerBtn.classList.remove('open');
    });

    // 3. Botón de Inicio (Corregido)
    homeNav.addEventListener('click', (e) => {
        e.preventDefault(); 
        window.scrollTo(0, 0); 
        searchCocktails(DEFAULT_SEARCH_TERM); 
        removeActiveLetter(); // Limpiar el filtro alfabético
        navMenu.classList.remove('active');
        hamburgerBtn.classList.remove('open');
    });

    // 4. Menú Hamburguesa Lógica
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburgerBtn.classList.toggle('open'); 
    });

    // 5. Modo Oscuro
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if(document.body.classList.contains('dark-mode')){
            themeToggle.textContent = '☀️ Modo Claro';
        } else {
            themeToggle.textContent = '🌙 Modo Oscuro';
        }
    });

    // 6. Listener Delegado para el Filtro Alfabético (NUEVO)
    alphabetFilter.addEventListener('click', (e) => {
        const target = e.target;
        // Solo reaccionar si hacemos click en un botón de letra
        if (target.classList.contains('letter-btn')) {
            const letter = target.dataset.letter; // Obtiene la letra del atributo data-letter
            filterByLetter(letter, target);
        }
    });

    // --- FUNCIONES ESPECÍFICAS DE FILTRADO ---

    // Función para generar los botones de la A a la Z
    function generateAlphabetFilter() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        alphabetFilter.innerHTML = letters.map(letter => 
            `<div class="letter-btn" data-letter="${letter}">${letter}</div>`
        ).join('');
    }

    // Función que inicia la búsqueda por inicial
    function filterByLetter(letter, element) {
        removeActiveLetter(); // Quita el estado 'active' de todas las letras
        element.classList.add('active'); // Marca la letra pulsada como activa
        
        // La API usa 'f=' para el filtro por primera letra
        const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`;
        fetchCocktails(url);
    }
    
    // Función auxiliar para limpiar el estado activo de las letras
    function removeActiveLetter() {
        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    // --- FUNCIONES ASÍNCRONAS (Uso de async/await y try/catch) ---

    // La función searchCocktails ahora asume que el término puede ser un nombre o el término por defecto
    async function searchCocktails(term) {
        const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${term}`;
        removeActiveLetter(); // Limpiar el filtro alfabético al buscar por nombre
        await fetchCocktails(url);
    }

    async function getRandomCocktail() {
        const url = `https://www.thecocktaildb.com/api/json/v1/1/random.php`;
        removeActiveLetter(); // Limpiar el filtro alfabético al buscar aleatorio
        await fetchCocktails(url);
    }

    // Función centralizada de Fetch (sin cambios en la lógica principal)
    async function fetchCocktails(url) {
        showLoading(); 
        hideError();
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json(); 
            
            if (data.drinks) {
                renderCocktails(data.drinks);
            } else {
                resultsContainer.innerHTML = '';
                showError('❌ No se encontraron cócteles con ese nombre/inicial.');
            }

        } catch (error) {
            console.error("Error en la petición:", error); 
            showError('⚠️ Hubo un problema de conexión con la API.'); 
        } finally {
            hideLoading(); 
        }
    }

    // --- MANIPULACIÓN DEL DOM (RENDER y Modal - sin cambios) ---

    function renderCocktails(drinks) {
        resultsContainer.innerHTML = ''; 
        // ... (resto de la lógica de renderizado de tarjetas) ...
        drinks.forEach(drink => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-lg-3';

            col.innerHTML = `
                <div class="card h-100 shadow-sm border-0">
                    <img src="${drink.strDrinkThumb}" class="card-img-top" alt="${drink.strDrink}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold">${drink.strDrink}</h5>
                        <p class="card-text text-muted">${drink.strCategory}</p>
                        <button class="btn btn-dark mt-auto btn-detail" data-id="${drink.idDrink}">Ver más</button>
                    </div>
                </div>
            `;
            
            resultsContainer.append(col);
        });

        const detailBtns = document.querySelectorAll('.btn-detail');
        detailBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id'); 
                const drinkData = drinks.find(d => d.idDrink === id);
                openModal(drinkData);
            });
        });
    }

    function openModal(drink) {
        document.getElementById('modal-title').textContent = drink.strDrink;
        document.getElementById('modal-img').src = drink.strDrinkThumb;
        document.getElementById('modal-category').textContent = drink.strCategory;
        document.getElementById('modal-alcohol').textContent = drink.strAlcoholic;
        document.getElementById('modal-instructions').textContent = drink.strInstructionsES || drink.strInstructions; 

        const list = document.getElementById('modal-ingredients');
        list.innerHTML = ''; 

        for (let i = 1; i <= 15; i++) {
            const ingredient = drink[`strIngredient${i}`];
            const measure = drink[`strMeasure${i}`];

            if (ingredient) {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = `${measure ? measure.trim() + ' ' : ''}${ingredient}`; 
                list.append(li);
            }
        }
        myModal.show();
    }

    // --- FUNCIONES AUXILIARES DE LOADER Y ERROR ---
    function showLoading() {
        resultsContainer.classList.add('d-none'); 
        loaderContainer.classList.remove('d-none'); 
    }
    
    function hideLoading() {
        loaderContainer.classList.add('d-none'); 
        resultsContainer.classList.remove('d-none'); 
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('d-none');
    }

    function hideError() {
        errorMessage.classList.add('d-none');
    }
});