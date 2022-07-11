<template>
  <v-container fluid>
    <h2 style="font-weight: 700;">User Management</h2>
    <Breadcrumbs/>
    <v-card
    >
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="4">
            <v-text-field v-model="search" dense append-icon="fas fa-search" outlined
                          label="Search..."></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="activeStatus = !activeStatus" :color="activeStatus?'deep-orange':'green'" dark>
              <v-icon left>{{ activeStatus ? 'fas fa-user-alt-slash' : 'fas fa-user' }}</v-icon>
              {{ activeStatus ? 'View Inactive Users' : 'View Active Users' }}
            </v-btn>
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
            <v-btn color="primary">
              <v-icon left>fas fa-plus</v-icon>
              Add New
            </v-btn>
          </v-col>
        </v-row>


        <v-data-table
          calculate-widths
          :headers="headers"
          :items="activeStatus?activeDataWithSn:inactiveDataWithSn"
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
                  <v-btn @click="editUser(item,false)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-eye</v-icon>
                  </v-btn>
                </template>
                <span>View User</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn @click="editUser(item,true)" v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit User</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-briefcase</v-icon>
                  </v-btn>
                </template>
                <span>Manage Functionalities</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-project-diagram</v-icon>
                  </v-btn>
                </template>
                <span>View Mapped Clients</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" fab icon x-small>
                    <v-icon>fas fa-key</v-icon>
                  </v-btn>
                </template>
                <span>Reset Password</span>
              </v-tooltip>
              <v-tooltip v-if="activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" color="error" fab icon x-small @click="confirm(item)">
                    <v-icon>fas fa-trash-alt</v-icon>
                  </v-btn>
                </template>
                <span>Delete User</span>
              </v-tooltip>
              <v-tooltip v-if="!activeStatus" bottom>
                <template v-slot:activator="{attrs,on}">
                  <v-btn v-bind="attrs" v-on="on" fab icon x-small>
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
    <v-dialog max-width="50%" persistent v-model="userDialog">
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
              @click="userDialog = false,editingUser=false"
            >
              <v-icon>fa-solid fa-xmark</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row dense>
              <v-col cols=6>
                <v-text-field
                  :readonly="!editingUser"
                  dense
                  filled
                  label="Name*"
                  v-model="editedItem.name"
                ></v-text-field>
              </v-col>
              <v-col cols=6>
                <v-text-field
                  :readonly="!editingUser"
                  dense
                  filled
                  label="Email*"
                  v-model="editedItem.email"
                ></v-text-field>
              </v-col>
              <v-col cols=6>
                <v-text-field
                  :readonly="!editingUser"
                  dense
                  filled
                  label="Phone"
                  v-model="editedItem.phone"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  :readonly="!editingUser"
                  v-model="editedItem.restrictAccessToClients"
                  label="Restrict access to clients"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions v-if="editingUser">
          <v-spacer/>
          <v-btn
            color="error"
            @click="userDialog = false,editingUser=false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="userDialog = false,editingUser=false"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Breadcrumbs from "@/components/breadcrumbs";
import {mapGetters} from 'vuex'

export default {
  name: "UserManagement",
  components: {
    Breadcrumbs
  },
  data() {
    return {
      activeStatus: true,
      activeData: [],
      inactiveData: [],
      search: "",
      isLoading: false,
      editedItem: {
        name: "",
        email: "",
        phone: ""
      },
      defaultItem: {
        name: "",
        email: "",
        phone: "",
        activeStatus: "A"
      },
      headers: [
        {text: "S.N.", value: "sno", width: "2%"},
        {text: "Name", value: "name"},
        {text: "E-mail", value: "email"},
        {text: "Phone No.", value: "phone"},
        {text: "Status", value: "activeStatus", width: "5%"},
        {text: "Actions", value: "actions", width: "15%"},
      ],
      userDialog: false,
      editingUser: false,
    }
  },
  computed: {
    ...mapGetters("auth", ["accessToken"]),
    activeDataWithSn() {
      return this.activeData.map((d, index) => (
        {...d, sno: index + 1}))
    },
    inactiveDataWithSn() {
      return this.inactiveData.map((d, index) => ({...d, sno: index + 1}))
    }
  },
  methods: {
    getActiveData() {
      let temp = this;
      this.isLoading = true;

      this.$store.dispatch("api/makeGetRequest",
        {
          route: "user/getAll/active"
        }
      ).then(response => {
        if (response.data.status === "OK") {
          this.$store.dispatch('toast/setSnackbar', {
            text: "Active users fetched successfully.",
          });
          this.activeData = response.data.data;
        }
        this.isLoading = false;
      }).catch(error => {
        this.$store.dispatch('toast/setSnackbar', {
          color: "error",
          icon: "fa-solid fa-circle-xmark",
          text: "Problem while fetching active users.",
        });
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
          this.$store.dispatch('toast/setSnackbar', {
            text: "Inactive users fetched successfully.",
          });
          this.inactiveData = response.data.data;
        }
        this.isLoading = false;
      }).catch(error => {
        this.$store.dispatch('toast/setSnackbar', {
          color: "error",
          icon: "fa-solid fa-circle-xmark",
          text: "Problem while fetching inactive users.",
        });
        this.isLoading = false;
      });
    },
    confirm(item) {
      const temp = this;
      this.$root.confirm('Confirm Delete', 'Are you sure you want to delete ' + item.name + '?', {color: 'red'})
        .then((confirm) => {
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
    }
  },
  mounted() {
    this.getActiveData();
    this.getInactiveData();
  }
}
</script>

<style scoped>

</style>
