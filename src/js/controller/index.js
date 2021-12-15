const OverViewModule = require("../models/overview");

module.exports = [
  "$scope",
  "$rootScope",
  function ($scope, $rootScope) {
    //init data old

    if ($rootScope.indexController) {
      for (var name in $rootScope.indexController) {
        $scope[name] = $rootScope.indexController[name];
      }
    } else {
      var today = new Date();
      $scope.mm = today.getMonth() + 1;
      $scope.yyyy = today.getFullYear();
    }

    $rootScope.isWaiting = false;
    $rootScope.location = "/index";

    $scope.isEditingOverviewSetting = false;

    $scope.changeDate = () => {
      OverViewModule.getOverView($scope.mm, $scope.yyyy, (rs) => {
        $scope.overView = rs[0];

        $scope.$apply();
      });
      getChartFullFiled();
    };

    $scope.changeDate();

    const monthStr = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    var ctx = document.getElementById("myChart");
    var color = Chart.helpers.color;

    window.chartColors = {
      red: "rgb(255, 99, 132)",
      orange: "rgb(255, 159, 64)",
      yellow: "rgb(255, 205, 86)",
      green: "rgb(75, 192, 192)",
      blue: "rgb(54, 162, 235)",
      purple: "rgb(153, 102, 255)",
      grey: "rgb(201, 203, 207)",
    };

    function getChartFullFiled() {
      OverViewModule.getAllOverView($scope.yyyy, (result) => {
        incomeData = [];
        labelsMonth = [];
        expanceData = [];
        // console.log(result);
        result.forEach((overView) => {
          incomeData.push(overView.income);
          expanceData.push(overView.expance);
          labelsMonth.push(monthStr[overView.mm - 1]);
        });
        // console.log(expanceData);

        var myChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labelsMonth,
            datasets: [
              {
                label: "Income",
                backgroundColor: color(window.chartColors.blue)
                  .alpha(0.5)
                  .rgbString(),
                borderColor: window.chartColors.blue,
                borderWidth: 1,
                data: incomeData,
              },
              {
                label: "Expance",
                backgroundColor: color(window.chartColors.red)
                  .alpha(0.5)
                  .rgbString(),
                borderColor: window.chartColors.red,
                borderWidth: 1,
                data: expanceData,
              },
            ],
          },
        });
      });
    }

    getChartFullFiled();

    $scope.$on("$destroy", function () {
      $rootScope.indexController = {
        mm: $scope.mm,
        yyyy: $scope.yyyy,
      };
    });
  },
];
