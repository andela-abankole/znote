(function() {
  "use strict";

  angular
    .module('sugg.controllers')
    .controller('ProfileController', ProfileController)

  ProfileController.$inject = ['$rootScope', '$q', '$state', '$window', '$controller', 'Authentication', 'Notification', 'User'];

  function ProfileController ($rootScope, $q, $state, $window, $controller, Authentication, Notification, User) {
    var vm = this;

    vm._main = $controller('MainController', {});
    vm.isLoggedIn = vm._main.isLoggedIn;
    if (vm.isLoggedIn) {
      vm.currentUser = vm._main.currentUser;
    }

    vm.Deactivate = Deactivate;
    vm.Logout = Logout;

    /////////////////////

    activate();


    function activate() {
      var promises = [];

      return $q.all(promises)
        .then(function() {
        })
        .catch(function(err) {
          Notification.notify('error', 'Error while loading. Try again...(ツ)');
        });
    }

    /////////////////////


    function Deactivate(uid) {
      User.remove(uid)
        .then(function(data) {
          Notification.notify('simple', 'Account Deactivate Successfully :( Sad to see you leave');
        })
        .catch(function(err) {
          Notification.notify('error', 'It\'s our fault. Please try again.');
        });

        $state.go('login');
    }


    function Logout() {
      Notification.notify('sticky', 'Successfully Signed Out! :)');
      Authentication.logout();
      $state.go('login');
    }
  }
})()