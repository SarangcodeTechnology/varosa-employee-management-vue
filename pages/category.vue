<template>
  <v-container fluid>
    <h2 style="font-weight: 700" class="mb-6">Category Management</h2>
    <v-card>
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="4">
            <v-text-field
              v-model="search"
              dense
              append-icon="fas fa-search"
              outlined
              label="Search..."
            ></v-text-field>
          </v-col>
          <v-col cols="auto">
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
            <v-btn dark>
              <v-icon left>fas fa-print</v-icon>
              Print
            </v-btn>

            <v-btn color="primary" @click="addNewDialogue('Add')">
              <v-icon left>fas fa-plus</v-icon>
              Add New
            </v-btn>
          </v-col>
        </v-row>

        <!-- v-dialog for addding new category management details -->
        <v-dialog
          v-model="addNewDialog"
          :persistent="dialogueState.add || dialogueState.edit"
          max-width="50%"
        >
          <v-card>
            <!-- title bar-->
            <v-toolbar dark flat class="mb-10" color="primary">
              <v-toolbar-title>Category Management Details</v-toolbar-title>
              <v-spacer></v-spacer>
              <!-- cross icon to close dialogue box -->
              <v-toolbar-items>
                <v-btn icon @click="removeNewDialogue()">
                  <v-icon>fa-solid fa-xmark</v-icon>
                </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <!-- adding category management details form inside v-card -->
            <v-card-text>
              <v-row>
                <v-text-field
                  label="Name"
                  prepend-inner-icon="fa-solid fa-user"
                  :placeholder="dialogueState.placeholder"
                  filled
                  v-model="newName"
                  :readonly="!(dialogueState.add || dialogueState.edit)"
                >
                </v-text-field>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                @click="removeNewDialogue()"
                class="error mr-3"
                v-if="dialogueState.add || dialogueState.edit"
                >Cancel</v-btn
              >
              <v-btn
                v-if="dialogueState.add || dialogueState.edit"
                @click="dialogueState.add ? addData() : editData()"
                class="primary"
                >{{ this.dialogueState.btnLabel }}</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- close v dialogue -->

        <!-- main data table for category management details -->
        <v-data-table
          :headers="headers"
          :items="selectedFilterOption === 'A' ? activeData : inactiveData"
          :search="search"
          :loading="isloading"
          :items-per-page="25"
          calculate-widths
          @click:row="(item) => addNewDialogue('View', item.name)"
          :footer-props="{
            showFirstLastPage: true,
            firstIcon: 'fas fa-angle-double-left',
            lastIcon: 'fas fa-angle-double-right',
            nextIcon: 'fas fa-angle-right',
            prevIcon: 'fas fa-angle-left',
            itemsPerPageOptions: [25, 50, 100, -1],
          }"
        >
          <template #item.activeStatus="{ item }">
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
          <!-- actions in data table -->

          <template #item.actions="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  @click="addNewDialogue('View', item.name), ''"
                  v-on="on"
                  v-bind="attrs"
                  ><v-icon> fas fa-eye</v-icon></v-btn
                >
              </template>
              <span>View Category</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  @click.stop.prevent="
                    addNewDialogue('Edit', item.name, item.id)
                  "
                  v-if="selectedFilterOption === 'A'"
                  v-on="on"
                  v-bind="attrs"
                  ><v-icon> fas fa-pencil</v-icon></v-btn
                >
              </template>
              <span>Edit Category</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-if="selectedFilterOption === 'I'"
                  @click.stop.prevent="reactivate(item)"
                  v-on="on"
                  v-bind="attrs"
                  ><v-icon> fas fa-unlock</v-icon></v-btn
                >
              </template>
              <span>Reactivate Category</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  @click.stop.prevent="deleteItem(item)"
                  v-if="selectedFilterOption === 'A'"
                  v-on="on"
                  v-bind="attrs"
                  color="error"
                  ><v-icon> fas fa-trash-alt</v-icon></v-btn
                >
              </template>
              <span>Delete Category</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import helpers from "../helpers";

export default {
  name: "CategoryManagement",
  data() {
    return {
      activeData: [],
      inactiveData: [],
      selectedFilterOption: "A",
      search: "",
      isloading: true,
      addNewDialog: false,

      newName: "",
      newId: -1,

      filterMenuItems: [
        { name: "Active", value: "A", color: "green" },
        { name: "Inactive", value: "I", color: "error" },
      ],

      // v-data table items and headers
      headers: [
        { text: "S.N.", value: "id" },
        { text: "Name", value: "name" },
        { text: "Status", value: "activeStatus" },
        { text: "Actions", value: "actions" },
      ],

      //dialogue state object
      dialogueState: {
        type: "",
        placeholder: "",
        add: false,
        edit: false,
        btnLabel: "",
      },
    };
  },
  methods: {
    responseGetter() {
      return this.$store.dispatch("api/makeGetRequest", {
        route:
          `category/getAll/` +
          (this.selectedFilterOption == "A" ? "active" : "inactive"),
      });
    },
    async toExcel() {
      try {
        await helpers.jsonToExcel({
          fileName: "Category List",
          sheetName:
            "Categories: " +
            (this.selectedFilterOption == "A" ? "Active" : "Inactive"),
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
    addNewDialogue(dialogueStatus, categoryName, categoryId) {
      if (dialogueStatus == "Add") {
        this.dialogueState.type = dialogueStatus;
        this.dialogueState.placeholder = "Add New Category";
        this.dialogueState.add = true;
        this.dialogueState.edit = false;
        this.dialogueState.btnLabel = "Add New";
        this.newName = "";
      } else if (dialogueStatus == "View") {
        console.log("View item here");
        this.dialogueState.type = dialogueStatus;
        this.dialogueState.placeholder = "";
        this.dialogueState.add = false;
        this.dialogueState.edit = false;
        this.newName = categoryName;
      } else if (dialogueStatus == "Edit") {
        console.log("edit item here");
        this.dialogueState.type = dialogueStatus;
        this.dialogueState.placeholder = "";
        this.dialogueState.edit = true;
        this.dialogueState.add = false;
        this.dialogueState.btnLabel = "Save";
        this.newName = categoryName;
        this.newId = categoryId;
      }
      this.addNewDialog = true;
    },

    removeNewDialogue() {
      this.addNewDialog = false;
    },

    getActiveData() {
      this.$store
        .dispatch("api/makeGetRequest", {
          route: "category/getAll/active",
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.activeData = response.data.data;
            this.isloading = false;
          }
        })
        .catch((error) => {});
    },
    getInActiveData() {
      this.$store
        .dispatch("api/makeGetRequest", {
          route: "category/getAll/inactive",
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.inactiveData = response.data.data;
            this.isloading = false;
          }
        })
        .catch((error) => {});
    },
    getData() {
      if (this.selectedFilterOption == "A") {
        this.getActiveData();
      } else if (this.selectedFilterOption == "I") {
        this.getInActiveData();
      }
    },
    addData() {
      this.$store
        .dispatch("api/makePostRequest", {
          route: "category/registerNew",
          data: {
            name: this.newName,
          },
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.$store.dispatch("toast/setSnackbar", {
              text: "Category Added successfully",
            });
            this.getActiveData();
          }
        })
        .catch((error) => {
          console.log("Failed adding new Category details");
        });
      this.removeNewDialogue();
    },
    editData() {
      this.$store
        .dispatch("api/makePostRequest", {
          route: "category/update",
          data: {
            id: this.newId,
            name: this.newName,
          },
        })
        .then((response) => {
          if (response.data.status === "OK") {
            this.$store.dispatch("toast/setSnackbar", {
              text: "Category edited successfully",
            });
            this.getActiveData();
          }
        })
        .catch((error) => {
          console.log("Failed editing Category");
        });
      this.removeNewDialogue();
    },

    deleteItem(item) {
      this.$root
        .confirm(
          `Confirm Delete`,
          `Are you sure you want to delete "${item.name}" ?`,
          { color: "red" }
        )
        .then((confirm) => {
          this.$store
            .dispatch("api/makePostRequest", {
              route: "category/delete",
              data: {
                id: item.id,
                activeStatus: item.activeStatus,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                name: item.name,
              },
            })
            .then((response) => {
              if (response.data.status === "OK") {
                this.$store.dispatch("toast/setSnackbar", {
                  text: "Category deleted successfully",
                });
                this.getActiveData();
              }
            })
            .catch((error) => {
              console.log("Failed deleting category details");
            });
        })
        .catch((error) => {
          console.log("Failed deleting category details " + error);
        });
    },

    reactivate(item) {
      this.$root
        .confirm(
          `Confirm Reactivate`,
          `Are you sure you want to reactivate "${item.name}" ?`,
          { color: "red" }
        )
        .then((confirm) => {
          this.$store
            .dispatch("api/makePostRequest", {
              route: "category/reactivate",
              data: {
                id: item.id,
                activeStatus: item.activeStatus,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                name: item.name,
              },
            })
            .then((response) => {
              if (response.data.status === "OK") {
                this.$store.dispatch("toast/setSnackbar", {
                  text: "Category reactivated successfully",
                });
                this.getInActiveData();
              }
            })
            .catch((error) => {
              console.log("Failed reactivating Category");
            });
        })
        .catch((error) => {
          text = "Failed deleting Category";
          console.log(text + error);
        });
    },
  },
  mounted() {
    this.getData();
  },
};
</script>

<style scoped></style>
