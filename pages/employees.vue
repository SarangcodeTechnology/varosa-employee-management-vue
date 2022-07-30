<template>
  <v-container fluid>
    <h2 style="font-weight: 700;" class="mb-6">Employee Management</h2>
    <v-card>
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="4">
            <v-text-field v-model="search" dense append-icon="fas fa-search" outlined
                          label="Search..."></v-text-field>
          </v-col>
          <v-col class="override-class" cols="auto">
            <v-select menu-props="auto" chips @input="getData()" solo flat
                      dense :items="filterMenuItems"
                      v-model="selectedFilterOption"
                      label="Filter Data" item-text="name"
                      item-value="value">
              <template v-slot:selection="{item}">
                <v-chip :color="item.color" dark>{{ item.name }}</v-chip>
              </template>
            </v-select>
          </v-col>
          <v-spacer/>
          <v-col cols="auto">
            <v-btn color="green" dark>
              <v-icon left>fas fa-file-excel</v-icon>
              Excel
            </v-btn>
            <v-btn dark>
              <v-icon left>fas fa-print</v-icon>
              Print
            </v-btn>
            <v-btn @click="newEmployee(defaultItem,true)" color="primary">
              <v-icon left>fas fa-plus</v-icon>
              Add New
            </v-btn>
          </v-col>
        </v-row>


        <v-data-table
          calculate-widths
          @click:row="(item)=>editEmployee(item,false)"
          :headers="headers"
          :items="tableItems"
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
        >
          <template v-slot:item.actions="{ item }">
            <div class="d-flex justify-content-center align-items-center">
              <v-tooltip bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="editEmployee(item,false)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-eye</v-icon>
                  </v-btn>
                </template>
                <span>View Employee</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption !== 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="editEmployee(item,true)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit Employee</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption !== 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="navigateToMonthlyRoster(item)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fa-solid fa-calendar-days</v-icon>
                  </v-btn>
                </template>
                <span>Navigate to Monthly Roster</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption !== 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="navigateToSalaryDetails(item)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fa-solid fa-money-bill</v-icon>
                  </v-btn>
                </template>
                <span>Navigate to Salary Details</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption !== 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="viewMappedClients(item,true)" v-bind="attrs" v-on="on" fab icon
                         x-small>
                    <v-icon>fa-solid fa-network-wired</v-icon>
                  </v-btn>
                </template>
                <span>View Mapped Clients</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption !== 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="viewLeaveDetails(item,true)" v-bind="attrs" v-on="on" fab icon
                         x-small>
                    <v-icon>fa-solid fa-user-clock</v-icon>
                  </v-btn>
                </template>
                <span>View Leave Details</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption !== 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="updateEmployeeStatus(item)" v-bind="attrs" v-on="on" fab icon
                         x-small>
                    <v-icon>fa-solid fa-user-edit</v-icon>
                  </v-btn>
                </template>
                <span>Update Employee Status</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption !== 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" fab icon x-small
                         @click.stop.prevent="cloneEmployee(item,true)">
                    <v-icon>fas fa-clone</v-icon>
                  </v-btn>
                </template>
                <span>Clone Employee</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption !== 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" color="error" fab icon x-small
                         @click.stop.prevent="deactivateEmployee(item)">
                    <v-icon>fas fa-trash-alt</v-icon>
                  </v-btn>
                </template>
                <span>Deactivate Employee</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption === 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="reactivateEmployee(item)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-user-lock</v-icon>
                  </v-btn>
                </template>
                <span>Reactivate Employee</span>
              </v-tooltip>
              <v-tooltip v-if="selectedFilterOption === 'I'" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" color="error" fab icon x-small @click.stop.prevent="deleteItem(item)">
                    <v-icon>fas fa-trash-alt</v-icon>
                  </v-btn>
                </template>
                <span>Delete Employee</span>
              </v-tooltip>
            </div>
          </template>
          <template v-slot:item.activeStatus="{ item }">
            <v-chip
              :color="filterMenuItems[0].color"
              class="ma-2"
              v-if="selectedFilterOption === 'A'"
              dark
              dense
            >
              Active
            </v-chip>
            <v-chip
              :color="filterMenuItems[2].color"
              class="ma-2"
              v-if="selectedFilterOption === 'H'"
              dark
              dense
            >
              Hold
            </v-chip>
            <v-chip
              :color="filterMenuItems[3].color"
              class="ma-2"
              v-if="selectedFilterOption === 'M'"
              dark
              dense
            >
              Missing
            </v-chip>
            <v-chip
              :color="filterMenuItems[4].color"
              class="ma-2"
              v-if="selectedFilterOption === 'P'"
              dark
              dense
            >
              Resign Pending
            </v-chip>
            <v-chip
              :color="filterMenuItems[5].color"
              class="ma-2"
              v-if="selectedFilterOption === 'R'"
              dark
              dense
            >
              Resigned
            </v-chip>
            <v-chip
              :color="filterMenuItems[1].color"
              class="ma-2"
              v-if="selectedFilterOption === 'I'"
              dark
              dense
            >
              Inactive
            </v-chip>
          </template>
        </v-data-table>
      </v-container>
    </v-card>
    <v-dialog scrollable max-width="60%" :persistent="editingEmployee||creatingEmployee" v-model="employeeDialog">
      <v-card>
        <v-toolbar
          dark
          flat
          class="mb-6"
          color="primary"
        >

          <v-toolbar-title>Employee Details</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="employeeDialog = false;editingEmployee=false;creatingEmployee=false"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-alert
            type="error"
            v-if="$v.editedItem.$invalid"
            elevation="2"
          >
            Some required fields are missing. Please check for all errors before proceeding.
          </v-alert>
          <v-card
            v-if="!creatingEmployee"
            outlined
            class="mb-2"
          >
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1">
                  {{ editedItem.staffName }}
                </v-list-item-title>
                <span>{{ editedItem.category.name ? editedItem.category.name : "" }}</span><br>
                <span>{{ editedItem.temporaryAddress ? editedItem.temporaryAddress : "" }}</span><br>
                <span>{{ editedItem.email ? editedItem.email : "" }}</span>
                <span>{{ editedItem.phone ? editedItem.phone : "" }}</span>
              </v-list-item-content>
              <v-chip
                :color="filterMenuItems[0].color"
                class="ma-2"
                v-if="editedItem.activeStatus === 'A'"
                dark
                dense
              >
                Active
              </v-chip>
              <v-chip
                :color="filterMenuItems[2].color"
                class="ma-2"
                v-if="editedItem.activeStatus === 'H'"
                dark
                dense
              >
                Hold
              </v-chip>
              <v-chip
                :color="filterMenuItems[3].color"
                class="ma-2"
                v-if="editedItem.activeStatus === 'M'"
                dark
                dense
              >
                Missing
              </v-chip>
              <v-chip
                :color="filterMenuItems[4].color"
                class="ma-2"
                v-if="editedItem.activeStatus === 'P'"
                dark
                dense
              >
                Resign Pending
              </v-chip>
              <v-chip
                :color="filterMenuItems[5].color"
                class="ma-2"
                v-if="editedItem.activeStatus === 'R'"
                dark
                dense
              >
                Resigned
              </v-chip>
              <v-chip
                :color="filterMenuItems[1].color"
                class="ma-2"
                v-if="editedItem.activeStatus === 'I'"
                dark
                dense
              >
                Inactive
              </v-chip>
            </v-list-item>
          </v-card>
          <v-stepper outlined v-model="step">
            <v-stepper-header class="elevation-0 ma-0 pa-0">
              <v-container fluid>
                <v-row align="center">
                  <v-col cols="3">
                    <v-stepper-step color="accent" :editable="!creatingEmployee" step="1">
                      Employee Details
                    </v-stepper-step>
                  </v-col>
                  <v-divider></v-divider>
                  <v-col cols="3">
                    <v-stepper-step color="accent" :editable="!creatingEmployee" step="2">
                      Employee Financial Details
                    </v-stepper-step>
                  </v-col>
                  <v-divider></v-divider>
                  <v-col cols="4">
                    <v-stepper-step color="accent" :editable="!creatingEmployee" step="3">
                      Employee Emergency Contact Information
                    </v-stepper-step>
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{attrs,on}">
                      <v-btn
                        v-bind="attrs" v-on="on"
                        fab
                        x-small
                        color="primary"
                        @click="step=(parseInt(step)-1).toString()"
                        :disabled="step==='1'"
                      >
                        <v-icon>fa-solid fa-angle-left</v-icon>
                      </v-btn>
                    </template>
                    <span>Previous</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{attrs,on}">
                      <v-btn
                        class="mr-2 ml-2"
                        v-bind="attrs" v-on="on"
                        fab
                        x-small
                        color="primary"
                        @click="step=(parseInt(step)+1).toString()"
                        :disabled="($v.editedItem.$invalid && !editingEmployee)||step==='3'"
                      >
                        <v-icon>fa-solid fa-angle-right</v-icon>
                      </v-btn>
                    </template>
                    <span>Next</span>
                  </v-tooltip>
                </v-row>
              </v-container>

            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <v-container fluid>
                  <v-row dense>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-list-ol"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="V.S. No.*"
                        v-model="editedItem.vsNo"
                        :error-messages="getErrors('vsNo', $v.editedItem.vsNo)"
                        @blur="$v.editedItem.vsNo.$touch()"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-checkbox
                        :readonly="!editingEmployee && !creatingEmployee"
                        label="Use Nepali Calendar"
                        v-model="editedItem.useNepaliCalendar">
                      </v-checkbox>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-user"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Name*"
                        v-model="editedItem.staffName"
                        :error-messages="getErrors('staffName', $v.editedItem.staffName)"
                        @blur="$v.editedItem.staffName.$touch()"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-envelope"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Branch"
                        v-model="editedItem.email"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-phone-alt"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Phone*"
                        v-model="editedItem.phone"
                        :error-messages="getErrors('phone', $v.editedItem.phone)"
                        @blur="$v.editedItem.phone.$touch()"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-input :disabled="!editingEmployee && !creatingEmployee" style="margin-top:-22px;"
                      >
                        <v-row no-gutters>
                          <v-col cols="12">
                            <span style="font-size:12px;">Date of birth (BS)*</span>
                          </v-col>
                          <v-col cols="12">
                            <VNepaliDatePicker classValue="nepali-datepicker" v-model="editedItem.dateOfBirth"
                                               calenderType="Nepali" placeholder="yyyy-mm-dd" format="YYYY-MM-DD"/>
                          </v-col>
                        </v-row>
                      </v-input>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-map-marker-alt"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Permanent Address"
                        v-model="editedItem.permanentAddress"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-map-marker-alt"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Temporary Address"
                        v-model="editedItem.temporaryAddress"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-input :disabled="!editingEmployee && !creatingEmployee" style="margin-top:-22px;"
                      >
                        <v-row no-gutters>
                          <v-col cols="12">
                            <span style="font-size:12px;">Full Time Join Date (BS)</span>
                          </v-col>
                          <v-col cols="12">
                            <VNepaliDatePicker classValue="nepali-datepicker" v-model="editedItem.fullTimeJoinDate"
                                               calenderType="Nepali" placeholder="yyyy-mm-dd" format="YYYY-MM-DD"/>
                          </v-col>
                        </v-row>
                      </v-input>
                    </v-col>
                    <v-col cols="6">
                      <v-input :disabled="!editingEmployee && !creatingEmployee" style="margin-top:-22px;"
                      >
                        <v-row no-gutters>
                          <v-col cols="12">
                            <span style="font-size:12px;">Part Time Join Date (BS)</span>
                          </v-col>
                          <v-col cols="12">
                            <VNepaliDatePicker classValue="nepali-datepicker" v-model="editedItem.partTimeJoinDate"
                                               calenderType="Nepali" placeholder="yyyy-mm-dd" format="YYYY-MM-DD"/>
                          </v-col>
                        </v-row>
                      </v-input>
                    </v-col>
                    <v-col cols="6">
                      <v-input :disabled="!editingEmployee && !creatingEmployee" style="margin-top:-22px;"
                      >
                        <v-row no-gutters>
                          <v-col cols="12">
                            <span style="font-size:12px;">Resign Date (BS)</span>
                          </v-col>
                          <v-col cols="12">
                            <VNepaliDatePicker classValue="nepali-datepicker" v-model="editedItem.resignDate"
                                               calenderType="Nepali" placeholder="yyyy-mm-dd" format="YYYY-MM-DD"/>
                          </v-col>
                        </v-row>
                      </v-input>
                    </v-col>
                    <v-col cols=6>
                      <v-autocomplete prepend-inner-icon="fa-solid fa-users" filled dense :items="allActiveCategory"
                                      v-model="editedItem.category"
                                      :readonly="!editingEmployee && !creatingEmployee"
                                      label="Employee Category" item-text="name"
                                      return-object
                                      :error-messages="getErrors('category', $v.editedItem.category)"
                                      @blur="$v.editedItem.category.$touch()"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12">
                      <v-container fluid>
                        <v-row dense>
                          <v-card width="100%" outlined class="mb-2">
                            <v-container fluid>
                              <v-row no-gutters>
                                <v-col cols="12">
                                  <h5>Non Working Days</h5>
                                </v-col>
                                <v-col class="mr-2" v-for="(weekday,i) in weekdays" :key="i" cols="auto">
                                  <v-checkbox
                                    :readonly="!editingEmployee && !creatingEmployee"
                                    :label="weekday.name" :value="weekday.id.toString()"
                                    v-model="nonWorkingDays" multiple>
                                  </v-checkbox>
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-card>
                        </v-row>
                      </v-container>
                    </v-col>
                    <v-col cols=4>
                      <v-autocomplete prepend-inner-icon="fa-solid fa-venus-mars" filled dense :items="genderItems"
                                      v-model="editedItem.gender"
                                      item-text="name"
                                      item-value="name"
                                      :readonly="!editingEmployee && !creatingEmployee"
                                      label="Gender"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols=4>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-clock"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Hours per day*"
                        v-model="editedItem.assignedHours"
                        :error-messages="getErrors('assignedHours', $v.editedItem.assignedHours)"
                        @blur="$v.editedItem.assignedHours.$touch()"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=4>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-clock"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Basic Hours*"
                        v-model="editedItem.basicHours"
                        :error-messages="getErrors('basicHours', $v.editedItem.basicHours)"
                        @blur="$v.editedItem.basicHours.$touch()"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-stepper-content>
              <v-stepper-content step="2">
                <v-container fluid>
                  <v-row dense>
                    <v-col cols="12">
                      <v-autocomplete prepend-inner-icon="fa-solid fa-university" filled dense :items="allActiveBanks"
                                      :readonly="!editingEmployee && !creatingEmployee"
                                      v-model="editedItem.employeeDetails.bank"
                                      label="Bank" item-text="name"
                                      return-object
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-file-invoice-dollar"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Account Number"
                        v-model="editedItem.employeeDetails.accountNumber"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-id-card"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="SSF Number"
                        v-model="editedItem.employeeDetails.ssfNo"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-building"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Bank Branch"
                        v-model="editedItem.bankBranch"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-id-card-alt"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="PAN Number"
                        v-model="editedItem.employeeDetails.panNumber"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-money-check-alt"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Basic Salary"
                        v-model="editedItem.employeeDetails.basicSalary"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-dollar-sign"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Dearness Allowance"
                        v-model="editedItem.employeeDetails.dearnessAllowance"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-dollar-sign"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Other Allowance"
                        v-model="editedItem.employeeDetails.otherAllowance"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-dollar-sign"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Special Allowance"
                        v-model="editedItem.employeeDetails.specialAllowance"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-dollar-sign"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Direness Allowance"
                        v-model="editedItem.employeeDetails.direnessAllowance"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-dollar-sign"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Hardness Allowance"
                        v-model="editedItem.employeeDetails.hardnessAllowance"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-coins"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Overtime Rate"
                        v-model="editedItem.employeeDetails.overtimeRate"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-coins"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Holiday Rate"
                        v-model="editedItem.employeeDetails.holidayRate"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-stepper-content>
              <v-stepper-content step="3">
                <v-container fluid>
                  <v-row dense>
                    <v-col cols="6">
                      <v-autocomplete prepend-inner-icon="fa-solid fa-heartbeat" filled dense :items="allBloodGroups"
                                      v-model="editedItem.employeeEmergencyDetails.bloodGroup"
                                      :readonly="!editingEmployee && !creatingEmployee"
                                      item-text="name"
                                      item-value="name"
                                      label="Blood Group"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-file-medical"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Emergency Contact Name"
                        v-model="editedItem.employeeEmergencyDetails.contactName"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-laptop-medical"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Emergency Contact Number"
                        v-model="editedItem.employeeEmergencyDetails.contactNumber"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-handshake"
                        :readonly="!editingEmployee && !creatingEmployee"
                        dense
                        filled
                        label="Relation"
                        v-model="editedItem.employeeEmergencyDetails.relation"
                      ></v-text-field>
                    </v-col>
                    <v-col cols=6>
                      <v-file-input
                        v-model="editedItem.employeeEmergencyDetails.photo"
                        :disabled="!editingEmployee && !creatingEmployee"
                        label="Photo"
                        placeholder="Select your photo..."
                        prepend-inner-icon="fa-solid fa-image"
                        filled
                        dense
                      >
                      </v-file-input>
                    </v-col>
                    <v-col cols=6>
                      <v-file-input
                        v-model="editedItem.employeeEmergencyDetails.citizenship"
                        :disabled="!editingEmployee && !creatingEmployee"
                        label="Citizenship"
                        placeholder="Select your citizenship..."
                        prepend-inner-icon="fa-solid fa-image"
                        filled
                        dense
                      >
                      </v-file-input>
                    </v-col>
                  </v-row>
                </v-container>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>

        </v-card-text>
        <v-card-actions v-if="editingEmployee || creatingEmployee">
          <v-spacer/>
          <v-btn
            color="error"
            @click="employeeDialog = false;editingEmployee=false;creatingEmployee=false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="(creatingEmployee && step !== '3') || $v.editedItem.$invalid"
            @click="creatingEmployee?createEmployee():updateEmployee();"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog scrollable max-width="50%" v-model="mappedClientsDialog">
      <v-card>
        <v-toolbar
          dark
          flat
          class="mb-6"
          color="primary"
        >

          <v-toolbar-title>{{ editedTableItem.staffName }}'s Clients</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="mappedClientsDialog = false;viewingMappedClients=false;"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-card
            outlined
            class="mb-2"
          >
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1">
                  {{ editedTableItem.staffName }}
                </v-list-item-title>

                <span>{{ editedTableItem.categoryName ? editedTableItem.categoryName : "" }}</span><br>
                <span>{{ editedTableItem.email ? editedTableItem.email : "" }}</span>
                <span>{{ editedTableItem.phone ? editedTableItem.phone : "" }}</span>
              </v-list-item-content>
              <v-chip
                :color="filterMenuItems[0].color"
                class="ma-2"
                v-if="selectedFilterOption === 'A'"
                dark
                dense
              >
                Active
              </v-chip>
              <v-chip
                :color="filterMenuItems[2].color"
                class="ma-2"
                v-if="selectedFilterOption === 'H'"
                dark
                dense
              >
                Hold
              </v-chip>
              <v-chip
                :color="filterMenuItems[3].color"
                class="ma-2"
                v-if="selectedFilterOption === 'M'"
                dark
                dense
              >
                Missing
              </v-chip>
              <v-chip
                :color="filterMenuItems[4].color"
                class="ma-2"
                v-if="selectedFilterOption === 'P'"
                dark
                dense
              >
                Resign Pending
              </v-chip>
              <v-chip
                :color="filterMenuItems[5].color"
                class="ma-2"
                v-if="selectedFilterOption === 'R'"
                dark
                dense
              >
                Resigned
              </v-chip>
              <v-chip
                :color="filterMenuItems[1].color"
                class="ma-2"
                v-if="selectedFilterOption === 'I'"
                dark
                dense
              >
                Inactive
              </v-chip>
            </v-list-item>
          </v-card>
          <v-card outlined class="mb-2">
            <v-card-text>
              <h4>Add new clients</h4>
              <v-container fluid>
                <v-row dense>
                  <v-col cols="7">
                    <v-autocomplete outlined dense :items="allActiveClientsFiltered"
                                    v-model="clientMappings.newMapping.client"
                                    label="Client" item-text="siteName"
                                    return-object
                                    :error-messages="getErrors('client', $v.clientMappings.newMapping.client)"
                                    @blur="$v.clientMappings.newMapping.client.$touch()"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="2">
                    <v-tooltip bottom>
                      <template v-slot:activator="{attrs,on}">
                        <v-btn :disabled="$v.clientMappings.newMapping.$invalid"
                               @click.stop.prevent="addClientMapping"
                               v-bind="attrs" v-on="on" color="accent" fab small
                               depressed>
                          <v-icon>fa-solid fa-plus</v-icon>
                        </v-btn>
                      </template>
                      Add
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
          <v-card outlined>
            <v-card-text>
              <h4>Selected Clients</h4>
              <v-data-table
                calculate-widths
                :headers="clientMappingHeaders"
                :items="currentClientMappings"
                :items-per-page="10"
                :loading="clientMappingsLoading"
                fixed-header
                loading-text="Fetching data. Please wait..."
                :footer-props="{
                                      showFirstLastPage: true,
                                      firstIcon : 'fas fa-angle-double-left',
                                      lastIcon:'fas fa-angle-double-right',
                                      nextIcon:'fas fa-angle-right',
                                      prevIcon:'fas fa-angle-left',
                                      itemsPerPageOptions:[10,25,-1]
                                      }"
              >
                <template v-slot:item.actions="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{attrs,on}">
                      <v-btn color="error" @click.stop.prevent="deleteClientMapping(item)" v-bind="attrs" v-on="on" fab
                             icon x-small>
                        <v-icon>fas fa-trash-alt</v-icon>
                      </v-btn>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="error"
            @click="mappedClientsDialog = false;viewingMappedClients=false;"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="updateClientMappings()"
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
          <v-toolbar-title>{{ editedTableItem.staffName }}'s Leave Details</v-toolbar-title>
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
          <v-card
            outlined
            class="mb-2"
          >
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1">
                  {{ editedTableItem.staffName }}
                </v-list-item-title>

                <span>{{ editedTableItem.categoryName ? editedTableItem.categoryName : "" }}</span><br>
                <span>{{ editedTableItem.email ? editedTableItem.email : "" }}</span>
                <span>{{ editedTableItem.phone ? editedTableItem.phone : "" }}</span>
              </v-list-item-content>
              <v-chip
                :color="filterMenuItems[0].color"
                class="ma-2"
                v-if="selectedFilterOption === 'A'"
                dark
                dense
              >
                Active
              </v-chip>
              <v-chip
                :color="filterMenuItems[2].color"
                class="ma-2"
                v-if="selectedFilterOption === 'H'"
                dark
                dense
              >
                Hold
              </v-chip>
              <v-chip
                :color="filterMenuItems[3].color"
                class="ma-2"
                v-if="selectedFilterOption === 'M'"
                dark
                dense
              >
                Missing
              </v-chip>
              <v-chip
                :color="filterMenuItems[4].color"
                class="ma-2"
                v-if="selectedFilterOption === 'P'"
                dark
                dense
              >
                Resign Pending
              </v-chip>
              <v-chip
                :color="filterMenuItems[5].color"
                class="ma-2"
                v-if="selectedFilterOption === 'R'"
                dark
                dense
              >
                Resigned
              </v-chip>
              <v-chip
                :color="filterMenuItems[1].color"
                class="ma-2"
                v-if="selectedFilterOption === 'I'"
                dark
                dense
              >
                Inactive
              </v-chip>
            </v-list-item>
          </v-card>
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
    <v-dialog scrollable max-width="50%" v-model="updateEmployeeStatusDialog">
      <v-card>
        <v-toolbar
          dark
          flat
          class="mb-6"
          color="primary"
        >
          <v-toolbar-title>Update {{ editedTableItem.staffName }}'s Status</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="updateEmployeeStatusDialog = false;"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-card
            outlined
            class="mb-2"
          >
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1">
                  {{ editedTableItem.staffName }}
                </v-list-item-title>

                <span>{{ editedTableItem.categoryName ? editedTableItem.categoryName : "" }}</span><br>
                <span>{{ editedTableItem.email ? editedTableItem.email : "" }}</span>
                <span>{{ editedTableItem.phone ? editedTableItem.phone : "" }}</span>
              </v-list-item-content>
              <v-chip
                :color="filterMenuItems[0].color"
                class="ma-2"
                v-if="selectedFilterOption === 'A'"
                dark
                dense
              >
                Active
              </v-chip>
              <v-chip
                :color="filterMenuItems[2].color"
                class="ma-2"
                v-if="selectedFilterOption === 'H'"
                dark
                dense
              >
                Hold
              </v-chip>
              <v-chip
                :color="filterMenuItems[3].color"
                class="ma-2"
                v-if="selectedFilterOption === 'M'"
                dark
                dense
              >
                Missing
              </v-chip>
              <v-chip
                :color="filterMenuItems[4].color"
                class="ma-2"
                v-if="selectedFilterOption === 'P'"
                dark
                dense
              >
                Resign Pending
              </v-chip>
              <v-chip
                :color="filterMenuItems[5].color"
                class="ma-2"
                v-if="selectedFilterOption === 'R'"
                dark
                dense
              >
                Resigned
              </v-chip>
              <v-chip
                :color="filterMenuItems[1].color"
                class="ma-2"
                v-if="selectedFilterOption === 'I'"
                dark
                dense
              >
                Inactive
              </v-chip>
            </v-list-item>
          </v-card>
          <v-container fluid>
            <v-row dense>
              <v-col cols="12">
                <v-radio-group
                  v-model="employeeStatusItem.activeStatus"
                  column
                >
                  <template v-for="(item) in filterMenuItems">
                    <v-radio
                      v-if="item.value !== 'I'"
                      :label="item.name"
                      :value="item.value"
                    ></v-radio>
                  </template>

                </v-radio-group>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="error"
            @click="updateEmployeeStatusDialog = false;"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="changeEmployeeStatus()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import VNepaliDatePicker from 'v-nepalidatepicker';
import {mapActions, mapGetters} from 'vuex'
import {validationMixin} from 'vuelidate';
import {required} from "vuelidate/lib/validators";
import NepaliDate from 'nepali-date-converter';

export default {
  mixins: [validationMixin],
  name: "EmployeeManagement",
  components: {
    VNepaliDatePicker,
  },
  validations: {
    editedItem: {
      vsNo: {required},
      staffName: {required},
      phone: {required},
      category: {required},
      dateOfBirth: {required},
      assignedHours: {required},
      basicHours: {required},
    },
    clientMappings: {
      newMapping: {
        client: {required}
      },
    },
  },
  data() {
    return {
      genderItems: [{name: "Male"}, {name: "Female"}, {name: "Other"}],
      allBloodGroups:
        [{name: "O +ve"}, {name: "O -ve"}, {name: "A +ve"}, {name: "A -ve"}, {name: "B +ve"}, {name: "B -ve"}, {name: "AB +ve"}, {name: "AB -ve"}],
      activeData: [],
      inactiveData: [],
      holdData: [],
      missingData: [],
      resignPendingData: [],
      resignedData: [],
      search: "",
      isLoading: false,
      editedItem: {
        activeStatus: "",
        vsNo: "",
        staffName: "",
        phone: "",
        dateOfBirth: "",
        permanentAddress: "",
        temporaryAddress: "",
        partTimeJoinDate: "",
        fullTimeJoinDate: "",
        resignDate: "",
        category: {
          activeStatus: "",
          name: ""
        },
        workstation: "",
        nonWorkingDays: "",
        useNepaliCalendar: false,
        assignedHours: null,
        basicHours: null,
        email: "",
        gender: "",
        employeeDetails: {
          activeStatus: "",
          accountNumber: "",
          ssfNo: "",
          panNumber: null,
          bank: {
            activeStatus: "",
            name: ""
          },
          bankBranch: "",
          basicSalary: null,
          dearnessAllowance: null,
          otherAllowance: null,
          specialAllowance: null,
          direnessAllowance: null,
          hardnessAllowance: null,
          overtimeRate: null,
          holidayRate: null
        },
        employeeEmergencyDetails: {
          bloodGroup: "",
          contactName: "",
          contactNumber: "",
          relation: "",
          photo: [],
          citizenship: []
        }
      },
      defaultItem: {
        activeStatus: "",
        vsNo: "",
        staffName: "",
        phone: "",
        dateOfBirth: "",
        permanentAddress: "",
        temporaryAddress: "",
        partTimeJoinDate: "",
        fullTimeJoinDate: "",
        resignDate: "",
        category: {
          activeStatus: "",
          name: ""
        },
        workstation: "",
        nonWorkingDays: "",
        useNepaliCalendar: false,
        assignedHours: null,
        basicHours: null,
        email: "",
        gender: "",
        employeeDetails: {
          activeStatus: "",
          accountNumber: "",
          ssfNo: "",
          panNumber: null,
          bank: {
            activeStatus: "",
            name: ""
          },
          bankBranch: "",
          basicSalary: null,
          dearnessAllowance: null,
          otherAllowance: null,
          specialAllowance: null,
          direnessAllowance: null,
          hardnessAllowance: null,
          overtimeRate: null,
          holidayRate: null
        },
        employeeEmergencyDetails: {
          bloodGroup: "",
          contactName: "",
          contactNumber: "",
          relation: "",
          photo: [],
          citizenship: []
        }
      },
      headers: [
        {text: "S.N.", value: "sno", width: "2%"},
        {text: "V.S. No.", value: "vsNo"},
        {text: "Staff Name", value: "staffName"},
        {text: "Phone", value: "phone"},
        {text: "Branch", value: "email"},
        {text: "Date of Birth", value: "dateOfBirth"},
        {text: "Gender", value: "gender"},
        {text: "Part Time Join Date", value: "partTimeJoinDate"},
        {text: "Full Time Join Date", value: "fullTimeJoinDate"},
        {text: "Designation", value: "categoryName"},
        {text: "Clients", value: "clients"},
        {text: "Assigned Hours", value: "assignedHours"},
        {text: "Basic Hours", value: "basicHours"},
        {text: "Status", value: "activeStatus"},
        {text: "Actions", value: "actions", width: "15%"},
      ],
      employeeDialog: false,
      editingEmployee: false,
      creatingEmployee: false,
      weekdays: [
        {id: 0, name: "sun"},
        {id: 1, name: "mon"},
        {id: 2, name: "tue"},
        {id: 3, name: "wed"},
        {id: 4, name: "thu"},
        {id: 5, name: "fri"},
        {id: 6, name: "sat"},
      ],
      allActiveCategory: [],
      allActiveBanks: [],
      step: "1",
      filterMenuItems: [
        {name: "Active", value: "A", color: "green"},
        {name: "Inactive", value: "I", color: "error"},
        {name: "Hold", value: "H", color: "warning"},
        {name: "Missing", value: "M", color: "error"},
        {name: "Resign Pending", value: "P", color: "warning"},
        {name: "Resigned", value: "R", color: "error"},
      ],
      selectedFilterOption: "A",
      viewingMappedClients: false,
      mappedClientsDialog: false,
      clientMappings: {
        addedMappings: [],
        removedMappings: [],
        newMapping: {
          client: {},
          employee: {},
        },
      },
      clientMappingsLoading: false,
      currentClientMappings: [],
      originalClientMappings: [],
      allActiveClients: [],
      clientMappingHeaders: [
        {text: "Client Name", value: "client.siteName"},
        {text: "Actions", value: "actions", width: "15%"},
      ],
      editedTableItem: {
        vsNo: "",
        staffName: "",
        email: "",
        categoryName: "",
        gender: "",
        phone: "",
        dateOfBirth: "",
        partTimeJoinDate: "",
        fullTimeJoinDate: "",
        assignedHours: null,
        basicHours: null,
        nonWorkingDays: "",
        useNepaliCalendar: false,
        clients: ""
      },
      viewLeaveDetailsDialog: false,
      leaveDetails: {
        allLeaves: [],
        allLeavesPreviousFiscalYear: [],
      },
      selectedNepaliYear: new NepaliDate().getYear(),
      selectedNepaliMonth: new NepaliDate().getMonth() + 1,
      updateEmployeeStatusDialog: false,
      selectedEmployeeStatus: "A",
      employeeStatusItem: {
        activeStatus: "A"
      }
    }
  },
  computed: {
    ...mapGetters("leave",["annualLeaves","sickLeaves","annualLeavesPreviousFiscalYear","sickLeavesPreviousFiscalYear","paidLeavesPreviousFiscalYear"]),
    ...mapGetters("auth", ["accessToken"]),
    annualLeaveDetails() {
      return this.validateLeave(true,
        this.editedTableItem.fullTimeJoinDate ? this.editedTableItem.fullTimeJoinDate : this.editedTableItem.partTimeJoinDate,
        this.selectedNepaliMonth, this.selectedNepaliYear, this.annualLeaves, this.annualLeavesPreviousFiscalYear,
        this.paidLeavesPreviousFiscalYear, 0);
    },

    sickLeaveDetails() {
      return this.validateLeave(false,
        this.editedTableItem.fullTimeJoinDate ? this.editedTableItem.fullTimeJoinDate : this.editedTableItem.partTimeJoinDate,
        this.selectedNepaliMonth, this.selectedNepaliYear, this.sickLeaves,
        this.sickLeavesPreviousFiscalYear, this.paidLeavesPreviousFiscalYear, 0);
    },
    tableItems() {
      switch (this.selectedFilterOption) {
        case "A":
          return this.activeDataWithSn
        case "I":
          return this.inactiveDataWithSn
        case "H":
          return this.holdDataWithSn
        case "M":
          return this.missingDataWithSn
        case "P":
          return this.resignPendingDataWithSn
        case "R":
          return this.resignedDataWithSn
        default:
          return this.activeDataWithSn
      }
    },
    nonWorkingDays: {
      get() {
        return this.editedItem.nonWorkingDays.split("")
      },
      set(newValue) {
        this.editedItem.nonWorkingDays = newValue.join("")
      }
    },
    activeDataWithSn() {
      return this.activeData.map((d, index) => (
        {...d, sno: index + 1}));
    },
    inactiveDataWithSn() {
      return this.inactiveData.map((d, index) => ({...d, sno: index + 1}))
    },
    holdDataWithSn() {
      return this.holdData.map((d, index) => ({...d, sno: index + 1}))
    },
    missingDataWithSn() {
      return this.missingData.map((d, index) => ({...d, sno: index + 1}))
    },
    resignPendingDataWithSn() {
      return this.resignPendingData.map((d, index) => ({...d, sno: index + 1}))
    },
    resignedDataWithSn() {
      return this.resignedData.map((d, index) => ({...d, sno: index + 1}))
    },
    allActiveClientsFiltered() {
      const temp = this;
      return this.allActiveClients.filter(item => {
        return !temp.currentClientMappings.find(x => x.client.id === item.id)
      })
    }
  },
  methods: {
    ...mapActions("api", ["makeGetRequest", "makePostRequest"]),
    ...mapActions("leave", ["getEmployeeLeaveDetails"]),
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "vsNo":
          !model.required && errors.push("V.S. No. is required.");
          break;
        case "staffName":
          !model.required && errors.push("Staff name is required");
          break;
        case "phone":
          !model.required && errors.push("Phone is required");
          break;
        case "category":
          !model.required && errors.push("Employee category must be selected");
          break;
        case "dateOfBirth":
          !model.required && errors.push("Date of birth is required");
          break;
        case "assignedHours":
          !model.required && errors.push("Hours per day is required");
          break;
        case "basicHours":
          !model.required && errors.push("Basic hours is required");
          break;
        case "client":
          !model.required && errors.push("Client must be selected");
          break;
        default:
          break;
      }
      return errors;
    },
    deleteItem(item) {
      const temp = this;
      this.editedTableItem = Object.assign({}, item);
      this.$root.confirm('Confirm Delete', 'Are you sure you want to delete ' + item.staffName + '?')
        .then((confirm) => {
          this.makePostRequest({
            route: "employee/hardDelete",
            data: {
              ...temp.editedTableItem
            }
          }).then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "Client deleted successfully"
              });
              this.getData();
            }
          })
        }).catch((error) => {
      });
    },
    editEmployee(item, editingEmployee) {
      let temp = this;
      this.editedTableItem = Object.assign({}, item);
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "employee/getById",
          params: {
            id: item.id
          }
        }
      ).then(response => {
          if (response.data.status === "OK") {
            if (!response.data.data.employeeEmergencyDetails) {
              response.data.data.employeeEmergencyDetails = {
                bloodGroup: "",
                contactName: "",
                contactNumber: "",
                relation: "",
                photo: [],
                citizenship: []
              }
            }
            if (!response.data.data.category) {
              response.data.data.category = {
                activeStatus: "",
                name: ""
              }
            }

            if (!response.data.data.employeeDetails) {
              response.data.data.employeeDetails = {
                activeStatus: "",
                accountNumber: "",
                ssfNo: "",
                panNumber: null,
                bank: {
                  activeStatus: "",
                  name: ""
                }
              }
            }
            if (!response.data.data.employeeDetails.bank) {
              response.data.data.employeeDetails.bank = {
                activeStatus: "",
                name: ""
              }
            }
            if (!response.data.data.employeeEmergencyDetails.photo) {
              response.data.data.employeeEmergencyDetails.photo = []
            }
            if (!response.data.data.employeeEmergencyDetails.citizenship) {
              response.data.data.employeeEmergencyDetails.citizenship = []
            }
            if (!response.data.data.partTimeJoinDate) {
              response.data.data.partTimeJoinDate = ""
            }
            if (!response.data.data.fullTimeJoinDate) {
              response.data.data.fullTimeJoinDate = ""
            }
            if (!response.data.data.resignDate) {
              response.data.data.resignDate = ""
            }
            if (!response.data.data.dateOfBirth) {
              response.data.data.dateOfBirth = ""
            }
            this.editedItem = response.data.data
            this.employeeDialog = true
            this.step = "1"
            if (editingEmployee) {
              this.editingEmployee = editingEmployee
            }
          }
        }
      ).catch((error) => {

      });
    }
    ,
    newEmployee(item, creatingEmployee) {
      this.editedItem = Object.assign({}, this.defaultItem)
      this.editedTableItem = Object.assign({}, item);
      this.employeeDialog = true
      this.step = "1"
      if (creatingEmployee) {
        this.creatingEmployee = creatingEmployee
      }
    }
    ,
    createEmployee() {
      let temp = this;
      this.$store.dispatch("api/makePostRequest",
        {
          route: "employee/registerNew",
          data: {
            vsNo: temp.editedItem.vsNo,
            staffName: temp.editedItem.staffName,
            email: temp.editedItem.email,
            phone: temp.editedItem.phone,
            dateOfBirth: temp.editedItem.dateOfBirth,
            gender: temp.editedItem.gender,
            permanentAddress: temp.editedItem.permanentAddress,
            temporaryAddress: temp.editedItem.temporaryAddress,
            partTimeJoinDate: temp.editedItem.partTimeJoinDate,
            fullTimeJoinDate: temp.editedItem.fullTimeJoinDate,
            resignDate: temp.editedItem.resignDate,
            category: temp.editedItem.category,
            nonWorkingDays: temp.editedItem.nonWorkingDays,
            assignedHours: temp.editedItem.assignedHours,
            basicHours: temp.editedItem.basicHours,
            employeeDetails: {
              accountNumber: temp.editedItem.employeeDetails.accountNumber,
              ssfNo: temp.editedItem.employeeDetails.ssfNo,
              panNumber: temp.editedItem.employeeDetails.panNumber,
              bankBranch: temp.editedItem.employeeDetails.bankBranch,
              basicSalary: temp.editedItem.employeeDetails.basicSalary,
              dearnessAllowance: temp.editedItem.employeeDetails.dearnessAllowance,
              otherAllowance: temp.editedItem.employeeDetails.otherAllowance,
              specialAllowance: temp.editedItem.employeeDetails.specialAllowance,
              direnessAllowance: temp.editedItem.employeeDetails.direnessAllowance,
              hardnessAllowance: temp.editedItem.employeeDetails.hardnessAllowance,
              overtimeRate: temp.editedItem.employeeDetails.overtimeRate,
              holidayRate: temp.editedItem.employeeDetails.holidayRate,
              bank: temp.editedItem.employeeDetails.bank,
            },
            employeeEmergencyDetails: {
              bloodGroup: temp.editedItem.employeeEmergencyDetails.bloodGroup,
              contactName: temp.editedItem.employeeEmergencyDetails.contactName,
              contactNumber: temp.editedItem.employeeEmergencyDetails.contactNumber,
              relation: temp.editedItem.employeeEmergencyDetails.relation,
              photo: temp.editedItem.employeeEmergencyDetails.photo,
              citizenship: temp.editedItem.employeeEmergencyDetails.citizenship,
            }
          }
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.$store.dispatch("toast/setSnackbar", {
            text: "Employee created successfully"
          })
          this.getData();
          this.employeeDialog = false;
          this.editingEmployee = false;
          this.creatingEmployee = false;
        }
      }).catch((error) => {

      });
    }
    ,
    updateEmployee() {
      const temp = this
      this.makePostRequest({
        route: "employee/update",
        data: {
          ...temp.editedItem
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          this.$store.dispatch("toast/setSnackbar", {
            text: "Employee details updated successfully"
          })
          this.getData();
          this.employeeDialog = false;
          this.editingEmployee = false;
        }
      }).catch((error) => {
      })
    }
    ,
    reactivateEmployee(item) {
      const temp = this;
      this.editedTableItem = Object.assign({}, item);
      this.$root.confirm(`Confirm`, `Are you sure you want to reactivate ${item.staffName}'s ?`)
        .then((confirm) => {
          this.makePostRequest({
            route: "employee/reactivate",
            data: {
              ...temp.editedTableItem
            }
          }).then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "Employee reactivated successfully."
              });
              this.getData();

            }
          })
        }).catch((error) => {
      });
    }
    ,
    navigateToMonthlyRoster(item) {
    }
    ,
    getAllActiveCategory() {
      let temp = this;

      this.$store.dispatch("api/makeGetRequest",
        {
          route: "category/getAll/active"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.allActiveCategory = response.data.data;
        }
      }).catch((error) => {
      });
    }
    ,
    getAllActiveClients() {
      let temp = this;
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "client/getAllActive"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.allActiveClients = response.data.data;
        }
      }).catch((error) => {
      });
    }
    ,
    getAllActiveBanks() {
      let temp = this;
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "bank/getAll/active"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.allActiveBanks = response.data.data;
        }
      }).catch((error) => {
      });
    }
    ,
    getData() {
      let temp = this;
      this.isLoading = true;
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "employee/getByStatusMini",
          params: {
            activeStatus: temp.selectedFilterOption
          }
        }
      ).then(response => {
        if (response.data.status === "OK") {
          switch (this.selectedFilterOption) {
            case "A":
              this.activeData = response.data.data
              break;
            case "I":
              this.inactiveData = response.data.data
              break;
            case "H":
              this.holdData = response.data.data
              break;
            case "M":
              this.missingData = response.data.data
              break;
            case "P":
              this.resignPendingData = response.data.data
              break;
            case "R":
              this.resignedData = response.data.data
              break;
            default:
              break;
          }
        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      });
    }
    ,
    navigateToSalaryDetails(item) {
    }
    ,
    viewMappedClients(item, viewingMappedClients) {
      this.editedTableItem = Object.assign({}, item);
      this.clientMappings = {
        addedMappings: [],
        removedMappings: [],
        newMapping: {
          client: {},
          employee: {},
        },
      }
      this.mappedClientsDialog = true;
      if (viewingMappedClients) {
        this.viewingMappedClients = viewingMappedClients;
      }
      this.clientMappingsLoading = true;
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "employee/clientMappings",
          params: {
            employeeId: item.id
          }
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.currentClientMappings = response.data.data;
          this.originalClientMappings = JSON.parse(JSON.stringify(response.data.data));
        }
        this.clientMappingsLoading = false;
      }).catch((error) => {
        this.clientMappingsLoading = false;
        this.mappedClientsDialog = false;
        this.viewingMappedClients = false;
      });
    }
    ,
    updateEmployeeStatus(item) {
      let temp = this;
      this.editedTableItem = Object.assign({}, item);
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "employee/getById",
          params: {
            id: item.id
          }
        }
      ).then(response => {
          if (response.data.status === "OK") {
            /*if (!response.data.data.employeeEmergencyDetails) {
              response.data.data.employeeEmergencyDetails = {
                bloodGroup: "",
                contactName: "",
                contactNumber: "",
                relation: "",
                photo: [],
                citizenship: []
              }
            }
            if (!response.data.data.category) {
              response.data.data.category = {
                activeStatus: "",
                name: ""
              }
            }

            if (!response.data.data.employeeDetails) {
              response.data.data.employeeDetails = {
                activeStatus: "",
                accountNumber: "",
                ssfNo: "",
                panNumber: null,
                bank: {
                  activeStatus: "",
                  name: ""
                }
              }
            }
            if (!response.data.data.employeeDetails.bank) {
              response.data.data.employeeDetails.bank = {
                activeStatus: "",
                name: ""
              }
            }
            if (!response.data.data.employeeEmergencyDetails.photo) {
              response.data.data.employeeEmergencyDetails.photo = []
            }
            if (!response.data.data.employeeEmergencyDetails.citizenship) {
              response.data.data.employeeEmergencyDetails.citizenship = []
            }
            if (!response.data.data.partTimeJoinDate) {
              response.data.data.partTimeJoinDate = ""
            }
            if (!response.data.data.fullTimeJoinDate) {
              response.data.data.fullTimeJoinDate = ""
            }
            if (!response.data.data.resignDate) {
              response.data.data.resignDate = ""
            }
            if (!response.data.data.dateOfBirth) {
              response.data.data.dateOfBirth = ""
            }*/
            this.employeeStatusItem = response.data.data
            this.updateEmployeeStatusDialog = true
          }
        }
      ).catch((error) => {
      });
    }
    ,
    viewLeaveDetails(item, viewingLeaveDetails) {
      this.editedTableItem = Object.assign({}, item);
      this.viewLeaveDetailsDialog = true;
      this.getEmployeeLeaveDetails(this.editedTableItem);
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
    cloneEmployee(item, cloningEmployee) {
      let temp = this;
      this.editedTableItem = Object.assign({}, item);
      this.$store.dispatch("api/makeGetRequest",
        {
          route: "employee/getById",
          params: {
            id: item.id
          }
        }
      ).then(response => {
          if (response.data.status === "OK") {
            let data = response.data.data;
            // this.editedItem=this.defaultItem;
          /*  this.editedItem.activeStatus = data.activeStatus ? data.activeStatus : "";
            this.editedItem.vsNo = data.vsNo ? data.vsNo : "";
            this.editedItem.staffName = data.staffName ? data.staffName : "";
            this.editedItem.phone = data.phone ? data.phone : "";
            this.editedItem.dateOfBirth = data.dateOfBirth ? data.dateOfBirth : "";
            this.editedItem.permanentAddress = data.permanentAddress ? data.permanentAddress : "";
            this.editedItem.temporaryAddress = data.temporaryAddress ? data.temporaryAddress : "";
            this.editedItem.partTimeJoinDate = data.partTimeJoinDate ? data.partTimeJoinDate : "";
            this.editedItem.fullTimeJoinDate = data.fullTimeJoinDate ? data.fullTimeJoinDate : "";
            this.editedItem.resignDate = data.resignDate ? data.resignDate : "";
            this.editedItem.category.activeStatus = data.category.activeStatus ? data.activeStatus : "";
            this.editedItem.category.name = data.category.name ? data.name : "";
            this.editedItem.workstation = data.workstation ? data.workstation : "";
            this.editedItem.nonWorkingDays = data.nonWorkingDays ? data.nonWorkingDays : "";
            this.editedItem.useNepaliCalendar = data.useNepaliCalendar ? data.useNepaliCalendar : false;
            this.editedItem.assignedHours = data.assignedHours ? data.assignedHours : null;
            this.editedItem.basicHours = data.basicHours ? data.basicHours : null;
            this.editedItem.email = data.email ? data.email : "";
            this.editedItem.gender = data.gender ? data.gender : "";
            this.editedItem.employeeDetails.activeStatus = data.employeeDetails.activeStatus ? data.employeeDetails.activeStatus : "";
            this.editedItem.employeeDetails.accountNumber = data.employeeDetails.accountNumber ? data.employeeDetails.accountNumber : "";
            this.editedItem.employeeDetails.ssfNo = data.employeeDetails.ssfNo ? data.employeeDetails.ssfNo : "";
            this.editedItem.employeeDetails.panNumber = data.employeeDetails.panNumber ? data.employeeDetails.panNumber : null;
            this.editedItem.employeeDetails.bank.activeStatus = data.employeeDetails.bank.activeStatus ? data.employeeDetails.bank.activeStatus : "";
            this.editedItem.employeeDetails.bank.name = data.employeeDetails.bank.name ? data.employeeDetails.bank.name : "";
            this.editedItem.employeeDetails.bankBranch = data.employeeDetails.bankBranch ? data.employeeDetails.bankBranch : "";
            this.editedItem.employeeDetails.basicSalary = data.employeeDetails.basicSalary ? data.employeeDetails.basicSalary : null;
            this.editedItem.employeeDetails.dearnessAllowance = data.employeeDetails.dearnessAllowance ? data.employeeDetails.dearnessAllowance : null;
            this.editedItem.employeeDetails.otherAllowance = data.employeeDetails.otherAllowance ? data.employeeDetails.otherAllowance : null;
            this.editedItem.employeeDetails.specialAllowance = data.employeeDetails.specialAllowance ? data.employeeDetails.specialAllowance : null;
            this.editedItem.employeeDetails.direnessAllowance = data.employeeDetails.direnessAllowance ? data.employeeDetails.direnessAllowance : null;
            this.editedItem.employeeDetails.hardnessAllowance = data.employeeDetails.hardnessAllowance ? data.employeeDetails.hardnessAllowance : null;
            this.editedItem.employeeDetails.overtimeRate = data.employeeDetails.overtimeRate ? data.employeeDetails.overtimeRate : null;
            this.editedItem.employeeDetails.holidayRate = data.employeeDetails.holidayRate ? data.employeeDetails.holidayRate : null;

            this.editedItem.employeeEmergencyDetails.bloodGroup = data.employeeEmergencyDetails.bloodGroup ? data.employeeEmergencyDetails.bloodGroup : "";
            this.editedItem.employeeEmergencyDetails.contactName = data.employeeEmergencyDetails.contactName ? data.employeeEmergencyDetails.contactName : "";
            this.editedItem.employeeEmergencyDetails.contactNumber = data.employeeEmergencyDetails.contactNumber ? data.employeeEmergencyDetails.contactNumber : "";
            this.editedItem.employeeEmergencyDetails.relation = data.employeeEmergencyDetails.relation ? data.employeeEmergencyDetails.relation : "";
            this.editedItem.employeeEmergencyDetails.photo = data.employeeEmergencyDetails.photo ? data.employeeEmergencyDetails.photo : "";
            this.editedItem.employeeEmergencyDetails.citizenship = data.employeeEmergencyDetails.citizenship ? data.employeeEmergencyDetails.citizenship : "";

*/
             if (!response.data.data.employeeEmergencyDetails) {
               response.data.data.employeeEmergencyDetails = {
                 bloodGroup: "",
                 contactName: "",
                 contactNumber: "",
                 relation: "",
                 photo: [],
                 citizenship: []
               }
             }
             if (!response.data.data.category) {
               response.data.data.category = {
                 activeStatus: "",
                 name: ""
               }
             }

             if (!response.data.data.employeeDetails) {
               response.data.data.employeeDetails = {
                 activeStatus: "",
                 accountNumber: "",
                 ssfNo: "",
                 panNumber: null,
                 bank: {
                   activeStatus: "",
                   name: ""
                 }
               }
             }
             if (!response.data.data.employeeDetails.bank) {
               response.data.data.employeeDetails.bank = {
                 activeStatus: "",
                 name: ""
               }
             }
             if (!response.data.data.employeeEmergencyDetails.photo) {
               response.data.data.employeeEmergencyDetails.photo = []
             }
             if (!response.data.data.employeeEmergencyDetails.citizenship) {
               response.data.data.employeeEmergencyDetails.citizenship = []
             }
             if (!response.data.data.partTimeJoinDate) {
               response.data.data.partTimeJoinDate = ""
             }
             if (!response.data.data.fullTimeJoinDate) {
               response.data.data.fullTimeJoinDate = ""
             }
             if (!response.data.data.resignDate) {
               response.data.data.resignDate = ""
             }
             if (!response.data.data.dateOfBirth) {
               response.data.data.dateOfBirth = ""
             }
            this.editedItem = response.data.data
            this.employeeDialog = true
            this.step = "1"
            if (cloningEmployee) {
              this.creatingEmployee = cloningEmployee
            }
          }
        }
      ).catch((error) => {

      });


    }
    ,
    deactivateEmployee(item) {
      const temp = this;
      this.editedTableItem = Object.assign({}, item);
      this.$root.confirm('Confirm Delete', 'Are you sure you want to deactivate ' + item.staffName + '?')
        .then((confirm) => {
          this.makePostRequest({
            route: "employee/delete",
            data: {
              ...temp.editedTableItem
            }
          }).then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "Client deactivated successfully"
              });
              this.getData();
            }
          })
        }).catch((error) => {
      });
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
    addClientMapping() {
      let data = {
        client: this.clientMappings.newMapping.client,
        employee: this.editedTableItem,
      }
      this.currentClientMappings.push(data);
      this.clientMappings.addedMappings.push(data);
      this.clientMappings.newMapping.client = {};
      this.clientMappings.newMapping.employee = {};

    },
    deleteClientMapping(data) {
      for (var i = 0; i < this.originalClientMappings.length; i++) {
        if (this.originalClientMappings[i].client.id === data.client.id) {
          this.clientMappings.removedMappings.push(data);
        }
      }
      for (var k = 0; k < this.currentClientMappings.length; k++) {
        if (this.currentClientMappings[k].client.id === data.client.id) {
          this.currentClientMappings.splice(k, 1);
        }
      }
      for (var j = 0; j < this.clientMappings.addedMappings.length; j++) {
        if (this.clientMappings.addedMappings[j].client.id === data.client.id) {
          this.clientMappings.addedMappings.splice(j, 1);
        }
      }
    },
    updateClientMappings() {
      const temp = this
      this.makePostRequest({
        route: "employee/clientMappings/update",
        data: {
          addedMappings: temp.clientMappings.addedMappings,
          removedMappings: temp.clientMappings.removedMappings
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          this.$store.dispatch("toast/setSnackbar", {
            text: "Client mappings updated successfully"
          })
          this.getData();
          this.mappedClientsDialog = false;
          this.viewingMappedClients = false;
        }
      }).catch((error) => {
      })
    },
    changeEmployeeStatus() {
      const temp = this;
      this.makePostRequest({
        route: "employee/updateStatus",
        data: {
          ...temp.employeeStatusItem
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          this.$store.dispatch("toast/setSnackbar", {
            text: "Employee status updated successfully"
          })
          this.getData();
          temp.updateEmployeeStatusDialog = false;
        }
      }).catch((error) => {
      })
    }
  }
  ,
  mounted() {
    this.getData();
    this.getAllActiveCategory();
    this.getAllActiveClients();
    this.getAllActiveBanks();
    this.$v.$touch();
  }
}
</script>

<style>
.nepali-datepicker {
  display: flex;
  min-height: 52px !important;
  width: 100% !important;
  padding: 0 12px;
  margin-bottom: 4px;
  align-items: stretch;
  border-radius: 5px 5px 0 0;
  background: rgba(0, 0, 0, 0.06);
  border-bottom: solid 1px #212121 !important;
}
</style>
