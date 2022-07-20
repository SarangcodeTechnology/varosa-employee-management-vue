<template>
  <v-app dark>
    <client-only>
      <v-navigation-drawer
        v-model="drawer"
        :mini-variant="miniVariant"
        :clipped="clipped"
        color="#0F436E"
        dark
        app
      >
        <template v-for="item in tableItems">
          <template v-if="item.listItems.length>0">
            <v-divider v-if="miniVariant"></v-divider>
            <v-subheader v-else-if="item.subheading">{{ item.subheading }}</v-subheader>
          </template>
          <v-list nav>
            <template v-for="listItem in item.listItems">
              <v-tooltip v-if="miniVariant" right>
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item
                    v-bind="attrs"
                    v-on="on"
                    :to="listItem.to"
                    router
                    exact
                  >
                    <v-list-item-action class="mr-4">
                      <v-icon>{{ listItem.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title v-text="listItem.title"/>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <span>{{ listItem.title }}</span>
              </v-tooltip>
              <v-list-item
                v-else
                :to="listItem.to"
                router
                exact
              >
                <v-list-item-action class="mr-4">
                  <v-icon>{{ listItem.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title v-text="listItem.title"/>
                </v-list-item-content>
              </v-list-item>
            </template>


          </v-list>
        </template>
      </v-navigation-drawer>
    </client-only>
    <v-app-bar
      flat
      :class="!clipped?'mt-2 mx-2':''"
      :clipped-left="clipped"
      :rounded="!clipped?'lg':'0'"
      app
      fixed
      color="#FFFFFF"
      style="box-shadow: 0 0 10px 0 #bcbcbc !important;"
    >
      <NuxtLink :to="'/'" class="mr-7">
        <img height="50px" src="/images/varosa-logo-final.png"/>
      </NuxtLink>


      <!--      Back Button-->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            @click="goBack"
            v-on="on"
          >
            <v-icon>fas fa-arrow-left</v-icon>
          </v-btn>
        </template>
        <span>Back</span>
      </v-tooltip>

      <!--      Forward Button-->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            @click="goForward"
            v-on="on"
          >
            <v-icon>fas fa-arrow-right</v-icon>
          </v-btn>
        </template>
        <span>Forward</span>
      </v-tooltip>

      <!--      Refresh Button-->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            @click="refresh"
            v-on="on"
          >
            <v-icon>fas fa-redo</v-icon>
          </v-btn>
        </template>
        <span>Refresh</span>
      </v-tooltip>
      <v-hover v-slot="{hover}">
        <v-sheet color="transparent" fluid rounded="pill">

          <!--      Hide Drawer Button-->
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-app-bar-nav-icon v-bind="attrs"
                                  v-on="on"
                                  @click.stop="drawer = !drawer"/>
            </template>
            <span v-if="drawer">Hide Drawer</span>
            <span v-else>Show Drawer</span>
          </v-tooltip>
          <!--Drawer Mini Variant Switch-->
          <v-tooltip v-if="hover" bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon
                     v-bind="attrs"
                     v-on="on"
                     @click.stop="miniVariant = !miniVariant"
              >
                <v-icon>fas fa-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
              </v-btn>
            </template>
            <span>Mini Drawer</span>
          </v-tooltip>
          <!-- App Bar Maximize -->
          <v-tooltip v-if="hover" bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon
                     v-bind="attrs"
                     v-on="on"
                     @click.stop="clipped = !clipped"
              >
                <v-icon>fas fa-{{ `window-${clipped ? 'minimize' : 'maximize'}` }}</v-icon>
              </v-btn>
            </template>
            <span v-if="!clipped">Maximize</span>
            <span v-else>Minimize</span>
          </v-tooltip>
        </v-sheet>
      </v-hover>

      <v-spacer/>
      <v-menu v-model="userMenuModal" :close-on-content-click="false" offset-overflow offset-y
              origin="center center"
              transition="slide-x-reverse-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>fas fa-user-circle</v-icon>
          </v-btn>
        </template>
        <v-expand-transition/>
        <v-container class="pa-0 ma-0" flat>
          <v-list class="pa-0 ma-0" dense>
            <v-list-item href="https://varosaservices.com/" target="_blank">
              <v-list-item-icon><img alt="bigyapan_logo"
                                     src="/images/varosa-logo-final-favicon.png"/></v-list-item-icon>
              <v-list-item-title class="pa-0 ma-0">
                <h3>Varosa Services Pvt. Ltd.</h3>
              </v-list-item-title>
            </v-list-item>
            <v-divider class="pa-0 ma-0"></v-divider>
            <v-list-item :to="'/change-password'" @click="userMenuModal = !userMenuModal">
              <v-list-item-icon>
                <v-icon>fa-solid fa-key</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Change Password</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout(), userMenuModal = !userMenuModal">
              <v-list-item-icon>
                <v-icon>fas fa-sign-out-alt</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-container>
      </v-menu>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            to="/settings"
            icon
          >
            <v-icon>fas fa-gear</v-icon>
          </v-btn>
        </template>
        <span>Settings</span>
      </v-tooltip>
      <!--      <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click.stop="rightDrawer = !rightDrawer"
                >
                  <v-icon>fas fa-ellipsis-h</v-icon>
                </v-btn>
              </template>
              <span>More</span>
            </v-tooltip>-->

    </v-app-bar>
    <v-main style="background-color: #FAFAFA;">
      <v-container fluid>
        <Nuxt/>
      </v-container>
    </v-main>
    <!-- Right Navigation Drawer -->
    <!--    <v-navigation-drawer
          v-model="rightDrawer"
          :right="right"
          :clipped="true"
          temporary
          app
        >
          <v-list>
    &lt;!&ndash;        <v-list-item>
              <v-list-item-action>
                <v-icon>
                  {{ themeSwitch ? 'fas fa-moon' : 'fas fa-sun' }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-title>Switch Theme</v-list-item-title>
              <v-switch
                v-model="themeSwitch"
              ></v-switch>
            </v-list-item>
            <v-divider></v-divider>&ndash;&gt;
            <v-list-item :to="'/settings'">
              <v-list-item-action>
                <v-icon>
                  fas fa-cog
                </v-icon>
              </v-list-item-action>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>

          </v-list>
        </v-navigation-drawer>-->

    <!-- Confirm Dialog-->
    <confirmDialog ref="confirm"></confirmDialog>
    <toast/>
  </v-app>
</template>

<script>
import confirmDialog from '/components/confirmDialog.vue'
import toast from '/components/toast.vue'
import {mapGetters} from "vuex";

export default {
  name: 'DefaultLayout',
  components: {
    confirmDialog,
    toast,
  },
  data() {
    return {
      clipped: true,
      drawer: true,
      themeSwitch: false,
      userMenuModal: false,
      fixed: false,
      items: [
        {
          listItems: [
            {
              icon: 'fa-solid fa-gauge',
              title: 'Dashboard',
              to: '/'
            }
          ]
        },
        {
          subheading: 'Management',
          listItems: [
            {
              icon: 'fa-solid fa-users',
              title: 'User Management',
              to: 'user'
            },
            {
              icon: 'fa-solid fa-user-tie',
              title: 'Client Management',
              to: 'clients'
            },
            {
              icon: 'fa-solid fa-clipboard-user',
              title: 'Employee Management',
              to: 'employees'
            },
            {
              icon: 'fa-solid fa-calendar',
              title: 'Holiday Management',
              to: 'holiday'
            },
            {
              icon: 'fa-solid fa-building-columns',
              title: 'Bank Management',
              to: 'bank'
            },
            {
              icon: 'fa-solid fa-grip',
              title: 'Category Management',
              to: 'category'
            }
          ]
        },
        {
          subheading: 'Roster',
          listItems: [
            {
              icon: 'fa-solid fa-id-card',
              title: 'Client Roster',
              to: 'client-roster'
            },
            {
              icon: 'fa-solid fa-id-card-clip',
              title: 'Employee Roster',
              to: 'employee-roster'
            },
          ]
        },
        {
          subheading: 'Salary',
          listItems: [
            {
              icon: 'fa-solid fa-money-bill-transfer',
              title: 'Salary Details',
              to: 'salary'
            },
            {
              icon: 'fa-solid fa-file-invoice',
              title: 'Monthly Salary Sheet',
              to: 'sheet'
            },
          ]
        },
        {
          subheading: 'Leave',
          listItems: [
            {
              icon: 'fa-solid fa-user-clock',
              title: 'Leave History',
              to: 'leave'
            },
            {
              icon: 'fa-solid fa-chalkboard-teacher',
              title: 'Leave Payout Sheet',
              to: 'leave-payout'
            },
          ]
        }

      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
    }
  },
  methods: {
    logout() {
      this.$store.dispatch("auth/logout");
    },
    goBack() {
      this.$router.go(-1);
    },
    goForward() {
      this.$router.go(1);
    },
    refresh() {
      this.$router.go(0);
    },
  },
  watch: {
    themeSwitch: function (old, newVal) {
      this.$vuetify.theme.dark = old;
    },
  },
  computed: {
    ...mapGetters("auth", ["userFunctionalities"]),
    tableItems() {
      const temp = this;
      return this.items.filter(item => {
        return item.listItems= item.listItems.filter(listItem => {
          if (listItem.to === "/") {
            return true;
          }
          return !!temp.userFunctionalities.includes(listItem.to)
        })
      })
    }
  },
  mounted() {
    this.$root.confirm = this.$refs.confirm.open;
  },
}
</script>

<style lang="scss">
.v-select__selections input {
  display: none !important;
}
.v-app-bar {
  i.v-icon.v-icon {
    color: #212121;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #f5f5f5;
}

::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background-color: #9e9e9e;
}
</style>
