module.exports = [
  "$scope",
  "$rootScope",
  function ($scope, $rootScope) {
    $rootScope.location = "/help";
    $rootScope.isWaiting = false;

    $scope.clickMoreInfo = () => {
      // event.preventDefault();
      shell.openExternal("http://spyhunteritsolution.in");
    };

    $scope.clickMoreInfo = () => {
      // event.preventDefault();
      shell.openExternal("https://wa.me/message/ASVAFGFR4VTNL1");
    };

    $scope.clickLiveChart = () => {
      // event.preventDefault();
      shell.openExternal(
        "https://tawk.to/866648132497419600a82f2ba0f19e9493d14e6f"
      );
    };
  },
];
