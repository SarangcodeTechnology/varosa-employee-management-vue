<template>
  <v-container fluid>
    <h2 style="font-weight: 700" class="mb-6">Monthly Salary Sheet</h2>
    <v-card>
      <v-container fluid>
        <v-container fluid>
          <v-row justify="center">
            <v-col cols="auto">
              <h3 v-if="useNepaliCalendar">Nepali Calendar</h3>
              <h3 v-else>English Calendar</h3>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="auto">
              <v-btn-toggle>
                <v-btn @click="previousYear()" fab small icon>
                  <v-icon>fas fa-angle-left</v-icon>
                </v-btn>
                <v-text-field
                  dense
                  outlined
                  readonly
                  :value="
                    useNepaliCalendar ? selectedNepaliYear : selectedEnglishYear
                  "
                ></v-text-field>

                <v-btn @click="nextYear()" fab small icon>
                  <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-col>
            <v-col cols="auto">
              <v-btn-toggle>
                <v-btn @click="previousMonth()" fab small icon>
                  <v-icon>fas fa-angle-left</v-icon>
                </v-btn>
                <v-text-field
                  dense
                  outlined
                  readonly
                  :value="
                    useNepaliCalendar
                      ? nepaliMonthList[selectedNepaliMonth - 1]
                      : englishMonthList[selectedEnglishMonth - 1]
                  "
                ></v-text-field>
                <v-btn @click="nextMonth()" fab small icon>
                  <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="auto">
              <v-btn
                @click="
                  useNepaliCalendar = !useNepaliCalendar;
                  getSalarySheet();
                "
                color="primary"
                dark
              >
                <v-icon left>fas fa-calendar-days</v-icon>
                <template v-if="useNepaliCalendar"
                  >View English Calendar</template
                >
                <template v-else>View Nepali Calendar</template>
              </v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
              <v-btn color="green" @click="toExcel" dark>
                <v-icon left>fas fa-file-excel</v-icon>
                Excel
              </v-btn>
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
  name: "MonthlySalarySheet",
  data() {
    return {
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
        { text: "VS No.", value: "employee.vsNo" },
        { text: "Employee Name", value: "employee.staffName" },
        { text: "Bank Name", value: "bankName" },
        { text: "Account Number", value: "accountNumber" },
        { text: "SSF Number", value: "employeeHoursPerDay" },
        { text: "No. of days in month", value: "noOfDaysInMonth" },
        { text: "No. of weekends in month", value: "noOfWeekendsInMonth" },
        { text: "No. of worked days", value: "noOfWorkedDays" },
        { text: "No. of absent days", value: "noOfAbsentDays" },
        { text: "Basic Hours", value: "basicHours" },
        { text: "Worked Hours", value: "workedHours" },
        { text: "No. of Taken Leaves", value: "noOfTakenLeaves" },
        { text: "No. of Taken Sick Leaves", value: "noOfTakenSickLeaves" },
        { text: "No. of Holidays in month", value: "noOfHolidaysInMonth" },
        { text: "Holiday Basic hours", value: "holidayBasicHours" },
        { text: "Total Hours", value: "totalHours" },
        { text: "Overtime Hours", value: "overtimeHours" },
        { text: "Weekend Hours", value: "weekendHours" },
        { text: "Holiday Hours", value: "holidayHours" },
        { text: "No. of Worked Holidays", value: "noOfWorkedHolidays" },
        { text: "Basic Salary", value: "basicSalary" },
        { text: "Dearness Allowance", value: "dearnessAllowance" },
        { text: "Other Allowance", value: "otherAllowance" },
        { text: "Direness Allowance", value: "direnessAllowance" },
        { text: "Hardness Allowance", value: "hardnessAllowance" },
        { text: "Gross Salary", value: "grossSalary" },
        { text: "Absence Reduction", value: "reductionSalary" },
        { text: "Overtime Allowance", value: "overtimeAllowance" },
        { text: "Holiday Allowance", value: "holidayAlowance" },
        { text: "Total", value: "totalSalary" },
        {
          text: "Employer's SSF Contribution",
          value: "employerSSFcontribution",
        },
        {
          text: "Employee's SSF Contribution",
          value: "employeeSSFcontribution",
        },
        { text: "Income Tax", value: "incomeTax" },
        { text: "Lunch", value: "lunch" },
        { text: "Medical Insurance", value: "medicalInsurance" },
        { text: "Advance", value: "advance" },
        { text: "Security Deposit", value: "securityDeposit" },
        { text: "Other Deductions", value: "otherDeductions" },
        {
          text: "Salary after deductions",
          value: "totalSalaryAfterDeductions",
        },
        { text: "Actions", value: "actions", width: "15%" },
      ],
    };
  },
  methods: {
    responseGetter() {
      let temp = this;
      return this.makePostRequest({
        route: "salaryDetails/sheet",
        data: {
          isNepaliDate: temp.useNepaliCalendar,
          month: temp.useNepaliCalendar
            ? temp.selectedNepaliMonth
            : temp.selectedEnglishMonth,
          year: temp.useNepaliCalendar
            ? temp.selectedNepaliYear
            : temp.selectedEnglishYear,
        },
      });
    },
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
        this.getSalarySheet();
      } else {
        this.selectedEnglishYear--;
        this.getSalarySheet();
      }
    },
    nextYear() {
      if (this.useNepaliCalendar) {
        this.selectedNepaliYear++;
        this.getSalarySheet();
      } else {
        this.selectedEnglishYear++;
        this.getSalarySheet();
      }
    },
    previousMonth() {
      if (this.useNepaliCalendar) {
        if (this.selectedNepaliMonth > 1) {
          this.selectedNepaliMonth--;
          this.getSalarySheet();
        }
      } else {
        if (this.selectedEnglishMonth > 1) {
          this.selectedEnglishMonth--;
          this.getSalarySheet();
        }
      }
    },
    nextMonth() {
      if (this.useNepaliCalendar) {
        if (this.selectedNepaliMonth < 12) {
          this.selectedNepaliMonth++;
          this.getSalarySheet();
        }
      } else {
        if (this.selectedEnglishMonth < 12) {
          this.selectedEnglishMonth++;
          this.getSalarySheet();
        }
      }
    },
    getSalarySheet() {
      let temp = this;
      temp.isLoading = true;
      this.makePostRequest({
        route: "salaryDetails/sheet",
        data: {
          isNepaliDate: temp.useNepaliCalendar,
          month: temp.useNepaliCalendar
            ? temp.selectedNepaliMonth
            : temp.selectedEnglishMonth,
          year: temp.useNepaliCalendar
            ? temp.selectedNepaliYear
            : temp.selectedEnglishYear,
        },
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
    this.getSalarySheet();
  },
  computed: {
    salaryDetailsWithSno() {
      return this.salaryDetails.map((d, index) => ({ ...d, sno: index + 1 }));
    },
  },
};
</script>

<style scoped></style>
