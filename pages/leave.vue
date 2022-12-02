<template>
  <v-container fluid>
    <h2 style="font-weight: 700;" class="mb-6">Leave Management</h2>
    <v-card>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <v-autocomplete prepend-inner-icon="fa-solid fa-users" filled dense :items="allActiveEmployee"
                            v-model="selectedEmployee"
                            label="Employee (Nepali Date)"
                            placeholder="Search by name or V.S. No."
                            return-object
                            :filter="filterEmployee"
                            @input="selectEmployee"
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
              <h3>Nepali Calendar</h3>
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
                              :value="selectedNepaliYear+'/'+(selectedNepaliYear+1)+' Fiscal Year'"></v-text-field>
                <v-btn
                  @click="nextYear()"
                  fab
                  small
                  icon>
                  <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field
                dense
                v-model="search"
                append-icon="fa-solid fa-magnifying-glass"
                label="Search"
                outlined
              ></v-text-field>
            </v-col>
            <v-spacer/>
            <v-col cols="auto">
              <v-btn @click="payOutLeaves()" color="primary" dark>
                <v-icon left>fas fa-money-bill</v-icon>
                Pay out leaves
              </v-btn>
              <v-btn color="green" dark>
                <v-icon left>fas fa-file-excel</v-icon>
                Excel
              </v-btn>
              <v-btn dark>
                <v-icon left>fas fa-print</v-icon>
                Print
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
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
                :items="leavesWithSn"
                :headers="headers">
                <template v-slot:item.nepaliFullDate="{ item }">
                  <template v-if="item.leaveType !== 'PAID'">{{ item.nepaliFullDate }}</template>
                  <template v-else>N/A</template>
                </template>
                <template v-slot:item.englishFullDate="{ item }">
                  <template v-if="item.leaveType !== 'PAID'">{{ item.englishFullDate }}</template>
                  <template v-else>N/A</template>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-container>
      </v-container>
    </v-card>
  </v-container>

</template>

<script>
import NepaliDate from "nepali-date-converter";
import {mapActions} from "vuex";

export default {
  name: "LeaveHistory",
  data() {
    return {
      selectedNepaliYear: new NepaliDate().getYear(),
      selectedEnglishYear: new Date().getFullYear(),
      search: '',
      isLoading: false,
      leaves: [],
      headers: [
        {text: "S.N.", value: "sno", width: "2%"},
        {text: "Leave Type", value: "leaveType"},
        {text: "Nepali Full date", value: "nepaliFullDate"},
        {text: "English Full Date", value: "englishFullDate"},
      ],
      allActiveEmployee: [],
      selectedEmployee: null,
    }
  },
  methods: {
    ...mapActions("api", ["makeGetRequest", "makePostRequest"]),
    getNumberOfMonthsSinceJoined(selectedNepaliMonth, employeeJoinMonth, selectedNepaliYear, employeeJoinYear) {
      const numberOfMonths = selectedNepaliMonth - employeeJoinMonth + (selectedNepaliYear - employeeJoinYear) * 12;
      return numberOfMonths < 1 ? 0 : numberOfMonths;
    },
    payOutLeaves() {
      let temp=this;
      const currentEnglishDate = new Date();
      const currentNepaliDate = new NepaliDate();
      const employeeJoinDate = this.selectedEmployee.fullTimeJoinDate ? this.selectedEmployee.fullTimeJoinDate :
        this.selectedEmployee.partTimeJoinDate;
      const employeeFullTimeJoinDateSplit = employeeJoinDate.split('-');
      const employeeJoinYear = parseInt(employeeFullTimeJoinDateSplit[0], 10);
      const employeeJoinMonth = parseInt(employeeFullTimeJoinDateSplit[1], 10);
      const numberOfMonthsSinceJoinedToLastShrawan = this.getNumberOfMonthsSinceJoined(
        3, employeeJoinMonth, this.selectedNepaliYear + 1, employeeJoinYear);
      const validMonths = numberOfMonthsSinceJoinedToLastShrawan > 12 ? 12 : numberOfMonthsSinceJoinedToLastShrawan;
      const numberOfValidLeaves = validMonths * 1.5;
      const numberOfUsedAnnualLeaves = this.leaves.filter(item => item.leaveType === 'ANNUAL' || item.leaveType === 'PAID').length;
      const numberOfPayouts = numberOfValidLeaves - numberOfUsedAnnualLeaves;
      if (numberOfPayouts < 1) {
        temp.$store.dispatch("toast/setSnackbar", {
          icon: "fa-solid fa-exclamation-triangle",
          color: "warning",
          title: "Warning",
          text: `${temp.selectedEmployee.staffName} does not have any leaves remaining for payout.`
        });
        return;
      }

      this.makePostRequest({
        route: "employeeLeaves/payOutAnnualLeaves",
        data: {
          employeeId: temp.selectedEmployee.id,
          nepaliYear: temp.selectedNepaliYear,
          englishYear: temp.selectedEnglishYear,
          numberOfPayouts
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          temp.getAllLeavesPerNepaliFiscalYear();
          temp.$store.dispatch("toast/setSnackbar", {
            title: "Success",
            text: `${temp.selectedEmployee.staffName} has been paid out for the year ${temp.selectedNepaliYear}`
          });
        } else {
          temp.$store.dispatch("toast/setSnackbar", {
            icon: "fa-solid fa-circle-xmark",
            color: "error",
            title: "Error",
            text: "Unable to pay out leaves."
          });
        }
      }).catch((error) => {
        temp.$store.dispatch("toast/setSnackbar", {
          icon: "fa-solid fa-circle-xmark",
          color: "error",
          title: "Error",
          text: "Unable to pay out leaves."
        });
      });
    },
    filterEmployee(item, queryText) {
      return (
        item.staffName.toLowerCase().includes(queryText.toLowerCase()) || item.vsNo.toLowerCase().includes(queryText.toLowerCase()))
    },
    selectEmployee() {
      this.getAllLeavesPerNepaliFiscalYear();
    },
    previousYear() {
      this.selectedNepaliYear--;
      this.selectedEnglishYear--;
      this.getAllLeavesPerNepaliFiscalYear();
    },
    nextYear() {
      this.selectedNepaliYear++;
      this.selectedEnglishYear++;
      this.getAllLeavesPerNepaliFiscalYear();
    },
    getAllLeavesPerNepaliFiscalYear() {
      let temp = this;
      this.makePostRequest({
        route: "employeeLeaves/getAll/nepaliFiscalYear",
        data: {
          employeeId: temp.selectedEmployee.id,
          nepaliYear: temp.selectedNepaliYear,
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          temp.leaves = response.data.data;
        } else {
          temp.$store.dispatch("toast/setSnackbar", {
            icon: "fa-solid fa-circle-xmark",
            color: "error",
            title: "Error",
            text: "Unable to load leave list."
          });
        }
      }).catch((error) => {
        temp.$store.dispatch("toast/setSnackbar", {
          icon: "fa-solid fa-circle-xmark",
          color: "error",
          title: "Error",
          text: "Unable to load leave list."
        });
      });

    },
    getAllActiveMini() {
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "employee/getAllActiveMini"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.allActiveEmployee = response.data.data;
        }
        this.isloading = false;
      }).catch((error) => {
      });
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
            } else {
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
    this.getAllActiveMini();
  },
  computed: {
    leavesWithSn() {
      return this.leaves.map((d, index) => ({...d, sno: index + 1}))
    }
  }
}
</script>

<style scoped>

</style>
