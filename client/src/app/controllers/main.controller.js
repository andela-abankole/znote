(function() {
  "use strict";

  function MainController ($rootScope, $q, $state, $window, $localStorage, Authentication, Notification, User, Response, Settings, featureFlag) {
    var vm = this;

    vm.isLoggedIn = Authentication.isLoggedIn();

    if (vm.isLoggedIn) {
      vm.currentUser = Authentication.authenticatedUser();
    }

    vm.Refresh = Refresh;
    vm.Logout = Logout;
    vm.changeView = changeView;
    vm.searchFilterChange = searchFilterChange;
    vm.flags = featureFlag;

    /////////////////////

    activate();

    function activate() {
      var promises = [
        Settings.find(vm.currentUser.$id)
      ];

      return $q.all(promises)
        .then(function(response) {
          var userSettings = response[0];

          vm.View = userSettings.default_layout || $localStorage.view || 'list';
        })
        .catch(function() {
          Notification.notify('error', Response.error['page']);
        })
    }

    /////////////////////

    function changeView(viewType) {
      if (viewType == 'list') {
        vm.View = 'brick';
        $localStorage.view = 'brick';
      } else {
        vm.View = 'list';
        $localStorage.view = 'list';
      }

      Settings.update(vm.currentUser.$id, {
        default_layout: vm.View
      });

      Reload();
    }

    function Refresh() { $window.location.reload(); }
    function Reload() { $state.reload(); }
    function searchFilterChange(search) {
      $rootScope.$broadcast('filterSearch', search);
    }

    function Logout() {
      Notification.notify('sticky', Response.success['auth.logout']);
      Authentication.logout();
      $state.go('login');
    }
  }

  angular
    .module('sugg.controllers')
    .controller('MainController', MainController);

  MainController.$inject = ['$rootScope', '$q', '$state', '$window', '$localStorage', 'Authentication', 'Notification', 'User', 'Response', 'Settings', 'featureFlag'];
})();