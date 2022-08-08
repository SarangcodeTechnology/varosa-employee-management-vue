<template>
  <v-container fluid>
    <h2 style="font-weight: 700;" class="mb-6">Employee Roster</h2>
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
                            @input="onEmployeeSelect"
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
                              :value="selectedNepaliYear"></v-text-field>

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
                              :value="nepaliMonthList[selectedNepaliMonth-1]"></v-text-field>
                <v-btn @click="nextMonth()" fab
                       small icon>
                  <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
              </v-btn-toggle>

            </v-col>
          </v-row>
        </v-container>
      </v-container>
    </v-card>
  </v-container>

</template>

<script>
import {mapActions} from "vuex";
import NepaliDate from "nepali-date-converter";

export default {
  name: "SalaryDetails",
  data() {
    return {
      allActiveEmployee: [],
      selectedEmployee: null,
      selectedEmployeeData: null,
      selectedNepaliYear: new NepaliDate().getYear(),
      selectedNepaliMonth: new NepaliDate().getMonth() + 1,
      nepaliMonthList: ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Asoj', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'],
    }
  },
  computed: {
    filterEmployee(item, queryText) {
      return (
        item.staffName.toLowerCase().includes(queryText.toLowerCase()) || item.vsNo.toLowerCase().includes(queryText.toLowerCase()))
    },
  },
  mounted() {
    this.getAllActiveEmployee();
  },
  methods: {
    ...mapActions("api", ["makeGetRequest", "makePostRequest"]),
    onEmployeeSelect(item) {
      let temp = this;
      temp.isLoading = true;
      if (!!item) {
        temp.getEmployeeById(item);
        temp.getAllActiveHoliday();

      }
    },
    getEmployeeById(item) {
      let temp = this;
      this.makeGetRequest({
        route: "employee/getById",
        params: {
          id: item.id,
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          temp.selectedEmployeeData = response.data.data
        }
        temp.isLoading = false;
      }).catch((error) => {
        temp.isLoading = false;
      })
    },
    getSalaryDetails(item) {
      let temp = this;
      this.makePostRequest({
        route: "salaryDetails/get",
        params: {
          employeeId: item.id,
          isNepaliDate: true,
          month: 4,
          year: 2079
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          temp.selectedEmployeeData = response.data.data
        }
        temp.isLoading = false;
      }).catch((error) => {
        temp.isLoading = false;
      })
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
    getAllActiveEmployee() {
      let temp = this;
      this.makeGetRequest(
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
    previousYear() {
      this.selectedNepaliYear--;
      this.getEmployee(this.selectedEmployee)
      this.getAllActiveHoliday();
    },
    nextYear() {
      this.selectedNepaliYear++;
      this.getEmployee(this.selectedEmployee)
      this.getAllActiveHoliday();
    },
    previousMonth() {
      if (this.selectedNepaliMonth > 1) {
        this.selectedNepaliMonth--;
        this.getEmployee(this.selectedEmployee);
      }
    },
    nextMonth() {
      if (this.selectedNepaliMonth < 12) {
        this.selectedNepaliMonth++;
        this.getEmployee(this.selectedEmployee);
      }
    },
  }
}
</script>

<style scoped>

</style>
