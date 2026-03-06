// Move Stall Design by Pious Godfearing, in space of two weeks 3days 8 hours. Ended on Mar/05/2026 2:AM NY time. FES Academy Project. 

function openMenu() {
    document.body.classList.add("menu--open");
}

function closeMenu() {
    document.body.classList.remove("menu--open");
}

const API_KEY = "c2556c42";

const categories = ["Trending", "Classical", "Horror", "Romantic"];
const movieList = {
    Trending: ["Avengers: Endgame", "Inception", "Black Panther", "Joker"],
    Classical: ["Casablanca", "Gone with the Wind", "The Godfather", "Citizen Kane"],
    Horror: ["The Conjuring", "It", "Hereditary", "A Quiet Place"],
    Romantic: ["The Notebook", "Titanic", "Pride & Prejudice", "La La Land"]
};

let currentMode = "stationary";
let stationaryCache = [];
let searchCache = [];
let lastSearchQuery = "";

// Loading state
function showLoading() {
    const movieGrid = document.querySelector(".movie__grid");
    if (!movieGrid) return;

    movieGrid.innerHTML = `
        <div class="loading-spinner">
            <img src="./img/DoubleRing.svg" alt="Loading...">
        </div>
    `;
}

function el(tag, className = "", html = "") {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html) e.innerHTML = html;
    return e;
}

function posterOrPlaceholder(poster) {
    if (!poster || poster === "N/A") {
        return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600'>
            <rect width='100%' height='100%' fill='#2DAEBC'/>
            <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='Arial' font-size='22' fill='white'>No Image</text></svg>`
        );
    }
    return poster;
}

// movie card
function createMovieCard(detailData, mode, clickMode) {
    const item1 = el("div", "item__1");
    const posterSrc = posterOrPlaceholder(detailData.Poster);

    item1.innerHTML = `
        <figure class="movie__img--wrapper">
            <img class="movie__img poster" src="${posterSrc}" alt="${detailData.Title}">
        </figure>
    `;

    item1.querySelector(".movie__img")
        .addEventListener("click", () => showDetails(detailData, clickMode));

    return item1;
}

// movie details
function createDetailsCard(detailData) {

    const item1 = el("div", "item__1");
    const posterSrc = posterOrPlaceholder(detailData.Poster);

    item1.innerHTML = `
        <figure class="movie__img--wrapper">
            <img class="movie__img detail poster" src="${posterSrc}" alt="${detailData.Title}">
        </figure>
    `;

    const item2 = el("div", "item__2");
    item2.innerHTML = `
    <div class="movie__title"><span class="orange">Title:</span> ${detailData.Title}</div>
    <div class="rated"><span class="orange">Rated:</span> ${detailData.Rated}</div>
    <div class="released"><span class="orange">Released:</span> ${detailData.Released}</div>
    <div class="genre"><span class="orange">Genre:</span> ${detailData.Genre}</div>
    <div class="box__office"><span class="orange">BoxOffice:</span> ${detailData.BoxOffice}</div>
    <div class="imdb__rating"><span class="orange">IMDB Rating:</span> ${detailData.imdbRating}/10</div>
    `;

    const item3 = el("div", "item__3");
    item3.innerHTML = `
    <div class="writer"><span class="orange">Writer:</span> ${detailData.Writer}</div>
    <div class="plot"><span class="orange">Plot:</span> ${detailData.Plot}</div>
    <div class="actors"><span class="orange">Actors:</span> ${detailData.Actors}</div>
    `;

    return [item1, item2, item3];
}

function createCloseButton(previousMode) {
    const btn = el("button", "close-details", "X");
    btn.addEventListener("click", () => restorePreviousView(previousMode));
    return btn;
}

// stationary movies
async function displayStationaryMovies() {

    const movieGrid = document.querySelector(".movie__grid");
    if (!movieGrid) return;

    showLoading();
    stationaryCache = [];

    // spinner time controller is visible for 0.4s
    await new Promise(res => setTimeout(res, 400));

    for (const category of categories) {

        const pool = movieList[category].slice();

        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        const selected = pool.slice(0, 3);

        const promises = selected.map(title =>
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`)
                .then(r => r.json())
                .catch(() => ({ Response: "False" }))
        );

        const results = await Promise.all(promises);

        // clear spinner once before appending movies
        if (movieGrid.querySelector(".loading-spinner")) {
            movieGrid.innerHTML = "";
        }

        const header = el("h2", "category__header", `${category} Movies`);
        movieGrid.appendChild(header);

        for (const data of results) {
            if (data?.Response === "True") {

                stationaryCache.push(data);

                const item = el("div", "item__1");

                item.innerHTML = `
                <figure class="movie__img--wrapper">
                    <img class="movie__img poster" src="${posterOrPlaceholder(data.Poster)}" alt="${data.Title}">
                    <figcaption class="orange">${data.Title}</figcaption>
                </figure>
                `;

                item.querySelector(".movie__img")
                    .addEventListener("click", () => showDetails(data, "stationary"));

                movieGrid.appendChild(item);
            }
        }
    }

    currentMode = "stationary";
}

function showDetails(detailData, previousMode = "stationary") {

    const movieGrid = document.querySelector(".movie__grid");
    if (!movieGrid) return;

    movieGrid.innerHTML = "";

    const [item1, item2, item3] = createDetailsCard(detailData);

    const closeBtn = createCloseButton(previousMode);
    item2.appendChild(closeBtn);

    movieGrid.appendChild(item1);
    movieGrid.appendChild(item2);
    movieGrid.appendChild(item3);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") restorePreviousView(previousMode);
    }, { once: true });

    currentMode = "details";
}

function restorePreviousView(previousMode) {
    if (previousMode === "search" && searchCache.length > 0) {
        renderSearchCache();
    } else {
        renderStationaryCache();
    }
}

function renderStationaryCache() {

    const movieGrid = document.querySelector(".movie__grid");
    if (!movieGrid) return;

    movieGrid.innerHTML = "";

    if (!stationaryCache.length) {
        displayStationaryMovies();
        return;
    }

    let idx = 0;

    for (const category of categories) {

        const header = el("h2", "category__header", `${category} Movies`);
        movieGrid.appendChild(header);

        for (let i = 0; i < 3; i++) {

            const data = stationaryCache[idx++];

            if (!data) continue;

            const item = el("div", "item__1");

            item.innerHTML = `
            <figure class="movie__img--wrapper">
                <img class="movie__img poster" src="${posterOrPlaceholder(data.Poster)}" alt="${data.Title}">
                <figcaption class="orange dvd__title">${data.Title}</figcaption>
            </figure>
            `;

            item.querySelector(".movie__img")
                .addEventListener("click", () => showDetails(data, "stationary"));

            movieGrid.appendChild(item);
        }
    }

    currentMode = "stationary";
}

function renderSearchCache() {

    const movieGrid = document.querySelector(".movie__grid");
    if (!movieGrid) return;

    movieGrid.innerHTML = "";

    for (const detailData of searchCache) {

        const [item1, item2, item3] = createDetailsCard(detailData);

        item1.innerHTML = `
        <figure class="movie__img--wrapper">
            <img class="movie__img poster" src="${posterOrPlaceholder(detailData.Poster)}" alt="${detailData.Title}">
        </figure>
        `;

        item1.querySelector(".movie__img")
            .addEventListener("click", () => showDetails(detailData, "search"));

        movieGrid.appendChild(item1);
        movieGrid.appendChild(item2);
        movieGrid.appendChild(item3);
    }

    currentMode = "search";
}

async function getMovie() {

    const movieGrid = document.querySelector(".movie__grid");
    const movieInput = document.getElementById("movieTitleInput");

    if (!movieGrid || !movieInput) return;

    const q = movieInput.value.trim();
    if (!q) return;

    lastSearchQuery = q;

    showLoading();
    searchCache = [];

    // Spinner visible time 0.4s
    await new Promise(res => setTimeout(res, 400));

    try {

        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(q)}`);

        const data = await response.json();

        if (data.Response === "False" || !data.Search?.length) {
            alert(data.Error || "No movies found");
            displayStationaryMovies();
            return;
        }

        if (movieGrid.querySelector(".loading-spinner")) {
            movieGrid.innerHTML = "";
        }

        let limitedResults = data.Search.slice(0, 6);

        const sortOption = document.querySelector(".top-search select")?.value || "";

        if (sortOption === "NEWEST_TO_OLDEST") {
            limitedResults.sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
        }
        else if (sortOption === "OLDEST_TO_NEWEST") {
            limitedResults.sort((a, b) => (parseInt(a.Year) || 0) - (parseInt(b.Year) || 0));
        }

        const details = await Promise.all(
            limitedResults.map(m =>
                fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${m.imdbID}`)
                    .then(r => r.json())
                    .catch(() => ({ Response: "False" }))
            )
        );

        for (const detail of details) {

            if (detail?.Response !== "True" || searchCache.length >= 6) continue;

            searchCache.push(detail);

            const [item1, item2, item3] = createDetailsCard(detail);

            item1.innerHTML = `
            <figure class="movie__img--wrapper">
                <img class="movie__img poster" src="${posterOrPlaceholder(detail.Poster)}" alt="${detail.Title}">
            </figure>
            `;

            item1.querySelector(".movie__img")
                .addEventListener("click", () => showDetails(detail, "search"));

            movieGrid.appendChild(item1);
            movieGrid.appendChild(item2);
            movieGrid.appendChild(item3);
        }

        currentMode = "search";

    } catch (err) {

        console.error("Search error:", err);
        displayStationaryMovies();

    }
}

document.addEventListener("DOMContentLoaded", () => {

    displayStationaryMovies();

    const searchBtn = document.querySelector(".top-search button");
    const searchInput = document.getElementById("movieTitleInput");
    const sortSelect = document.querySelector(".top-search select");

    if (searchBtn) searchBtn.addEventListener("click", getMovie);

    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") getMovie();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            if (lastSearchQuery) getMovie();
        });
    }

});