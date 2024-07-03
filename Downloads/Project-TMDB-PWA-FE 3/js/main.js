const apiBaseUrl = "https://project-tmdb-pwa-be-2.onrender.com/api/movies"; // Replace with your actual API base URL
const apiRandomUrl = "https://project-tmdb-pwa-be-2.onrender.com/api/movie";
const cacheName = "pwa-app-project-1";
const movieCacheName = "movies-pwa-project-1";
const DUMMY_IMAGE = `https://images.unsplash.com/photo-1606603696914-a0f46d934b9c?q=80&w=1564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`/sw.js`)
      .then((reg) => console.log("Service Worker Registered"))
      .catch((err) => console.log("Service Worker Registration Failed", err));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  var myForm = document.getElementById("search-form");

  if (myForm) {
    ``
    myForm.addEventListener("submit", function (event) {
      // Prevent the form from submitting
      event.preventDefault();

      // Perform any necessary form validation or data processing here
      var keyword = myForm.elements["keyword"].value;
      var sort = myForm.elements["sort"].value;

      if (navigator.onLine) {
        window.location.href = `${window.location.origin}/search-results.html?keyword=${keyword}&sort=${sort}`;
      } else {
        window.location.href = `${window.location.origin}/cache-results.html?keyword=${keyword}&sort=${sort}`;
      }
    });
  }
});

// Fetch movies from API
async function fetchMovies(keyword, sort) {
  const response = await fetch(`${apiBaseUrl}?keyword=${keyword}&sort=${sort}`);
  console.log(response, "url working");
  const data = await response.json();
  return data.status ? data.data : [];
}

// Fetch movies from API
async function fetchFavourites() {
  const response = await fetch(`${apiBaseUrl}/favourites`);
  const data = await response.json();
  return data.status ? data.data : [];
}

// Display search results
async function displaySearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const keyword = urlParams.get("keyword");
  const sort = urlParams.get("sort");

  if (keyword && sort) {
    if (navigator.onLine) {
      sortingHeader(sort);
      const movies = await fetchMovies(keyword, sort);
      // cacheMovies(movies);
      cacheMovieImages(movies);
      renderMovies(movies, document.getElementById("results-list"));
    } else {
      const cachedMovies = await getCachedMovies();
      renderMovies(cachedMovies, document.getElementById("cache-results-list"));
    }
  }
}

// Navigate to movie details
function navigateToDetails(e) {

  let obj = JSON.parse(data || {})

  if (obj?.id) {
    cacheMovies([obj])
    window.location.href = `./details.html?id=${id}`;
  }
}

function sortingHeader(sort) {
  const headerElement = document.getElementById("sortType");
  
  const headerTexts = {
    "release-date": "New Collection",
    "popularity": "Most Popular",
    "vote": "Most Votes"
  };

  if (headerElement) {
    headerElement.textContent = headerTexts[sort] || "";
  }
}

// Render movies in the DOM
function renderMovies(movies, container) {
  if (movies?.length && container) {
    container.innerHTML = '';
    movies.forEach(movie => {
      const li = document.createElement('li');
      li.classList.add('movie-tile');
      li.innerHTML = `
      <div class="movie-link">
      <img src="${movie.imageUrl}" alt="${movie.title}">
      <div class="movie-details">
      <span>${movie.title}</span>
      <button class="details-button" onclick="navigateToDetails(${movie.id})"><i class="fa-solid fa-plus"></i> Read</button>
      </div>
      </div>
      `;
      container.appendChild(li);
    });
  }
}

// Function to navigate to details page
function navigateToDetails(movieId) {
  window.location.href = `./details.html?id=${movieId}`;
}

// Cache movies
async function cacheMovies(movies) {
  const cache = await caches.open(movieCacheName);
  await Promise.all(
    movies.map((movie) =>
      cache.put(`movie-${movie.id}.json`, new Response(JSON.stringify(movie)))
    )
  );
}

// Get cached movies
async function getCachedMovies() {
  const cache = await caches.open(movieCacheName);
  const keys = await cache.keys();
  const movies = await Promise.all(
    keys.map((key) => cache.match(key).then((res) => res.json()))
  );
  return movies;
}

// Fetch and display movie details
async function displayMovieDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("id");

  if (navigator.onLine) {
    const cache = [];
    const response = await fetch(`${apiBaseUrl}/${movieId}`);
    const movie = await response.json();

    renderMovieDetails(movie.status ? movie.data[0] : null);
  } else {
    const movie = await getCachedMovieDetails(movieId);
    renderMovieDetails(movie);
  }
}

// Fetch and display random movie details
async function displayRandomMovies() {
  if (navigator.onLine) {
    const cache = [];
    const response = await fetch(`${apiRandomUrl}`);
    const movie = await response.json();
    console.log(response, "random url working");
    renderRandomMovies(movie.status ? movie.data : null, document.getElementById("randomData"));
  } else {
    const movie = await getCachedMovieDetails(movieId);
    renderRandomMovies(movie);
  }
}

//random movies
function renderRandomMovies(movies, container) {
  if (movies?.length && container) {
    container.innerHTML = '';
    movies.forEach(movie => {
      const li = document.createElement('li');
      li.classList.add('randomData');
      li.innerHTML = `
      <div class="movie-link">
      <img src="${movie.imageUrl}" alt="${movie.title}">
      <div class="movie-details">
      <span>${movie.title}</span>
      <button class="details-button" onclick="navigateToDetails(${movie.id})"><i class="fa-solid fa-plus"></i> Read</button>
      </div>
      </div>
      `;
      container.appendChild(li);
    });
  }
}

// Render movie details in the DOM
function renderMovieDetails(movie) {
  if (movie) {
    cacheMovieDetails(movie)
    const container = document.getElementById("movie-details");
    container.innerHTML = `
        <img src="${movie?.iconUrl || DUMMY_IMAGE}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p><b>Release Date:</b> ${movie.release_date}</p>
        <p>${movie.description}</p>
        <p><b>Rating:</b> ${Math.floor(movie.rating)} out of 10</p>
        <i class="fa-regular fa-heart heartCss ${movie.isFavourite ? 'active' : ''}" autofocus="off" id="favourite"  onclick="favouriteMovie(${movie.id})" />`;

  }
}


async function favouriteMovie(id) {
  const response = await fetch(`${apiBaseUrl}/${id}/favourite`, {
    method: 'post'
  });
  const data = await response.json();
  if (data?.isLiked) {
    document.getElementById('favourite').classList.add('active');

  } else {
    document.getElementById('favourite').classList.remove('active');

  }
}


// Cache movie details
async function cacheMovieDetails(movie) {
  const cache = await caches.open(movieCacheName);
  await cache.put(
    `movie-${movie.id}.json`,
    new Response(JSON.stringify(movie))
  );
}

async function cacheMovieImages(movies) {
  const cache = await caches.open(cacheName);
  const corsPrevent = "https://cors-anywhere.herokuapp.com";
  if (movies?.length) {
    await Promise.allSettled(
      movies.map(async (movie) => {
        if (movie.imageUrl) {
          fetch(
            `http://localhost:3000/proxy?url=${movie.imageUrl || DUMMY_IMAGE}`
          )
            .then((res) => res.blob())
            .then(async (blob) => {
              let file = new File([blob], movie.imageUrl || DUMMY_IMAGE, {
                type: blob.type,
              });
              const response = new Response(file, {
                headers: {
                  "content-type": file.type,
                  "content-length": file.size,
                },
              });
              await cache.put(`${movie.imageUrl || DUMMY_IMAGE}`, response);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
    );
  }
}
// Get cached movie details
async function getCachedMovieDetails(movieId) {
  const cache = await caches.open(movieCacheName);
  const response = await cache.match(`movie-${movieId}.json`);
  const movie = await response.json();
  return movie;
}

if (document.getElementById("results-list")) {
  document.addEventListener("DOMContentLoaded", () => {
    if (navigator.onLine) {
      displaySearchResults()
    } else if (window.location.pathname == '/search-results.html') {
      window.location.href = `${window.location.origin}/`;
    }

  });

}

async function displayFavourites() {

  if (navigator.onLine) {
    const movies = await fetchFavourites();
    renderMovies(movies, document.getElementById("favorites-list"));
  }

}

if (document.getElementById("cache-results-list")) {
  document.addEventListener("DOMContentLoaded", displaySearchResults);
}

if (document.getElementById("movie-details")) {

  document.addEventListener("DOMContentLoaded", displayMovieDetails);
}


if (document.getElementById("randomData")) {
  document.addEventListener("DOMContentLoaded", displayRandomMovies);
}

if (document.getElementById("favorites-list")) {
  document.addEventListener("DOMContentLoaded", () => {
    if (navigator.onLine) {
      displayFavourites()
    } else {
      window.location.href = `${window.location.origin}`;

    }
  });
}
