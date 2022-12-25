<template>
  <v-container fluid>
    <h2 style="font-weight: 700" class="mb-6">Salary Details</h2>
    <v-card>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <v-autocomplete
              prepend-inner-icon="fa-solid fa-users"
              filled
              dense
              :items="allActiveEmployee"
              v-model="listSelectedEmployee"
              label="Employee (Nepali Date)"
              placeholder="Search by name or V.S. No."
              return-object
              :filter="filterEmployee"
              @input="getEmployeeById"
              :item-text="
                (item) =>
                  'V.S. No. ' +
                  item.vsNo +
                  ' | ' +
                  item.staffName +
                  ' | ' +
                  '(Assigned:' +
                  item.assignedHours +
                  ' hrs)'
              "
            >
              <template v-slot:item="{ item }">
                V.S. No. {{ item.vsNo }} | {{ item.staffName }} | (Assigned:
                {{ item.assignedHours }} hrs)
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-container v-if="!!listSelectedEmployee" fluid>
          <v-row justify="center">
            <v-col cols="auto">
              <h3>Nepali Calendar</h3>
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
                  :value="selectedNepaliYear"
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
                  :value="nepaliMonthList[selectedNepaliMonth - 1]"
                ></v-text-field>
                <v-btn @click="nextMonth()" fab small icon>
                  <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
          <v-row v-if="!innerLoading">
            <v-col>
              <v-btn @click="recalculateSalary()" color="primary" dark>
                <v-icon left>fas fa-calculator</v-icon>
                Recalculate Salary
              </v-btn>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <v-btn @click="saveChanges()" color="green" dark>
                <v-icon left>fas fa-database</v-icon>
                Save to database
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="!innerLoading">
            <v-col cols="6">
              <v-card outlined>
                <v-card-title><h3>Work Hours Summary</h3></v-card-title>
                <v-divider />
                <v-card-text>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Employee Weekends</b>
                    </v-col>
                    <v-col cols="8">{{ salaryDetails.employeeWeekends }}</v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Employee Hours per day</b>
                    </v-col>
                    <v-col cols="8">{{
                      salaryDetails.employeeHoursPerDay
                    }}</v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>No. of days in month:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.noOfDaysInMonth }} days</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>No. of Weekends in month:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.noOfWeekendsInMonth }} days</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>No. of Worked days:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.noOfWorkedDays }} days</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>No. of Absent days:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.noOfAbsentDays }} days</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Basic hours:</b>
                    </v-col>
                    <v-col cols="8"
                      ><b
                        >{{ calculateBasicHours(salaryDetails) }} hours</b
                      ></v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Worked Hours:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.workedHours }} hours</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>No. of Taken Leaves:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.noOfTakenLeaves }} days ({{
                        convertDaysToHours(salaryDetails.noOfTakenLeaves)
                      }}
                      hours)
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>No. of Taken Sick Leaves:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.noOfTakenSickLeaves }} days ({{
                        convertDaysToHours(salaryDetails.noOfTakenSickLeaves)
                      }}
                      hours)
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>No. of Holidays in month:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.noOfHolidaysInMonth }} days ({{
                        convertDaysToHours(salaryDetails.noOfHolidaysInMonth)
                      }}
                      hours)
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Holiday Basic hours:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.holidayBasicHours }} hours</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Total Hours:</b>
                    </v-col>
                    <v-col cols="8"
                      ><b>{{ salaryDetails.totalHours }} hours</b></v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Overtime Hours:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ calculateOvertimeHours(salaryDetails) }} hours</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Weekend Hours:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.weekendHours }} hours</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Holiday Hours:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.holidayHours }} hours</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>No. of Worked Holidays:</b>
                    </v-col>
                    <v-col cols="8"
                      >{{ salaryDetails.noOfWorkedHolidays }} days</v-col
                    >
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card outlined>
                <v-card-title><h3>Salary Summary</h3></v-card-title>
                <v-divider />
                <v-card-text>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <b>Basic Salary:</b>
                    </v-col>
                    <v-col cols="8">Rs. {{ salaryDetails.basicSalary }}</v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="4"><b>Dearness Allowance:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.dearnessAllowance }}</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Other Allowance:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.otherAllowance }}</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Direness Allowance:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.direnessAllowance }}</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Hardness Allowance:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.hardnessAllowance }}</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Gross Salary:</b></v-col>
                    <v-col cols="8">Rs. {{ salaryDetails.grossSalary }}</v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Absence Reduction:</b></v-col>
                    <v-col cols="8"
                      >Rs. - {{ salaryDetails.reductionSalary }}</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Overtime Allowance:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.overtimeAllowance }}</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Holiday Allowance:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.holidayAlowance }}</v-col
                    >
                  </v-row>
                  <v-row no-gutters> </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Total:</b></v-col>
                    <v-col cols="8">Rs. {{ salaryDetails.totalSalary }}</v-col>
                  </v-row>
                  <br />
                  <v-row no-gutters>
                    <v-col cols="4"><b>Employer's SSF Contribution:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.employerSSFcontribution }}</v-col
                    >
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4"><b>Employee's SSF Contribution:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.employeeSSFcontribution }}</v-col
                    >
                  </v-row>
                </v-card-text>
              </v-card>
              <v-divider class="my-4"></v-divider>
              <v-card outlined>
                <v-card-text>
                  <v-row justify="center" no-gutters>
                    <v-col cols="4"><b>Income Tax:</b></v-col>
                    <v-col cols="8">
                      <v-text-field
                        dense
                        outlined
                        type="number"
                        v-model="reductionForm.incomeTax"
                        @input="deductFromTotal()"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-row justify="center" no-gutters>
                    <v-col cols="4"><b>Lunch</b></v-col>
                    <v-col cols="8">
                      <v-text-field
                        dense
                        outlined
                        type="number"
                        v-model="reductionForm.lunch"
                        @input="deductFromTotal()"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-row justify="center" no-gutters>
                    <v-col cols="4"><b>Medical Insurance</b></v-col>
                    <v-col cols="8">
                      <v-text-field
                        dense
                        outlined
                        type="number"
                        v-model="reductionForm.medicalInsurance"
                        @input="deductFromTotal()"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row justify="center" no-gutters>
                    <v-col cols="4"><b>Advance</b></v-col>
                    <v-col cols="8">
                      <v-text-field
                        dense
                        outlined
                        type="number"
                        v-model="reductionForm.advance"
                        @input="deductFromTotal()"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-row justify="center" no-gutters>
                    <v-col cols="4"><b>Security Deposit</b></v-col>
                    <v-col cols="8">
                      <v-text-field
                        dense
                        outlined
                        type="number"
                        v-model="reductionForm.securityDeposit"
                        @input="deductFromTotal()"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-row justify="center" no-gutters>
                    <v-col cols="4"><b>Other Deductions</b></v-col>
                    <v-col cols="8">
                      <v-text-field
                        dense
                        outlined
                        type="number"
                        v-model="reductionForm.otherDeductions"
                        @input="deductFromTotal()"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <v-row no-gutters>
                    <v-col cols="4"><b>Salary after deductions:</b></v-col>
                    <v-col cols="8"
                      >Rs. {{ salaryDetails.totalSalaryAfterDeductions }}</v-col
                    >
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import NepaliDate from "nepali-date-converter";

export default {
  name: "SalaryDetails",
  data() {
    return {
      innerLoading: false,
      allActiveEmployee: [],
      listSelectedEmployee: null,
      selectedEmployee: {
        id: null,
        vsNo: "",
        staffName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        permanentAddress: "",
        temporaryAddress: "",
        partTimeJoinDate: "",
        fullTimeJoinDate: "",
        resignDate: "",
        category: {
          id: null,
          name: "",
        },
        categoryName: "",
        clients: "",
        // workstation: string;
        nonWorkingDays: "",
        useNepaliCalendar: false,
        assignedHours: null,
        basicHours: null,
        employeeDetails: {
          id: null,
          accountNumber: "",
          ssfNo: "",
          panNumber: null,
          bank: {
            id: null,
            name: "",
          },
          bankBranch: "",
          basicSalary: null,
          dearnessAllowance: null,
          otherAllowance: null,
          specialAllowance: null,
          direnessAllowance: null,
          hardnessAllowance: null,
          overtimeRate: null,
          holidayRate: null,
          activeStatus: "",
        },
        employeeEmergencyDetails: {
          id: null,
          bloodGroup: "",
          contactName: "",
          contactNumber: "",
          relation: "",
          photo: "",
          citizenship: "",
          activeStatus: "",
        },
        activeStatus: "",
      },
      selectedNepaliYear: new NepaliDate().getYear(),
      selectedNepaliMonth: new NepaliDate().getMonth() + 1,
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
      calendarData: {
        useNepaliCalendar: null,
        currentEnglishDate: new Date(),
        currentNepaliDate: new NepaliDate(),
        selectedYear: new NepaliDate().getYear(),
        selectedMonth: new NepaliDate().getMonth() + 1,
        numberOfDaysInCurrentMonth: null,
        numberOfWeekendsInCurrentMonth: null,
        numberOfHolidaysInCurrentMonth: null,
      },
      salaryDetails: {},
      employeeRosterAggregate: {
        totalHours: null,
        numberOfWorkedDays: null,
        numberOfLeaveDays: null,
        leaveDays: "",
        numberOfSickLeaveDays: null,
        sickDays: "",
        numberOfAbsentDays: null,
        absentDays: "",
        numberOfHolidayDays: null,
        holidayDays: "",
        holidayHours: null,
        numberOfOvertimeDays: null,
        overtimeDays: "",
        overtimeHours: null,
        numberOfWeekendDays: null,
        weekendDays: "",
        weekendHours: null,
        holidayBasicHours: null,
      },
      dayList: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      allActiveHoliday: [],
      reductionForm: {
        incomeTax: 0,
        lunch: 0,
        medicalInsurance: 0,
        advance: 0,
        securityDeposit: 0,
        otherDeductions: 0,
      },
    };
  },
  computed: {},
  mounted() {
    this.getAllActiveEmployee();
  },
  methods: {
    ...mapActions("api", ["makeGetRequest", "makePostRequest"]),
    filterEmployee(item, queryText) {
      return (
        item.staffName.toLowerCase().includes(queryText.toLowerCase()) ||
        item.vsNo.toLowerCase().includes(queryText.toLowerCase())
      );
    },
    getEmployeeById(item) {
      let temp = this;
      this.makeGetRequest({
        route: "employee/getById",
        params: {
          id: item.id,
        },
      })
        .then((response) => {
          if (response.data.status === "OK") {
            if (response.data.data.employeeDetails == null) {
              this.$store.dispatch("toast/setSnackbar", {
                icon: "fa-solid fa-triangle-exclamation",
                color: "warning",
                title: "Employee Salary missing",
                text: `Please configure employee salary from employee management.`,
              });
            } else {
              temp.selectedEmployee = response.data.data;
              this.innerLoading = true;
              temp.calendarData.useNepaliCalendar =
                temp.selectedEmployee.useNepaliCalendar;
              temp.setupInitialCalendarInfo();
              temp.getSalaryDetails();
            }
          } else {
            this.$store.dispatch("toast/setSnackbar", {
              icon: "fa-solid fa-circle-xmark",
              color: "error",
              title: "Error",
              text: response.data.message,
            });
          }
        })
        .catch((error) => {});
    },
    getSalaryDetails() {
      let temp = this;
      this.makePostRequest({
        route: "salaryDetails/get",
        data: {
          employeeId: this.selectedEmployee.id,
          isNepaliDate: this.calendarData.useNepaliCalendar,
          year: this.calendarData.selectedYear,
          month: this.calendarData.selectedMonth,
        },
      })
        .then((response) => {
          if (response.data.status === "OK") {
            temp.salaryDetails = response.data.data;
            this.$store.dispatch("toast/setSnackbar", {
              title: "Success",
              text: `Salary loaded from database`,
            });
            this.innerLoading = false;
          } else {
            this.getAggregateDetailsFromAPI();
          }
        })
        .catch((error) => {});
    },
    getAllActiveHoliday() {
      let temp = this;
      this.$store
        .dispatch("api/makeGetRequest", {
          route: "holiday/getByNepaliYear/active",
          params: {
            nepaliYear: temp.selectedNepaliYear,
          },
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.allActiveHoliday = response.data.data;
          }
        })
        .catch((error) => {});
    },
    getAllActiveEmployee() {
      let temp = this;
      this.makeGetRequest({
        route: "employee/getAllActiveMini",
      })
        .then((response) => {
          if (response.data.status === "OK") {
            this.allActiveEmployee = response.data.data;
          }
        })
        .catch((error) => {});
    },
    previousYear() {
      this.innerLoading = true;
      this.selectedNepaliYear--;
      this.calendarData.selectedYear--;
      this.setupSelectedMonthInfo();
      this.getSalaryDetails();
      this.getAllActiveHoliday();
    },
    nextYear() {
      this.innerLoading = true;
      this.selectedNepaliYear++;
      this.calendarData.selectedYear++;
      this.setupSelectedMonthInfo();
      this.getSalaryDetails();
      this.getAllActiveHoliday();
    },
    previousMonth() {
      if (this.selectedNepaliMonth > 1) {
        this.innerLoading = true;
        this.selectedNepaliMonth--;
        this.calendarData.selectedMonth--;
        this.setupSelectedMonthInfo();
        this.getSalaryDetails();
      }
    },
    nextMonth() {
      if (this.selectedNepaliMonth < 12) {
        this.innerLoading = true;
        this.selectedNepaliMonth++;
        this.calendarData.selectedMonth++;
        this.setupSelectedMonthInfo();
        this.getSalaryDetails();
      }
    },
    setupInitialCalendarInfo() {
      this.calendarData.currentEnglishDate = new Date();
      this.calendarData.currentNepaliDate = new NepaliDate();

      if (this.calendarData.useNepaliCalendar) {
        this.calendarData.selectedYear =
          this.calendarData.currentNepaliDate.getYear();
        this.calendarData.selectedMonth =
          this.calendarData.currentNepaliDate.getMonth() + 1;
      } else {
        this.calendarData.selectedYear =
          this.calendarData.currentEnglishDate.getFullYear();
        this.calendarData.selectedMonth =
          this.calendarData.currentEnglishDate.getMonth() + 1;
      }

      this.setupSelectedMonthInfo();
      this.getAllActiveHoliday();
    },
    setupSelectedMonthInfo() {
      // Setup number of days in current month
      this.numberOfDaysInCurrentMonth();

      this.calendarData.numberOfWeekendsInCurrentMonth =
        this.getNumberOfWeekendsInCurrentMonth(
          this.calendarData.numberOfDaysInCurrentMonth,
          this.selectedEmployee,
          this.calendarData.useNepaliCalendar,
          this.calendarData.selectedYear,
          this.calendarData.selectedMonth
        );

      this.calendarData.numberOfHolidaysInCurrentMonth =
        this.getNumberOfHolidaysInCurrentMonth(
          this.calendarData.numberOfDaysInCurrentMonth,
          this.selectedEmployee,
          this.calendarData.useNepaliCalendar,
          this.allActiveHoliday,
          this.calendarData.selectedMonth,
          this.calendarData.selectedYear
        );
    },
    numberOfDaysInCurrentMonth() {
      if (this.calendarData.useNepaliCalendar) {
        this.calendarData.numberOfDaysInCurrentMonth = new NepaliDate(
          this.calendarData.selectedYear,
          this.calendarData.selectedMonth,
          0
        ).getDate();
      } else {
        this.calendarData.numberOfDaysInCurrentMonth = new Date(
          this.calendarData.selectedYear,
          this.calendarData.selectedMonth,
          0
        ).getDate();
      }
    },
    getNumberOfWeekendsInCurrentMonth(
      numberOfDaysInCurrentMonth,
      employee,
      useNepaliCalendar,
      selectedYear,
      selectedMonth
    ) {
      // Setup number of saturdays in current month
      let numberOfWeekends = 0;
      for (let i = 1; i <= numberOfDaysInCurrentMonth; i++) {
        const day = useNepaliCalendar
          ? new NepaliDate(selectedYear, selectedMonth - 1, i).getDay()
          : new Date(selectedYear, selectedMonth - 1, i).getDay();
        const weekendList = !!employee.nonWorkingDays
          ? employee.nonWorkingDays.split("")
          : [];
        if (weekendList.includes(day.toString())) {
          numberOfWeekends++;
        }
      }
      return numberOfWeekends;
    },
    getNumberOfHolidaysInCurrentMonth(
      numberOfDaysInCurrentMonth,
      employee,
      useNepaliCalendar,
      holidays,
      selectedMonth,
      selectedYear
    ) {
      let numberOfWeekends = 0;
      for (let i = 1; i <= numberOfDaysInCurrentMonth; i++) {
        for (const holiday of holidays) {
          if (useNepaliCalendar) {
            if (
              holiday.nepaliMonth === selectedMonth &&
              holiday.nepaliDay === i
            ) {
              const day = useNepaliCalendar
                ? new NepaliDate(selectedYear, selectedMonth - 1, i).getDay()
                : new Date(selectedYear, selectedMonth - 1, i).getDay();
              const weekendList = !!employee.nonWorkingDays
                ? employee.nonWorkingDays.split("")
                : [];
              if (!weekendList.includes(day.toString())) {
                numberOfWeekends++;
              }
            }
          } else {
            if (
              holiday.englishMonth === selectedMonth &&
              holiday.englishDay === i
            ) {
              const day = useNepaliCalendar
                ? new NepaliDate(selectedYear, selectedMonth - 1, i).getDay()
                : new Date(selectedYear, selectedMonth - 1, i).getDay();
              const weekendList = !!employee.nonWorkingDays
                ? employee.nonWorkingDays.split("")
                : [];
              if (!weekendList.includes(day.toString())) {
                numberOfWeekends++;
              }
            }
          }
        }
      }

      return numberOfWeekends;
    },
    getAggregateDetailsFromAPI() {
      let temp = this;
      this.makePostRequest({
        route: "employeeRoster/employee/aggregate",
        data: {
          year: this.calendarData.selectedYear,
          month: this.calendarData.selectedMonth,
          employeeId: this.selectedEmployee.id,
          isNepaliDate: this.calendarData.useNepaliCalendar,
        },
      })
        .then((response) => {
          console.log("here");
          if (response.data.status === "OK") {
            temp.employeeRosterAggregate = response.data.data.aggregate;

            temp.salaryDetails = temp.getSalaryDetailsObject(
              temp.selectedEmployee,
              response.data.data.aggregate,
              temp.allActiveHoliday,
              temp.calendarData
            );

            const salaryDetailsId = temp.salaryDetails?.id;

            if (salaryDetailsId != null) {
              temp.salaryDetails.id = salaryDetailsId;
            }
            temp.$store.dispatch("toast/setSnackbar", {
              title: "Success",
              text: `Salary calculated`,
            });
            temp.innerLoading = false;
          } else {
            temp.$store.dispatch("toast/setSnackbar", {
              icon: "fa-solid fa-circle-xmark",
              color: "error",
              title: "Load Failed",
              text: `Unable to get aggregate details for selected employee`,
            });
          }
        })
        .catch((error) => {
          temp.$store.dispatch("toast/setSnackbar", {
            icon: "fa-solid fa-circle-xmark",
            color: "error",
            title: "Load Failed",
            text: `Unable to get aggregate details for selected employee`,
          });
        });
    },
    getSalaryDetailsObject(
      selectedEmployee,
      employeeRosterAggregate,
      holidays,
      calendarData
    ) {
      const employeeWeekends = this.translateWeekendStringToNames(
        selectedEmployee.nonWorkingDays
      );

      const totalLeaveHours =
        (employeeRosterAggregate.numberOfLeaveDays +
          employeeRosterAggregate.numberOfSickLeaveDays) *
        selectedEmployee.assignedHours;

      const expectedWorkHours = selectedEmployee.basicHours - totalLeaveHours;

      const actualWorkedHours = this.getActualWorkedHours(
        selectedEmployee,
        employeeRosterAggregate,
        calendarData
      );

      const actualTotalHours =
        actualWorkedHours +
        totalLeaveHours +
        employeeRosterAggregate.holidayBasicHours;
      // + this.numberOfHolidaysInCurrentMonth * this.selectedEmployee.assignedHours;

      const totalOvertimeAllowance =
        selectedEmployee.employeeDetails.overtimeRate *
          employeeRosterAggregate.overtimeHours +
        selectedEmployee.employeeDetails.overtimeRate *
          employeeRosterAggregate.weekendHours;

      const grossSalary = this.getGrossSalary(selectedEmployee);

      const reductionSalary = this.getReductionSalary(
        grossSalary,
        selectedEmployee,
        actualTotalHours,
        actualWorkedHours,
        expectedWorkHours,
        employeeRosterAggregate.holidayBasicHours
      );

      const totalSalary = this.getTotalSalary(
        selectedEmployee,
        reductionSalary,
        employeeRosterAggregate
      );

      const basicSalaryAfterReduction =
        selectedEmployee.employeeDetails.basicSalary -
        this.getReductionBasicSalary(
          selectedEmployee,
          actualTotalHours,
          actualWorkedHours,
          expectedWorkHours,
          employeeRosterAggregate.holidayBasicHours
        );
      const employerSSFContribution = Number(
        (0.2 * basicSalaryAfterReduction).toFixed(1)
      );
      const employeeSSFContribution = Number(
        (0.11 * basicSalaryAfterReduction).toFixed(1)
      );
      const totalSalaryAfterDeductions = Number(
        (totalSalary - employeeSSFContribution).toFixed(1)
      );

      // START INITIALIZE SALARY DETAILS OBJECT
      let englishYear;
      let englishMonth;
      let englishDay;
      let nepaliYear;
      let nepaliMonth;
      let nepaliDay;

      if (calendarData.useNepaliCalendar) {
        nepaliYear = calendarData.selectedYear;
        nepaliMonth = calendarData.selectedMonth;
        nepaliDay = 1;
        const tempEnglishDate = new NepaliDate(
          nepaliYear,
          nepaliMonth,
          nepaliDay
        ).getAD();
        englishYear = tempEnglishDate.year;
        englishMonth = tempEnglishDate.month + 1;
      } else {
        englishYear = calendarData.selectedYear;
        englishMonth = calendarData.selectedMonth;
        englishDay = 1;
        const tempNepaliDate = new NepaliDate(
          englishYear,
          englishMonth,
          englishDay
        ).getBS();
        nepaliYear = tempNepaliDate.year;
        nepaliMonth = tempNepaliDate.month;
      }

      const salaryDetails = {
        employee: { id: selectedEmployee.id },
        bankName: selectedEmployee.employeeDetails.bank
          ? selectedEmployee.employeeDetails.bank.name
          : "N/A",
        accountNumber: selectedEmployee.employeeDetails?.accountNumber
          ? selectedEmployee.employeeDetails?.accountNumber
          : "N/A",
        ssfNo: selectedEmployee.employeeDetails?.ssfNo
          ? selectedEmployee.employeeDetails?.ssfNo
          : "N/A",
        englishYear,
        englishMonth,
        nepaliYear,
        nepaliMonth,
        useNepaliCalendar: calendarData.useNepaliCalendar,

        employeeWeekends,
        employeeHoursPerDay: selectedEmployee.assignedHours,
        noOfDaysInMonth: calendarData.numberOfDaysInCurrentMonth,
        noOfWeekendsInMonth: calendarData.numberOfWeekendsInCurrentMonth,
        noOfWorkedDays: employeeRosterAggregate.numberOfWorkedDays,
        noOfAbsentDays: employeeRosterAggregate.numberOfAbsentDays,
        basicHours: selectedEmployee.basicHours,
        workedHours: actualWorkedHours,
        noOfTakenLeaves: employeeRosterAggregate.numberOfLeaveDays,
        noOfTakenSickLeaves: employeeRosterAggregate.numberOfSickLeaveDays,
        noOfHolidaysInMonth: calendarData.numberOfHolidaysInCurrentMonth,
        totalHours: actualTotalHours,
        weekendHours: employeeRosterAggregate.weekendHours,
        overtimeHours: employeeRosterAggregate.overtimeHours,
        holidayHours: employeeRosterAggregate.holidayHours,
        noOfWorkedHolidays: employeeRosterAggregate.numberOfHolidayDays,
        holidayBasicHours: employeeRosterAggregate.holidayBasicHours,
        basicSalary: selectedEmployee.employeeDetails.basicSalary,
        dearnessAllowance: selectedEmployee.employeeDetails.dearnessAllowance,
        otherAllowance: selectedEmployee.employeeDetails.otherAllowance,
        direnessAllowance: selectedEmployee.employeeDetails.direnessAllowance,
        hardnessAllowance: selectedEmployee.employeeDetails.hardnessAllowance,
        grossSalary,
        reductionSalary,
        overtimeAllowance: totalOvertimeAllowance,
        holidayAlowance:
          selectedEmployee.employeeDetails.holidayRate *
          employeeRosterAggregate.holidayHours,
        totalSalary,
        employerSSFcontribution: employerSSFContribution,
        employeeSSFcontribution: employeeSSFContribution,
        incomeTax: 0,
        lunch: 0,
        medicalInsurance: 0,
        advance: 0,
        securityDeposit: 0,
        otherDeductions: 0,
        totalSalaryAfterDeductions,
      };

      return salaryDetails;
    },
    translateWeekendStringToNames(nonWorkingDays) {
      let weekends = "";
      const weekendList = nonWorkingDays ? nonWorkingDays.split("") : [];
      if (weekendList.length > 0) {
        for (const weekend of weekendList) {
          weekends += this.dayList[parseInt(weekend, 10)];
          weekends += ", ";
        }
        weekends = weekends.slice(0, weekends.length - 2);
        return weekends;
      }
      return "-";
    },
    getActualWorkedHours(
      selectedEmployee,
      employeeRosterAggregate,
      calendarData
    ) {
      const numberOfWorkingDaysInCurrentMonth =
        this.getNumberOfWorkingDaysInCurrentMonth(
          calendarData.numberOfDaysInCurrentMonth,
          selectedEmployee,
          calendarData.useNepaliCalendar,
          calendarData.selectedYear,
          calendarData.selectedMonth
        );
      return this.getExpectedBasicHours(
        numberOfWorkingDaysInCurrentMonth,
        this.getActualTotalDays(employeeRosterAggregate, calendarData),
        selectedEmployee.nonWorkingDays.length,
        employeeRosterAggregate.totalHours,
        selectedEmployee.basicHours,
        selectedEmployee.assignedHours
      );
    },
    getNumberOfWorkingDaysInCurrentMonth(
      numberOfDaysInCurrentMonth,
      employee,
      useNepaliCalendar,
      selectedYear,
      selectedMonth
    ) {
      // Setup number of saturdays in current month
      let numberOfWeekends = 0;
      for (let i = 1; i <= numberOfDaysInCurrentMonth; i++) {
        const day = useNepaliCalendar
          ? new NepaliDate(selectedYear, selectedMonth - 1, i).getDay()
          : new Date(selectedYear, selectedMonth - 1, i).getDay();
        const weekendList = !!employee.nonWorkingDays
          ? employee.nonWorkingDays.split("")
          : [];
        if (weekendList.includes(day.toString())) {
          numberOfWeekends++;
        }
        // if (this.isWeekend(
        //   useNepaliCalendar, selectedYear, selectedMonth, i, employee.nonWorkingDays)) {
        //   numberOfWeekends++;
        // }
      }
      return numberOfDaysInCurrentMonth - numberOfWeekends;
    },
    getExpectedBasicHours(
      actualNumberOfDays,
      numberOfWorkedDays,
      numberOfWeekends,
      actualHours,
      basicHours,
      assignedHours
    ) {
      if (numberOfWorkedDays < 15) {
        return actualHours;
      } else {
        const workingDays = 30 - numberOfWeekends * 4;
        if (actualNumberOfDays > workingDays) {
          return (
            actualHours - assignedHours * (actualNumberOfDays - workingDays)
          );
        } else if (actualNumberOfDays < workingDays) {
          return (
            actualHours + assignedHours * (workingDays - actualNumberOfDays)
          );
        } else {
          return actualHours;
        }
      }
    },
    getTotalLeaveDays(employeeRosterAggregate) {
      return (
        employeeRosterAggregate.numberOfLeaveDays +
        employeeRosterAggregate.numberOfSickLeaveDays
      );
    },
    getActualTotalDays(employeeRosterAggregate, calendarData) {
      console.log("Hi");
      return (
        employeeRosterAggregate.numberOfWorkedDays +
        this.getTotalLeaveDays(employeeRosterAggregate) +
        calendarData.numberOfHolidaysInCurrentMonth
      );
    },
    getGrossSalary(selectedEmployee) {
      let gross = 0;
      gross += selectedEmployee.employeeDetails.basicSalary;
      gross += selectedEmployee.employeeDetails.dearnessAllowance;
      gross += selectedEmployee.employeeDetails.otherAllowance;
      gross += selectedEmployee.employeeDetails.specialAllowance;
      gross += selectedEmployee.employeeDetails.direnessAllowance;
      gross += selectedEmployee.employeeDetails.hardnessAllowance;
      gross = Number(gross.toFixed(1));
      return gross;
    },
    getReductionSalary(
      grossSalary,
      selectedEmployee,
      actualTotalHours,
      actualWorkedHours,
      expectedWorkHours,
      holidayBasicHours
    ) {
      const grossSalaryPerHour = grossSalary / selectedEmployee.basicHours;
      let missingHours;
      if (actualTotalHours === null || actualTotalHours === 0) {
        return grossSalary;
      }
      if (actualWorkedHours < expectedWorkHours) {
        missingHours =
          expectedWorkHours - actualWorkedHours - holidayBasicHours;
        return Number((missingHours * grossSalaryPerHour).toFixed(1));
      }
      return 0;
    },
    getTotalSalary(selectedEmployee, reductionSalary, employeeRosterAggregate) {
      let totalSalary = 0;
      totalSalary += selectedEmployee.employeeDetails.basicSalary;
      totalSalary += selectedEmployee.employeeDetails.dearnessAllowance;
      totalSalary += selectedEmployee.employeeDetails.otherAllowance;
      totalSalary += selectedEmployee.employeeDetails.specialAllowance;
      totalSalary += selectedEmployee.employeeDetails.direnessAllowance;
      totalSalary += selectedEmployee.employeeDetails.hardnessAllowance;
      totalSalary +=
        selectedEmployee.employeeDetails.overtimeRate *
        employeeRosterAggregate.overtimeHours;
      totalSalary +=
        selectedEmployee.employeeDetails.overtimeRate *
        employeeRosterAggregate.weekendHours;
      totalSalary +=
        selectedEmployee.employeeDetails.holidayRate *
        employeeRosterAggregate.holidayHours;
      totalSalary -= reductionSalary;
      return Number(totalSalary.toFixed(1));
    },
    getReductionBasicSalary(
      selectedEmployee,
      actualTotalHours,
      actualWorkedHours,
      expectedWorkHours,
      holidayBasicHours
    ) {
      const basicSalary = selectedEmployee.employeeDetails.basicSalary;
      const basicSalaryPerHour = basicSalary / selectedEmployee.basicHours;
      let missingHours;
      if (actualTotalHours === null || actualTotalHours === 0) {
        return basicSalary;
      }
      if (actualWorkedHours < expectedWorkHours) {
        missingHours =
          expectedWorkHours - actualWorkedHours - holidayBasicHours;
        return Number((missingHours * basicSalaryPerHour).toFixed(1));
      }
      return 0;
    },

    recalculateSalary() {
      this.getAggregateDetailsFromAPI();
      this.reductionForm.incomeTax = 0;
      this.reductionForm.lunch = 0;
      this.reductionForm.medicalInsurance = 0;
      this.reductionForm.advance = 0;
      this.reductionForm.securityDeposit = 0;
      this.reductionForm.otherDeductions = 0;
    },
    saveChanges() {
      let temp = this;

      this.salaryDetails.incomeTax = this.reductionForm.incomeTax;
      this.salaryDetails.lunch = this.reductionForm.lunch;
      this.salaryDetails.medicalInsurance = this.reductionForm.medicalInsurance;
      this.salaryDetails.advance = this.reductionForm.advance;
      this.salaryDetails.securityDeposit = this.reductionForm.securityDeposit;
      this.salaryDetails.otherDeductions = this.reductionForm.otherDeductions;

      if (this.salaryDetails.id == null) {
        this.makePostRequest({
          route: "salaryDetails/registerNew",
          data: {
            ...temp.salaryDetails,
          },
        })
          .then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                title: "Success",
                text: `Changes saved`,
              });
            } else {
              this.$store.dispatch("toast/setSnackbar", {
                icon: "fa-solid fa-circle-xmark",
                color: "error",
                title: "Error",
                text: response.data.message,
              });
            }
          })
          .catch((error) => {
            this.$store.dispatch("toast/setSnackbar", {
              icon: "fa-solid fa-circle-xmark",
              color: "error",
              title: "Error",
              text: "Unable to save changes.",
            });
          });
      } else {
        this.makePostRequest({
          route: "salaryDetails/update",
          data: {
            ...temp.salaryDetails,
          },
        })
          .then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                title: "Success",
                text: `Changes saved`,
              });
            } else {
              this.$store.dispatch("toast/setSnackbar", {
                icon: "fa-solid fa-circle-xmark",
                color: "error",
                title: "Error",
                text: response.data.message,
              });
            }
          })
          .catch((error) => {
            this.$store.dispatch("toast/setSnackbar", {
              icon: "fa-solid fa-circle-xmark",
              color: "error",
              title: "Error",
              text: "Unable to save changes.",
            });
          });
      }
    },
    calculateBasicHours(salaryDetails) {
      if (
        salaryDetails?.noOfTakenLeaves !== 0 ||
        salaryDetails?.noOfTakenSickLeaves !== 0
      ) {
        return (
          salaryDetails.employeeHoursPerDay *
          salaryDetails?.noOfTakenLeaves *
          salaryDetails?.noOfTakenSickLeaves
        );
      } else {
        return salaryDetails?.basicHours;
      }
    },
    calculateOvertimeHours(salaryDetails) {
      if (salaryDetails?.overtimeHours !== 0) {
        return (
          salaryDetails?.overtimeHours -
          (this.calculateBasicHours(salaryDetails) - salaryDetails?.totalHours)
        );
      } else {
        return salaryDetails?.overtimeHours;
      }
    },
    convertDaysToHours(days) {
      return days * this.selectedEmployee.assignedHours;
    },
    deductFromTotal() {
      let totalSalaryAfterDeductions = Number(
        (
          this.salaryDetails.totalSalary -
          this.salaryDetails.employeeSSFcontribution
        ).toFixed(1)
      );
      totalSalaryAfterDeductions -= this.reductionForm.incomeTax;
      totalSalaryAfterDeductions -= this.reductionForm.lunch;
      totalSalaryAfterDeductions -= this.reductionForm.medicalInsurance;
      totalSalaryAfterDeductions -= this.reductionForm.advance;
      totalSalaryAfterDeductions -= this.reductionForm.securityDeposit;
      totalSalaryAfterDeductions -= this.reductionForm.otherDeductions;
      this.salaryDetails.totalSalaryAfterDeductions =
        totalSalaryAfterDeductions;
    },
  },
};
</script>

<style scoped></style>
