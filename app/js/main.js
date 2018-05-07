let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  // Moved up here in case the request of the map fails, this still runs
  updateRestaurants(true);
  registerSW();
});

/**
 * Load secondary stuff after fully load.
 */
window.addEventListener('load', (event) => {
  swapMap();
  lazyLoad();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML when requesting the Maps script.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11.5,
    center: loc,
    scrollwheel: false
  });
  // updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = (lazy) => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      if (lazy) {
        fillRestaurantsHTML();
      } else {
        fillRestaurantsHTMLwithoutLL();
      }
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage with lazy loading.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create all restaurants HTML and add them to the webpage without lazy loading.
 */
fillRestaurantsHTMLwithoutLL = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTMLwithoutLL(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML (with Lazy Loading).
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  // const picture = document.createElement('picture');
  // picture.className = 'restaurant-img';
  // li.append(picture);

  // const source1 = document.createElement('source');
  // source1.srcset = DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w400.webp 400w, ';
  // source1.srcset = source1.srcset.concat(DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w600.webp 600w, ');
  // source1.srcset = source1.srcset.concat(DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w800.webp 800w');
  // source1.sizes = '(max-width: 650px) 90vw, (max-width: 1050px) 45vw, (min-width: 1051px) 27vw';
  // source1.type = 'image/webp';
  // picture.append(source1);

  // const source2 = document.createElement('source');
  // source2.srcset = DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w400.jpg 400w, ';
  // source2.srcset = source2.srcset.concat(DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w600.jpg 600w, ');
  // source2.srcset = source2.srcset.concat(DBHelper.imageUrlForRestaurant(restaurant).split('.')[0] + '_w800.jpg 800w');
  // source2.sizes = '(max-width: 650px) 90vw, (max-width: 1050px) 45vw, (min-width: 1051px) 27vw';
  // source2.type = 'image/jpg';
  // picture.append(source2);

  const image = document.createElement('img');
  image.className = 'restaurant-img lazy';
  image.src = DBHelper.imageUrlForRestaurant(restaurant) + '_sqip.svg';
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant) + '.jpg');
  const responsiveness = DBHelper.imageUrlForRestaurant(restaurant) + '_w400.webp 400w, ' + DBHelper.imageUrlForRestaurant(restaurant) + '_w600.webp 600w, ' + DBHelper.imageUrlForRestaurant(restaurant) + '_w800.webp 800w';
  image.setAttribute('data-srcset', responsiveness);
  image.alt = restaurant.name + ' restaurant';
  li.append(image);
  // picture.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.title = restaurant.name + ' restaurant';
  li.append(more)

  return li
}

/**
 * Create restaurant HTML without lazyloading.
 */
createRestaurantHTMLwithoutLL = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';
  // image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant) + '.jpg');
  const responsiveness = DBHelper.imageUrlForRestaurant(restaurant) + '_w400.webp 400w, ' + DBHelper.imageUrlForRestaurant(restaurant) + '_w600.webp 600w, ' + DBHelper.imageUrlForRestaurant(restaurant) + '_w800.webp 800w';
  image.setAttribute('data-srcset', responsiveness);
  image.alt = restaurant.name + ' restaurant';
  li.append(image);
  // picture.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.title = restaurant.name + ' restaurant';
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/**
 * SW Registration script.
 */
registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(registration => {
        console.log('SW registered: ', registration.scope);
        if ('sync' in registration) {
          console.log('Background Sync is supported');
        }
      })
        .catch(e => console.log('SW registration failed: ', e));
    })
  }
}

/**
 * Lazy Loading with Intersection Observer.
 */
lazyLoad = () => {
  const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to a more compatible method here
  }
}

/**
 * Swap map placeholder.
 */
swapMap = () => {
  const placeholder = document.getElementById('map-placeholder');
  const map = document.getElementById('map');
  placeholder.style.display = 'none';
  map.style.display = 'block';
}