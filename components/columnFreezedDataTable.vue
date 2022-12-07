<!-- ColumnFreezedDataTable.vue -->
<template>

<!-- <v-data-table :headers="headers" 
                      :items="selectedFilterOption==='A'? activeData:inactiveData"
                      :search="search"
                      :loading="isloading"
                      :items-per-page="25"
                      calculate-widths
                      @click:row="(item)=>addNewDialogue('View', item.name)"
                      :footer-props="{
                        showFirstLastPage: true,
                        firstIcon : 'fas fa-angle-double-left',
                        lastIcon:'fas fa-angle-double-right',
                        nextIcon:'fas fa-angle-right',
                        prevIcon:'fas fa-angle-left',
                        itemsPerPageOptions:[25,50,100,-1]
                      }"
                      >
        <template #item.activeStatus="{item}"> 
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
                    
        <template #item.actions="{item}"> 
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="addNewDialogue('View', item.name),''" v-on="on" v-bind="attrs"><v-icon> fas fa-eye</v-icon></v-btn>
            
          </template>
          <span>View Bank</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click.stop.prevent="addNewDialogue('Edit', item.name, item.id)" v-if="selectedFilterOption === 'A'" v-on="on" v-bind="attrs"><v-icon> fas fa-pencil</v-icon></v-btn>
        </template>
          <span>Edit Bank</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-if="selectedFilterOption === 'I'"  @click.stop.prevent="reactivate(item)" v-on="on" v-bind="attrs"><v-icon> fas fa-unlock</v-icon></v-btn>
          </template>
          <span>Reactivate Bank</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click.stop.prevent="deleteItem(item)" v-if="selectedFilterOption === 'A'" v-on="on" v-bind="attrs" color="error"><v-icon> fas fa-trash-alt</v-icon></v-btn>
           </template>
          <span>Delete Bank</span>
        </v-tooltip>

        </template>

         
        </v-data-table> -->


        <p>

            hello

        </p>

</template>

<script>
export default {
    props: ['headers', 'items', 'fixedColumns'],
}

</script>