module.exports = [
  "$scope",
  "$rootScope",
  "$location",
  function ($scope, $rootScope, $location) {
    $rootScope.location = "/settings";

    $rootScope.isWaiting = false;

    $scope.insrprefix;
    $scope.invoicesrno;

    $scope.mailuser;
    $scope.mailpass;
    $scope.storeinfo_dis = true;
    $scope.invoice_dis = true;
    $scope.emailcred_dis = true;

    $scope.getInvoiceSettingsAndSet = () => {
      SettingModule.getInvoiceSr((result) => {
        $scope.insrprefix = result[1].data;
        $scope.invoicesmsapi = result[2].data;
        $scope.invoicesrno = Number(result[0].data);
        $scope.$apply();
      });
    };
    $scope.getInvoiceSettingsAndSet();

    $scope.getEmailSettingsAndSet = () => {
      SettingModule.getEmailCred((result) => {
        // console.log(result);
        $scope.mailuser = result[0].data;
        $scope.mailpass = result[1].data;
        $scope.mailhost = result[2].data;
        $scope.mailport = result[3].data;
        $scope.$apply();
      });
    };

    $scope.getEmailSettingsAndSet();

    $scope.changeLogoErrorMsg = "Image Must Be PNG Format.";

    $scope.storeLogoUpload = () => {
      $scope.changeLogoErrorMsg = null;

      dialog.showOpenDialog(
        {
          filters: [{ name: "Images", extensions: ["png"] }],
        },
        (fileNames) => {
          if (fileNames === undefined) {
            return;
          }

          fs.readFile(fileNames[0], (err, data) => {
            if (err) {
              $scope.changeLogoErrorMsg =
                "Error in Reading Logo Please Select Deferent Image.";
              $scope.$apply();
              return;
            }
            fs.writeFile(RES_ROOT + "/storeLogo.png", data, (err) => {
              if (err) {
                $scope.changeLogoErrorMsg = "Please Try Again Letter. " + err;
                $scope.$apply();
                return;
              }
              $scope.changeLogoErrorMsg =
                "Your Logo Has Been Change. Please Referesh Page.";

              $rootScope.storeInfo.logo = RES_ROOT + "/storeLogo.png";
              $scope.storeInfo.logo = RES_ROOT + "/storeLogo.png";

              $scope.clickToSaveStoreInfo();

              $scope.$apply();
            });
          });
        }
      );
    };

    $scope.storeInfo = false;
    $scope.storeInfoEdit = false;
    $scope.settingFstTime = false;


    SettingModule.getSetting("UserID", (data) => {
      $scope.UniqueUID = data;
    });


    $scope.getStoreDataEndSet = () => {
      SettingModule.getSetting("storeInfo", (data) => {
        $scope.storeInfo = data;

        if ($scope.storeInfo == null) {
          $scope.settingFstTime = true;
          $scope.storeInfoEdit = true;
          $scope.storeinfo_dis = false;

          $rootScope.isHideAuthNav = true;

          $scope.storeInfo = {
            storename: "",
            email: "",
            phno: "",
            gstin: "",
            // type: null,
            area: "",
            city: "",
            state: "",
            pincode: "",
            productName: "",
            logo: "./assets/storeLogo.png",
          };
        }

        $scope.$apply();
      });
    };

    $scope.getStoreDataEndSet();

    $scope.clickToEditStoreInfo = () => {
      $scope.storeinfo_dis = false;
    };

    $scope.clickToSaveStoreInfo = () => {
      $scope.storeinfo_dis = true;
      if ($scope.storeInfo.gstin !== null) {
        $scope.storeInfo.gstin = $scope.storeInfo.gstin.toUpperCase();
      }

      mixpanel.track("Store Profile Information Updated", {
        info:
        {
          store_name: $scope.storeInfo.storename,
          email: $scope.storeInfo.email,
          phone: $scope.storeInfo.phno,
        },
        user: $scope.UniqueUID
      });

      SettingModule.updateSettingJson(
        "storeInfo",
        $scope.storeInfo,
        (result) => {
          if ($scope.settingFstTime) {
            $rootScope.isHideAuthNav = false;
            // $rootScope.BusinessType = $scope.storeInfo.type
            $location.path("/");
          }
          $scope.storeInfoEdit = false;
          $scope.$apply();
        }
      );
    };

    $scope.clickToEditInvoiceSR = () => {
      $scope.invoice_dis = false;
    };

    $scope.clickToEditEmailCred = () => {
      $scope.emailcred_dis = false;
    };

    $scope.clickToSaveInvoiceSR = () => {
      $scope.invoice_dis = true;
      SettingModule.updateSettingData(
        { name: "insrno", data: $scope.invoicesrno },
        () => {
          SettingModule.updateSettingData(
            { name: "insrpre", data: $scope.insrprefix },
            () => {
              SettingModule.updateSettingData(
                { name: "invoicesmsapi", data: $scope.invoicesmsapi },
                () => { }
              );
            }
          );
        }
      );
    };

    // $scope.getAllSettingsInfo = () => {
    //   SettingModule.getAllSettings({}, (data) => {
    //     console.log(data);
    //   });
    // };

    // $scope.getAllSettingsInfo();

    $scope.clickToSaveEmailCred = () => {
      $scope.emailcred_dis = true;
      SettingModule.updateSettingData(
        { name: "mailuser", data: $scope.mailuser },
        () => {
          SettingModule.updateSettingData(
            { name: "mailpass", data: $scope.mailpass },
            () => {
              SettingModule.updateSettingData(
                { name: "mailhost", data: $scope.mailhost },
                () => {
                  SettingModule.updateSettingData(
                    { name: "mailport", data: $scope.mailport },
                    () => { }
                  );
                }
              );
            }
          );
        }
      );
    };

    // if savelocation is false then name is select file name

    // database inport export

    $scope.DatabaseInExErrorMsg = null;

    $scope.databaseImport = () => {
      $scope.DatabaseInExErrorMsg = null;

      dialog.showOpenDialog((fileNames) => {
        if (fileNames === undefined) {
          return;
        } else {
          fs.readFile(fileNames[0], (err, data) => {
            if (err) {
              $scope.DatabaseInExErrorMsg = "Error In Reading Database.";
              $scope.$apply();
              return;
            }

            fs.writeFile("./store.sqlite", data, (err) => {
              if (err) $scope.DatabaseInExErrorMsg = "Error In Save Database.";
              else
                $scope.DatabaseInExErrorMsg =
                  "Database Successfully Saved. Please Reaload Apps. (ctrl+r)";
              $scope.$apply();
            });
          });
        }
      });
    };

    $scope.databaseExport = () => {
      $scope.DatabaseInExErrorMsg = null;

      var path = dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      fs.readFile("./store.sqlite", (err, data) => {
        if (err) {
          $scope.DatabaseInExErrorMsg = "Error In Reading Database.";
          $scope.$apply();
          return;
        }

        fs.writeFile(path + "/store.sqlite", data, (err) => {
          if (err) $scope.DatabaseInExErrorMsg = "Error In Save Database.";
          else
            $scope.DatabaseInExErrorMsg =
              "Database Successfully Saved. Please Verify It's. " +
              path +
              "/store.sqlite";

          $scope.$apply();
        });
      });
    };

    $scope.clickOpenPrintSettings = () =>
      ipc.send("show-print", {
        location: "settings",
      });
  },
];
