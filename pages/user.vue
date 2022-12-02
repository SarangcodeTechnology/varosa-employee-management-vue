<template>
  <v-container fluid>
    <h2 style="font-weight: 700;" class="mb-6">User Management</h2>
    <v-card>
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="4">
            <v-text-field v-model="search" dense append-icon="fas fa-search" outlined
                          label="Search..."></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-select menu-props="auto" chips @input="getData(selectedFilterOption)" solo flat
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
            <v-btn @click="newUser(defaultItem,true)" color="primary">
              <v-icon left>fas fa-plus</v-icon>
              Add New
            </v-btn>
          </v-col>
        </v-row>


        <v-data-table
          calculate-widths
          @click:row="(item)=>editUser(item,false)"
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
                  <v-btn @click.stop.prevent="editUser(item,false)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-eye</v-icon>
                  </v-btn>
                </template>
                <span>View User</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="editUser(item,true)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit User</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="getFunctionalitiesByUser(item,true)" v-bind="attrs" v-on="on" fab icon
                         x-small>
                    <v-icon>fas fa-briefcase</v-icon>
                  </v-btn>
                </template>
                <span>Manage Functionalities</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="viewMappedClients(item,true)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-project-diagram</v-icon>
                  </v-btn>
                </template>
                <span>View Mapped Clients</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="resetPassword(item)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-key</v-icon>
                  </v-btn>
                </template>
                <span>Reset Password</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" color="error" fab icon x-small @click.stop.prevent="deleteItem(item)">
                    <v-icon>fas fa-trash-alt</v-icon>
                  </v-btn>
                </template>
                <span>Delete User</span>
              </v-tooltip>
              <v-tooltip v-if="!activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click.stop.prevent="reactivateUser(item)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-user-lock</v-icon>
                  </v-btn>
                </template>
                <span>Reactivate Account</span>
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
            <v-chip
              color="red"
              class="ma-2"
              v-else
              dark
              dense
            >
              Inactive
            </v-chip>
          </template>
        </v-data-table>
      </v-container>
    </v-card>
    <v-dialog scrollable max-width="50%" :persistent="editingUser||creatingUser" v-model="userDialog">
      <v-card>
        <v-toolbar
          dark
          flat
          class="mb-6"
          color="primary"
        >

          <v-toolbar-title>User Details</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="userDialog = false;editingUser=false;creatingUser=false"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-card
            v-if="!creatingUser"
            outlined
          >
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1">
                  {{ editedItem.name }}
                </v-list-item-title>
                <span>{{ editedItem.email ? editedItem.email : "" }}</span><br>
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
              <v-chip
                color="red"
                class="ma-2"
                v-else
                dark
                dense
              >
                Inactive
              </v-chip>
            </v-list-item>
          </v-card>

          <v-container>
            <v-row dense>
              <v-col cols=6>
                <v-text-field
                  prepend-inner-icon="fa-solid fa-user"
                  :readonly="!editingUser && !creatingUser"
                  dense
                  filled
                  label="Name*"
                  v-model="editedItem.name"
                ></v-text-field>
              </v-col>
              <v-col cols=6>
                <v-text-field
                  prepend-inner-icon="fa-solid fa-envelope"
                  :readonly="!editingUser && !creatingUser"
                  dense
                  filled
                  label="Email*"
                  v-model="editedItem.email"
                ></v-text-field>
              </v-col>
              <v-col cols=6>
                <v-text-field
                  prepend-inner-icon="fa-solid fa-phone"
                  :readonly="!editingUser && !creatingUser"
                  dense
                  filled
                  label="Phone"
                  v-model="editedItem.phone"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  :readonly="!editingUser && !creatingUser"
                  v-model="editedItem.restrictAccessToClients"
                  label="Restrict access to clients"
                ></v-checkbox>
              </v-col>
              <template v-if="creatingUser">
                <v-col cols="12">
                  <v-checkbox
                    v-model="editedItem.setPasswordByAdmin"
                    label="Set password by Admin"
                  ></v-checkbox>
                </v-col>
                <v-col v-if="editedItem.setPasswordByAdmin" cols="6">
                  <v-text-field
                    dense
                    filled
                    label="Password"
                    v-model="editedItem.password"
                    :append-icon="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Enter your password here..."
                    @click:append="showPassword = !showPassword"
                    prepend-inner-icon="fas fa-key"
                  ></v-text-field>
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions v-if="editingUser || creatingUser">
          <v-spacer/>
          <v-btn
            color="error"
            @click="userDialog = false;editingUser=false;creatingUser=false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="creatingUser?createUser():updateUser()"
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
          <v-toolbar-title>{{ editedItem.staffName }}'s Clients</v-toolbar-title>
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
                  {{ editedItem.staffName }}
                </v-list-item-title>

                <span>{{ editedItem.categoryName ? editedItem.categoryName : "" }}</span><br>
                <span>{{ editedItem.email ? editedItem.email : "" }}</span>
                <span>{{ editedItem.phone ? editedItem.phone : "" }}</span>
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
    <v-dialog scrollable max-width="50%" :persistent="editingFunctionalities" v-model="functionalitiesDialog">
      <v-card>
        <v-toolbar
          dark
          flat
          class="mb-6"
          color="primary"
        >

          <v-toolbar-title>Manage Functionalities</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              icon
              @click="functionalitiesDialog = false;editingFunctionalities=false;"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-card
            outlined
          >
            <v-list-item three-line>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-1">
                  {{ editedItem.name }}
                </v-list-item-title>
                <span>{{ editedItem.email ? editedItem.email : "" }}</span><br>
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
              <v-chip
                color="red"
                class="ma-2"
                v-else
                dark
                dense
              >
                Inactive
              </v-chip>
            </v-list-item>
          </v-card>
          <v-container fluid>
            <v-row>
              <v-col cols="6">
                <v-checkbox v-for="(functionality,i) in allUserFunctionalities" :key="i" v-if="i<6"
                            :label="functionality.name" :value="functionality.id.toString()"
                            v-model="editedFunctionalities" multiple>
                </v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox v-for="(functionality,i) in allUserFunctionalities" :key="i" v-if="i>=6"
                            :label="functionality.name" :value="functionality.id.toString()"
                            v-model="editedFunctionalities" multiple>
                </v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="error"
            @click="functionalitiesDialog = false;editingFunctionalities=false;"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="updateFunctionalities()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
import {validationMixin} from 'vuelidate';
import {required} from "vuelidate/lib/validators";

export default {
  mixins: [validationMixin],
  name: "UserManagement",
  validations: {
    clientMappings: {
      newMapping: {
        client: {required}
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
        email: "",
        name: "",
        password: "",
        phone: "",
        restrictAccessToClients: false,
      },
      editedFunctionalities: [],
      defaultItem: {
        activeStatus: "",
        email: "",
        name: "",
        password: "",
        phone: "",
        restrictAccessToClients: false,
        setPasswordByAdmin: false,
      },
      headers: [
        {text: "S.N.", value: "sno", width: "2%"},
        {text: "Name", value: "name"},
        {text: "E-mail", value: "email"},
        {text: "Contact No.", value: "phone"},
        {text: "Status", value: "activeStatus", width: "5%"},
        {text: "Actions", value: "actions", width: "15%"},
      ],
      userDialog: false,
      mappedClientsDialog: false,
      editingUser: false,
      creatingUser: false,
      showPassword: true,
      editingFunctionalities: false,
      functionalitiesDialog: false,
      filterMenuItems: [
        {name: "Active", value: "A", color: "green"},
        {name: "Inactive", value: "I", color: "error"},
      ],
      selectedFilterOption: "A",
      viewingMappedClients: false,
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
    }
  },
  computed: {
    ...mapGetters("auth", ["accessToken", "allUserFunctionalities"]),
    allActiveClientsFiltered() {
      const temp = this;
      return this.allActiveClients.filter(item => {
        return !temp.currentClientMappings.find(x => x.client.id === item.id)
      })
    },
    activeDataWithSn() {
      return this.activeData.map((d, index) => (
        {...d, sno: index + 1}))
    },
    inactiveDataWithSn() {
      return this.inactiveData.map((d, index) => ({...d, sno: index + 1}))
    },
    tableItems() {
      switch (this.selectedFilterOption) {
        case "A":
          return this.activeDataWithSn
        case "I":
          return this.inactiveDataWithSn
        default:
          return this.activeDataWithSn
      }
    },
  },
  methods: {
    ...mapActions("api", ["makeGetRequest", "makePostRequest"]),
    addClientMapping() {
      let data = {
        client: this.clientMappings.newMapping.client,
        user: this.editedItem,
      }
      this.currentClientMappings.push(data);
      this.clientMappings.addedMappings.push(data);
      this.clientMappings.newMapping.client = {};
      this.clientMappings.newMapping.employee = {};
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "client":
          !model.required && errors.push("Client must be selected");
          break;
        default:
          break;
      }
      return errors;
    },
    getActiveData() {
      let temp = this;
      this.isLoading = true;

      this.$store.dispatch("api/makeGetRequest",
        {
          route: "user/getAll/active"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.activeData = response.data.data;
        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      });
    },
    getInactiveData() {
      this.isLoading = true;
      this.$store.dispatch('api/makeGetRequest',
        {
          route: "user/getAll/inactive"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.inactiveData = response.data.data;
        }
        this.isLoading = false;
      }).catch((error) => {
        this.isLoading = false;
      });
    },
    deleteItem(item) {
      const temp = this;
      this.editedItem = Object.assign({}, item);
      this.$root.confirm('Confirm Delete', 'Are you sure you want to delete ' + item.name + '?')
        .then((confirm) => {
          this.makePostRequest({
            route: "user/delete",
            data: {
              ...temp.editedItem
            }
          }).then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "User deleted successfully"
              });
              this.getActiveData();
              this.getInactiveData();
            }
          })
        }).catch((error) => {
      });
    },
    editUser(item, editingUser) {
      this.editedItem = Object.assign({}, item)
      this.userDialog = true
      if (editingUser) {
        this.editingUser = editingUser
      }
    },
    newUser(item, creatingUser) {
      this.editedItem = Object.assign({}, item)
      this.userDialog = true
      if (creatingUser) {
        this.creatingUser = creatingUser
      }
    },
    createUser() {
      const temp = this
      this.makePostRequest({
        route: "user/registerNew",
        data: {
          activeStatus: temp.editedItem.setPasswordByAdmin ? "A" : "U",
          email: temp.editedItem.email,
          name: temp.editedItem.name,
          password: temp.editedItem.setPasswordByAdmin ? temp.editedItem.password : "temp_password",
          phone: temp.editedItem.phone,
          restrictAccessToClients: temp.editedItem.restrictAccessToClients,
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          this.$store.dispatch("toast/setSnackbar", {
            text: "User created successfully"
          })
          this.getActiveData();
          this.userDialog = false;
          this.editingUser = false;
        }
      }).catch((error) => {
      })

    },
    updateUser() {
      const temp = this
      this.makePostRequest({
        route: "user/update",
        data: {
          ...temp.editedItem
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          this.$store.dispatch("toast/setSnackbar", {
            text: "User details updated successfully"
          })
          this.getActiveData();
          this.userDialog = false;
          this.editingUser = false;
        }
      }).catch((error) => {
      })
    },
    getFunctionalitiesByUser(item, editingFunctionalities) {
      const temp = this
      this.editedItem = Object.assign({}, item)
      this.functionalitiesDialog = true
      if (editingFunctionalities) {
        this.editingFunctionalities = editingFunctionalities
      }
      this.makeGetRequest({
        route: "functionality/mappings/getByUser",
        params: {
          userId: temp.editedItem.id
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          this.editedFunctionalities = response.data.data;
        }
      })
    },
    updateFunctionalities() {
      const temp = this
      this.makePostRequest({
        route: "functionality/mappings/update",
        data: {
          userId: temp.editedItem.id,
          functionalities: temp.editedFunctionalities
        }
      }).then((response) => {
        if (response.data.status === "OK") {
          this.$store.dispatch("toast/setSnackbar", {
            text: "Functionalities updated successfully"
          })
          this.$store.dispatch("auth/getCurrentUserFunctionalitiesMappings")
          this.functionalitiesDialog = false;
          this.editingFunctionalities = false;
        }
      }).catch((error) => {
      })
    },
    resetPassword(item) {
      const temp = this;
      this.editedItem = Object.assign({}, item);
      this.$root.confirm(`Are you sure you want to reset ${item.name}'s password?`, `An email will be sent to ${item.email} with reset password.`)
        .then((confirm) => {
          this.makeGetRequest({
            route: "user/resetPassword",
            params: {
              userId: item.id
            }
          }).then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "Password reset email sent successfully"
              })
            }
          })
        }).catch((error) => {
        console.log(error);
      });
    },
    reactivateUser(item) {
      const temp = this;
      this.editedItem = Object.assign({}, item);
      this.$root.confirm(`Confirm`, `Are you sure you want to reactivate ${item.name}'s account?`)
        .then((confirm) => {
          this.makePostRequest({
            route: "user/reactivate",
            data: {
              ...temp.editedItem
            }
          }).then((response) => {
            if (response.data.status === "OK") {
              this.$store.dispatch("toast/setSnackbar", {
                text: "Account reactivated successfully."
              });
              this.getActiveData();
              this.getInactiveData();

            }
          })
        }).catch((error) => {
      });
    },
    viewMappedClients(item, viewingMappedClients) {
      if (item.restrictAccessToClients) {
        this.editedItem = Object.assign({}, item);
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
            route: "client/userClientMappings",
            params: {
              userId: item.id
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
      } else {
        this.$store.dispatch("toast/setSnackbar", {
          text: `Not allowed! ${item.name} hass access to all clients.`,
          color: "warning",
          icon: "fa-solid fa-triangle-exclamation"
        });
      }

    },
    getData(selectedFilterOption) {
      switch (selectedFilterOption) {
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
        route: "client/userMappings/update",
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
  },
  mounted() {
    this.getActiveData();
    this.getAllActiveClients();
  }
}
</script>

<style scoped>

</style>
