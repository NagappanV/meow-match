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
let currentCatUrl = ""; // to save the current displayed cat's URL

// Fetch cat metadata and image
function fetchCat() {
  loadingText.style.display = "block";
  catImage.hidden = true;

  // Using json to get a url that can be used to download the cat image
  fetch(`https://cataas.com/cat?json=true&timestamp=${Date.now()}`)
    .then(response => response.json())
    .then(data => {
      currentCatUrl = data.url; // Full image URL
      catImage.src = currentCatUrl;

      catImage.onload = () => {
        loadingText.style.display = "none";
        catImage.hidden = false;
      };

      catImage.onerror = () => {
        loadingText.textContent = "Failed to load cat 😿";
      };
    })
    .catch(() => {
      loadingText.textContent = "Failed to fetch cat metadata 😿";
    });
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
// Add favourite cats to history with clickable images to show the full cat image
function addToFavourites() {
  if (!currentCatUrl) return;

  // Save URL to array
  favouriteCats.push(currentCatUrl);

  // Adding hyperlinks to allow users to click on the cats in the favourites for downloading purposes
  const link = document.createElement("a");
  link.href = currentCatUrl;
  link.target = "_blank";

  const img = document.createElement("img");
  img.src = currentCatUrl;
  img.style.width = "8em";
  img.style.height = "8em";
  img.style.objectFit = "cover";
  img.style.margin = "5px";
  img.alt = "Favourite Cat";

  link.appendChild(img);
  favouriteHistory.appendChild(link);
}
