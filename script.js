// onload of website windows run the fetchCat and button listners
window.onload = () => {
  fetchCat();
  addListeners();
};

const loadingText = document.getElementById("loading-text");
const catImage = document.getElementById("cat-img");
const loveButton = document.getElementById("love-btn");
const skipButton = document.getElementById("skip-btn");
const favouriteHistory = document.getElementById("history");

let favouriteCats = [];

// Fetching Cat and change the loading-text element when loading or if loading is failed.
function fetchCat() {
  loadingText.style.display = "block";
  catImage.hidden = true;

  catImage.onload = () => {
    loadingText.style.display = "none";
    catImage.hidden = false;
  };

  catImage.onerror = () => {
    loadingText.textContent = "Failed to load cat 😿";
  };
  
  // Adding timestamp to avoid caching
  catImage.src = `https://cataas.com/cat?timestamp=${Date.now()}`;
}

// Listeners to handle button clicks for both love and skip buttons
function addListeners() {
  loveButton.addEventListener("click", () => {
    addToFavourites(); // add cat to history if love/like is clicked
    fetchCat();
  });

  skipButton.addEventListener("click", () => {
    fetchCat();
  });
}

// Cat images liked by user is stored and shown on the webpage
function addToFavourites() {
  const currentCatUrl = catImage.src;

  // Save URL to array
  favouriteCats.push(currentCatUrl);

  // Create img element and set its src
  const img = document.createElement("img");
  img.src = currentCatUrl;
  img.style.width = "20%";
  img.style.margin = "0.1em";

  // Append to favourites history section
  favouriteHistory.appendChild(img);
}
