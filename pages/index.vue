<template>
  <div>
    <h2 style="color: #777; padding: 20px 10px">
      Varosa Services Employee Management
    </h2>
    <hr />
    <h2 style="padding: 15px 10px">Quick Links</h2>
    <div
      style="
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        justify-content: start;
      "
    >
      <v-card
        style="margin: 10px"
        v-for="linkDetail in links"
        class="mx-auto"
        max-width="344"
      >
        <v-card-text>
          <p class="text-h6 text--primary">{{ linkDetail.title }}</p>
          <div class="text--primary">{{ linkDetail.description }}</div>
        </v-card-text>
        <v-card-actions>
          <router-link  style="width: 100%" :to="linkDetail.to" >
            <v-btn style="width: 100%" text color="blue" @click="navigateToRoute">
            Go
          </v-btn>
        </router-link>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "Dashboard",

  data() {
    return {
      links: [
        {
          to: "/employees",
          title: "Employee Management",
          description: "View all the staff that work for Varosa",
        },
        {
          to: "/clients",
          title: " Client Management",
          description: "View all of Varosa's clients",
        },
        {
          to: "/client-roster",
          title: "Client Roster",
          description: "Fill up roster per client",
        },
        {
          to: "/employee-roster",
          title: "Employee Roster",
          description: "Fill up roster per employee",
        },
        {
          to: "/holiday",
          title: "Holiday Management",
          description: "Setup holidays per fiscal year",
        },
        {
          to: "/bank",
          title: "Bank Management",
          description: "Setup the banks that Varosa uses",
        },
        {
          to: "/category",
          title: "Category Management",
          description: "Setup the category of staffs that Varosa employs",
        },
        {
          to: "/leave",
          title: "Leave History",
          description: "View the leaves that your staff have taken till now.",
        },
        {
          to: "/salary",
          title: "Salary Details",
          description: "View and save the staff's monthly salaries.",
        },
        {
          to: "/sheet",
          title: "Monthly Salary Sheet",
          description: "View staff's monthly salary sheet.",
        }, {
          to: "/user",
          title: "User Management",
          description: "View all the users that have access to this application.",
        },
      ],
    };
  },
  methods: {
    navigateToRoute() {
      console.log(this.$vuetify.goTo("salary"));
    },
  },
};
</script>

<style>
.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}
</style>
