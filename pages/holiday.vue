<template>
  <v-container fluid>
    <h2 style="font-weight: 700" class="mb-6">Holiday Management</h2>
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
          <!-- toggle different year -->
          <v-col cols="auto">
            <v-btn-toggle>
              <v-btn @click="selectHolidayYearBack()" fab small icon>
                <v-icon>fas fa-angle-left</v-icon>
              </v-btn>
              <v-text-field
                v-model="nepaliDate"
                dense
                outlined
                readonly
                style="width: 4vw"
              >
              </v-text-field>

              <v-btn @click="selectHolidayYearForward()" fab small icon>
                <v-icon>fas fa-angle-right</v-icon>
              </v-btn>
            </v-btn-toggle>
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
          scrollable
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
            <v-card-text style="height: 50vh">
              <v-row>
                <v-text-field
                  label="Name"
                  prepend-inner-icon="fa-solid fa-user"
                  :placeholder="dialogueState.placeholder.name"
                  filled
                  v-model="newName"
                  :readonly="!(dialogueState.add || dialogueState.edit)"
                >
                </v-text-field>
              </v-row>
              <v-row>
                <v-input
                  :disabled="!(dialogueState.add || dialogueState.edit)"
                  style="margin-top: -22px"
                >
                  <v-row no-gutters>
                    <v-col cols="12">
                      <span style="font-size: 12px">Nepali Date</span>
                    </v-col>
                    <v-col cols="12">
                      <VNepaliDatePicker
                        classValue="nepali-datepicker"
                        v-model="nepDate"
                        calenderType="Nepali"
                        placeholder="yyyy-mm-dd"
                        format="YYYY-MM-DD"
                      />
                    </v-col>
                  </v-row>
                </v-input>
              </v-row>
              <v-row>
                <v-text-field
                  :value="convertNepaliToEnglishDate"
                  readonly
                ></v-text-field>
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
          @click:row="
            (item) =>
              addNewDialogue(
                'View',
                item.name,
                item.id,
                item.englishFullDate,
                item.nepaliFullDate
              )
          "
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
                  @click="
                    addNewDialogue(
                      'View',
                      item.name,
                      item.id,
                      item.englishFullDate,
                      item.nepaliFullDate
                    )
                  "
                  v-on="on"
                  v-bind="attrs"
                  ><v-icon> fas fa-eye</v-icon></v-btn
                >
              </template>
              <span>View Holiday</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  @click.stop.prevent="
                    addNewDialogue(
                      'Edit',
                      item.name,
                      item.id,
                      item.englishFullDate,
                      item.nepaliFullDate
                    )
                  "
                  v-if="selectedFilterOption === 'A'"
                  v-on="on"
                  v-bind="attrs"
                  ><v-icon> fas fa-pencil</v-icon></v-btn
                >
              </template>
              <span>Edit Holiday</span>
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
              <span>Reactivate Holiday</span>
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
              <span>Delete Holiday</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import VNepaliDatePicker from "v-nepalidatepicker";
import NepaliDate from "nepali-date-converter";
import helpers from "../helpers";

export default {
  name: "HolidayManagement",
  components: {
    VNepaliDatePicker,
  },
  data() {
    return {
      nepaliDate: 2079,
      activeData: [],
      inactiveData: [],
      selectedFilterOption: "A",
      search: "",
      isloading: true,
      addNewDialog: false,

      newName: "",
      nepDate: "2079-01-01",
      newId: -1,

      filterMenuItems: [
        { name: "Active", value: "A", color: "green" },
        { name: "Inactive", value: "I", color: "error" },
      ],

      // v-data table items and headers
      headers: [
        { text: "S.N.", value: "id" },
        { text: "Name", value: "name" },
        { text: "English FullDate", value: "englishFullDate" },
        { text: "Nepali FullDate", value: "nepaliFullDate" },
        { text: "Status", value: "activeStatus" },
        { text: "Actions", value: "actions" },
      ],

      //dialogue state object
      dialogueState: {
        type: "",
        placeholder: {
          name: "",
          dateN: "",
          dateE: "",
        },
        add: false,
        edit: false,
        btnLabel: "",
      },
    };
  },
  computed: {
    convertNepaliToEnglishDate() {
      // accepts nepali date in format of 'yy-mm-dd'
      // and returns english date in format of 'yy-mm-dd'
      console.log(this.nepDate);
      let engDate = new NepaliDate(
        parseInt(this.nepDate.split("-")[0]),
        parseInt(this.nepDate.split("-")[1]) - 1,
        parseInt(this.nepDate.split("-")[2])
      ).getAD();
      let convertedDate =
        engDate.year + "-" + engDate.month + "-" + engDate.date;
      return convertedDate;
    },
  },
  methods: {
    responseGetter() {
      const temp = this;
      return this.$store.dispatch("api/makeGetRequest", {
        route:
          `holiday/getByNepaliYear/` +
          (this.selectedFilterOption == "A" ? "active" : "inactive"),
        params: {
          nepaliYear: this.nepaliDate,
        },
      });
    },
    async toExcel() {
      try {
        await helpers.jsonToExcel({
          fileName: "Holidays",
          sheetName:
            "Holidays: " +
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
    addNewDialogue(
      dialogueStatus,
      holidayName,
      holidayId,
      englishdate,
      nepalidate
    ) {
      if (dialogueStatus == "Add") {
        this.dialogueState.type = dialogueStatus;
        this.dialogueState.placeholder.name = "Add New Holiday";
        this.dialogueState.placeholder.dateN = "Add New Nepali Date";
        this.dialogueState.placeholder.dateE = "Add New English Date";
        this.dialogueState.add = true;
        this.dialogueState.edit = false;
        this.dialogueState.btnLabel = "Add New";
        this.newName = "";
      } else if (dialogueStatus == "View") {
        console.log("View item here");
        this.dialogueState.type = dialogueStatus;
        this.dialogueState.placeholder.name = "";
        this.dialogueState.placeholder.dateN = "";
        this.dialogueState.placeholder.dateE = "";
        this.dialogueState.add = false;
        this.dialogueState.edit = false;
        this.newName = holidayName;
        this.nepDate = nepalidate;
      } else if (dialogueStatus == "Edit") {
        console.log("edit item here");
        this.dialogueState.type = dialogueStatus;
        this.dialogueState.placeholder.name = "";
        this.dialogueState.placeholder.dateN = "";
        this.dialogueState.placeholder.dateE = "";
        this.dialogueState.edit = true;
        this.dialogueState.add = false;
        this.dialogueState.btnLabel = "Save";
        this.newName = holidayName;
        this.newId = holidayId;
      }
      this.addNewDialog = true;
    },

    removeNewDialogue() {
      this.addNewDialog = false;
    },

    //  handle api requests

    getActiveData() {
      this.$store
        .dispatch("api/makeGetRequest", {
          route: `holiday/getByNepaliYear/active`,
          params: {
            nepaliYear: this.nepaliDate,
          },
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
          route: `holiday/getByNepaliYear/inactive`,
          params: {
            nepaliYear: this.nepaliDate,
          },
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
          route: "holiday/registerNew",
          data: {
            // worked nicely
            name: this.newName,
            nepaliFullDate: "2079-1-25",
            englishFullDate: "2022-5-8",
            nepaliDay: 25,
            nepaliMonth: 1,
            nepaliYear: 2079,
            englishDay: 8,
            englishMonth: 5,
            englishYear: 2022,
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
          route: "holiday/update",
          data: {
            id: this.newId,
            name: this.newName,
            nepaliFullDate: "2079-1-17",
            englishFullDate: "2022-4-30",
            nepaliDay: 17,
            nepaliMonth: 1,
            nepaliYear: 2079,
            englishDay: 30,
            englishMonth: 4,
            englishYear: 2022,
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
              route: "holiday/delete",
              data: item,
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
              route: "holiday/reactivate",
              data: item,
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

    selectHolidayYearBack() {
      console.log("year selected");
      this.nepaliDate -= 1;
      this.getData();
    },

    selectHolidayYearForward() {
      console.log("year selected");
      this.nepaliDate += 1;
      this.getData();
    },
  },
  mounted() {
    this.getData();
  },
};
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
