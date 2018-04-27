/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then(response => response.json())
      .then(restaurants => DBHelper.insertRestaurantsToDB(restaurants))
      .then(restaurants => callback(null, restaurants))
      .catch(err => {
        // Fetch from indexdb incase network is not available
        DBHelper.fetchRestaurantsFromClient().then(restaurants => {
          callback(null, restaurants)
        })
        console.log('testindg');
      });
  }

  /**
   * Insert restaurants to DB.
   */
  static insertRestaurantsToDB(restaurants) {
    const DB_NAME = 'udacity-restaurants';
    const DB_VERSION = 1;
    const DB_STORE_NAME = 'restaurants';

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function (e) { //onupgradeneeded is the only place where you can alter the structure of the database
      var db = e.target.result;
      var objectStore = db.createObjectStore(DB_STORE_NAME, {
        keyPath: "id"
      });
      // objectStore.createIndex("neighborhood", "neighborhood", {
      //   unique: false
      // });
      // objectStore.createIndex("cuisine_type", "cuisine_type", {
      //   unique: false
      // });
      objectStore.transaction.oncomplete = function (e) {
        // Store values in the newly created objectStore.
        var restaurantsObjectStore = db.transaction(DB_STORE_NAME, "readwrite").objectStore(DB_STORE_NAME);
        restaurants.forEach(function (restaurant) {
          restaurantsObjectStore.add(restaurant);
        });
      };
    };
    req.onerror = function (e) {
      console.log(e);
    };
    return restaurants;
  }

  /**
   * Get restaurants from DB.
   */
  static fetchRestaurantsFromClient() {
    const DB_NAME = 'udacity-restaurants';
    const DB_VERSION = 1;
    const DB_STORE_NAME = 'restaurants';

    // const restaurnats = [];

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (e) {
      var db = e.target.result;
      var restaurantsObjectStore = db.transaction(DB_STORE_NAME, "readwrite").objectStore(DB_STORE_NAME);
      //var restaurantsObjectStoreRequest = restaurantsObjectStore.get("id");
      var restaurantsObjectStoreRequest = restaurantsObjectStore.getAll();
      // debugger;
      restaurantsObjectStoreRequest.onsuccess = function (event) {
        // var mzRecord = restaurantsObjectStoreRequest.result;
        // debugger;
        return restaurantsObjectStoreRequest.result;
      }
    };
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }

}

// /**
// * SW Registration script.
// */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}