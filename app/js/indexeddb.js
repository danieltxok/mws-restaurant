const DB_NAME = 'udacity-restaurants';
const DB_VERSION = 3;
const DB_STORE_NAME = 'restaurants';

const customerData = [
  { id: "444", name: "Bill", age: 35, email: "bill@company.com" },
  { id: "555", name: "Donna", age: 32, email: "donna@home.org" }
];

const req = window.indexedDB.open(DB_NAME, DB_VERSION);
req.onupgradeneeded = function (e) { //onupgradeneeded is the only place where you can alter the structure of the database
  var db = e.target.result;
  var objectStore = db.createObjectStore(DB_STORE_NAME, { keyPath: "id" });
  objectStore.createIndex("name", "name", { unique: false });
  objectStore.createIndex("age", "age", { unique: false });

  objectStore.transaction.oncomplete = function (e) {
    // Store values in the newly created objectStore.
    var customerObjectStore = db.transaction(DB_STORE_NAME, "readwrite").objectStore(DB_STORE_NAME);
    customerData.forEach(function (customer) {
      customerObjectStore.add(customer);
    });
  };
};
req.onerror = function (e) {
  console.log(e);
};