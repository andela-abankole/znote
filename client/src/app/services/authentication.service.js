"use strict";

angular
  .module('sugg.services')
  .factory('Authentication', ['Refs', '$firebaseAuth', '$rootScope', '$localStorage',
    function(Refs, $firebaseAuth, $rootScope, $localStorage) {
      var authObj;

      return {
        /**
         * @param  {provider} Provider can be Facebook, Google or Twitter
         * @param  {Function}
         * @return {Object} AuthData from Firebase or Error if any occurs
         */
        login: function(provider, cb) {
          var authObj = $firebaseAuth(Refs.root);
          var fb_option = {
            remember: 'sessionOnly',
            scope: 'email'
//             scope: 'email,user_likes,user_friends'
          };
          var google_option = {
            remember: 'sessionOnly',
            scope: 'email'
          };
          var query = provider == 'facebook'
            ? fb_option
            : provider == 'google'
              ? google_option
              : { remember : 'sessionOnly' };

          /**
           * Authenticates the client using a popup-based OAuth flow
           * @param  {provider} OAuth provider
           * @return {authData} object containing authentication data about the logged-in user
           */
          authObj.$authWithOAuthPopup(provider, query).then(function(authData) {
            cb(null, authData);
          })
          //  If unsuccessful, the promise will be rejected with an Error object
          .catch(function(error) {
            if (error) {
              if (error.code === 'TRANSPORT_UNAVAILABLE') {
                /**
                 * fall-back to browser redirects, and pick up the session
                 * automatically when we come back to the origin page
                 */
                authObj.$authWithOAuthRedirect(provider).then(function(authData) {
                  cb(error, authData);
                })
                .catch(function(error) {
                  cb(error);
                });
              } else {
                cb(error);
              }
            }
          });
        },

        isAdmin: function (userEmail, cb) {
          if (!userEmail) {
            cb(null);
          }

          Refs.admin.once('value', function (snap) {
            var admins = snap.val();

            for (var email in admins) {
              if (admins.hasOwnProperty(email)) {
                if (admins[email] == userEmail) {
                  cb(null, true);
                  return true;
                }
              }
            }

            cb(null, false);
          });
        },

        /**
         * @param  {authData} object containing authentication data about the logged-in user
         * @return {Object} containing filter logged-in user data
         */
        buildUserObjectFromProviders: function(authData) {
          if (!authData) {
            return;
          }

          function getName(authData) {
            switch(authData.provider) {
             case 'facebook':
              return 'facebook';
             case 'twitter':
              return 'twitter';
             case 'google':
              return 'google';
            }
          }

          var socialProvider = getName(authData);
          return {
            uid: authData.uid,
            provider: authData.provider,
            name: authData[socialProvider].displayName,
            image_URL: authData[socialProvider].profileImageURL,
            email: authData[socialProvider].email,
            access_token: authData[socialProvider].accessToken,
            id: authData[socialProvider].cachedUserProfile.id,
            created: Firebase.ServerValue.TIMESTAMP,
            is_active: true,
            is_new: true,
            suspended: null
          };
        },

        /**
         * @return {unauth} Unauthenticates from the Firebase database. It returns no value.
         */
        logout: function() {
          authObj = $firebaseAuth(Refs.root);
          authObj.$unauth();
          $rootScope.currentUser = null;
          $localStorage.cachedUser = null;
        },

        isLoggedIn: function() {
          authObj = $firebaseAuth(Refs.root);
          return authObj.$getAuth() ? true : false;
        },

        authenticatedUser: function() {
          authObj = $firebaseAuth(Refs.root);
          return $localStorage.cachedUser || this.buildUserObjectFromProviders(authObj.$getAuth());
        }
      };
  }]);
