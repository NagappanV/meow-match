window.onload = fetchCat;

// Fetching Cat and change the loading-text element when loading or if loading is failed.
function fetchCat() {
  const loadingText = document.getElementById("loading-text");
  const catImage = document.getElementById("cat-img");

  // Hide image while loading cat
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
