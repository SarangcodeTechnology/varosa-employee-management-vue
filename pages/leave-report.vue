<template>
    <v-container fluid>
      <h2 style="font-weight: 700;" class="mb-6">Leave Report</h2>
      <v-card>
        
           
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
  

       
      </v-card>
      <v-card>
        <v-row>
         
            <v-col cols="12">
          
              <v-btn color="green" dark @click="openLeaveFileModal()" class="my-2 ml-2">
                <v-icon left>fas fa-file-excel</v-icon>
                Upload Opening Leave Excel
              </v-btn>
          </v-col>
        </v-row>
      </v-card>


      <v-card >
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
                :items="leaveReportWithSN"
                :headers="reportHeader">
               
             
              </v-data-table>
            </v-col>
          </v-row>
    </v-card>
    <v-dialog scrollable max-width="50%" v-model="leaveFileModal">
  <v-card>
    <v-toolbar dark flat class="mb-6" color="primary">
      <v-toolbar-title>Upload Opening Leave Excel</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn icon @click="leaveFileModal = false">
          <v-icon>fa-solid fa-xmark</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-card-text>
      <v-container fluid>
        <v-row dense>
          <v-col cols="12">
            <v-file-input
              v-model="file"
              label="Upload Excel File"
              accept=".xlsx, .xls"
              outlined
              dense
            ></v-file-input>
          </v-col>
        </v-row>
        <p class="mt-2">
              <span>Here is a sample Excel file for your reference: </span>
              <br>
              <a href="/leaveExcelUpload.xlsx" download>Download Sample File</a>
            </p>
      </v-container>
    </v-card-text>
   
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="uploadFile()">Upload</v-btn>
    
    </v-card-actions>
  </v-card>
</v-dialog>
    </v-container>
   

  </template>
  
  <script>
  import NepaliDate from 'nepali-date-converter';
  import {mapActions} from "vuex";
  
  export default {
    name: "Leave Report",
    data() {
      return {
        selectedNepaliYear: new NepaliDate().getYear(),
        selectedEnglishYear: new Date().getFullYear(),
        leaveReportData: [],
        leaveFileModal: false,
        file: null,
        images: [],
        isLoading: false,
        nepaliDate : 2078,
        activeData : [],
        search: '',
        isloading: true,
        addNewDialog: false,
  
       
        reportHeader : [
  { text: "S.N.", value: "sno", width: "5%" },
  { text: "Employee Name", value: "employeeName", width: "20%" },
  { text: "Allocated Sick Leaves", value: "numberOfAllocatedSickLeaves", width: "15%" },
  { text: "Allocated Yearly Leaves", value: "numberOfAllocatedYearlyLeaves", width: "15%" },
  { text: "Opening Sick Leaves", value: "numberOfOpeningSickLeaves", width: "15%" },
  { text: "Opening Yearly Leaves", value: "numberOfOpeningYearlyLeaves", width: "15%" },
  { text: "Remaining Sick Leaves", value: "numberOfRemainingSickLeaves", width: "15%" },
  { text: "Remaining Yearly Leaves", value: "numberOfRemainingYearlyLeaves", width: "15%" },
  { text: "Sick Leaves Taken", value: "numberOfSickLeavesTaken", width: "15%" },
  { text: "Yearly Leaves Taken", value: "numberOfYearlyLeavesTaken", width: "15%" },
],
        }
    },
   
    methods: {
        ...mapActions("api", ["makeGetRequest", "makePostRequest","makePostRequestFile"]),
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
      openLeaveFileModal(){
      this.leaveFileModal = true;
    },

    uploadFile() {
      const temp =this;
      let excelUpload = {
        customerName: 'ssss'
      }
      if (!this.file) {
        temp.$store.dispatch("toast/setSnackbar", {
          icon: "fa-solid fa-circle-xmark",
          color: "error",
          title: "Error",
          text: "Please choose excel file."
        });
        return;
      }
      // Handle the file upload logic here
      console.log("Selected file:", this.file);
      this.images.push(this.file)
      const formData = new FormData()
      console.log("imges file:", this.images);
      formData.append('excelUpload', JSON.stringify(excelUpload))
      for (let i = 0; i < this.images.length; i++) {
        formData.append('file', this.images[i])
      }
      this.makePostRequestFile({
        route: "fileUpload/openingLeaveUpload",
        data: formData
        // data: {
        //   item: formData,
        // }
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

      previousYear() {
      this.selectedNepaliYear--;
      this.selectedEnglishYear--;
     this.openViewReport();
    },
    nextYear() {
      this.selectedNepaliYear++;
      this.selectedEnglishYear++;
     this.openViewReport();
    },

   

    openViewReport(){
      this.$store.dispatch("api/makeGetRequest",
        {
          route: `leaveDetails/leaveDetailsAllEmployee?nepaliYear=${this.selectedNepaliYear}`
        }
      ).then(response => {
      
       

          this.leaveReportData=response.data.data;
        
        this.isloading = false;
      }).catch((error) => {
      });


      this.leaveReportModal = true;
    },
  
  
   
  
    },
    mounted(){
      this.openViewReport();
  
    },
    computed: {
        leaveReportWithSN(){
      return this.leaveReportData.map((d, index) => ({...d, sno: index + 1}))
    }
    }
  }
  
  </script>
  
  <style>
  
  </style>
  