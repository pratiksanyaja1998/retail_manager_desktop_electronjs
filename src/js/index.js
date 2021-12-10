const path = require("path");
const $ = require("jquery");

var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./store.sqlite",
  },
  useNullAsDefault: true,
  migrations: {
    directory: __dirname + "/migrations",
  },
});

const RES_ROOT = path.join(__dirname, "../../");

var fs = require("fs");
var electron = require("electron");
var shell = require("electron").shell;
const ipc = electron.ipcRenderer;
const { dialog } = electron.remote;
const app = require("electron").remote.app;
const basepath = app.getAppPath();

// models
const CustomerModule = require("./js/models/customer");
const ProductModule = require("./js/models/product");
const InvoiceModule = require("./js/models/invoice");
const ProductCategoryModule = require("./js/models/productCate");
const SettingModule = require("./js/models/setting");
const ExpanceModule = require("./js/models/expance");
const CategoryModule = require("./js/models/expanceCate");
const OverViewModule = require("./js/models/overview");

storeApp = angular.module("StoreApp", ["ngRoute"]);

storeApp.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      template: "",
      controller: "lodingController",
    })
    .when("/index", {
      templateUrl: "template/index.html",
      controller: "indexController",
    })
    .when("/products", {
      templateUrl: "template/products.html",
      controller: "productsController",
    })
    .when("/customer", {
      templateUrl: "template/customer.html",
      controller: "customerController",
    })
    .when("/invoice", {
      templateUrl: "template/invoice.html",
      controller: "invoiceController",
    })
    .when("/expance", {
      templateUrl: "template/expance.html",
      controller: "expanceController",
    })
    .when("/create-store", {
      templateUrl: "template/createStore.html",
      controller: "createStoreController",
    })
    .when("/create-invoice", {
      templateUrl: "template/createInvoice.html",
      controller: "createInvoiceController",
    })
    .when("/settings", {
      templateUrl: "template/settings.html",
      controller: "settingsController",
    })
    .when("/help", {
      templateUrl: "template/help.html",
      controller: "helpController",
    });
});

storeApp.run(function ($rootScope, $location, $window) {
  $rootScope.isWaiting = true;
  $rootScope.isHideAuthNav = false;

  fetch('http://localhost/php/spyhunteritsolution/api/retail/promotion.php')
    .then(response => response.json())
    .then((data) => {
      $rootScope.promoAds = data.data;
    })

  $rootScope.OpenBLink = (link) => {
    shell.openExternal(link);
  }


  $rootScope.storeInfo = null;

  const SettingModule = require("./js/models/setting");

  $rootScope.logo = "./assets/storeLogo.png";

  $rootScope.showFullScreen = () => {
    ipc.send("show-full-screen");
  };

  $rootScope.refresh = () => {
    $location.path("/");
    $window.location.reload();
  };
  $rootScope.closeWindow = () => {
    app.quit();
  };

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && (event.key == "r" || event.key == "R")) {
      $location.path("/");
      $rootScope.$apply();
    }

    if (event.ctrlKey && (event.key == "f" || event.key == "F")) {
      $rootScope.showFullScreen();
    }

    if (event.ctrlKey && (event.key == "q" || event.key == "Q")) {
      $rootScope.closeWindow();
    }

    // menu
    if (event.altKey && event.key == "1") {
      $location.path("/index");
      $rootScope.$apply();
    }

    if (event.altKey && event.key == "2") {
      $location.path("/customer");
      $rootScope.$apply();
    }

    if (event.altKey && event.key == "3") {
      $location.path("/products");
      $rootScope.$apply();
    }

    if (event.altKey && event.key == "4") {
      $location.path("/invoice");
      $rootScope.$apply();
    }

    if (event.altKey && event.key == "5") {
      $location.path("/expance");
      $rootScope.$apply();
    }

    // new invoice
    if (event.ctrlKey && event.key == "i") {
      $location.path("/create-invoice");
      $rootScope.$apply();
    }
  });
});

//controller
storeApp.controller("indexController", require("./js/controller/index.js"));

storeApp.controller("lodingController", require("./js/controller/loding.js")); //apply migrations

storeApp.controller(
  "customerController",
  require("./js/controller/customer.js")
);

storeApp.controller(
  "productsController",
  require("./js/controller/product.js")
);

storeApp.controller("invoiceController", require("./js/controller/invoice.js"));

storeApp.controller(
  "createInvoiceController",
  require("./js/controller/createInvoice.js")
);

storeApp.controller(
  "settingsController",
  require("./js/controller/setting.js")
);

storeApp.controller("expanceController", require("./js/controller/expance.js"));

storeApp.controller("helpController", require("./js/controller/help.js"));

// directiove

storeApp.directive("error", function () {
  return {
    restrict: "E",
    transclude: "true",
    template: "<div class='error w3-center'>{{error}}</div>",
    link: function (scope, element, attr) {
      // element.append("");
    },
  };
});

storeApp.directive("inputError", function () {
  var directive = {};

  directive.restrict = "E";

  directive.transclude = true;

  directive.template =
    "<span class='input-error' ><i class='fa fa-caret-up  error-arrow'></i><ng-transclude></ng-transclude></span>";

  return directive;
});

storeApp.directive("focusMe", function ($timeout) {
  return {
    scope: { trigger: "=focusMe" },
    link: function (scope, element) {
      scope.$watch("trigger", function (value) {
        if (value === true) {
          element[0].focus();
          scope.trigger = false;
        }
      });
    },
  };
});



// utils

function clickOpenPrint(location) {
  // console.log(location);
  ipc.send("show-print", {
    location: location,
  });
}

// for overview
function openOverViewTab(ele, id) {
  var i;
  var x = document.getElementsByClassName("overviewTab");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  $(".active-overviewTab").removeClass("active-overviewTab");
  document.getElementById(id).style.display = "block";
  $(ele).addClass("active-overviewTab");
}

function logger(message, data) {
  console.log(
    "==================================================================================="
  );
  console.log(message);
  console.log(
    "==================================================================================="
  );
  console.log(data);
  console.log(
    "-----------------------------------------------------------------------------------"
  );
}
