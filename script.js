const card = document.getElementById("card");
const loadingText = document.getElementById("loading-text");
const catImage = document.getElementById("cat-img");
const loveButton = document.getElementById("love-btn");
const skipButton = document.getElementById("skip-btn");
const favouriteHistory = document.getElementById("history");
const modal = document.getElementById("intro-modal");
const startBtn = document.getElementById("start-btn");
const swipeContent = document.getElementById("swipe-content");
const toggleButton = document.getElementById("toggle-cat-dog");
const title = document.getElementById("page-title");

let favouriteCats = [];
let currentCatUrl = ""; // to save the current displayed cat's URL
let latestfavouritCatURL = "";
let catCount = 0;
const maxCats = 20;
let allowSwipe = true;
let currentCatType = "image";

function setButtonsEnabled(enabled) {
  loveButton.disabled = !enabled;
  skipButton.disabled = !enabled;
}

// Fetch cat metadata and image
function fetchCat() {
  if (catCount >= maxCats) return;

  setButtonsEnabled(false); // Disable buttons while loading
  allowSwipe = false; // Disable swiping while loading
  loadingText.style.display = "block";
  loadingText.textContent = "Loading cat... 🐈";
  catImage.hidden = true;

  loadingText.textContent = currentCatType === "dog"
    ? "Fetching good boi... 🐶"
    : "Loading cat... 🐈";
  catImage.hidden = true;

  const endpoint =
    currentCatType === "dog"
      ? "https://dog.ceo/api/breeds/image/random"
      : "https://cataas.com/cat?json=true";

  // Using json to get a url that can be used to download the cat/dog image
  fetch(endpoint)
    .then((response) => response.json())
    .then((data) => {
      currentCatUrl =
        currentCatType === "dog"
          ? data.message // full image URL for dogs
          : data.url; // full image URL for cats

      catImage.src = currentCatUrl;
      catImage.alt = currentCatType === "dog" ? "Random Dog" : "Cute Cat";
      
      catImage.onload = () => {
        loadingText.style.display = "none";
        catImage.hidden = false;
        setButtonsEnabled(true); // Enable buttons after image loads
        allowSwipe = true;  // Enable swiping after image fully loads

        // Remove background and border after image loads
        card.style.backgroundColor = "transparent";
        card.style.border = "none";
      };

      catImage.onerror = () => {
        loadingText.textContent = "Failed to load image 😿 Retrying...";
        fetchCat(); // Retry if image fails
      };
    })
    .catch(() => {
      loadingText.textContent = "Failed to fetch image 😿 Retrying...";
      fetchCat(); // Retry if image fails
    });
}

// Listeners to handle button clicks for both love and skip buttons
function addListeners() {
  loveButton.addEventListener("click", () => {
    addToFavourites(); // add cat to history if love/like is clicked
    catCount++;

    if (catCount >= maxCats) {
      endSession();
    } else {
      fetchCat();
    }
  });

  skipButton.addEventListener("click", () => {
    catCount++;

    if (catCount >= maxCats) {
      endSession();
    } else {
      fetchCat();
    }
  });
}

function endSession() {
  setButtonsEnabled(false);
  catImage.hidden = true;
  allowSwipe = false;
  card.style.transform = "translateX(0) rotate(0)";
  loadingText.style.display = "block";
  loadingText.textContent = "Thank you for Using Meow Match! 😻";
  loveButton.hidden = true;
  skipButton.hidden = true;
}


// Cat images liked by user is stored and shown on the webpage
// Add favourite cats to history with clickable images to show the full cat image
function addToFavourites() {
  if (!currentCatUrl) return;

  if (currentCatUrl == latestfavouritCatURL) return;

  latestfavouritCatURL = currentCatUrl;

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

function enableDragSwipe() {
  let startX = 0;         // Where the drag starts (x position)
  let isDragging = false; // True while dragging

  // Called when user starts dragging
  const onDragStart = (x) => {
    if (!allowSwipe) return;

    startX = x;                  // Save initial x position
    isDragging = true;          // User is now dragging the cat image
    card.style.transition = "none"; // Remove transition while dragging
  };

  // Called while dragging
  const onDragMove = (x) => {
    if (!isDragging || !allowSwipe) return;

    let deltaX = x - startX;      // how far user dragged the cat image

    let rotateDeg = deltaX / 10;  // Make rotation lesser than how much user is dragging

    // Rotation is limited to range [-20, 20] degrees
    if (rotateDeg > 20) {
      rotateDeg = 20;
    }
    if (rotateDeg < -20) {
      rotateDeg = -20;
    }

    // Move and rotate the card visually
    card.style.transform = `translateX(${deltaX}px) rotate(${rotateDeg}deg)`;
  };

  // Called when dragging ends
  const onDragEnd = (x) => {
    if (!isDragging || !allowSwipe) return;

    isDragging = false;
    const deltaX = x - startX; // Total movement

    card.style.transition = "transform 0.3s ease"; // change transition style for animating the snap/swipe

    if (deltaX < -100) {
      // Swiped left (like)
      card.style.transform = "translateX(-150%) rotate(-20deg)";
      handleAction("like");
    } else if (deltaX > 100) {
      // Swiped right (skip)
      card.style.transform = "translateX(150%) rotate(20deg)";
      handleAction("skip");
    } else {
      // Not enough swipe → reset card
      card.style.transform = "translateX(0) rotate(0)";
    }
  };

  // Mouse Events
  card.addEventListener("mousedown", (e) => {
    e.preventDefault(); // Prevent native image dragging when mouse is cliccked
    onDragStart(e.clientX);
  });

  card.addEventListener("mousemove", (e) => {
    onDragMove(e.clientX);
  });

  card.addEventListener("mouseup", (e) => {
    onDragEnd(e.clientX);
  });

  card.addEventListener("mouseleave", (e) => {
    onDragEnd(e.clientX); // Also end drag if mouse leaves the card div
  });

  // Touch Events (Mobile)
  card.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Stop mobile device from scrolling or selecting the image
    onDragStart(e.touches[0].clientX);
  });

  card.addEventListener("touchmove", (e) => {
    onDragMove(e.touches[0].clientX);
  });

  card.addEventListener("touchend", (e) => {
    onDragEnd(e.changedTouches[0].clientX);
  });
}

function handleAction(type) {
  setButtonsEnabled(false);
  setTimeout(() => {
    if (type === "like") {
      addToFavourites();
    }

    catCount++;
    if (catCount >= maxCats) {
      endSession();
    } else {
      fetchCat();
      document.getElementById("card").style.transform = "translateX(0) rotate(0)";
    }
  }, 300); // Add delay to smoothen animation transition using timeout
}

// onload of website windows run the fetchCat and button listners
window.onload = () => {
  startBtn.addEventListener("click", () => {
    modal.style.display = "none";
    swipeContent.style.display = "block";
    fetchCat();
    addListeners();
    enableDragSwipe();
  });

  toggleButton.addEventListener("click", () => {
    currentCatType = currentCatType === "image" ? "dog" : "image";
    toggleButton.textContent = currentCatType === "dog" ? "🐶 Dog Images" : "🐱 Cat Images";

    title.textContent = currentCatType === "dog" ? "Doggo Match 🐶" : "Meow Match 🐱";
    document.title = currentCatType === "dog" ? "Doggo Match 🐶" : "Meow Match 🐱";
    fetchCat(); // reload cat based on type
  });
};
