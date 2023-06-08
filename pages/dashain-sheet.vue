<template>
    <v-container fluid>
      <h2 style="font-weight: 700" class="mb-6">Dashain Working Calculation</h2>
      <v-card>
        <v-container fluid>
          <v-container fluid>
            <v-row justify="center">
              <v-col cols="auto">
                <h3 v-if="useNepaliCalendar">Nepali Calendar</h3>
                <h3 v-else>English Calendar</h3>
              </v-col>
              <v-col cols="6">
                      <v-autocomplete
                        prepend-inner-icon="fa-solid fa-users"
                        filled
                        dense
                        :items="allActiveCategory"
                        v-model="category"
                        label="Employee Category"
                        item-text="name"
                        return-object
                      ></v-autocomplete>
                    </v-col>
            </v-row>
            <v-row>
            <v-data-table
              :search="search"
              :items-per-page="25"
              :loading="isLoading"
              fixed-header
              loading-text="Fetching data. Please wait..."
              :footer-props="{
                showFirstLastPage: true,
                firstIcon: 'fas fa-angle-double-left',
                lastIcon: 'fas fa-angle-double-right',
                nextIcon: 'fas fa-angle-right',
                prevIcon: 'fas fa-angle-left',
                itemsPerPageOptions: [25, 50, 100, -1],
              }"
              :items="salaryDetailsWithSno"
              :headers="headers"
            >
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  color="error"
                  @click.stop.prevent="deleteItem(item)"
                >
                  <v-icon>fas fa-trash-alt</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-row>

  
          </v-container>
        </v-container>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import NepaliDate from "nepali-date-converter";
  import { mapActions } from "vuex";
  import helpers from "../helpers";
  
  export default {
    name: "DashainWorkingCalculation",
    data() {
      return {
        category: "",
        allActiveCategory: [],
        useNepaliCalendar: true,
        selectedNepaliYear: new NepaliDate().getYear(),
        selectedNepaliMonth: new NepaliDate().getMonth() + 1,
        selectedEnglishYear: new Date().getFullYear(),
        selectedEnglishMonth: new Date().getMonth() + 1,
        nepaliMonthList: [
          "Baisakh",
          "Jestha",
          "Asar",
          "Shrawan",
          "Bhadra",
          "Asoj",
          "Kartik",
          "Mangsir",
          "Poush",
          "Magh",
          "Falgun",
          "Chaitra",
        ],
        englishMonthList: [
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
        ],
        search: "",
        isLoading: false,
        salaryDetails: [],
        headers: [
          { text: "S.N.", value: "sno", width: "2%" },
          { text: "VS No.", value: "vsNo" },
          { text: "Name", value: "name" },
          { text: "Account No", value: "accountNumber" },
          { text: "Work Station", value: "workStation" },
          { text: "Designation", value: "designation" },
          { text: "Sharawan", value: "m4" },
          { text: "Bhadra", value: "m5" },
          { text: "Asoj", value: "m6" },
          { text: "Kartik", value: "m7" },
          { text: "Mangsir", value: "m8" },
          { text: "Poush", value: "m9" },
          { text: "Magh", value: "m10" },
          { text: "Falgun", value: "m11" },
          { text: "Chaitra", value: "m12" },
          { text: "Baisakh", value: "m1" },
          { text: "Jestha", value: "m2" },
          { text: "Asar", value: "m3" },
          { text: "Total", value: "total" },
          { text: "Net Payable", value: "netPayable" },
          { text: "Paid", value: "paid" },
          { text: "UnPaid", value: "unPaid" },
        ],
      };
    },
    methods: {
      // responseGetter() {
      //   let temp = this;
      //   return this.makePostRequest({
      //     route: "salaryDetails/dashainSheet",
      //     data: {
      //       isNepaliDate: temp.useNepaliCalendar,
      //       month: temp.useNepaliCalendar
      //         ? temp.selectedNepaliMonth
      //         : temp.selectedEnglishMonth,
      //       year: temp.useNepaliCalendar
      //         ? temp.selectedNepaliYear
      //         : temp.selectedEnglishYear,
      //     },
      //   });
      // },
      async toExcel() {
        let temp = this ;
        try {
          let configs = {
            isNepaliDate: temp.useNepaliCalendar,
            month: temp.useNepaliCalendar
              ? temp.selectedNepaliMonth
              : temp.selectedEnglishMonth,
            year: temp.useNepaliCalendar
              ? temp.selectedNepaliYear
              : temp.selectedEnglishYear,
          };
          await helpers.jsonToExcel({
            fileName:
              configs.month +
              "-" +
              configs.year +
              "-salary-sheet: " +
              (configs.isNepaliDate ? "Nepali" : "English"),
            sheetName: "Salaries= ",
            responseGetter: this.responseGetter,
            listAt: "data.data",
          });
        } catch (e) {
          console.log(e);
          this.$store.dispatch("toast/setSnackbar", {
            text: "Excel Error: " + e,
          });
        }
      },
      ...mapActions("api", ["makeGetRequest", "makePostRequest"]),
      previousYear() {
        if (this.useNepaliCalendar) {
          this.selectedNepaliYear--;
          // this.getSalarySheet();
        } else {
          this.selectedEnglishYear--;
          // this.getSalarySheet();
        }
      },
      getAllActiveCategory() {
      let temp = this;

      this.$store
        .dispatch("api/makeGetRequest", {
          route: "category/getAll/active",
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.allActiveCategory = response.data.data;
          }
        })
        .catch((error) => {});
    },
      nextYear() {
        if (this.useNepaliCalendar) {
          this.selectedNepaliYear++;
          // this.getSalarySheet();
        } else {
          this.selectedEnglishYear++;
          // this.getSalarySheet();
        }
      },
      previousMonth() {
        if (this.useNepaliCalendar) {
          if (this.selectedNepaliMonth > 1) {
            this.selectedNepaliMonth--;
            // this.getSalarySheet();
          }
        } else {
          if (this.selectedEnglishMonth > 1) {
            this.selectedEnglishMonth--;
            // this.getSalarySheet();
          }
        }
      },
      nextMonth() {
        if (this.useNepaliCalendar) {
          if (this.selectedNepaliMonth < 12) {
            this.selectedNepaliMonth++;
            // this.getSalarySheet();
          }
        } else {
          if (this.selectedEnglishMonth < 12) {
            this.selectedEnglishMonth++;
            // this.getSalarySheet();
          }
        }
      },
      getDashainCalculation() {
        let temp = this;
        temp.isLoading = true;
        this.makeGetRequest({
          route: "salaryDetails/dashainWorkingSheet",
          // data: {
          //   isNepaliDate: temp.useNepaliCalendar,
          //   month: temp.useNepaliCalendar
          //     ? temp.selectedNepaliMonth
          //     : temp.selectedEnglishMonth,
          //   year: temp.useNepaliCalendar
          //     ? temp.selectedNepaliYear
          //     : temp.selectedEnglishYear,
          // },
        })
          .then((response) => {
            if (response.data.status === "OK") {
              temp.salaryDetails = response.data.data;
            } else {
              temp.$store.dispatch("toast/setSnackbar", {
                icon: "fa-solid fa-circle-xmark",
                color: "error",
                title: "Load Failed",
                text: "Unable to load salary list",
              });
            }
            temp.isLoading = false;
          })
          .catch((error) => {
            temp.$store.dispatch("toast/setSnackbar", {
              icon: "fa-solid fa-circle-xmark",
              color: "error",
              title: "Load Failed",
              text: "Unable to load salary list",
            });
            temp.isLoading = false;
          });
      },
      deleteItem(item) {
        const temp = this;
        this.$root
          .confirm(
            "Confirm Delete",
            "Are you sure you want to delete " + item.employee.staffName + "?"
          )
          .then((confirm) => {
            this.makePostRequest({
              route: "salaryDetails/delete",
              data: {
                ...item,
              },
            }).then((response) => {
              if (response.data.status === "OK") {
                temp.getSalarySheet();
                this.$store.dispatch("toast/setSnackbar", {
                  text: "Salary deleted successfully",
                });
              } else {
                temp.$store.dispatch("toast/setSnackbar", {
                  icon: "fa-solid fa-circle-xmark",
                  color: "error",
                  title: "Error",
                  text: "Unable to delete salary",
                });
              }
            });
          })
          .catch((error) => {
            temp.$store.dispatch("toast/setSnackbar", {
              icon: "fa-solid fa-circle-xmark",
              color: "error",
              title: "Error",
              text: "Unable to delete salary",
            });
          });
      },
    },
    mounted() {
      this.getDashainCalculation();
      this.getAllActiveCategory();
    },
    computed: {
      salaryDetailsWithSno() {
        return this.salaryDetails.map((d, index) => ({ ...d, sno: index + 1 }));
      },
    },
  };
  </script>
  
  <style scoped></style>
  