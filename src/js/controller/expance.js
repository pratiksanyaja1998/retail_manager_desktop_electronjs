module.exports = [
  "$scope",
  "$rootScope",
  function ($scope, $rootScope) {
    $rootScope.isWaiting = false;
    $rootScope.location = "/expance";

    $scope.isEditingExpanceSetting = false;
    $scope.isEditingExpance = false;

    $scope.expanceCategory = false;

    let getCategorys = () =>
      CategoryModule.getCategorys((row) => {
        $scope.expanceCategory = row;
        $scope.$apply();
      });

    getCategorys();

    SettingModule.getSetting("UserID", (data) => {
      $scope.UniqueUID = data;
    });

    var today = new Date();

    $scope.filter = {
      offset: 0,
      limit: 13,
      searchInput: "",
      isNext: true,
      catagory: null,
      mm: today.getMonth() + 1,
      yyyy: today.getFullYear(),
    };

    let getExpanceFromDatabase = () => {
      ExpanceModule.getExpance($scope.filter, (row) => {
        $scope.expance = row;
        // console.log(row);
        if (row.length < $scope.filter.limit) $scope.filter.isNext = false;
        else $scope.filter.isNext = true;

        $scope.$apply();
      });
    };

    getExpanceFromDatabase();

    $scope.changeFilterData = () => {
      getExpanceFromDatabase();
    };

    $scope.clickPrev = () => {
      $scope.filter.offset = $scope.filter.offset - $scope.filter.limit;
      getExpanceFromDatabase();
    };

    $scope.clickNext = () => {
      $scope.filter.offset = $scope.filter.offset + $scope.filter.limit;
      getExpanceFromDatabase();
    };

    $scope.newCategory = "";

    $scope.newCategoryError = {
      flag: false,
      message: null,
    };

    $scope.clickAddCategory = function () {
      $scope.newCategoryError.flag = false;

      if ($scope.newCategory == null || $scope.newCategory == "") {
        $scope.expance_category.newcatename.$invalid = true;
        return;
      }

      CategoryModule.insertCategory({ name: $scope.newCategory }, (result) => {
        if (!result.error) {
          $scope.expanceCategory.push($scope.newCategory);
          $scope.newCategory = "";
        } else {
          $scope.newCategoryError.flag = true;
          $scope.newCategoryError.message = result.error;
        }
        $scope.$apply();
      });
    };

    $scope.clickAddNewCateOption = () => {
      $scope.isEditingExpanceSetting = true;
    };

    $scope.clickSaveExpance = function () {
      if ($scope.newExpance.isUpdate) {
        mixpanel.track("Expense Updated", {
          user: $scope.UniqueUID
        });

        ExpanceModule.updateExpance(
          {
            description: $scope.newExpance.description,
          },
          $scope.newExpance.id,
          () => {
            $scope.expance[$scope.newExpance.arrayid] = {
              ...$scope.newExpance,
            };

            $scope.$apply();

            $scope.clickClearExpance();
          }
        );
      } else {
        // validations

        if ($scope.newExpance.category == null) {
          $scope.expance_form.category.$invalid = true;

          return;
        }

        mixpanel.track("Expense Added", {
          user: $scope.UniqueUID
        });

        ExpanceModule.insertExpance($scope.newExpance, (result) => {
          getExpanceFromDatabase();
          $scope.clickClearExpance();
          $scope.$apply();
        });
      }

      $scope.isEditingExpance = false;
    };

    $scope.clickClearExpance = () => {
      $scope.newExpance = {
        description: "",
        refno: "",
        price: 0.0,
        category: null,
        dd: today.getDate(),
        mm: today.getMonth() + 1,
        yyyy: today.getFullYear(),
      };
    };

    $scope.clickClearExpance();

    $scope.clickCancelExpance = () => {
      $scope.isEditingExpance = false;

      $scope.clickClearExpance();
    };

    $scope.deleteExpance = (expance) => {
      if (confirm("Are you sure you want to delete this expence?")) {
        ExpanceModule.deleteExpance(expance, () => {
          $scope.expance.find((o, i) => {
            if (o) {
              if (o.id === expance.id) {
                delete $scope.expance[i];
                $scope.$apply();
                return; // stop searching
              }
            }
          });
        });
      }

    };

    $scope.editExpance = (expance) => {
      delete expance.$$hashKey;

      $scope.expance.find((o, i) => {
        if (o)
          if (o.id === expance.id) {
            $scope.newExpance = {
              ...expance,
              arrayid: i,
              isUpdate: true,
            };

            $scope.isEditingExpance = true;

            return;
          }
      });
    };

    $scope.deleteExpanceCategory = (name) => {
      if (confirm("Are you sure you want to delete this category?")) {
        $scope.newCategoryError.flag = false;

        CategoryModule.deleteCategory(name, (result) => {
          if (!result.error) {
            getCategorys();
          } else {
            $scope.newCategoryError.flag = true;
            $scope.newCategoryError.message = result.error;
          }

          $scope.$apply();
        });
      }

    };

    $scope.focusFrist = true;

    const insertBatch = (BatchInsertData) =>
      ExpanceModule.insertBatchExpense(BatchInsertData, (res) => {
        if (!res.error) {
          // alert("File Imported Successfully");
          // swal("File Imported Successfully","success");
          getExpanceFromDatabase();
          $scope.$apply();
        } else {
          alert(res.error);
        }
      });

    const insertBatchCategories = (newCats) =>
      CategoryModule.insertBatchCategories(newCats, (data) => {
        getCategorys();
        $scope.$apply();
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
        let newCategories = [];
        let cnt = 0;
        jsonData.forEach((item) => {
          cnt++;
          let custPartArray = {};
          if (item.Cost != "" && item.Cost != undefined && item.Refno != "" && item.Refno != undefined) {
            if (
              !$scope.expanceCategory.includes(item.Category) &&
              !newCategories.includes(item.Category)
            ) {
              newCategories.push(item.Category);
            }
            custPartArray.description = item.Description;
            custPartArray.category = item.Category;
            custPartArray.dd = item.Date;
            custPartArray.mm = item.Month;
            custPartArray.yyyy = item.Year;
            custPartArray.price = item.Cost;
            custPartArray.refno = item.Refno;
            $scope.addToOverView({price : item.Cost,mm: item.Month,yyyy:item.Year},cnt);
            BatChData.push(custPartArray);
          }
        });

        insertBatch(BatChData);
        if (newCategories.length > 0) {
          //   console.log(newCategories);
          insertBatchCategories(newCategories);
        }
      };

      $scope.isEditingExpanceSetting = false;

      reader.readAsText(input);
    };

    $scope.addToOverView = (data,cnt) => {
      setTimeout(() => {

        OverViewModule.updateOverView(
          "+",
          {
            name: "expance",
            data: data.price,
            mm: Number(data.mm),
            yyyy: Number(data.yyyy),
          },
          (ovres) => {
            console.log(ovres)
          }
        );
      }, cnt*50);
      
    }

    $scope.sampleJsonCSVData = [
      {
        Description: "Purchased Logtable for Science",
        Category: "Acedemic",
        Date: "6",
        Month: "12",
        Year: "2021",
        Cost: "1200",
        Refno: "12133234343",
      },
      {
        Description: "Paid last month Rate",
        Category: "Primary Need",
        Date: "1",
        Month: "12",
        Year: "2021",
        Cost: "5000",
        Refno: "32423434",
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
      hiddenElement.download = "Expenses.csv";
      hiddenElement.click();
    };

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key == "n") {
        $scope.isEditingExpance = true;

        $scope.$apply();
        $scope.focusFrist = true;
        $scope.clickClearExpance();
        $scope.$apply();
      }

      if (event.keyCode == "27") {
        $scope.isEditingExpance = false;
        $scope.isEditingExpanceSetting = false;
        $scope.$apply();
      }
    });
  },
];
