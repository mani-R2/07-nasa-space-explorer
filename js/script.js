// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// Find the button and gallery
const getImagesBtn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');

// Find modal elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalVideoLink = document.getElementById('modalVideoLink');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeBtn = document.querySelector('.close');

// Add event listener to the button
getImagesBtn.addEventListener('click', getSpaceImages);

// Add event listeners for modal
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

// Function to open the modal with image details
function openModal(imageData) {
  if (imageData.media_type === 'image') {
    modalImage.src = imageData.url;
    modalImage.alt = imageData.title;
    modalImage.style.display = 'block';
    modalVideoLink.style.display = 'none';
  } else {
    // For videos, show thumbnail and a link to the video
    modalImage.src = imageData.thumbnail_url || imageData.url;
    modalImage.alt = imageData.title;
    modalImage.style.display = 'block';
    modalVideoLink.href = imageData.url;
    modalVideoLink.textContent = 'View Video';
    modalVideoLink.style.display = 'inline-block';
  }
  modalTitle.textContent = imageData.title;
  modalDate.textContent = imageData.date;
  modalExplanation.textContent = imageData.explanation;
  modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
}

// Function to get space images
async function getSpaceImages() {
  // Get the selected dates
  const startDate = new Date(startInput.value);
  const endDate = new Date(endInput.value);

  // Generate array of dates between start and end
  const dates = getDatesInRange(startDate, endDate);

  // Clear the gallery
  gallery.innerHTML = '<div class="loading">Loading space images...</div>';

  // Fetch images for each date
  const images = [];
  for (const date of dates) {
    try {
      const imageData = await fetchAPODImage(date);
      images.push(imageData);
    } catch (error) {
      console.error('Error fetching image for', date, error);
    }
  }

  // Display the images
  displayImages(images);
}

// Function to generate array of dates
function getDatesInRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Function to fetch APOD image for a specific date
async function fetchAPODImage(date) {
  const dateString = date.toISOString().split('T')[0];
  const apiKey = 'CeoVwSREvyRVN6pfiI01kxUgeGqlnAt5LMQMb82P'; // Replace with your NASA API key
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${dateString}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

// Function to display images in the gallery
function displayImages(images) {
  gallery.innerHTML = ''; // Clear loading message

  if (images.length === 0) {
    gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">😔</div><p>No images found for the selected date range.</p></div>';
    return;
  }

  images.forEach(image => {
    const imageElement = document.createElement('div');
    imageElement.className = 'gallery-item';

    if (image.media_type === 'image') {
      imageElement.innerHTML = `
        <img src="${image.url}" alt="${image.title}" loading="lazy">
        <h3>${image.title}</h3>
        <p>${image.explanation}</p>
        <small>${image.date}</small>
      `;
      // Make the gallery item clickable to open modal
      imageElement.style.cursor = 'pointer';
      imageElement.addEventListener('click', () => openModal(image));
    } else {
      // For videos or other media
      imageElement.innerHTML = `
        <a href="${image.url}" target="_blank">
          <img src="${image.thumbnail_url || image.url}" alt="${image.title}" loading="lazy">
        </a>
        <h3>${image.title}</h3>
        <p>${image.explanation}</p>
        <small>${image.date} (Click to view video)</small>
      `;
      // For videos, don't add modal click since there's already a link
    }

    gallery.appendChild(imageElement);
  });
}


