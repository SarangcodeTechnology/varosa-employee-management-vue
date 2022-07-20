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
            <v-select menu-props="auto"  chips @input="getData(selectedFilterOption)" solo flat
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
                  <v-btn @click.stop.prevent="viewMappedClients()" v-bind="attrs" v-on="on" fab icon x-small>
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
import {mapActions, mapGetters} from 'vuex'

export default {
  name: "UserManagement",
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
    }
  },
  computed: {
    ...mapGetters("auth", ["accessToken", "allUserFunctionalities"]),
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
        console.log(error);
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
        console.log(error);
      });
    },
    viewMappedClients() {
    },
    getData(selectedFilterOption) {
      switch (selectedFilterOption) {
        case "A":
          this.activeStatus=true;
          this.getActiveData();
          break;
        case "I":
          this.activeStatus=false;
          this.getInactiveData();
          break;
        default:
          this.activeStatus=true;
          return this.getActiveData();
      }
    }
  },
  mounted() {
    this.getActiveData();
  }
}
</script>

<style scoped>

</style>
