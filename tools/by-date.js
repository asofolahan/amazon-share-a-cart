var LINKS = {
    base: 'https://share-a-cart.firebaseio.com/'
 },
 _ = require('underscore'),
 Firebase = require("firebase"),
 firebase = new Firebase(LINKS.base);

/**
 * Need a list of orders by date.
 * Need a list of items by frequency
 */
Firebase.goOnline();

firebase.on('value', function(snapshot) {
  let remote = snapshot.val();

  remote.forEach(
    function(entry) {

    });

  Firebase.goOffline();

  }
