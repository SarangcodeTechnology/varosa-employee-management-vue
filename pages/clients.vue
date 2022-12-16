<template>
  <v-container fluid>
    <h2 style="font-weight: 700" class="mb-6">Client Management</h2>
    <v-card>
      <v-container fluid>
        <v-row
          v-if="!this.$store.state.printControl.isPrinting"
          justify="center"
        >
          <v-col cols="4">
            <v-text-field
              v-model="search"
              dense
              append-icon="fas fa-search"
              outlined
              label="Search..."
            ></v-text-field>
          </v-col>
          <v-col class="override-class" cols="auto">
            <v-select
              menu-props="auto"
              chips
              @input="getData()"
              solo
              flat
              dense
              :items="filterMenuItems"
              v-model="selectedFilterOption"
              label="Filter Data"
              item-text="name"
              item-value="value"
            >
              <template v-slot:selection="{ item }">
                <v-chip :color="item.color" dark>{{ item.name }}</v-chip>
              </template>
            </v-select>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn color="green" @click="toExcel" dark>
              <v-icon left>fas fa-file-excel</v-icon>
              Excel
            </v-btn>
            <v-btn dark @click="print">
              <v-icon left>fas fa-print</v-icon>
              Print
            </v-btn>
            <v-btn @click="newClient(defaultItem, true)" color="primary">
              <v-icon left>fas fa-plus</v-icon>
              Add New
            </v-btn>
          </v-col>
        </v-row>

        <v-data-table
          calculate-widths
          @click:row="(item) => editClient(item, false)"
          :headers="headers"
          :items="tableItems"
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
        >
          <template v-slot:item.actions="{ item }">
            <div class="d-flex justify-content-center align-items-center">
              <v-tooltip bottom>
                <template v-slot:activator="{ attrs, on }">
                  <v-btn
                    @click.stop.prevent="editClient(item, false)"
                    v-bind="attrs"
                    v-on="on"
                    fab
                    icon
                    x-small
                  >
                    <v-icon>fas fa-eye</v-icon>
                  </v-btn>
                </template>
                <span>View Client</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{ attrs, on }">
                  <v-btn
                    @click.stop.prevent="editClient(item, true)"
                    v-bind="attrs"
                    v-on="on"
                    fab
                    icon
                    x-small
                  >
                    <v-icon>fas fa-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit Client</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{ attrs, on }">
                  <v-btn
                    @click.stop.prevent="navigateToMonthlyRoster(item)"
                    v-bind="attrs"
                    v-on="on"
                    fab
                    icon
                    x-small
                  >
                    <v-icon>fa-solid fa-calendar-days</v-icon>
                  </v-btn>
                </template>
                <span>Navigate to Monthly Roster</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{ attrs, on }">
                  <v-btn
                    @click.stop.prevent="viewEmployeeCategories(item, true)"
                    v-bind="attrs"
                    v-on="on"
                    fab
                    icon
                    x-small
                  >
                    <v-icon>fa-solid fa-grip</v-icon>
                  </v-btn>
                </template>
                <span>View Employee Categories</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{ attrs, on }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    color="error"
                    fab
                    icon
                    x-small
                    @click.stop.prevent="deleteItem(item)"
                  >
                    <v-icon>fas fa-trash-alt</v-icon>
                  </v-btn>
                </template>
                <span>Delete Client</span>
              </v-tooltip>
              <v-tooltip v-if="!activeStatus" bottom>
                <template v-slot:activator="{ attrs, on }">
                  <v-btn
                    @click.stop.prevent="reactivateClient(item)"
                    v-bind="attrs"
                    v-on="on"
                    fab
                    icon
                    x-small
                  >
                    <v-icon>fas fa-user-lock</v-icon>
                  </v-btn>
                </template>
                <span>Reactivate Client</span>
              </v-tooltip>
            </div>
          </template>
          <template v-slot:item.activeStatus="{ item }">
            <v-chip
              color="green"
              class="ma-2"
              v-if="item.activeStatus === 'A'"
              dark
              dense
            >
              Active
            </v-chip>
            <v-chip color="red" class="ma-2" v-else dark dense>
              Inactive
            </v-chip>
          </template>
        </v-data-table>
      </v-container>
    </v-card>
    <v-dialog
      scrollable
      max-width="50%"
      :persistent="editingClient || creatingClient"
      v-model="clientDialog"
    >
      <v-card>
        <v-toolbar dark flat class="mb-6" color="primary">
          <v-toolbar-title>Client Details</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="
                clientDialog = false;
                editingClient = false;
                creatingClient = false;
              "
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-alert type="error" v-if="$v.editedItem.$invalid" elevation="2">
            Some required fields are missing. Please check for all errors before
            proceeding.
          </v-alert>
          <v-card v-if="!creatingClient" outlined class="mb-2">
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1">
                  {{ editedItem.siteName }}
                </v-list-item-title>
                <span>{{ editedItem.branch ? editedItem.branch : "" }}</span
                ><br />
                <span>{{ editedItem.address ? editedItem.address : "" }}</span
                ><br />
                <span>{{ editedItem.email ? editedItem.email : "" }}</span>
                <span>{{ editedItem.phone ? editedItem.phone : "" }}</span>
              </v-list-item-content>

              <v-chip
                color="green"
                class="ma-2"
                v-if="editedItem.activeStatus === 'A'"
                dark
                dense
              >
                Active
              </v-chip>
              <v-chip color="red" class="ma-2" v-else dark dense>
                Inactive
              </v-chip>
            </v-list-item>
          </v-card>
          <v-stepper outlined v-model="step">
            <v-stepper-header class="elevation-0 ma-0 pa-0">
              <v-container fluid>
                <v-row align="center">
                  <v-col cols="auto">
                    <v-stepper-step
                      style="height: 20px"
                      color="accent"
                      :editable="!creatingClient"
                      step="1"
                    >
                      Client Details
                    </v-stepper-step>
                  </v-col>
                  <v-divider></v-divider>
                  <v-col cols="auto">
                    <v-stepper-step
                      style="height: 20px"
                      color="accent"
                      :editable="!creatingClient"
                      step="2"
                    >
                      Client Settings
                    </v-stepper-step>
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col cols="auto">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ attrs, on }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          fab
                          x-small
                          color="primary"
                          @click="step = (parseInt(step) - 1).toString()"
                          :disabled="step === '1'"
                        >
                          <v-icon>fa-solid fa-angle-left</v-icon>
                        </v-btn>
                      </template>
                      <span>Previous</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ attrs, on }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          fab
                          x-small
                          color="primary"
                          @click="step = (parseInt(step) + 1).toString()"
                          :disabled="
                            ($v.editedItem.$invalid && !editingClient) ||
                            step === '2'
                          "
                        >
                          <v-icon>fa-solid fa-angle-right</v-icon>
                        </v-btn>
                      </template>
                      <span>Next</span>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-container>
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content class="ma-0 pa-0" step="1">
                <v-container fluid>
                  <v-row dense>
                    <v-col cols="6">
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-user"
                        :readonly="!editingClient && !creatingClient"
                        dense
                        filled
                        label="Name*"
                        v-model="editedItem.siteName"
                        :error-messages="
                          getErrors('siteName', $v.editedItem.siteName)
                        "
                        @blur="$v.editedItem.siteName.$touch()"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-building"
                        :readonly="!editingClient && !creatingClient"
                        dense
                        filled
                        label="Branch"
                        v-model="editedItem.branch"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-location-dot"
                        :readonly="!editingClient && !creatingClient"
                        dense
                        filled
                        label="Address*"
                        v-model="editedItem.address"
                        :error-messages="
                          getErrors('address', $v.editedItem.address)
                        "
                        @blur="$v.editedItem.address.$touch()"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="6">
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-envelope"
                        :readonly="!editingClient && !creatingClient"
                        dense
                        filled
                        label="Email"
                        v-model="editedItem.email"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-phone"
                        :readonly="!editingClient && !creatingClient"
                        dense
                        filled
                        label="Phone*"
                        v-model="editedItem.phone"
                        :error-messages="
                          getErrors('phone', $v.editedItem.phone)
                        "
                        @blur="$v.editedItem.phone.$touch()"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-clock"
                        :readonly="!editingClient && !creatingClient"
                        dense
                        filled
                        label="Monthly Hours"
                        v-model="editedItem.monthlyHours"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-stepper-content>
              <v-stepper-content class="ma-0 pa-0" step="2">
                <v-container fluid>
                  <v-row dense>
                    <v-card width="100%" outlined class="mb-2">
                      <v-container fluid>
                        <v-row no-gutters>
                          <v-col cols="12">
                            <h5>Non Working Days</h5>
                          </v-col>
                          <v-col
                            class="mr-2"
                            v-for="(weekday, i) in weekdays"
                            :key="i"
                            cols="auto"
                          >
                            <v-checkbox
                              :readonly="!editingClient && !creatingClient"
                              :label="weekday.name"
                              :value="weekday.id.toString()"
                              v-model="nonWorkingDays"
                              multiple
                            >
                            </v-checkbox>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card>
                  </v-row>
                  <v-row dense>
                    <v-col cols="6">
                      <v-checkbox
                        :readonly="!editingClient && !creatingClient"
                        label="Use Nepali Calendar"
                        v-model="editedItem.useNepaliCalendar"
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="6">
                      <v-checkbox
                        :readonly="!editingClient && !creatingClient"
                        label="Has Public Holiday"
                        v-model="editedItem.useHoliday"
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="6">
                      <v-checkbox
                        :readonly="!editingClient && !creatingClient"
                        label="Use Replacement"
                        v-model="editedItem.useReplacement"
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="6">
                      <v-checkbox
                        :readonly="!editingClient && !creatingClient"
                        label="Use Uniform"
                        v-model="editedItem.useUniform"
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="12">
                      <v-checkbox
                        :readonly="!editingClient && !creatingClient"
                        label="Has Lunch"
                        v-model="editedItem.useLunch"
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-dollar-sign"
                        :readonly="!editingClient && !creatingClient"
                        dense
                        filled
                        label="Overtime Rate"
                        v-model="editedItem.overtimeRate"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        prepend-inner-icon="fa-solid fa-hand-holding-usd"
                        :readonly="!editingClient && !creatingClient"
                        dense
                        filled
                        label="Holiday Rate"
                        v-model="editedItem.holidayRate"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card-text>
        <v-card-actions v-if="editingClient || creatingClient">
          <v-spacer />
          <v-btn
            color="error"
            @click="
              clientDialog = false;
              editingClient = false;
              creatingClient = false;
            "
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="
              (creatingClient && step !== '2') || $v.editedItem.$invalid
            "
            @click="creatingClient ? createClient() : updateClient()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      scrollable
      max-width="50%"
      :persistent="viewingEmployeeCategories"
      v-model="employeeCategoriesDialog"
    >
      <v-card>
        <v-toolbar dark flat class="mb-6" color="primary">
          <v-toolbar-title>Employee Categories</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="
                employeeCategoriesDialog = false;
                viewingEmployeeCategories = false;
              "
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-card outlined class="mb-2">
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1">
                  {{ editedItem.siteName }}
                </v-list-item-title>
                <span>{{ editedItem.branch ? editedItem.branch : "" }}</span
                ><br />
                <span>{{ editedItem.address ? editedItem.address : "" }}</span
                ><br />
                <span>{{ editedItem.email ? editedItem.email : "" }}</span>
                <span>{{ editedItem.phone ? editedItem.phone : "" }}</span>
              </v-list-item-content>

              <v-chip
                color="green"
                class="ma-2"
                v-if="editedItem.activeStatus === 'A'"
                dark
                dense
              >
                Active
              </v-chip>
              <v-chip color="red" class="ma-2" v-else dark dense>
                Inactive
              </v-chip>
            </v-list-item>
          </v-card>
          <v-card outlined class="mb-2">
            <v-card-text>
              <h4>Add Category</h4>
              <v-container fluid>
                <v-row dense>
                  <v-col cols="7">
                    <v-autocomplete
                      outlined
                      dense
                      :items="allActiveCategoryFiltered"
                      v-model="employeeMappings.newMapping.category"
                      label="Employee Category"
                      item-text="name"
                      return-object
                      :error-messages="
                        getErrors(
                          'category',
                          $v.employeeMappings.newMapping.category
                        )
                      "
                      @blur="$v.employeeMappings.newMapping.category.$touch()"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      v-model="employeeMappings.newMapping.quantity"
                      label="Number"
                      type="number"
                      outlined
                      dense
                      :error-messages="
                        getErrors(
                          'quantity',
                          $v.employeeMappings.newMapping.quantity
                        )
                      "
                      @blur="$v.employeeMappings.newMapping.quantity.$touch()"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ attrs, on }">
                        <v-btn
                          :disabled="$v.employeeMappings.newMapping.$invalid"
                          @click.stop.prevent="addEmployeeCategory"
                          v-bind="attrs"
                          v-on="on"
                          color="accent"
                          fab
                          small
                          depressed
                        >
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
              <h4>Selected Categories</h4>
              <v-data-table
                calculate-widths
                :headers="employeeHeaders"
                :items="currentClientCategoryMappings"
                :items-per-page="10"
                :loading="employeeMappingsLoading"
                fixed-header
                loading-text="Fetching data. Please wait..."
                :footer-props="{
                  showFirstLastPage: true,
                  firstIcon: 'fas fa-angle-double-left',
                  lastIcon: 'fas fa-angle-double-right',
                  nextIcon: 'fas fa-angle-right',
                  prevIcon: 'fas fa-angle-left',
                  itemsPerPageOptions: [10, 25, -1],
                }"
              >
                <template v-slot:item.actions="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ attrs, on }">
                      <v-btn
                        color="error"
                        @click.stop.prevent="deleteCategory(item)"
                        v-bind="attrs"
                        v-on="on"
                        fab
                        icon
                        x-small
                      >
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
          <v-spacer />
          <v-btn
            color="error"
            @click="
              employeeCategoriesDialog = false;
              viewingEmployeeCategories = false;
            "
          >
            Cancel
          </v-btn>
          <v-btn color="primary" @click="updateClientEmployeeDetails()">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import helpers from "../helpers";

export default {
  mixins: [validationMixin],
  name: "ClientManagement",
  validations: {
    editedItem: {
      siteName: { required },
      address: { required },
      phone: { required },
    },
    employeeMappings: {
      newMapping: {
        category: { required },
        quantity: { required },
      },
    },
  },
  data() {
    return {
      activeStatus: true,
      activeData: [],
      inactiveData: [],
      search: "",
      isLoading: false,
      editedItem: {
        activeStatus: "",
        siteName: "",
        branch: "",
        address: "",
        email: "",
        phone: "",
        nonWorkingDays: "",
        monthlyHours: null,
        useNepaliCalendar: false,
        useHoliday: false,
        useLunch: false,
        useUniform: false,
        useReplacement: false,
        holidayRate: "",
        overtimeRate: "",
      },
      defaultItem: {
        activeStatus: "",
        siteName: "",
        branch: "",
        address: "",
        email: "",
        phone: "",
        nonWorkingDays: "",
        monthlyHours: null,
        useNepaliCalendar: false,
        useHoliday: false,
        useLunch: false,
        useUniform: false,
        useReplacement: false,
        holidayRate: "",
        overtimeRate: "",
      },
      headers: [
        { text: "S.N.", value: "sno", width: "2%" },
        { text: "Site Name", value: "siteName" },
        { text: "Branch", value: "branch" },
        { text: "Address", value: "address" },
        { text: "E-mail", value: "email" },
        { text: "Contact No.", value: "phone" },
        { text: "Status", value: "activeStatus", width: "5%" },
        { text: "Actions", value: "actions", width: "15%" },
      ],
      employeeHeaders: [
        { text: "Employee Category", value: "category.name" },
        { text: "No. of Employees", value: "quantity" },
        { text: "Actions", value: "actions", width: "15%" },
      ],
      clientDialog: false,
      editingClient: false,
      creatingClient: false,
      weekdays: [
        { id: 0, name: "sun" },
        { id: 1, name: "mon" },
        { id: 2, name: "tue" },
        { id: 3, name: "wed" },
        { id: 4, name: "thu" },
        { id: 5, name: "fri" },
        { id: 6, name: "sat" },
      ],
      allActiveCategory: [],
      currentClientCategoryMappings: [],
      step: "1",
      viewingEmployeeCategories: false,
      employeeCategoriesDialog: false,
      employeeMappings: {
        addedMappings: [],
        removedMappings: [],
        newMapping: {
          category: {},
          quantity: "",
        },
      },
      employeeMappingsLoading: false,
      originalClientCategoryMappings: [],
      filterMenuItems: [
        { name: "Active", value: "A", color: "green" },
        { name: "Inactive", value: "I", color: "error" },
      ],
      selectedFilterOption: "A",
    };
  },
  computed: {
    tableItems() {
      switch (this.selectedFilterOption) {
        case "A":
          return this.activeDataWithSn;
        case "I":
          return this.inactiveDataWithSn;
        default:
          return this.activeDataWithSn;
      }
    },
    nonWorkingDays: {
      get() {
        return this.editedItem.nonWorkingDays.split("");
      },
      set(newValue) {
        this.editedItem.nonWorkingDays = newValue.join("");
      },
    },
    ...mapGetters("auth", ["accessToken"]),
    activeDataWithSn() {
      return this.activeData.map((d, index) => ({ ...d, sno: index + 1 }));
    },
    inactiveDataWithSn() {
      return this.inactiveData.map((d, index) => ({ ...d, sno: index + 1 }));
    },
    allActiveCategoryFiltered() {
      const temp = this;
      return this.allActiveCategory.filter((item) => {
        return !temp.currentClientCategoryMappings.find(
          (x) => x.category.id === item.id
        );
      });
    },
  },
  methods: {
    print(){
      helpers.print(this.$store)  ;
    },
    responseGetter() {
      const temp = this;
      return this.$store.dispatch("api/makeGetRequest", {
        route: "client/getAll" + (temp.activeStatus ? "Active" : "Inactive"),
      });
    },
    async toExcel() {
      try {
        await helpers.jsonToExcel({
          fileName: "Clients",
          sheetName: "Clients= " + (this.activeStatus ? "Active" : "Inactive"),
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
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "siteName":
          !model.required && errors.push("Site name is required.");
          break;
        case "address":
          !model.required && errors.push("Address is required");
          break;
        case "phone":
          !model.required && errors.push("Phone is required");
          break;
        case "category":
          !model.required && errors.push("Employee category must be selected");
          break;
        case "quantity":
          !model.required && errors.push("Quantity is required");
          break;
        default:
          break;
      }
      return errors;
    },
    getActiveData() {
      let temp = this;
      this.isLoading = true;

      this.$store
        .dispatch("api/makeGetRequest", {
          route: "client/getAllActive",
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.activeData = response.data.data;
          }
          this.isLoading = false;
        })
        .catch((error) => {
          this.isLoading = false;
        });
    },
    getInactiveData() {
      this.isLoading = true;
      this.$store
        .dispatch("api/makeGetRequest", {
          route: "client/getAllInactive",
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.inactiveData = response.data.data;
          }
          this.isLoading = false;
        })
        .catch((error) => {
          this.isLoading = false;
        });
    },
    deleteItem(item) {
      const temp = this;
      this.editedItem = Object.assign({}, item);
      this.$root
        .confirm(
          "Confirm Delete",
          "Are you sure you want to delete " + item.siteName + "?"
        )
        .then((confirm) => {
          this.makePostRequest({
            route: "client/delete",
            data: {
              ...temp.editedItem,
            },
          }).then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "Client deleted successfully",
              });
              this.getActiveData();
              this.getInactiveData();
            }
          });
        })
        .catch((error) => {});
    },
    editClient(item, editingClient) {
      this.editedItem = Object.assign({}, item);
      this.clientDialog = true;
      this.step = "1";
      if (editingClient) {
        this.editingClient = editingClient;
      }
    },
    newClient(item, creatingClient) {
      this.editedItem = Object.assign({}, item);
      this.clientDialog = true;
      this.step = "1";
      if (creatingClient) {
        this.creatingClient = creatingClient;
      }
    },
    createClient() {
      const temp = this;
      this.makePostRequest({
        route: "client/registerNew",
        data: {
          siteName: temp.editedItem.siteName,
          branch: temp.editedItem.branch,
          address: temp.editedItem.address,
          email: temp.editedItem.email,
          phone: temp.editedItem.phone,
          nonWorkingDays: temp.editedItem.nonWorkingDays,
          monthlyHours: temp.editedItem.monthlyHours,
          useNepaliCalendar: temp.editedItem.useNepaliCalendar,
          useHoliday: temp.editedItem.useHoliday,
          useLunch: temp.editedItem.useLunch,
          useUniform: temp.editedItem.useUniform,
          useReplacement: temp.editedItem.useReplacement,
          holidayRate: temp.editedItem.holidayRate,
          overtimeRate: temp.editedItem.overtimeRate,
        },
      })
        .then((response) => {
          if (response.data.status === "OK") {
            this.$store.dispatch("toast/setSnackbar", {
              text: "Client created successfully",
            });
            this.getActiveData();
            this.clientDialog = false;
            this.editingClient = false;
          }
        })
        .catch((error) => {});
    },
    updateClient() {
      const temp = this;
      this.makePostRequest({
        route: "client/update",
        data: {
          ...temp.editedItem,
        },
      })
        .then((response) => {
          if (response.data.status === "OK") {
            this.$store.dispatch("toast/setSnackbar", {
              text: "Client details updated successfully",
            });
            this.getActiveData();
            this.clientDialog = false;
            this.editingClient = false;
          }
        })
        .catch((error) => {});
    },
    reactivateClient(item) {
      const temp = this;
      this.editedItem = Object.assign({}, item);
      this.$root
        .confirm(
          `Confirm`,
          `Are you sure you want to reactivate ${item.siteName}'s ?`
        )
        .then((confirm) => {
          this.makePostRequest({
            route: "client/reactivate",
            data: {
              ...temp.editedItem,
            },
          }).then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "Client reactivated successfully.",
              });
              this.getActiveData();
              this.getInactiveData();
            }
          });
        })
        .catch((error) => {});
    },
    navigateToMonthlyRoster(item) {},
    getAllActiveCategory() {
      let temp = this;
      this.isLoading = true;

      this.$store
        .dispatch("api/makeGetRequest", {
          route: "category/getAll/active",
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.allActiveCategory = response.data.data;
          }
          this.isLoading = false;
        })
        .catch((error) => {
          this.isLoading = false;
        });
    },
    viewEmployeeCategories(item, viewingEmployeeCategories) {
      this.editedItem = Object.assign({}, item);
      this.employeeMappings = {
        addedMappings: [],
        removedMappings: [],
        newMapping: {
          category: {},
          quantity: "",
        },
      };
      this.employeeCategoriesDialog = true;
      if (viewingEmployeeCategories) {
        this.viewingEmployeeCategories = viewingEmployeeCategories;
      }
      this.employeeMappingsLoading = true;
      this.$store
        .dispatch("api/makeGetRequest", {
          route: "client/categoryMappings",
          params: {
            clientId: item.id,
          },
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.currentClientCategoryMappings = response.data.data;
            this.originalClientCategoryMappings = JSON.parse(
              JSON.stringify(response.data.data)
            );
          }
          this.employeeMappingsLoading = false;
        })
        .catch((error) => {
          this.employeeMappingsLoading = false;
          this.employeeCategoriesDialog = false;
          this.viewingEmployeeCategories = false;
        });
    },
    updateClientEmployeeDetails() {
      const temp = this;
      this.makePostRequest({
        route: "client/categoryMappings/update",
        data: {
          addedMappings: temp.employeeMappings.addedMappings,
          removedMappings: temp.employeeMappings.removedMappings,
        },
      })
        .then((response) => {
          if (response.data.status === "OK") {
            this.$store.dispatch("toast/setSnackbar", {
              text: "Employee mappings updated successfully",
            });
            this.getActiveData();
            this.employeeCategoriesDialog = false;
            this.viewingEmployeeCategories = false;
          }
        })
        .catch((error) => {});
    },
    deleteCategory(data) {
      for (var i = 0; i < this.originalClientCategoryMappings.length; i++) {
        if (
          this.originalClientCategoryMappings[i].category.id ===
          data.category.id
        ) {
          this.employeeMappings.removedMappings.push(data);
        }
      }
      for (var k = 0; k < this.currentClientCategoryMappings.length; k++) {
        if (
          this.currentClientCategoryMappings[k].category.id === data.category.id
        ) {
          this.currentClientCategoryMappings.splice(k, 1);
        }
      }
      for (var j = 0; j < this.employeeMappings.addedMappings.length; j++) {
        if (
          this.employeeMappings.addedMappings[j].category.id ===
          data.category.id
        ) {
          this.employeeMappings.addedMappings.splice(j, 1);
        }
      }
    },
    addEmployeeCategory() {
      let data = {
        category: this.employeeMappings.newMapping.category,
        clientId: this.editedItem.id,
        quantity: this.employeeMappings.newMapping.quantity,
      };
      this.currentClientCategoryMappings.push(data);
      this.employeeMappings.addedMappings.push(data);
      this.employeeMappings.newMapping.category = {};
      this.employeeMappings.newMapping.quantity = "";
    },
    getData() {
      switch (this.selectedFilterOption) {
        case "A":
          this.activeStatus = true;
          this.getActiveData();
          break;
        case "I":
          this.activeStatus = false;
          this.getInactiveData();
          break;
        default:
          this.activeStatus = true;
          return this.getActiveData();
      }
    },
  },
  mounted() {
    this.getActiveData();
    this.getAllActiveCategory();
    this.$v.$touch();
  },
};
</script>

<style scoped></style>
