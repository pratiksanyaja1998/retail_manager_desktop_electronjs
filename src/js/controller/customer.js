module.exports = [
  "$scope",
  "$rootScope",
  "$location",
  function ($scope, $rootScope, $location) {
    // rootscope
    $rootScope.isWaiting = false;

    $rootScope.location = "/customer";

    SettingModule.getSetting("customer", (rs) => {
      $scope.settings = rs;
      $scope.$apply();
    });

    $scope.changeSettings = () => {
      SettingModule.updateSettingJson("customer", $scope.settings, (rs) => { });
    };

    SettingModule.getSetting("UserID", (data) => {
      $scope.UniqueUID = data;
    });

    $scope.isEditingCustomerSetting = false;

    $scope.filter = {
      offset: 0,
      limit: 13,
      searchInput: "",
      isNext: true,
    };

    let getCustomerToDatabase = () =>
      CustomerModule.getCustomers($scope.filter, (row) => {
        if (row.length < $scope.filter.limit) $scope.filter.isNext = false;
        else $scope.filter.isNext = true;

        $scope.customer = row;
        $scope.$apply();
      });

    getCustomerToDatabase();

    $scope.searchCustomer = () => {
      getCustomerToDatabase();
    };

    $scope.clickPrev = () => {
      $scope.filter.offset = $scope.filter.offset - $scope.filter.limit;
      getCustomerToDatabase();
    };

    $scope.clickNext = () => {
      $scope.filter.offset = $scope.filter.offset + $scope.filter.limit;
      getCustomerToDatabase();
    };

    $scope.isEditingCustomer = false;
    $scope.clickNewCustomer = function () {
      $scope.isEditingCustomer = true;
    };

    $scope.deleteCustomer = (id) => {
      swal({
        title: "Are you sure?",
        text: "You want to delete this Customer?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
        .then((willDelete) => {
          if (willDelete) {
            CustomerModule.deleteCustomer(id, () => {
              $scope.customer.find((o, i) => {
                if (o) {
                  if (o.id === id) {
                    delete $scope.customer[i];
                    $scope.$apply();
                    return; // stop searching
                  }
                }
              });
            });
            $scope.$apply();
          } else {
            // swal("Your imaginary file is safe!");
          }
        });


    };

    $scope.editCustomer = function (customer) {
      $scope.customer.find((o, i) => {
        if (o)
          if (o.id === customer.id) {
            $scope.isEditingCustomer = true;
            $scope.newCustomer = {
              ...customer,
              arrayid: i,
              isUpdate: true,
              isb_d: customer.isb_d == 1 ? true : false,
            };
            return;
          }
      });

      $scope.error = false;
    };

    $scope.clickSameBDAddr = function () {
      if ($scope.newCustomer.isb_d) {
        $scope.newCustomer.darea = $scope.newCustomer.barea;
        $scope.newCustomer.dcity = $scope.newCustomer.bcity;
        $scope.newCustomer.dstate = $scope.newCustomer.bstate;
        $scope.newCustomer.dpincode = $scope.newCustomer.bpincode;
      } else {
        $scope.newCustomer.darea = "";
        $scope.newCustomer.dcity = "";
        $scope.newCustomer.dstate = "";
        $scope.newCustomer.dpincode = "";
      }
    };


    $scope.clickSaveCustomer = function () {
      $scope.error = false;

      if ($scope.newCustomer.isUpdate) {
        mixpanel.track("Customer Information Updated", {
          user: $scope.UniqueUID
        });
        CustomerModule.updateCustomer(
          {
            phno: $scope.newCustomer.phno,
            gstin: $scope.newCustomer.gstin.toUpperCase(),

            //billing addr
            email: $scope.newCustomer.email,
            barea: $scope.newCustomer.barea,
            bcity: $scope.newCustomer.bcity,
            bstate: $scope.newCustomer.bstate,
            bpincode: $scope.newCustomer.bpincode,
            isb_d: $scope.newCustomer.isb_d, //is samebilling addr dellivery addr

            //delivry addr
            darea: $scope.newCustomer.darea,
            dcity: $scope.newCustomer.dcity,
            dstate: $scope.newCustomer.dstate,
            dpincode: $scope.newCustomer.dpincode,
          },
          $scope.newCustomer.id,
          (result) => {
            if (!result.error) {
              $scope.customer[$scope.newCustomer.arrayid] = {
                ...$scope.newCustomer,
              };

              $scope.isEditingCustomer = false;

              $scope.clickClearCustomer();
            } else {
              $scope.error = result.error;
            }
            $scope.$apply();
          }
        );
      } else {
        // validations
        if ($scope.newCustomer.name == "" || $scope.newCustomer.name == null) {
          $scope.customer_form.cname.$invalid = true;

          return;
        }

        if ($scope.newCustomer.phno == "") $scope.newCustomer.phno = null;

        //save customer

        mixpanel.track("New Customer Information Added", {
          user: $scope.UniqueUID
        });

        CustomerModule.insertCustomer($scope.newCustomer, (result) => {
          if (!result.error) {
            data = {
              ...$scope.newCustomer,
              gstin: $scope.newCustomer.gstin.toUpperCase(),
              id: result[0],
            };
            $scope.customer.push(data);
            $scope.isEditingCustomer = false;
            $scope.clickClearCustomer();
          } else {
            $scope.error = result.error;
          }
          $scope.$apply();
        });
      }
    };

    $scope.clickCancelCustomer = function () {
      $scope.isEditingCustomer = false;

      $scope.clickClearCustomer();
    };

    $scope.error = false;

    $scope.clickClearCustomer = function () {
      $scope.newCustomer = {
        name: "",
        phno: null,
        gstin: "",

        //billing addr
        barea: "",
        bcity: "",
        bstate: "",
        bpincode: "",

        isb_d: false, //is samebilling addr dellivery addr

        //delivry addr
        darea: "",
        dcity: "",
        dstate: "",
        dpincode: "",
      };
      $scope.error = false;
    };

    $scope.clickClearCustomer();

    $scope.focusFrist = true;

    let ispressALT = false;

    const insertBatch = (BatchInsertData) =>
      CustomerModule.insertBatchCustomer(BatchInsertData, (res) => {
        if (!res.error) {
          alert("File Imported Successfully");
          getCustomerToDatabase();
          $scope.$apply();
        } else {
          alert(res.error);
        }
      });

    $scope.csvToArray = (str, delimiter = ",") => {
      const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
      const rows = str.slice(str.indexOf("\n") + 1).split("\n");
      const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
          object[header] = values[index];
          return object;
        }, {});
        return el;
      });
      return arr;
    };

    $scope.importCSVFile = () => {
      const csvFile = document.getElementById("csvFile");
      if (csvFile.value.length < 4) {
        // alert("Please Upload any CSV File");
        return false;
      }
      const input = csvFile.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        let jsonData = $scope.csvToArray(text);
        let BatChData = [];
        jsonData.forEach((item) => {
          let custPartArray = {};
          custPartArray.name = item.Name;
          custPartArray.phno = item.Mobile;
          custPartArray.email = item.Email;
          custPartArray.gstin = item.Gst;
          custPartArray.barea = item.Billing_Address_Area;
          custPartArray.bstate = item.Billing_Address_State;
          custPartArray.bcity = item.Billing_Address_City;
          custPartArray.bpincode = item.Billing_Address_Pincode;
          if (
            item.Same_Delivery_Address != "Yes" &&
            item.Same_Delivery_Address != "yes"
          ) {
            custPartArray.darea = item.Delivery_Address_Area;
            custPartArray.dstate = item.Delivery_Address_State;
            custPartArray.dcity = item.Delivery_Address_City;
            custPartArray.dpincode = item.Delivery_Address_Pincode;
            custPartArray.isb_d = 0;
          } else {
            custPartArray.darea = "";
            custPartArray.dstate = "";
            custPartArray.dcity = "";
            custPartArray.dpincode = "";
            custPartArray.isb_d = 1;
          }
          BatChData.push(custPartArray);
        });

        insertBatch(BatChData);
      };

      $scope.isEditingCustomerSetting = false;
      reader.readAsText(input);
    };

    $scope.sampleJsonCSVData = [
      {
        Name: "Steve",
        Gst: "QWER1234ASDF123",
        Mobile: "1234567890",
        Email: "captain.rogers460@gmail.com",
        Billing_Address_Area: "Varachha",
        Billing_Address_City: "Surat",
        Billing_Address_State: "Gujarat",
        Billing_Address_Pincode: "395006",
        Same_Delivery_Address: "Yes",
        Delivery_Address_Area: "",
        Delivery_Address_City: "",
        Delivery_Address_State: "",
        Delivery_Address_Pincode: "",
      },
      {
        Name: "Tony",
        Gst: "ZXCVASDFQWER123",
        Mobile: "9876543210",
        Email: "jemish0437@gmail.com",
        Billing_Address_Area: "Mota Varachha",
        Billing_Address_City: "Surat",
        Billing_Address_State: "Gujarat",
        Billing_Address_Pincode: "394101",
        Same_Delivery_Address: "No",
        Delivery_Address_Area: "Puna Gam",
        Delivery_Address_City: "Surat",
        Delivery_Address_State: "Gujarat",
        Delivery_Address_Pincode: "395010",
      },
    ];

    $scope.csvFieldHeaders = Object.keys($scope.sampleJsonCSVData[0]);

    $scope.JsonToCSV = () => {
      var csvStr = $scope.csvFieldHeaders.join(",") + "\n";

      $scope.sampleJsonCSVData.forEach((item) => {
        $scope.csvFieldHeaders.forEach((item2) => {
          csvStr += item[item2] + ",";
        });
        csvStr += "\n";
      });
      return csvStr;
    };

    $scope.demoCsvData = $scope.JsonToCSV();
    $scope.exportCSV = () => {
      var hiddenElement = document.createElement("a");
      hiddenElement.href =
        "data:text/csv;charset=utf-8," + encodeURI($scope.demoCsvData);
      hiddenElement.target = "_blank";
      hiddenElement.download = "Customers.csv";
      hiddenElement.click();
    };

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key == "n") {
        $scope.isEditingCustomer = true;
        $scope.clickClearCustomer();
        $scope.$apply();
        $scope.focusFrist = true;
        $scope.$apply();
      }

      if (event.keyCode == "27") {
        $scope.isEditingCustomer = false;
        $scope.isEditingCustomerSetting = false;
        $scope.$apply();
      }
    });
  },
];
