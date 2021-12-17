const swal = require("sweetalert");

module.exports = [
  "$scope",
  "$location",
  "$rootScope",
  function ($scope, $location, $rootScope) {
    //init scope

    $rootScope.location = "/invoice";
    $rootScope.isWaiting = false;

    // settings
    $scope.settings = {
      cname: true,
      phno: true,
      total: true,
      gst: false,
      discount: false,
    };

    SettingModule.getSetting("invoice", (rs) => {
      $scope.settings = rs;

      $scope.$apply();
    });

    $scope.changeSettings = () => {
      SettingModule.updateSettingJson("invoice", $scope.settings, () => { });
    };

    // end settings

    $scope.isEditingInvoiceSetting = false;

    if ($rootScope.invoiceController) {
      for (var name in $rootScope.invoiceController) {
        $scope[name] = $rootScope.invoiceController[name];
      }
    } else {
    }

    var today = new Date();

    $scope.filter = {
      offset: 0,
      limit: 13,
      searchInput: "",
      isNext: true,
      mm: today.getMonth() + 1,
      yyyy: today.getFullYear(),
    };

    let getInvoiceFromDatabase = () => {
      InvoiceModule.getInvoices($scope.filter, (row) => {
        $scope.invoice = row;
        if (row.length < $scope.filter.limit) $scope.filter.isNext = false;
        else $scope.filter.isNext = true;

        $scope.$apply();
      });
    };

    getInvoiceFromDatabase();

    $scope.changeFilterData = () => {
      getInvoiceFromDatabase();
    };

    $scope.clickPrev = () => {
      $scope.filter.offset = $scope.filter.offset - $scope.filter.limit;
      getInvoiceFromDatabase();
    };

    $scope.clickNext = () => {
      $scope.filter.offset = $scope.filter.offset + $scope.filter.limit;
      getInvoiceFromDatabase();
    };

    $scope.clickNewInvoice = function () {
      $location.path("/create-invoice");
    };

    $scope.searchInvoiceInput = "";

    $scope.invoice = false;

    $scope.deleteInvoice = function (invoice) {
      swal({
        title: "Are you sure?",
        text: "You want to delete this Invoice?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
        .then((willDelete) => {
          if (willDelete) {
            InvoiceModule.deleteInvoice(invoice, () => {
              $scope.invoice.find((o, i) => {
                if (o) {
                  if (o.id === invoice.id) {
                    delete $scope.invoice[i];
                    $scope.$apply();
                    return; // stop searching
                  }
                }
              });
            });
          } else {
            // swal("Your imaginary file is safe!");
          }
        });

    };

    $scope.viewInvoice = (id) => {
      InvoiceModule.showInvoice(id);
    };

    $scope.$on("$destroy", function () {
      $rootScope.invoiceController = {
        mm: $scope.mm,
        yyyy: $scope.yyyy,
      };
    });

    document.addEventListener("keydown", (event) => {
      if (event.keyCode == "27") {
        $scope.isEditingInvoiceSetting = false;
        $scope.$apply();
      }
    });
  },
];
