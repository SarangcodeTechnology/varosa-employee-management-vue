<template>
  <v-container fluid>
    <h2 style="font-weight: 700;" class="mb-6">Employee Roster</h2>
    <v-card>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <v-autocomplete prepend-inner-icon="fa-solid fa-users" filled dense :items="allActiveEmployeeNepali"
                            v-model="selectedEmployee"
                            label="Employee (Nepali Date)"
                            placeholder="Search by name or V.S. No."
                            return-object
                            :filter="filterEmployee"
                            @input="getEmployee"
                            :item-text="item => 'V.S. No. ' + item.vsNo +' | '+ item.staffName+' | '+ '(Assigned:'+item.assignedHours+ ' hrs)'"
            >
              <template v-slot:item="{item}">
                V.S. No. {{ item.vsNo }} | {{ item.staffName }} | (Assigned: {{ item.assignedHours }} hrs)
              </template>

            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete prepend-inner-icon="fa-solid fa-users" filled dense :items="allActiveEmployeeEnglish"
                            v-model="selectedEmployee"
                            label="Employee (English Date)"
                            placeholder="Search by name or V.S. No."
                            return-object
                            @input="getEmployee"
                            :filter="filterEmployee"
                            :item-text="item => 'V.S. No. ' + item.vsNo +' | '+ item.staffName+' | '+ '(Assigned:'+item.assignedHours+ ' hrs)'"
            >
              <template v-slot:item="{item}">
                V.S. No. {{ item.vsNo }} | {{ item.staffName }} | (Assigned: {{ item.assignedHours }} hrs)
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-container v-if="!!selectedEmployee" fluid>
          <v-row justify="center">
            <v-col cols="auto">
              <h3 v-if="selectedEmployee.useNepaliCalendar">Nepali Calendar</h3>
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
                              :value="selectedEmployee.useNepaliCalendar ? selectedNepaliYear : selectedEnglishYear"></v-text-field>

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
                              :value="selectedEmployee.useNepaliCalendar ? nepaliMonthList[selectedNepaliMonth-1] : englishMonthList[selectedEnglishMonth-1]"></v-text-field>
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
              <v-btn @click="viewLeaveDetails()" dark>
                <v-icon left>fa-solid fa-user-clock</v-icon>
                View Employee Leaves
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
              :items="employeeData"
              :headers="getHeaders">
              <template v-slot:item.actions="{ item }">
                <v-btn icon color="error" @click.stop.prevent="deleteItem(item)">
                  <v-icon>fas fa-trash-alt</v-icon>
                </v-btn>
              </template>
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
                          (!!employeeData[index].days[j] ? employeeData[index].days[j].isLeave : false) ? 'Undo Leave' : 'Leave'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!!item.days[j]?!item.days[j].isHoliday:false"
                                 @click="setSickLeave(item.days[j].workedHours,index,j)">
                      <v-list-item-title>{{
                          (!!employeeData[index].days[j] ? employeeData[index].days[j].isSick : false) ? 'Undo Sick Leave' : 'Sick Leave'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!!item.days[j]?!item.days[j].isHoliday:false"
                                 @click="setAbsent(item.days[j].workedHours,index,j)">
                      <v-list-item-title>{{
                          (!!employeeData[index].days[j] ? employeeData[index].days[j].isAbsent : false) ? 'Undo Absent' : 'Absent'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="!!item.days[j]?item.days[j].isHoliday:false"
                                 @click="setHolidayBasicHours(item.days[j].workedHours,index,j)">
                      <v-list-item-title>
                        {{
                          (!!employeeData[index].days[j] ? employeeData[index].days[j].addHolidayBasicHours : false) ? 'Undo Holiday basic hours' : 'Add holiday basic hours'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>

          </v-row>
        </v-container>
      </v-container>
    </v-card>
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
    <v-dialog scrollable max-width="50%" v-model="viewLeaveDetailsDialog">
      <v-card>
        <v-toolbar
          dark
          flat
          class="mb-6"
          color="primary"
        >
          <v-toolbar-title>Leave Details</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="viewLeaveDetailsDialog = false;"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container fluid>
            <v-row dense>
              <v-col cols="6">
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th>Annual Leave Details</th>
                      <th>No. of days</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr
                    >
                      <td>Annual Leaves this year</td>
                      <td>{{
                          annualLeaveDetails.numberOfValidLeavesThisYear - annualLeaveDetails.numberOfTakenLeavesThisYear
                        }}
                      </td>
                    </tr>
                    <tr
                    >
                      <td>Taken Leaves this year</td>
                      <td>{{ annualLeaveDetails.numberOfTakenLeavesThisYear }}</td>
                    </tr>
                    <tr
                    >
                      <td>Available Leaves from previous year</td>
                      <td>{{
                          annualLeaveDetails.numberOfValidLeavesPreviousYear - annualLeaveDetails.numberOfTakenLeavesPreviousYear
                          - annualLeaveDetails.numberOfPaidOutLeaves
                        }}
                      </td>
                    </tr>
                    <tr
                    >
                      <td>Taken Leaves from previous year</td>
                      <td>{{ annualLeaveDetails.numberOfTakenLeavesPreviousYear }}</td>
                    </tr>
                    <tr
                    >
                      <td>Paid out Leaves previous year</td>
                      <td>{{ annualLeaveDetails.numberOfPaidOutLeaves }}</td>
                    </tr>
                    <tr
                    >
                      <td>Total Available Leaves</td>
                      <td>{{
                          annualLeaveDetails.numberOfValidLeavesThisYear
                          + annualLeaveDetails.numberOfValidLeavesPreviousYear - annualLeaveDetails.numberOfTakenLeavesThisYear - annualLeaveDetails.numberOfTakenLeavesPreviousYear - annualLeaveDetails.numberOfPaidOutLeaves
                        }}
                      </td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>


              </v-col>
              <v-col cols="6">
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                    <tr>
                      <th>Sick Leave Details</th>
                      <th>No. of days</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr
                    >
                      <td>Available Leaves</td>
                      <td>{{
                          sickLeaveDetails.numberOfValidLeavesThisYear - sickLeaveDetails.numberOfTakenLeavesThisYear
                        }}
                      </td>
                    </tr>
                    <tr
                    >
                      <td>Taken Leaves</td>
                      <td>{{ sickLeaveDetails.numberOfTakenLeavesThisYear }}</td>
                    </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import NepaliDate from 'nepali-date-converter';
import VNepaliDatePicker from 'v-nepalidatepicker';
import {mapActions, mapGetters} from "vuex";

export default {
  name: "EmployeeRoster",
  components: {
    VNepaliDatePicker,
  },
  data() {
    return {
      holidayBasicHours: null,
      search: '',
      isLoading: false,
      allActiveEmployee: [],
      allActiveHoliday: [],
      selectedEmployee: null,
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
      employeeData: [],
      newEmployeeRosters: [],
      selectedPayload: {},
      holidayModal: false,
      viewLeaveDetailsDialog: false
    }
  },
  methods: {
    ...mapActions("api", ["makeGetRequest", "makePostRequest"]),
    ...mapActions("leave", ["getEmployeeLeaveDetails"]),
    deleteItem(item) {
      const temp = this;
      console.log(item)
      this.$root.confirm('Confirm Delete', 'Are you sure you want to delete ' + item.client.siteName + '?')
        .then((confirm) => {
          this.makePostRequest({
            route: "employeeRoster/delete",
            data: {
              employeeId: temp.selectedEmployee.id,
              clientId: item.client.id,
              isNepaliDate: temp.selectedEmployee.useNepaliCalendar,
              month: temp.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
              year: temp.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
            }
          }).then((response) => {
            if (response.data.status === "OK") {
              temp.getEmployee(temp.selectedEmployee);
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
    },
    getAllActiveEmployee() {
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
    filterEmployee(item, queryText) {
      return (
        item.staffName.toLowerCase().includes(queryText.toLowerCase()) || item.vsNo.toLowerCase().includes(queryText.toLowerCase()))
    },
    previousMonth() {
      if (this.selectedEmployee.useNepaliCalendar) {
        if (this.selectedNepaliMonth > 1) {
          this.selectedNepaliMonth--;
          this.getEmployee(this.selectedEmployee);

        }
      } else {
        if (this.selectedEnglishMonth > 1) {
          this.selectedEnglishMonth--;
          this.getEmployee(this.selectedEmployee);
        }
      }
    },
    nextMonth() {
      if (this.selectedEmployee.useNepaliCalendar) {
        if (this.selectedNepaliMonth < 12) {
          this.selectedNepaliMonth++;
          this.getEmployee(this.selectedEmployee);

        }
      } else {
        if (this.selectedEnglishMonth < 12) {
          this.selectedEnglishMonth++;
          this.getEmployee(this.selectedEmployee);
        }
      }
    },
    getEmployee(item) {
      let temp = this;
      temp.isLoading = true;
      if (!!item) {
        this.makePostRequest({
          route: "employeeRoster/employee",
          data: {
            employeeId: item.id,
            isNepaliDate: item.useNepaliCalendar,
            month: temp.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
            year: temp.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
          }
        }).then((response) => {
          if (response.data.status === "OK") {
            const tempRoster = [];
            for (const key in response.data.data) {
              const days = temp.getListOfDaysInCurrentMonth(
                response.data.data[key],
                temp.numberOfDaysInCurrentMonth,
                item.useNepaliCalendar,
                temp.currentEnglishDate,
                temp.currentNepaliDate,
                item.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
                item.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
                temp.allActiveHoliday,
                temp.selectedEmployee.nonWorkingDays);

              const totalHours = temp.getTotalHours(item, days,
                temp.numberOfDaysInCurrentMonth, item.useNepaliCalendar,
                item.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear, item.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth);
              const roster = {
                client: response.data.data[key][0].client,
                totalHours,
                days
              };
              roster.numberOfHolidays = roster.days.filter(item => item.isHoliday && !item.isWeekend).length;
              tempRoster.push(roster);
            }
            temp.employeeData = tempRoster;
            this.getEmployeeLeaveDetails(item);
          }
          temp.isLoading = false;
        }).catch((error) => {
          temp.isLoading = false;
        })
      }
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
      const roster = this.employeeData[rosterByEmployeeIndex];
      const day = this.employeeData[rosterByEmployeeIndex].days[dayIndex];
      const workedHours = parseFloat(event);
      // Set workedHours in current employeeData dataset
      this.employeeData[rosterByEmployeeIndex].days[dayIndex].workedHours = workedHours;

      // Extra overtime validation: Set overtime to false when hours less than assigned hours
      if (workedHours <= this.selectedEmployee.assignedHours) {
        this.employeeData[rosterByEmployeeIndex].days[dayIndex].isOvertime = false;
      }

      // Recalculate total worked hours
      this.employeeData[rosterByEmployeeIndex].totalHours = this.getTotalHours(this.selectedEmployee, this.employeeData[rosterByEmployeeIndex].days,
        this.numberOfDaysInCurrentMonth, this.selectedEmployee.useNepaliCalendar,
        this.selectedEmployee.useNepaliCalendar ? this.selectedNepaliYear : this.selectedEnglishYear, this.selectedEmployee.useNepaliCalendar ? this.selectedNepaliMonth : this.selectedEnglishMonth);
      // this.employeeData[rosterByEmployeeIndex].totalHours.totalWorkedHours = totalHours.totalWorkedHours;
      // this.employeeData[rosterByEmployeeIndex].totalHours.totalLeaveDays = totalHours.totalLeaveDays;
      // this.employeeData[rosterByEmployeeIndex].totalHours.totalSickLeaveDays = totalHours.totalSickLeaveDays;
      // this.employeeData[rosterByEmployeeIndex].totalHours.totalAbsentDays = totalHours.totalAbsentDays;
      // this.employeeData[rosterByEmployeeIndex].totalHours.totalBasicHours = totalHours.totalBasicHours;
      // this.employeeData[rosterByEmployeeIndex].totalHours.totalHolidayHours = totalHours.totalHolidayHours;
      // this.employeeData[rosterByEmployeeIndex].totalHours.totalOvertimeHours = totalHours.totalOvertimeHours;
      // this.employeeData[rosterByEmployeeIndex].totalHours.totalOvertimeHours = totalHours.totalOvertimeHours;

      let englishFullDate;
      let englishYear;
      let englishMonth;
      let englishDay;
      let nepaliFullDate;
      let nepaliYear;
      let nepaliMonth;
      let nepaliDay;

      if (this.selectedEmployee.useNepaliCalendar) {
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
      if (this.newEmployeeRosters.filter(item => item.clientId === roster.client.id && item.date === day.date).length !== 0) {
        this.newEmployeeRosters =
          this.newEmployeeRosters.filter(item => !(item.clientId === roster.client.id && item.date === day.date && !item.undoLeave));
      }
      this.newEmployeeRosters.push({
        employeeId: this.selectedEmployee.id,
        clientId: roster.client.id,
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
        holidayBasicHours: day.holidayBasicHours,
        date: day.date,
        undoLeave,
        leaveFiscalYear: day.leaveFiscalYear
      });

    },
    setLeave(event, rosterByEmployeeIndex, dayIndex) {
      const employeeAtHand = this.selectedEmployee;
      let undoLeave;
      if (this.employeeData[rosterByEmployeeIndex].days[dayIndex].isLeave) {
        this.employeeData[rosterByEmployeeIndex].days[dayIndex].isLeave = false;
        undoLeave = true;
        this.newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave);
      } else {
        this.getEmployeeLeaveDetails(this.selectedEmployee)
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
            this.employeeData[rosterByEmployeeIndex].days[dayIndex].leaveFiscalYear = this.selectedEmployee.useNepaliCalendar ? this.selectedNepaliYear - 1 : this.selectedEnglishYear - 1;
          } else {
            this.employeeData[rosterByEmployeeIndex].days[dayIndex].leaveFiscalYear = this.selectedEmployee.useNepaliCalendar ? this.selectedNepaliYear : this.selectedEnglishYear;
          }
          this.employeeData[rosterByEmployeeIndex].days[dayIndex].isLeave = true;
          this.employeeData[rosterByEmployeeIndex].days[dayIndex].isSick = false;
          this.employeeData[rosterByEmployeeIndex].days[dayIndex].isAbsent = false;
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
      const employeeAtHand = this.selectedEmployee;
      let undoLeave;
      if (this.employeeData[rosterByEmployeeIndex].days[dayIndex].isSick) {
        this.employeeData[rosterByEmployeeIndex].days[dayIndex].isSick = false;
        undoLeave = true;
        this.newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave);
      } else {
        this.getEmployeeLeaveDetails(this.selectedEmployee)

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
          this.employeeData[rosterByEmployeeIndex].days[dayIndex].leaveFiscalYear = this.selectedYear;
          this.employeeData[rosterByEmployeeIndex].days[dayIndex].isSick = true;
          this.employeeData[rosterByEmployeeIndex].days[dayIndex].isLeave = false;
          this.employeeData[rosterByEmployeeIndex].days[dayIndex].isAbsent = false;
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
      if (this.employeeData[rosterByEmployeeIndex].days[dayIndex].isAbsent) {
        this.employeeData[rosterByEmployeeIndex].days[dayIndex].isAbsent = false;
        undoLeave = true;
      } else {
        this.employeeData[rosterByEmployeeIndex].days[dayIndex].leaveFiscalYear = this.selectedYear;
        this.employeeData[rosterByEmployeeIndex].days[dayIndex].isAbsent = true;
        this.employeeData[rosterByEmployeeIndex].days[dayIndex].isLeave = false;
        this.employeeData[rosterByEmployeeIndex].days[dayIndex].isSick = false;
        undoLeave = true;
        event = 0;
      }
      this.newHourLog(event, rosterByEmployeeIndex, dayIndex, undoLeave);
    },
    setHolidayBasicHours(event, rosterByEmployeeIndex, dayIndex) {
      this.selectedPayload = {event, rosterByEmployeeIndex, dayIndex};
      const holidayBasicHours = this.employeeData[this.selectedPayload.rosterByEmployeeIndex]
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
      this.employeeData[this.selectedPayload.rosterByEmployeeIndex].days[this.selectedPayload.dayIndex].holidayBasicHours =
        this.holidayBasicHours;
      this.newHourLog(this.selectedPayload.event, this.selectedPayload.rosterByEmployeeIndex, this.selectedPayload.dayIndex);
      this.holidayBasicHours = 0;
      this.holidayModal = false;
    },
    previousYear() {
      if (this.selectedEmployee.useNepaliCalendar) {
        this.selectedNepaliYear--;
        this.getEmployee(this.selectedEmployee)
        this.getAllActiveHoliday();
      } else {
        this.selectedEnglishYear--;
        this.getEmployee(this.selectedEmployee)
        this.getAllActiveHoliday();
      }
    },
    nextYear() {
      if (this.selectedEmployee.useNepaliCalendar) {
        this.selectedNepaliYear++;
        this.getEmployee(this.selectedEmployee)
        this.getAllActiveHoliday();
      } else {
        this.selectedEnglishYear++;
        this.getEmployee(this.selectedEmployee)
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
      const calendarData = {
        useNepaliCalendar: temp.selectedEmployee.useNepaliCalendar,
        selectedMonth: temp.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
        selectedYear: temp.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
        currentEnglishDate: temp.currentEnglishDate,
        currentNepaliDate: temp.currentNepaliDate,
        numberOfDaysInCurrentMonth: temp.numberOfDaysInCurrentMonth,
        numberOfWeekendsInCurrentMonth: temp.numberOfWeekendsInCurrentMonth,
        numberOfHolidaysInCurrentMonth: temp.numberOfHolidaysInCurrentMonth
      };

      this.makePostRequest({
        route: "employeeRoster/employee/aggregate",
        data: {
          employeeId: temp.selectedEmployee.id,
          isNepaliDate: temp.selectedEmployee.useNepaliCalendar,
          month: temp.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
          year: temp.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          temp.selectedEmployee = response.data.data.employee;

          if (temp.selectedEmployee.employeeDetails == null) {
            temp.$store.dispatch("toast/setSnackbar", {
              icon: "fa-solid fa-triangle-exclamation",
              color: "warning",
              title: "Employee Salary missing",
              text: "Please configure employee salary from employee management"
            });
          } else {
            const salaryDetails = this.getSalaryDetailsObject(temp.selectedEmployee, response.data.data.aggregate, temp.allActiveHoliday, calendarData);
            this.makePostRequest({
              route: "salaryDetails/registerNew",
              data: {
                ...salaryDetails
              }
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
          }
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
    getSalaryDetailsObject(selectedEmployee, employeeRosterAggregate,
                           holidays, calendarData) {
      let temp = this;
      const employeeWeekends = temp.translateWeekendStringToNames(selectedEmployee.nonWorkingDays);

      const totalLeaveHours = (employeeRosterAggregate.numberOfLeaveDays + employeeRosterAggregate.numberOfSickLeaveDays)
        * selectedEmployee.assignedHours;

      const expectedWorkHours = selectedEmployee.basicHours - totalLeaveHours;

      const actualWorkedHours = temp.getActualWorkedHours(selectedEmployee, employeeRosterAggregate, calendarData);

      const actualTotalHours = actualWorkedHours + totalLeaveHours
        + employeeRosterAggregate.holidayBasicHours;
      // + temp.numberOfHolidaysInCurrentMonth * temp.selectedEmployee.assignedHours;

      const totalOvertimeAllowance = ((selectedEmployee.employeeDetails.overtimeRate * employeeRosterAggregate.overtimeHours)
        + (selectedEmployee.employeeDetails.overtimeRate * employeeRosterAggregate.weekendHours));

      const grossSalary = temp.getGrossSalary(selectedEmployee);

      const reductionSalary = temp.getReductionSalary(grossSalary, selectedEmployee, actualTotalHours, actualWorkedHours,
        expectedWorkHours, employeeRosterAggregate.holidayBasicHours);

      const totalSalary = temp.getTotalSalary(selectedEmployee, reductionSalary, employeeRosterAggregate);

      const basicSalaryAfterReduction = selectedEmployee.employeeDetails.basicSalary -
        temp.getReductionBasicSalary(selectedEmployee, actualTotalHours, actualWorkedHours,
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
        employee: {id: selectedEmployee.id},
        bankName: selectedEmployee.employeeDetails.bank ? selectedEmployee.employeeDetails.bank.name : 'N/A',
        accountNumber: selectedEmployee.employeeDetails?.accountNumber ? selectedEmployee.employeeDetails?.accountNumber : 'N/A',
        ssfNo: selectedEmployee.employeeDetails?.ssfNo ? selectedEmployee.employeeDetails?.ssfNo : 'N/A',
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
        holidayAlowance: selectedEmployee.employeeDetails.holidayRate * employeeRosterAggregate.holidayHours,
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

    getTotalSalary(selectedEmployee, reductionSalary, employeeRosterAggregate) {
      let totalSalary = 0;
      totalSalary += selectedEmployee.employeeDetails.basicSalary;
      totalSalary += selectedEmployee.employeeDetails.dearnessAllowance;
      totalSalary += selectedEmployee.employeeDetails.otherAllowance;
      totalSalary += selectedEmployee.employeeDetails.specialAllowance;
      totalSalary += selectedEmployee.employeeDetails.direnessAllowance;
      totalSalary += selectedEmployee.employeeDetails.hardnessAllowance;
      totalSalary += selectedEmployee.employeeDetails.overtimeRate * employeeRosterAggregate.overtimeHours;
      totalSalary += selectedEmployee.employeeDetails.overtimeRate * employeeRosterAggregate.weekendHours;
      totalSalary += selectedEmployee.employeeDetails.holidayRate * employeeRosterAggregate.holidayHours;
      totalSalary -= reductionSalary;
      return Number(totalSalary.toFixed(1));
    },

    getActualWorkedHours(selectedEmployee, employeeRosterAggregate,
                         calendarData) {
      const numberOfWorkingDaysInCurrentMonth =
        this.getNumberOfWorkingDaysInCurrentMonth(calendarData.numberOfDaysInCurrentMonth, selectedEmployee,
          calendarData.useNepaliCalendar, calendarData.selectedYear, calendarData.selectedMonth);
      return this.getExpectedBasicHours(numberOfWorkingDaysInCurrentMonth,
        this.getActualTotalDays(employeeRosterAggregate, calendarData), selectedEmployee.nonWorkingDays.length,
        employeeRosterAggregate.totalHours,
        selectedEmployee.basicHours, selectedEmployee.assignedHours);
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

    getReductionSalary(grossSalary, selectedEmployee, actualTotalHours, actualWorkedHours,
                       expectedWorkHours, holidayBasicHours) {
      const grossSalaryPerHour = grossSalary / selectedEmployee.basicHours;
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

    getReductionBasicSalary(selectedEmployee, actualTotalHours, actualWorkedHours, expectedWorkHours, holidayBasicHours) {
      const basicSalary = selectedEmployee.employeeDetails.basicSalary;
      const basicSalaryPerHour = basicSalary / selectedEmployee.basicHours;
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
    viewLeaveDetails() {
        this.viewLeaveDetailsDialog = true;
        this.getEmployeeLeaveDetails(this.selectedEmployee);
    }
  },
  mounted() {
    this.getAllActiveEmployee();
    this.getAllActiveHoliday();
  },
  computed: {
    ...mapGetters("calendar", ["getHoursPerDate", "isWeekend", "isHoliday", "checkIsLeave", "checkIsSick", "checkIsAbsent", "checkIsOvertime", "checkIsReliever", "getRelievedEmployeeId", "getHolidayBasicHoursPerDate"]),
    ...mapGetters("leave", ["allLeaves", "allLeavesPreviousFiscalYear", "annualLeaves", "sickLeaves", "annualLeavesPreviousFiscalYear", "sickLeavesPreviousFiscalYear", "paidLeavesPreviousFiscalYear"]),
    annualLeaveDetails() {
      return this.validateLeave(true,
        this.selectedEmployee.fullTimeJoinDate ? this.selectedEmployee.fullTimeJoinDate : this.selectedEmployee.partTimeJoinDate,
        this.selectedNepaliMonth, this.selectedNepaliYear, this.annualLeaves, this.annualLeavesPreviousFiscalYear,
        this.paidLeavesPreviousFiscalYear, 0);
    },
    sickLeaveDetails() {
      return this.validateLeave(false,
        this.selectedEmployee.fullTimeJoinDate ? this.selectedEmployee.fullTimeJoinDate : this.selectedEmployee.partTimeJoinDate,
        this.selectedNepaliMonth, this.selectedNepaliYear, this.sickLeaves,
        this.sickLeavesPreviousFiscalYear, this.paidLeavesPreviousFiscalYear, 0);
    },
    getHeaders() {
      let headers = [];
      headers.push({text: "S.N.", value: "sn"});
      headers.push({text: "Client name", value: "client.siteName"});
      headers.push({text: "Email", value: "client.email"});
      headers.push({text: "Calendar  ", value: "client.useNepaliCalendar"});
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
      if (this.selectedEmployee.useNepaliCalendar) {
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
          useNepaliCalendar: this.selectedEmployee.useNepaliCalendar,
          selectedYear: this.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
          selectedMonth: this.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
          selectedDate: i,
          clientWeekendList: this.selectedEmployee.nonWorkingDays
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
            selectedMonth: this.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
            useNepaliCalendar: this.selectedEmployee.useNepaliCalendar,
            date: i
          })
          && !this.isWeekend({
            useNepaliCalendar: this.selectedEmployee.useNepaliCalendar,
            selectedYear: this.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliYear : temp.selectedEnglishYear,
            selectedMonth: this.selectedEmployee.useNepaliCalendar ? temp.selectedNepaliMonth : temp.selectedEnglishMonth,
            selectedDate: i,
            clientWeekendList: this.selectedEmployee.nonWorkingDays
          })) {
          numberOfWeekends++;
        }
      }
      return numberOfWeekends;
    },

    allActiveEmployeeNepali() {
      return this.allActiveEmployee.filter(item => item.useNepaliCalendar === true);
    }
    ,
    allActiveEmployeeEnglish() {
      return this.allActiveEmployee.filter(item => item.useNepaliCalendar === false);
    }
  },
}
</script>

<style>
</style>
