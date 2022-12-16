<template>
  <v-container fluid>
    <h2 style="font-weight: 700;" class="mb-6">Leave Pay Out Sheet</h2>
    <v-card>
      <v-container fluid>
        <v-row v-if="!this.$store.state.printControl.isPrinting" justify="center">
          <v-col cols="4">
            <v-text-field v-model="search" dense append-icon="fas fa-search" outlined
                          label="Search..."></v-text-field>
          </v-col>
         
          <!-- toggle different year -->
          <v-col cols="auto">
          
              <v-btn-toggle>
                <v-btn
                  @click="selectLeavePayoutYearBack"
                  fab
                  small
                  icon>
                  <v-icon>fas fa-angle-left</v-icon>
                </v-btn>
                <v-text-field v-model="nepaliDate" dense outlined readonly style="width:4vw" >
    
                </v-text-field>

                <v-btn
                  @click="selectLeavePayoutYearForward()"
                  fab
                  small
                  icon>
                  <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
              </v-btn-toggle>
          </v-col>
          <v-spacer/>
          <!-- excel print buttons -->
          <v-col cols="auto">
            <v-btn color="green" @click="toExcel" dark>
              <v-icon left>fas fa-file-excel</v-icon>
              Excel
            </v-btn>
            <v-btn dark>
              <v-icon left>fas fa-print</v-icon>
              Print
            </v-btn>
            
          </v-col>
        </v-row>


        <!-- main data table for leave payout sheet management -->
        <v-data-table :headers="headers" 
                      :items="activeData"
                      :search="search"
                      :loading="isloading"
                      :items-per-page="25"
                      calculate-widths
                      :footer-props="{
                        showFirstLastPage: true,
                        firstIcon : 'fas fa-angle-double-left',
                        lastIcon:'fas fa-angle-double-right',
                        nextIcon:'fas fa-angle-right',
                        prevIcon:'fas fa-angle-left',
                        itemsPerPageOptions:[25,50,100,-1]
                      }">       

        <!-- actions in data table -->
        <template #item.actions="{item}"> 
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click.stop.prevent="deleteItem(item)" v-on="on" v-bind="attrs" color="error"><v-icon> fas fa-trash-alt</v-icon></v-btn>
            </template>
            <span>Delete LeavePayout</span>
          </v-tooltip>
        </template>

        </v-data-table>
      </v-container>
    </v-card>
    

  </v-container>
</template>

<script>
import helpers from '../helpers';

export default {
  name: "Leave Payout",
  data() {
    return {
      nepaliDate : 2078,
      activeData : [],
      search: '',
      isloading: true,
      addNewDialog: false,

     
      // v-data table items and headers
      headers: [
        {text: 'S.N.', value:'employee.id'},
        {text: 'VS No.', value:'employee.vsNo'},
        {text: 'Employee Name', value: 'employee.staffName'},
        {text: 'Bank Name', value:'employee.employeeDetails.bank.name'},
        {text: 'Account number', value:'employee.employeeDetails.accountNumber'},
        {text: 'SSF number', value:'employee.employeeDetails.ssfNo'},
        {text: 'Number of Leaves', value:'numberOfLeaves'},
        {text: 'Annual Leaves', value:'dontKnow'},
        {text: 'Sick Leaves', value:'dKnow'},
        {text: 'Basic Salary', value:'basicSalary'},
        {text: 'Total', value:'total'},
        {text: 'Actions', value:'actions'}
      ],
      }
  },
 
  methods: {
    responseGetter() {
      return this.$store.dispatch("api/makeGetRequest",
        {
          route: `leavePayout/sheet`,
          params: {
              nepaliYear: this.nepaliDate
          }
        }
      )
    },
    async toExcel() {
      try {
        await helpers.jsonToExcel({
          fileName: this.nepaliDate + " - Leave Payout Sheet",
          sheetName:
            "Leave Sheet= ",
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

    //  handle api requests
     getActiveData() {
      this.$store.dispatch("api/makeGetRequest",
        {
          route: `leavePayout/sheet`,
          params: {
              nepaliYear: this.nepaliDate
          }
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.activeData = response.data.data;
          this.isloading = false;
        }
        
      }).catch((error) => {
        
      });
    },

    deleteItem(item){
      this.$root.confirm(`Confirm Delete`, `Are you sure you want to delete leave payout for "${item.employee.staffName}" ?`, { color: 'red' })
      .then((confirm)=>{
            this.$store.dispatch("api/makePostRequest",
            {
            route: "leavePayout/delete",
            data: item,
            }
          ).then(response => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "Leave Payout deleted successfully"
              });
              this.getActiveData();
              
          } }).catch((error) => {
              console.log("Failed deleting Leave Payout")
          });
      }).catch((error)=>{
        console.log("Failed deleting Leave Payout " + error);
      
      })
      
      
    },

    selectLeavePayoutYearBack(){
      this.nepaliDate -= 1;
      this.getActiveData();
    },

     selectLeavePayoutYearForward(){
      this.nepaliDate += 1;
      this.getActiveData();
    },

  },
  mounted(){
    this.getActiveData();

  }
}

</script>

<style>

</style>
