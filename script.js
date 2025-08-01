// onload of website windows run the fetchCat and button listners
window.onload = () => {
  fetchCat();
  addListeners();
  enableDragSwipe();
};

const card = document.getElementById("card");
const loadingText = document.getElementById("loading-text");
const catImage = document.getElementById("cat-img");
const loveButton = document.getElementById("love-btn");
const skipButton = document.getElementById("skip-btn");
const favouriteHistory = document.getElementById("history");

let favouriteCats = [];
let currentCatUrl = ""; // to save the current displayed cat's URL
let latestfavouritCatURL = "";
let catCount = 0;
const maxCats = 20;
let allowSwipe = true;

function setButtonsEnabled(enabled) {
  loveButton.disabled = !enabled;
  skipButton.disabled = !enabled;
}

// Fetch cat metadata and image
function fetchCat() {
  if (catCount >= maxCats) return;

  setButtonsEnabled(false); // Disable buttons while loading
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
        setButtonsEnabled(true); // Enable buttons after image loads
      };

      catImage.onerror = () => {
        loadingText.textContent = "Failed to load cat 😿. Retrying...";
        fetchCat(); // Retry if image fails
      };
    })
    .catch(() => {
      loadingText.textContent = "Failed to fetch cat metadata 😿. Retrying...";
      fetchCat(); // Retry if fetch fails
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
