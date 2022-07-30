<template>
  <v-container fluid>
    <h2 style="font-weight: 700;" class="mb-6">Client Roster</h2>
    <v-card>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <v-autocomplete prepend-inner-icon="fa-solid fa-users" filled dense :items="allActiveClientNepali"
                            v-model="selectedClient"
                            label="Client (Nepali Date)"
                            placeholder="Search by name"
                            return-object
                            @input="getClient"
                            item-text="siteName"
            >
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete prepend-inner-icon="fa-solid fa-users" filled dense :items="allActiveClientEnglish"
                            v-model="selectedClient"
                            label="Client (English Date)"
                            placeholder="Search by name"
                            return-object
                            @input="getClient"
                            item-text="siteName"
            >
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-container v-if="!!selectedClient" fluid>
          <v-row justify="center">
            <v-col cols="auto">
              <h3 v-if="selectedClient.useNepaliCalendar">Nepali Calendar</h3>
              <h3 v-else>English Calendar</h3>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="auto">
              <v-btn-toggle>
                <v-btn
                  @click="previousYear()"
                  fab
                  small
                  icon>
                  <v-icon>fas fa-angle-left</v-icon>
                </v-btn>
                <v-text-field dense outlined readonly
                              :value="selectedClient.useNepaliCalendar ? selectedNepaliYear : selectedEnglishYear"></v-text-field>

                <v-btn
                  @click="nextYear()"
                  fab
                  small
                  icon>
                  <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-col>
            <v-col cols="auto">
              <v-btn-toggle>
                <v-btn @click="previousMonth()" fab small icon>
                  <v-icon>fas fa-angle-left</v-icon>
                </v-btn>
                <v-text-field dense outlined readonly
                              :value="selectedClient.useNepaliCalendar ? nepaliMonthList[selectedNepaliMonth-1] : englishMonthList[selectedEnglishMonth-1]"></v-text-field>
                <v-btn @click="nextMonth()" fab
                       small icon>
                  <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
              </v-btn-toggle>

            </v-col>
          </v-row>
          <v-row>
            <v-spacer/>
            <v-col cols="auto">
              <v-btn color="green" dark>
                <v-icon left>fas fa-file-excel</v-icon>
                Excel
              </v-btn>
              <v-btn @click="saveToSalarySheet()" dark>
                <v-icon left>fas fa-plus</v-icon>
                Save to salary sheet
              </v-btn>
              <v-btn @click="applyChanges()" color="success">
                <v-icon left>fas fa-save</v-icon>
                Apply Changes
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
                                firstIcon : 'fas fa-angle-double-left',
                                lastIcon:'fas fa-angle-double-right',
                                nextIcon:'fas fa-angle-right',
                                prevIcon:'fas fa-angle-left',
                                itemsPerPageOptions:[25,50,100,-1]
                              }"
              :items="rosterByEmployees"
              :headers="getHeaders">
              <template v-for="(tempItem,j) in numberOfDaysInCurrentMonth"
                        v-slot:[`item.days[${j}].workedHours`]="{item,index}">
                <v-menu close-on-content-click offset-y>
                  <template v-slot:activator="{attrs,on}">
                    <v-text-field :background-color="getBackgroundColor(item.days[j] ? item.days[j] : null)"
                                  v-bind="attrs" @contextmenu.stop.prevent="on.click" class="mt-3" type="number" dense
                                  outlined :value="item.days[j]?item.days[j].workedHours:''"
                                  @input="newHourLog($event,index,j)"></v-text-field>
                  </template>
                  <v-list v-if="!!item.days[j]?!item.days[j].isWeekend:false">
                    <v-list-item v-if="!!item.days[j]?!item.days[j].isHoliday:false"
                                 @click="setLeave(item.days[j].workedHours,index,j)">
                      <v-list-item-title>{{
                          (!!rosterByEmployees[index].days[j] ? rosterByEmployees[index].days[j].isLeave : false) ? 'Undo Leave' : 'Leave'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!!item.days[j]?!item.days[j].isHoliday:false"
                                 @click="setSickLeave(item.days[j].workedHours,index,j)">
                      <v-list-item-title>{{
                          (!!rosterByEmployees[index].days[j] ? rosterByEmployees[index].days[j].isSick : false) ? 'Undo Sick Leave' : 'Sick Leave'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!!item.days[j]?!item.days[j].isHoliday:false"
                                 @click="setAbsent(item.days[j].workedHours,index,j)">
                      <v-list-item-title>{{
                          (!!rosterByEmployees[index].days[j] ? rosterByEmployees[index].days[j].isAbsent : false) ? 'Undo Absent' : 'Absent'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!!item.days?!isRelieverEmployee(rosterByEmployees[index].days):false"
                                 @click="addReliever(item.days[j].workedHours,index,j)">
                      <v-list-item-title>Add Reliever
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!!item.days[j]?item.days[j].isHoliday:false"
                                 @click="setHolidayBasicHours(item.days[j].workedHours,index,j)">
                      <v-list-item-title>
                        {{
                          (!!rosterByEmployees[index].days[j] ? rosterByEmployees[index].days[j].addHolidayBasicHours : false) ? 'Undo Holiday basic hours' : 'Add holiday basic hours'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn icon color="error" @click.stop.prevent="deleteItem(item)">
                  <v-icon>fas fa-trash-alt</v-icon>
                </v-btn>
              </template>

            </v-data-table>
          </v-row>
        </v-container>
      </v-container>
    </v-card>
    <v-dialog scrollable max-width="40%" v-model="employeeModal">
      <v-card>
        <v-toolbar
          dark
          flat
          class="mb-6"
          color="primary"
        >
          <v-toolbar-title>Select Reliever Employee</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="employeeModal = false;"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-autocomplete prepend-inner-icon="fa-solid fa-users" filled dense :items="allActiveEmployee"
                          v-model="selectedEmployee"
                          label="Employee"
                          placeholder="Search by employee name"
                          return-object
                          item-text="staffName"
          >
          </v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="error"
            @click="employeeModal = false;"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="addRelieverEmployee()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog scrollable max-width="60%" v-model="holidayModal">
      <v-card>
        <v-toolbar
          dark
          flat
          class="mb-6"
          color="primary"
        >
          <v-toolbar-title>Enter holiday basic hours</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="holidayModal = false;"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model.number="holidayBasicHours"
            label="Holiday basic hours"
            type="number"
            filled
            prepend-inner-icon="fa-solid fa-clock"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="error"
            @click="holidayModal = false;"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveHolidayBasicHours"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import NepaliDate from 'nepali-date-converter';
import VNepaliDatePicker from 'v-nepalidatepicker';
import {mapActions, mapGetters} from "vuex";

export default {
  name: "ClientRoster",
  components: {
    VNepaliDatePicker,
  },
  data() {
    return {
      holidayBasicHours: null,
      search: '',
      isLoading: false,
      allActiveClient: [],
      allActiveHoliday: [],
      selectedClient: null,
      currentNepaliDate: new NepaliDate(),
      currentEnglishDate: new Date(),
      selectedNepaliYear: new NepaliDate().getYear(),
      selectedNepaliMonth: new NepaliDate().getMonth() + 1,
      selectedEnglishYear: new Date().getFullYear(),
      selectedEnglishMonth: new Date().getMonth() + 1,

      nepaliMonthList: ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Asoj', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'],
      englishMonthList: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      dayList: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      headers: [],
      rosterByEmployees: [],
      newEmployeeRosters: [],
      selectedPayload: {},
      holidayModal: false,
      viewLeaveDetailsDialog: false,
      rightClickPayload: {},
      employeeModal: false,
      allActiveEmployee: [],
      selectedEmployee: null
    }
  },
  methods: {
    ...mapActions("api", ["makeGetRequest", "makePostRequest"]),
    getallActiveClient() {
      let temp = this;
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "client/getAllActive"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.allActiveClient = response.data.data;
        }
      }).catch((error) => {
      });
    },
    getallActiveEmployee() {
      let temp = this;
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "employee/getAllActiveMini"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.allActiveEmployee = response.data.data;
        }
      }).catch((error) => {
      });
    },
    getAllActiveHoliday() {
      let temp = this;
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "holiday/getByNepaliYear/active",
          params: {
            nepaliYear: temp.selectedNepaliYear
          }
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.allActiveHoliday = response.data.data;
        }
      }).catch((error) => {
      });
    },
    previousMonth() {
      if (this.selectedClient.useNepaliCalendar) {
        if (this.selectedNepaliMonth > 1) {
          this.selectedNepaliMonth--;
          this.getClient(this.selectedClient);

        }
      } else {
        if (this.selectedEnglishMonth > 1) {
          this.selectedEnglishMonth--;
          this.getClient(this.selectedClient);
        }
      }
    },
    nextMonth() {
      if (this.selectedClient.useNepaliCalendar) {
        if (this.selectedNepaliMonth < 12) {
          this.selectedNepaliMonth++;
          this.getClient(this.selectedClient);

        }
      } else {
        if (this.selectedEnglishMonth < 12) {
          this.selectedEnglishMonth++;
          this.getClient(this.selectedClient);
        }
      }
    },
    getClient(item) {
      let temp = this;
      temp.isLoading = true;
      if (!!item) {
        this.makePostRequest({
          route: "employeeRoster/client",
          data: {
            clientId: item.id,
            isNepaliDate: item.useNepaliCalendar,
            month: temp.selectedMonth,
            year: temp.selectedYear,
          }
        }).then((response) => {
          if (response.data.status === "OK") {
            const tempRoster = [];
            for (const key in response.data.data) {
              const isReliever = this.isRelieverEmployee(response.data.data[key]);
              const days = temp.getListOfDaysInCurrentMonth(
                response.data.data[key],
                temp.numberOfDaysInCurrentMonth,
                item.useNepaliCalendar,
                temp.currentEnglishDate,
                temp.currentNepaliDate,
                temp.selectedYear,
                temp.selectedMonth,
                temp.allActiveHoliday,
                response.data.data[key][0].employee.nonWorkingDays);

              const totalHours = temp.getTotalHours(response.data.data[key][0].employee, days,
                temp.numberOfDaysInCurrentMonth, item.useNepaliCalendar,
                temp.selectedYear, temp.selectedMonth);
              const roster = {
                employee: response.data.data[key][0].employee,
                totalHours,
                isReliever,
                days
              };
              roster.numberOfHolidays = roster.days.filter(item => item.isHoliday && !item.isWeekend).length;
              tempRoster.push(roster);
            }

            tempRoster.sort((x, y) => {
              if (x.employee.vsNo < y.employee.vsNo) {
                return -1;
              }
              if (x.employee.vsNo > y.employee.vsNo) {
                return 1;
              }
              return 0;
            });

            temp.rosterByEmployees = tempRoster;
          }
          temp.isLoading = false;
        }).catch((error) => {
          temp.isLoading = false;
        })
      }
      temp.isLoading = false;
    },
    getListOfDaysInCurrentMonth(employeeRosterData,
                                numberOfDaysInCurrentMonth,
                                useNepaliCalendar, currentEnglishDate, currentNepaliDate,
                                selectedYear,
                                selectedMonth,
                                holidays,
                                employeeWeekendList,
                                isReliever,
                                relievedEmployeeId) {
      const listOfDays = [];
      for (let i = 1; i <= numberOfDaysInCurrentMonth; i++) {

        const day = {
          date: i,
          workedHours: this.getHoursPerDate({
            roster: employeeRosterData,
            date: i,
            useNepaliCalendar: useNepaliCalendar
          }),
          isWeekend: this.isWeekend({
            useNepaliCalendar: useNepaliCalendar,
            selectedYear: selectedYear,
            selectedMonth: selectedMonth,
            selectedDate: i,
            clientWeekendList: employeeWeekendList
          }),
          isHoliday: this.isHoliday({
            holidays: holidays,
            selectedMonth: selectedMonth,
            useNepaliCalendar: useNepaliCalendar,
            date: i
          }),
          isLeave: this.checkIsLeave({roster: employeeRosterData, date: i, useNepaliCalendar: useNepaliCalendar}),
          isSick: this.checkIsSick({roster: employeeRosterData, date: i, useNepaliCalendar: useNepaliCalendar}),
          isAbsent: this.checkIsAbsent({roster: employeeRosterData, date: i, useNepaliCalendar: useNepaliCalendar}),
          isOvertime: this.checkIsOvertime({roster: employeeRosterData, date: i, useNepaliCalendar: useNepaliCalendar}),
          isReliever: isReliever || this.checkIsReliever({
            roster: employeeRosterData,
            date: i,
            useNepaliCalendar: useNepaliCalendar
          }),
          relievedEmployeeId: relievedEmployeeId || this.getRelievedEmployeeId({
            roster: employeeRosterData,
            date: i,
            useNepaliCalendar: useNepaliCalendar
          }),
          holidayBasicHours: this.getHolidayBasicHoursPerDate({
            roster: employeeRosterData,
            date: i,
            useNepaliCalendar: useNepaliCalendar
          })
        };
        listOfDays.push(day);
      }
      return listOfDays;
    },
    getTotalHours(employee, days,
                  numberOfDaysInCurrentMonth, useNepaliCalendar,
                  selectedYear, selectedMonth) {
      let numberOfWorkedDays = 0;
      let numberOfWeekends = 0;
      let totalWorkedHours = 0;
      let totalLeaveDays = 0;
      let totalSickLeaveDays = 0;
      let totalAbsentDays = 0;
      let totalBasicHours = 0;
      let totalHolidayHours = 0;
      let totalOvertimeHours = 0;
      let totalHolidayBasicHours = 0;
      let totalLeaveHours = 0;
      let totalSickHours = 0;
      days.forEach(day => {
        // NaN fix
        day.workedHours = day.workedHours ? day.workedHours : 0;

        if (day.workedHours) {
          if (day.isHoliday) {
            if (day.workedHours > employee.assignedHours) {
              day.isOvertime = true;
              totalOvertimeHours = totalOvertimeHours + (day.workedHours - employee.assignedHours);
              totalHolidayHours += employee.assignedHours;
              numberOfWorkedDays++;
            } else {
              totalHolidayHours += day.workedHours;
            }
          } else {
            if (day.isWeekend) {
              totalOvertimeHours = totalOvertimeHours + (day.workedHours);
            } else if (day.workedHours > employee.assignedHours) {
              day.isOvertime = true;
              totalOvertimeHours = totalOvertimeHours + (day.workedHours - employee.assignedHours);
              totalWorkedHours = totalWorkedHours + (employee.assignedHours);
              totalBasicHours = totalBasicHours + (employee.assignedHours);
              numberOfWorkedDays++;
            } else {
              day.isOvertime = false;
              totalWorkedHours = totalWorkedHours + day.workedHours;
              totalBasicHours = totalBasicHours + day.workedHours;
              numberOfWorkedDays++;
            }
            // totalHolidayHours += day.isHoliday ? day.workedHours : 0;
          }
        }
        // Add leave and sick leave hours
        if (!day.isReliever) {
          if (day.isLeave) {
            // totalBasicHours = totalBasicHours + (employee.assignedHours);
            totalLeaveHours = totalLeaveHours + employee.assignedHours;
          }
          if (day.isSick) {
            // totalBasicHours = totalBasicHours + (employee.assignedHours);
            totalSickHours = totalSickHours + employee.assignedHours;
          }
        }

        // Add holiday basic hours to basic hours
        if (day.holidayBasicHours > 0) {
          if (day.holidayBasicHours > employee.assignedHours) {
            day.isOvertime = true;
            totalOvertimeHours = totalOvertimeHours + (day.holidayBasicHours - employee.assignedHours);
            totalHolidayBasicHours = totalHolidayBasicHours + employee.assignedHours;
          } else {
            totalHolidayBasicHours = totalHolidayBasicHours + day.holidayBasicHours;
          }
        }

        totalLeaveDays += day.isLeave ? 1 : 0;
        totalSickLeaveDays += day.isSick ? 1 : 0;
        totalAbsentDays += day.isAbsent ? 1 : 0;

        if (day.isWeekend) {
          numberOfWeekends++;
        }
      });
      totalBasicHours = totalBasicHours + totalLeaveHours + totalSickHours + totalHolidayBasicHours;
      // DO NOT SHOW 216 hours
      // totalWorkedHours = totalWorkedHours - totalHolidayHours;
      const numberOfWorkingDaysInCurrentMonth =
        this.getNumberOfWorkingDaysInCurrentMonth(numberOfDaysInCurrentMonth, employee, useNepaliCalendar,
          selectedYear, selectedMonth);
      totalWorkedHours = this.getExpectedBasicHours(numberOfWorkingDaysInCurrentMonth,
        numberOfWorkedDays, employee.nonWorkingDays.length, totalWorkedHours, employee.basicHours, employee.assignedHours);
      totalBasicHours = this.getExpectedBasicHours(numberOfWorkingDaysInCurrentMonth,
        numberOfWorkedDays, employee.nonWorkingDays.length, totalBasicHours, employee.basicHours, employee.assignedHours);
      return {
        totalWorkedHours, totalLeaveDays, totalSickLeaveDays, totalAbsentDays,
        totalBasicHours, totalHolidayHours, totalOvertimeHours, totalHolidayBasicHours, totalLeaveHours, totalSickHours
      };
    },
    getNumberOfWorkingDaysInCurrentMonth(numberOfDaysInCurrentMonth, employee, useNepaliCalendar,
                                         selectedYear, selectedMonth) {
      // Setup number of saturdays in current month
      let numberOfWeekends = 0;
      for (let i = 1; i <= numberOfDaysInCurrentMonth; i++) {
        if (this.isWeekend(
          useNepaliCalendar, selectedYear, selectedMonth, i, employee.nonWorkingDays)) {
          numberOfWeekends++;
        }
      }
      return numberOfDaysInCurrentMonth - numberOfWeekends;
    },
    getExpectedBasicHours(actualNumberOfDays, numberOfWorkedDays, numberOfWeekends,
                          actualHours, basicHours, assignedHours) {
      if (numberOfWorkedDays < 15) {
        return actualHours;
      } else {
        const workingDays = 30 - numberOfWeekends * 4;
        if (actualNumberOfDays > workingDays) {
          return actualHours - assignedHours * (actualNumberOfDays - workingDays);
        } else if (actualNumberOfDays < workingDays) {
          return actualHours + assignedHours * (workingDays - actualNumberOfDays);
        } else {
          return actualHours;
        }
      }
    },

    newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave) {
      const roster = this.rosterByEmployees[rosterByEmployeeIndex];
      const day = this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex];
      const workedHours = parseFloat(event);
      // Set workedHours in current rosterByEmployees dataset
      this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].workedHours = workedHours;

      // Extra overtime validation: Set overtime to false when hours less than assigned hours
      if (workedHours <= this.rosterByEmployees[rosterByEmployeeIndex].employee.assignedHours) {
        this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isOvertime = false;
      }

      // Recalculate total worked hours
      this.rosterByEmployees[rosterByEmployeeIndex].totalHours = this.getTotalHours(roster.employee, this.rosterByEmployees[rosterByEmployeeIndex].days,
        this.numberOfDaysInCurrentMonth, this.selectedClient.useNepaliCalendar,
        this.selectedYear, this.selectedMonth);
      // this.rosterByEmployees[rosterByEmployeeIndex].totalHours.totalWorkedHours = totalHours.totalWorkedHours;
      // this.rosterByEmployees[rosterByEmployeeIndex].totalHours.totalLeaveDays = totalHours.totalLeaveDays;
      // this.rosterByEmployees[rosterByEmployeeIndex].totalHours.totalSickLeaveDays = totalHours.totalSickLeaveDays;
      // this.rosterByEmployees[rosterByEmployeeIndex].totalHours.totalAbsentDays = totalHours.totalAbsentDays;
      // this.rosterByEmployees[rosterByEmployeeIndex].totalHours.totalBasicHours = totalHours.totalBasicHours;
      // this.rosterByEmployees[rosterByEmployeeIndex].totalHours.totalHolidayHours = totalHours.totalHolidayHours;
      // this.rosterByEmployees[rosterByEmployeeIndex].totalHours.totalOvertimeHours = totalHours.totalOvertimeHours;
      // this.rosterByEmployees[rosterByEmployeeIndex].totalHours.totalOvertimeHours = totalHours.totalOvertimeHours;

      let englishFullDate;
      let englishYear;
      let englishMonth;
      let englishDay;
      let nepaliFullDate;
      let nepaliYear;
      let nepaliMonth;
      let nepaliDay;

      if (this.selectedClient.useNepaliCalendar) {
        nepaliYear = this.selectedNepaliYear;
        nepaliMonth = this.selectedNepaliMonth;
        nepaliDay = day.date;
        nepaliFullDate = `${nepaliYear}-${nepaliMonth}-${nepaliDay}`;
        const tempEnglishDate = new NepaliDate(nepaliYear, nepaliMonth, nepaliDay).getAD();
        englishYear = tempEnglishDate.year;
        englishMonth = tempEnglishDate.month + 1;
        englishDay = tempEnglishDate.date;
        englishFullDate = `${englishYear}-${englishMonth}-${englishDay}`;
      } else {
        englishYear = this.selectedEnglishYear;
        englishMonth = this.selectedEnglishMonth;
        englishDay = day.date;
        englishFullDate = `${englishYear}-${englishMonth}-${englishDay}`;
        const tempNepaliDate = NepaliDate().getBS(englishYear, englishMonth, englishDay);
        nepaliYear = tempNepaliDate.year;
        nepaliMonth = tempNepaliDate.month;
        nepaliDay = tempNepaliDate.date;
        nepaliFullDate = `${nepaliYear}-${nepaliMonth}-${nepaliDay}`;
      }

      // Remove old value from newEmployeeRosters array if exists
      if (this.newEmployeeRosters.filter(item => item.employeeId === roster.employee.id && item.date === day.date).length !== 0) {
        this.newEmployeeRosters =
          this.newEmployeeRosters.filter(item => !(item.employeeId === roster.employee.id && item.date === day.date && !item.undoLeave));
      }
      this.newEmployeeRosters.push({
        employeeId: roster.employee.id,
        clientId: this.selectedClient.id,
        workedHours: workedHours && !day.isLeave && !day.isSick ? workedHours : 0,
        englishFullDate,
        englishYear,
        englishMonth,
        englishDay,
        nepaliFullDate,
        nepaliYear,
        nepaliMonth,
        nepaliDay,
        isWeekend: day.isWeekend,
        isLeave: day.isLeave,
        isSick: day.isSick,
        isAbsent: day.isAbsent,
        isHoliday: day.isHoliday,
        isOvertime: day.isOvertime,
        isReliever: day.isReliever,
        relievedEmployeeId: day.relievedEmployeeId,
        holidayBasicHours: day.holidayBasicHours,
        date: day.date,
        undoLeave,
        leaveFiscalYear: day.leaveFiscalYear
      });

    },
    setLeave(event, rosterByEmployeeIndex, dayIndex) {
      const employeeAtHand = this.rosterByEmployees[rosterByEmployeeIndex].employee;
      let undoLeave;
      if (this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isLeave) {
        this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isLeave = false;
        undoLeave = true;
        this.newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave);
      } else {
        this.getEmployeeLeaveDetails(employeeAtHand)
        // Get Employee Leave details first

        const annualLeavesForThisFiscalYear = this.annualLeaves;
        const annualLeavesForPreviousFiscalYear = this.annualLeavesPreviousFiscalYear;
        const paidLeavesForPreviousFiscalYear = this.paidLeavesPreviousFiscalYear;

        const numberOfLeavesTakenThatAreNotSavedYet =
          this.newEmployeeRosters.filter(item => item.employeeId === employeeAtHand.id && item.isLeave).length;
        const leaveDetails = this.validateLeave(
          true, employeeAtHand.fullTimeJoinDate ? employeeAtHand.fullTimeJoinDate : employeeAtHand.partTimeJoinDate,
          this.selectedNepaliMonth, this.selectedNepaliYear,
          annualLeavesForThisFiscalYear, annualLeavesForPreviousFiscalYear, paidLeavesForPreviousFiscalYear,
          numberOfLeavesTakenThatAreNotSavedYet);
        if (leaveDetails.validity) {
          if (leaveDetails.numberOfValidLeavesPreviousYear > 0) {
            this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].leaveFiscalYear = this.selectedYear - 1;
          } else {
            this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].leaveFiscalYear = this.selectedYear;
          }
          this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isLeave = true;
          this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isSick = false;
          this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isAbsent = false;
          undoLeave = true;
          event = 0;
          this.newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave);
        } else {
          this.$store.dispatch("toast/setSnackbar", {
            icon: "fa-solid fa-triangle-exclamation",
            color: "warning",
            title: "Unable to take leave",
            text: `${employeeAtHand.staffName} has already used up all annual leaves this fiscal year.`
          });
        }
      }
    },
    setSickLeave(event, rosterByEmployeeIndex, dayIndex) {
      const employeeAtHand = this.rosterByEmployees[rosterByEmployeeIndex].employee;
      let undoLeave;
      if (this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isSick) {
        this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isSick = false;
        undoLeave = true;
        this.newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave);
      } else {
        this.getEmployeeLeaveDetails(employeeAtHand)

        const sickLeavesForThisFiscalYear = this.sickLeaves;
        const sickLeavesForPreviousFiscalYear = this.sickLeavesPreviousFiscalYear;
        const paidLeavesForPreviousFiscalYear = this.paidLeavesPreviousFiscalYear;


        const numberOfLeavesTakenThatAreNotSavedYet =
          this.newEmployeeRosters.filter(item => item.employeeId === employeeAtHand.id && item.isSick).length;
        const leaveDetails = this.validateLeave(
          false, employeeAtHand.fullTimeJoinDate ? employeeAtHand.fullTimeJoinDate : employeeAtHand.partTimeJoinDate,
          this.selectedNepaliMonth, this.selectedNepaliYear,
          sickLeavesForThisFiscalYear, sickLeavesForPreviousFiscalYear, paidLeavesForPreviousFiscalYear,
          numberOfLeavesTakenThatAreNotSavedYet);
        if (leaveDetails.validity) {
          this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].leaveFiscalYear = this.selectedYear;
          this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isSick = true;
          this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isLeave = false;
          this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isAbsent = false;
          undoLeave = true;
          event = 0;
          this.newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave);
        } else {
          this.$store.dispatch("toast/setSnackbar", {
            icon: "fa-solid fa-triangle-exclamation",
            color: "warning",
            title: "Unable to take leave",
            text: `${employeeAtHand.staffName} has already used up all sick leaves this fiscal year.`
          });
        }
      }
    },
    setAbsent(event, rosterByEmployeeIndex, dayIndex) {
      let undoLeave;
      if (this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isAbsent) {
        this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isAbsent = false;
        undoLeave = true;
      } else {
        this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].leaveFiscalYear = this.selectedYear;
        this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isAbsent = true;
        this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isLeave = false;
        this.rosterByEmployees[rosterByEmployeeIndex].days[dayIndex].isSick = false;
        undoLeave = true;
        event = 0;
      }
      this.newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave);
    },
    setHolidayBasicHours(event, rosterByEmployeeIndex, dayIndex) {
      this.selectedPayload = {event, rosterByEmployeeIndex, dayIndex};
      const holidayBasicHours = this.rosterByEmployees[this.selectedPayload.rosterByEmployeeIndex]
        .days[this.selectedPayload.dayIndex].holidayBasicHours;
      this.holidayBasicHours = holidayBasicHours ? holidayBasicHours : 0;
      this.holidayModal = true;
    },
    validateLeave(isAnnualLeave, employeeJoinDate,
                  selectedNepaliMonth, selectedNepaliYear,
                  takenLeavesThisFiscalYear,
                  takenLeavesPreviousFiscalYear,
                  paidLeavesPreviousFiscalYear,
                  numberOfLeavesTakenThatAreNotSavedYet) {
      if (employeeJoinDate == null) {
        return {
          numberOfTakenLeavesThisYear: 0, numberOfTakenLeavesPreviousYear: 0, numberOfValidLeavesThisYear: 0,
          numberOfValidLeavesPreviousYear: 0, numberOfPaidOutLeaves: 0, validity: false
        };
      }
      const employeeFullTimeJoinDateSplit = employeeJoinDate.split('-');
      const employeeJoinYear = parseInt(employeeFullTimeJoinDateSplit[0], 10);
      const employeeJoinMonth = parseInt(employeeFullTimeJoinDateSplit[1], 10);
      const numberOfMonthsSinceJoined = this.getNumberOfMonthsSinceJoined(
        selectedNepaliMonth, employeeJoinMonth, selectedNepaliYear, employeeJoinYear);
      const numberOfMonthsSinceJoinedToLastShrawan = this.getNumberOfMonthsSinceJoined(
        3, employeeJoinMonth, selectedNepaliYear, employeeJoinYear);
      const numberOfWorkingMonthsInSelectedFiscalYear =
        numberOfMonthsSinceJoined > 12 ? this.getNumberOfMonthsSinceLastShrawan(selectedNepaliMonth) - 1 : numberOfMonthsSinceJoined - 1;
      const numberOfWorkingMonthsInPreviousFiscalYear =
        numberOfMonthsSinceJoinedToLastShrawan > 12 ? 12 : numberOfMonthsSinceJoinedToLastShrawan;
      /*if (numberOfMonthsSinceJoined > 12) {
        numberOfWorkingMonthsInSelectedFiscalYear = this.getNumberOfMonthsSinceLastShrawan(selectedNepaliMonth) - 1;
      } else {
        numberOfWorkingMonthsInSelectedFiscalYear = numberOfMonthsSinceJoined - 1;
      }*/

      let numberOfValidLeavesThisYear = 0;
      let numberOfValidLeavesPreviousYear = 0;
      if (isAnnualLeave) {
        numberOfValidLeavesThisYear = numberOfWorkingMonthsInSelectedFiscalYear * 1.5;
        numberOfValidLeavesPreviousYear = numberOfWorkingMonthsInPreviousFiscalYear * 1.5;
      } else {
        numberOfValidLeavesThisYear = numberOfWorkingMonthsInSelectedFiscalYear * 1;
      }
      let numberOfTakenLeavesThisYear = 0;
      if (isAnnualLeave) {
        numberOfTakenLeavesThisYear = takenLeavesThisFiscalYear.length + numberOfLeavesTakenThatAreNotSavedYet;
      } else {
        numberOfTakenLeavesThisYear = takenLeavesThisFiscalYear.length + numberOfLeavesTakenThatAreNotSavedYet;
      }
      let numberOfTakenLeavesPreviousYear = takenLeavesPreviousFiscalYear.length;
      let numberOfPaidOutLeaves = paidLeavesPreviousFiscalYear ? paidLeavesPreviousFiscalYear.length : 0;
      let validity = false;

      // Use leaves from previous years only after 2078
      if (selectedNepaliYear <= 2078) {
        numberOfTakenLeavesPreviousYear = 0;
        numberOfValidLeavesPreviousYear = 0;
        numberOfPaidOutLeaves = 0;
      }

      if (numberOfValidLeavesThisYear + numberOfValidLeavesPreviousYear -
        numberOfTakenLeavesThisYear - numberOfTakenLeavesPreviousYear - numberOfPaidOutLeaves > 0) {
        validity = true;
      }
      return {
        numberOfValidLeavesThisYear, numberOfValidLeavesPreviousYear,
        numberOfTakenLeavesThisYear, numberOfTakenLeavesPreviousYear, numberOfPaidOutLeaves, validity
      };
    },
    getNumberOfMonthsSinceJoined(selectedNepaliMonth, employeeJoinMonth, selectedNepaliYear, employeeJoinYear) {
      const numberOfMonths = selectedNepaliMonth - employeeJoinMonth + (selectedNepaliYear - employeeJoinYear) * 12;
      return numberOfMonths < 1 ? 0 : numberOfMonths;
    },
    getNumberOfMonthsSinceLastShrawan(givenNepaliMonth) {
      let numberOfMonthsSinceLastShrawan;
      if (givenNepaliMonth > 3) {
        numberOfMonthsSinceLastShrawan = givenNepaliMonth - 3;
      } else {
        numberOfMonthsSinceLastShrawan = 12 + givenNepaliMonth - 3;
      }
      return numberOfMonthsSinceLastShrawan;
    },
    saveHolidayBasicHours() {
      this.rosterByEmployees[this.selectedPayload.rosterByEmployeeIndex].days[this.selectedPayload.dayIndex].holidayBasicHours =
        this.holidayBasicHours;
      this.newHourLog(this.selectedPayload.event, this.selectedPayload.rosterByEmployeeIndex, this.selectedPayload.dayIndex);
      this.holidayBasicHours = 0;
      this.holidayModal = false;
    },
    previousYear() {
      if (this.selectedClient.useNepaliCalendar) {
        this.selectedNepaliYear--;
        this.getClient(this.selectedClient)
        this.getAllActiveHoliday();
      } else {
        this.selectedEnglishYear--;
        this.getClient(this.selectedClient)
        this.getAllActiveHoliday();
      }
    },
    nextYear() {
      if (this.selectedClient.useNepaliCalendar) {
        this.selectedNepaliYear++;
        this.getClient(this.selectedClient)
        this.getAllActiveHoliday();
      } else {
        this.selectedEnglishYear++;
        this.getClient(this.selectedClient)
        this.getAllActiveHoliday();
      }
    },
    applyChanges() {
      let temp = this;
      if (temp.newEmployeeRosters.length > 0) {
        this.makePostRequest({
          route: "employeeRoster/bulkSave",
          data: [
            ...temp.newEmployeeRosters
          ]
        }).then((response) => {
          if (response.data.status === "OK") {
            temp.$store.dispatch("toast/setSnackbar", {
              title: "Success",
              text: "Changes successfully applied"
            });
            temp.newEmployeeRosters = [];
          } else {
            temp.$store.dispatch("toast/setSnackbar", {
              icon: "fa-solid fa-circle-xmark",
              color: "error",
              title: "Error",
              text: "Unable to save changes"
            });
          }
        }).catch((error) => {
        })
      }
    },
    saveToSalarySheet() {
      let temp = this;
      const calendarData = {};
      const requestList = [];
      for (const roster of this.rosterByEmployees) {
        calendarData[roster.employee.id] = {
          useNepaliCalendar: temp.selectedClient.useNepaliCalendar,
          selectedMonth: temp.selectedClient.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
          selectedYear: temp.selectedClient.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
          currentEnglishDate: temp.currentEnglishDate,
          currentNepaliDate: temp.currentNepaliDate,
          numberOfDaysInCurrentMonth: temp.numberOfDaysInCurrentMonth,
          numberOfWeekendsInCurrentMonth: temp.numberOfWeekendsInCurrentMonth,
          numberOfHolidaysInCurrentMonth: temp.numberOfHolidaysInCurrentMonth
        };
        requestList.push({
          year: temp.selectedYear,
          month: temp.selectedMonth,
          employeeId: roster.employee.id,
          isNepaliDate: temp.selectedClient.useNepaliCalendar
        })
      }

      this.makePostRequest({
        route: "employeeRoster/employeeList/aggregate",
        data: [
          ...requestList
        ]
      }).then((response) => {
        if (response.data.status === "OK") {
          const listOfAggregates = response.data.data;
          const salaryDetailsList = [];

          for (const eachItem of listOfAggregates) {
            const selectedEmployee = eachItem.employee;
            if (selectedEmployee.employeeDetails == null) {
              temp.$store.dispatch("toast/setSnackbar", {
                icon: "fa-solid fa-triangle-exclamation",
                color: "warning",
                title: "Employee Salary missing",
                text: `Please configure employee salary for ${selectedEmployee.staffName} from employee management`
              });
            } else {
              salaryDetailsList.push(
                this.getSalaryDetailsObject(selectedEmployee, eachItem.aggregate, temp.allActiveHoliday, calendarData[selectedEmployee.id]));
            }
          }

          this.makePostRequest({
            route: "salaryDetails/registerList",
            data: [
              ...salaryDetailsList
            ]
          }).then((response) => {
            if (response.data.status === "OK") {
              temp.$store.dispatch("toast/setSnackbar", {
                title: "Success",
                text: "Salary saved to database"
              });
              temp.newEmployeeRosters = [];
            } else {
              temp.$store.dispatch("toast/setSnackbar", {
                icon: "fa-solid fa-circle-xmark",
                color: "error",
                title: "Error",
                text: "Unable to save salary"
              });
            }
          }).catch((error) => {
          })
        } else {
          temp.$store.dispatch("toast/setSnackbar", {
            icon: "fa-solid fa-circle-xmark",
            color: "error",
            title: "Error",
            text: "Unable to save changes"
          });
        }
      }).catch((error) => {
      })
    },
    getSalaryDetailsObject(selectedClient, employeeRosterAggregate,
                           holidays, calendarData) {
      let temp = this;
      const employeeWeekends = temp.translateWeekendStringToNames(selectedClient.nonWorkingDays);

      const totalLeaveHours = (employeeRosterAggregate.numberOfLeaveDays + employeeRosterAggregate.numberOfSickLeaveDays)
        * selectedClient.assignedHours;

      const expectedWorkHours = selectedClient.basicHours - totalLeaveHours;

      const actualWorkedHours = temp.getActualWorkedHours(selectedClient, employeeRosterAggregate, calendarData);

      const actualTotalHours = actualWorkedHours + totalLeaveHours
        + employeeRosterAggregate.holidayBasicHours;
      // + temp.numberOfHolidaysInCurrentMonth * temp.selectedClient.assignedHours;

      const totalOvertimeAllowance = ((selectedClient.employeeDetails.overtimeRate * employeeRosterAggregate.overtimeHours)
        + (selectedClient.employeeDetails.overtimeRate * employeeRosterAggregate.weekendHours));

      const grossSalary = temp.getGrossSalary(selectedClient);

      const reductionSalary = temp.getReductionSalary(grossSalary, selectedClient, actualTotalHours, actualWorkedHours,
        expectedWorkHours, employeeRosterAggregate.holidayBasicHours);

      const totalSalary = temp.getTotalSalary(selectedClient, reductionSalary, employeeRosterAggregate);

      const basicSalaryAfterReduction = selectedClient.employeeDetails.basicSalary -
        temp.getReductionBasicSalary(selectedClient, actualTotalHours, actualWorkedHours,
          expectedWorkHours, employeeRosterAggregate.holidayBasicHours);
      const employerSSFContribution = Number((0.20 * basicSalaryAfterReduction).toFixed(1));
      const employeeSSFContribution = Number((0.11 * basicSalaryAfterReduction).toFixed(1));
      const totalSalaryAfterDeductions = Number((totalSalary - employeeSSFContribution).toFixed(1));

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
        const tempEnglishDate = new NepaliDate(nepaliYear, nepaliMonth, nepaliDay).getAD();
        englishYear = tempEnglishDate.year;
        englishMonth = tempEnglishDate.month;
      } else {
        englishYear = calendarData.selectedYear;
        englishMonth = calendarData.selectedMonth;
        englishDay = 1;
        const tempNepaliDate = new NepaliDate(englishYear, englishMonth, englishDay).getBS();
        nepaliYear = tempNepaliDate.year;
        nepaliMonth = tempNepaliDate.month;
      }

      return {
        employee: {id: selectedClient.id},
        bankName: selectedClient.employeeDetails.bank ? selectedClient.employeeDetails.bank.name : 'N/A',
        accountNumber: selectedClient.employeeDetails?.accountNumber ? selectedClient.employeeDetails?.accountNumber : 'N/A',
        ssfNo: selectedClient.employeeDetails?.ssfNo ? selectedClient.employeeDetails?.ssfNo : 'N/A',
        englishYear,
        englishMonth,
        nepaliYear,
        nepaliMonth,
        useNepaliCalendar: calendarData.useNepaliCalendar,

        employeeWeekends,
        employeeHoursPerDay: selectedClient.assignedHours,
        noOfDaysInMonth: calendarData.numberOfDaysInCurrentMonth,
        noOfWeekendsInMonth: calendarData.numberOfWeekendsInCurrentMonth,
        noOfWorkedDays: employeeRosterAggregate.numberOfWorkedDays,
        noOfAbsentDays: employeeRosterAggregate.numberOfAbsentDays,
        basicHours: selectedClient.basicHours,
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
        basicSalary: selectedClient.employeeDetails.basicSalary,
        dearnessAllowance: selectedClient.employeeDetails.dearnessAllowance,
        otherAllowance: selectedClient.employeeDetails.otherAllowance,
        direnessAllowance: selectedClient.employeeDetails.direnessAllowance,
        hardnessAllowance: selectedClient.employeeDetails.hardnessAllowance,
        grossSalary,
        reductionSalary,
        overtimeAllowance: totalOvertimeAllowance,
        holidayAlowance: selectedClient.employeeDetails.holidayRate * employeeRosterAggregate.holidayHours,
        totalSalary,
        employerSSFcontribution: employerSSFContribution,
        employeeSSFcontribution: employeeSSFContribution,
        incomeTax: 0,
        lunch: 0,
        medicalInsurance: 0,
        advance: 0,
        securityDeposit: 0,
        otherDeductions: 0,
        totalSalaryAfterDeductions
      };
    },
    translateWeekendStringToNames(nonWorkingDays) {
      let temp = this;
      let weekends = '';
      const weekendList = nonWorkingDays ? nonWorkingDays.split('') : [];
      if (weekendList.length > 0) {
        for (const weekend of weekendList) {
          weekends += temp.dayList[parseInt(weekend, 10)];
          weekends += ', ';
        }
        weekends = weekends.slice(0, weekends.length - 2);
        return weekends;
      }
      return '-';
    },
    getActualTotalDays(employeeRosterAggregate, calendarData) {
      return employeeRosterAggregate.numberOfWorkedDays + this.getTotalLeaveDays(employeeRosterAggregate) + calendarData.numberOfHolidaysInCurrentMonth;
    },

    getTotalLeaveDays(employeeRosterAggregate) {
      return employeeRosterAggregate.numberOfLeaveDays + employeeRosterAggregate.numberOfSickLeaveDays;
    },

    getTotalSalary(selectedClient, reductionSalary, employeeRosterAggregate) {
      let totalSalary = 0;
      totalSalary += selectedClient.employeeDetails.basicSalary;
      totalSalary += selectedClient.employeeDetails.dearnessAllowance;
      totalSalary += selectedClient.employeeDetails.otherAllowance;
      totalSalary += selectedClient.employeeDetails.specialAllowance;
      totalSalary += selectedClient.employeeDetails.direnessAllowance;
      totalSalary += selectedClient.employeeDetails.hardnessAllowance;
      totalSalary += selectedClient.employeeDetails.overtimeRate * employeeRosterAggregate.overtimeHours;
      totalSalary += selectedClient.employeeDetails.overtimeRate * employeeRosterAggregate.weekendHours;
      totalSalary += selectedClient.employeeDetails.holidayRate * employeeRosterAggregate.holidayHours;
      totalSalary -= reductionSalary;
      return Number(totalSalary.toFixed(1));
    },

    getActualWorkedHours(selectedClient, employeeRosterAggregate,
                         calendarData) {
      const numberOfWorkingDaysInCurrentMonth =
        this.getNumberOfWorkingDaysInCurrentMonth(calendarData.numberOfDaysInCurrentMonth, selectedClient,
          calendarData.useNepaliCalendar, calendarData.selectedYear, calendarData.selectedMonth);
      return this.getExpectedBasicHours(numberOfWorkingDaysInCurrentMonth,
        this.getActualTotalDays(employeeRosterAggregate, calendarData), selectedClient.nonWorkingDays.length,
        employeeRosterAggregate.totalHours,
        selectedClient.basicHours, selectedClient.assignedHours);
    },

    getGrossSalary(selectedClient) {
      let gross = 0;
      gross += selectedClient.employeeDetails.basicSalary;
      gross += selectedClient.employeeDetails.dearnessAllowance;
      gross += selectedClient.employeeDetails.otherAllowance;
      gross += selectedClient.employeeDetails.specialAllowance;
      gross += selectedClient.employeeDetails.direnessAllowance;
      gross += selectedClient.employeeDetails.hardnessAllowance;
      gross = Number(gross.toFixed(1));
      return gross;
    },

    getReductionSalary(grossSalary, selectedClient, actualTotalHours, actualWorkedHours,
                       expectedWorkHours, holidayBasicHours) {
      const grossSalaryPerHour = grossSalary / selectedClient.basicHours;
      let missingHours;
      if (actualTotalHours === null || actualTotalHours === 0) {
        return grossSalary;
      }
      if (actualWorkedHours < expectedWorkHours) {
        missingHours = expectedWorkHours - actualWorkedHours
          - holidayBasicHours;
        return Number((missingHours * grossSalaryPerHour).toFixed(1));
      }
      return 0;
    },

    getReductionBasicSalary(selectedClient, actualTotalHours, actualWorkedHours, expectedWorkHours, holidayBasicHours) {
      const basicSalary = selectedClient.employeeDetails.basicSalary;
      const basicSalaryPerHour = basicSalary / selectedClient.basicHours;
      let missingHours;
      if (actualTotalHours === null || actualTotalHours === 0) {
        return basicSalary;
      }
      if (actualWorkedHours < expectedWorkHours) {
        missingHours = expectedWorkHours - actualWorkedHours
          - holidayBasicHours;
        return Number((missingHours * basicSalaryPerHour).toFixed(1));
      }
      return 0;
    },
    getBackgroundColor(day) {
      if (day) {
        if (day.isHoliday && day.isWeekend) {
          return 'linear-gradient(90deg, yellow 50%, light-green 50%)';
        }
        if (day.isHoliday) {
          return 'yellow';
        } else if (day.isWeekend) {
          return 'light-green';
        } else if (day.isLeave) {
          return 'orange';
        } else if (day.isSick) {
          return 'pink';
        } else if (day.isAbsent) {
          return 'red';
        }
      }
      return 'white';
    },
    isRelieverEmployee(days) {
      for (const day of days) {
        if (day.isReliever) {
          return true;
        }
      }
      return false;
    },
    addReliever(event, rosterByEmployeeIndex, dayIndex) {
      this.rightClickPayload = {event, rosterByEmployeeIndex, dayIndex};
      this.employeeModal = true;
    },
    addRelieverEmployee() {
      const currentEmployeeIdsInRoster = this.rosterByEmployees.map(item => item.employee.id);
      if (currentEmployeeIdsInRoster.includes(this.selectedEmployee.id)) {
        this.$store.dispatch("toast/setSnackbar", {
          icon: "fa-solid fa-triangle-exclamation",
          color: "warning",
          title: "Warning",
          text: `Employee already in roster`
        });
      } else {
        const roster =
          {
            employee: this.selectedEmployee,
            totalHours: {
              totalWorkedHours: 0,
              totalLeaveDays: 0,
              totalSickLeaveDays: 0,
              totalAbsentDays: 0,
              totalBasicHours: 0,
              totalHolidayHours: 0,
              totalOvertimeHours: 0,
              totalHolidayBasicHours: 0,
              totalLeaveHours: 0,
              totalSickHours: 0
            },
            isReliever: true,
            days: this.getListOfDaysInCurrentMonth(
              [],
              this.numberOfDaysInCurrentMonth,
              this.selectedClient.useNepaliCalendar,
              this.currentEnglishDate,
              this.currentNepaliDate,
              this.selectedYear,
              this.selectedMonth,
              this.allActiveHoliday,
              this.selectedEmployee.nonWorkingDays,
              true,
              this.rosterByEmployees[this.rightClickPayload.rosterByEmployeeIndex].employee.id)
          };
        roster.numberOfHolidays = roster.days.filter(item => item.isHoliday && !item.isWeekend).length;
        this.rosterByEmployees.push(roster);
        this.newHourLog({target: {value: 0}}, this.rosterByEmployees.length - 1, 0, false);
        this.applyChanges();
        this.getClient();
        this.employeeModal = false;
      }
    },
    deleteItem(item) {
      const temp = this;
      this.$root.confirm('Confirm Delete', 'Are you sure you want to delete ' + item.employee.staffName + '?')
        .then((confirm) => {
          this.makePostRequest({
            route: "employeeRoster/delete",
            data: {
              employeeId: item.employee.id,
              clientId: temp.selectedClient.id,
              isNepaliDate: temp.selectedClient.useNepaliCalendar,
              month: temp.selectedMonth,
              year: temp.selectedYear
            }
          }).then((response) => {
            if (response.data.status === "OK") {
              temp.getClient(temp.selectedClient);
              this.$store.dispatch("toast/setSnackbar", {
                text: "Reliever deleted successfully"
              });
            }else{
              temp.$store.dispatch("toast/setSnackbar", {
                icon: "fa-solid fa-circle-xmark",
                color: "error",
                title: "Error",
                text: "Unable to delete reliever"
              });
            }
          })
        }).catch((error) => {
      });


    }
  },
  mounted() {
    this.getallActiveClient();
    this.getAllActiveHoliday();
    this.getallActiveEmployee();
  },
  computed: {
    ...mapGetters("calendar", ["getHoursPerDate", "isWeekend", "isHoliday", "checkIsLeave", "checkIsSick", "checkIsAbsent", "checkIsOvertime", "checkIsReliever", "getRelievedEmployeeId", "getHolidayBasicHoursPerDate"]),
    ...mapGetters("leave", ["allLeaves", "allLeavesPreviousFiscalYear", "annualLeaves", "sickLeaves", "annualLeavesPreviousFiscalYear", "sickLeavesPreviousFiscalYear", "paidLeavesPreviousFiscalYear"]),
    selectedYear() {
      if (this.selectedClient.useNepaliCalendar) {
        return this.selectedNepaliYear;
      } else {
        return this.selectedEnglishYear;
      }
    },
    selectedMonth() {
      if (this.selectedClient.useNepaliCalendar) {
        return this.selectedNepaliMonth;
      } else {
        return this.selectedEnglishMonth;
      }
    },
    annualLeaveDetails() {
      return this.validateLeave(true,
        this.selectedClient.fullTimeJoinDate ? this.selectedClient.fullTimeJoinDate : this.selectedClient.partTimeJoinDate,
        this.selectedNepaliMonth, this.selectedNepaliYear, this.annualLeaves, this.annualLeavesPreviousFiscalYear,
        this.paidLeavesPreviousFiscalYear, 0);
    },
    sickLeaveDetails() {
      return this.validateLeave(false,
        this.selectedClient.fullTimeJoinDate ? this.selectedClient.fullTimeJoinDate : this.selectedClient.partTimeJoinDate,
        this.selectedNepaliMonth, this.selectedNepaliYear, this.sickLeaves,
        this.sickLeavesPreviousFiscalYear, this.paidLeavesPreviousFiscalYear, 0);
    },
    getHeaders() {
      let headers = [];
      headers.push({text: "S.N.", value: "sn"});
      headers.push({text: "V.S. No.", value: "employee.vsNo"});
      headers.push({text: "Employee name", value: "employee.staffName"});
      headers.push({text: "Assigned Hours", value: "assignedHours"});
      headers.push({text: "Branch  ", value: "email"});
      for (let i = 0; i < this.numberOfDaysInCurrentMonth; i++) {
        headers.push({text: `${i + 1}`, value: `days[${i}].workedHours`, width: "6rem"});
      }
      headers.push({text: "Worked Hours", value: "totalHours.totalWorkedHours"});
      headers.push({text: "Leave hours", value: "totalHours.totalLeaveHours"});
      headers.push({text: "Sick hours", value: "totalHours.totalSickHours"});
      headers.push({text: "Absent days", value: "totalHours.totalAbsentDays"});
      headers.push({text: "Holiday Basic Hours", value: "totalHours.totalHolidayBasicHours"});
      headers.push({text: "Total Hours", value: "totalHours.totalBasicHours"});
      headers.push({text: "Holiday Hours", value: "totalHours.totalHolidayHours"});
      headers.push({text: "Overtime Hours", value: "totalHours.totalOvertimeHours"});
      headers.push({text: "Actions", value: "actions"});
      return headers;
    },
    numberOfDaysInCurrentMonth() {
      if (this.selectedClient.useNepaliCalendar) {
        return new NepaliDate(this.selectedNepaliYear, this.selectedNepaliMonth, 0).getDate()
      } else {
        return new Date(this.selectedEnglishYear, this.selectedEnglishMonth, 0).getDate()
      }
    },
    numberOfWeekendsInCurrentMonth() {
      // Setup number of saturdays in current month
      let temp = this;
      let numberOfWeekends = 0;
      for (let i = 1; i <= temp.numberOfDaysInCurrentMonth; i++) {
        if (temp.isWeekend({
          useNepaliCalendar: this.selectedClient.useNepaliCalendar,
          selectedYear: this.selectedClient.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
          selectedMonth: this.selectedClient.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
          selectedDate: i,
          clientWeekendList: this.selectedClient.nonWorkingDays
        })) {
          numberOfWeekends++;
        }
      }
      return numberOfWeekends;
    },
    numberOfHolidaysInCurrentMonth() {
      let temp = this;
      let numberOfWeekends = 0;
      for (let i = 1; i <= temp.numberOfDaysInCurrentMonth; i++) {
        if (this.isHoliday({
            holidays: temp.allActiveHoliday,
            selectedMonth: this.selectedClient.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
            useNepaliCalendar: this.selectedClient.useNepaliCalendar,
            date: i
          })
          && !this.isWeekend({
            useNepaliCalendar: this.selectedClient.useNepaliCalendar,
            selectedYear: this.selectedClient.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
            selectedMonth: this.selectedClient.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
            selectedDate: i,
            clientWeekendList: this.selectedClient.nonWorkingDays
          })) {
          numberOfWeekends++;
        }
      }
      return numberOfWeekends;
    },

    allActiveClientNepali() {
      return this.allActiveClient.filter(item => item.useNepaliCalendar === true);
    }
    ,
    allActiveClientEnglish() {
      return this.allActiveClient.filter(item => item.useNepaliCalendar === false);
    }
  },
}
</script>

<style>
</style>
