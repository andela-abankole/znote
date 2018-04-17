"use strict";

angular
  .module('sugg.services')
  .factory('User', ['Refs', '$q', '$firebaseArray', '$firebaseObject',
    function(Refs, $q, $firebaseArray, $firebaseObject) {
      var time = Firebase.ServerValue.TIMESTAMP;
      var user;

      return {
        create: function(authData, cb) {
          var newUser = {};
          user = $firebaseObject(Refs.users.child(authData.uid));

          user.$loaded().then(function() {
            if (user.id === undefined) {
              if (authData.email) {
                newUser.email = authData.email;
              }

              newUser.access_token  = authData.access_token;
              newUser.created = authData.created;
              newUser.image_url = authData.image_URL;
              newUser.name = authData.name;
              newUser.id = authData.id;
              newUser.is_active = authData.is_active;
              newUser.is_new = authData.is_new;
              newUser.suspended = authData.suspended;
              newUser.provider = authData.provider;

              // save user to firebase collection under the user node
              user.$ref().set(newUser);
            } else {
              this.update(authData);
            }

            // ...and we return the user when done
            return cb(null, user);
          }.bind(this)).catch(function(error) {
            cb(error);
          });
        },

        update: function(authData) {
          // update user access token
          if (authData.provider) {
            user.access_token = authData.access_token;
            user.image_url = authData.image_URL;
            user.updated = authData.created;
            user.is_new = false;

            if (!user.provider) {
              user.provider = authData.provider;
            }
          }

          user.$save().then(function(ref) {
            if (ref.key() === user.$id) {
              // console.info(ref.key() + ' updated');
            }
          });
        },

        remove: function(uid) {
          var deferred = $q.defer();
          var user = $firebaseObject(Refs.users.child(uid));

          user.$loaded().then(function() {
            user.is_active = false;
            user.suspended = time;

            user.$save().then(function(ref) {
              if (ref.key() === user.$id) {
                deferred.resolve({
                  id: ref.key(),
                  message: 'user deleted locally and database'
                });
              }
            })
            .catch(function(error) {
              deferred.reject(error);
            });
          })
          .catch(function(error) {
            deferred.reject(error);
          });

          return deferred.promise;
        },

        all: function() {
          var deferred = $q.defer();
          var data = $firebaseArray(Refs.users);

          data.$loaded()
            .then(function(users) {
              deferred.resolve(users);
            })
            .catch(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        },

        find: function(uid) {
          var deferred = $q.defer();
          var data = $firebaseObject(Refs.users.child(uid));

          data.$loaded()
            .then(function(user) {
              deferred.resolve(user);
            })
            .catch(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }
      };
  }]);
