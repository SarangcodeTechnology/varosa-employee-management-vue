<template>
  <v-container fluid>
    <template v-for="(snackbar, index) in snackbars.filter((s) => s.showing)">
      <v-snackbar
        :key="snackbar.text + Math.random()"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        @input="snackbars.splice(index, 1)"
        v-model="snackbar.showing"
        :style="`bottom:${index * 80 + 8}px`"
        multi-line
        bottom
        max-width="10%"
        right
      >
        <v-container class="ma-0 pa-0" fluid>
          <v-row align="center" no-gutters>
            <v-col cols="2">
              <v-icon x-large>{{ snackbar.icon }}</v-icon>
            </v-col>
            <v-col cols="10">
              <h4 v-if="snackbar.title !== false">{{ snackbar.title }}</h4>
              {{ snackbar.text }}
            </v-col>
          </v-row>
        </v-container>
        <template v-slot:action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            icon
            @click="
              snackbar.showing = false;
              snackbars.splice(index, 1);
            "
          >
            <v-icon left small>fa-solid fa-xmark</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </template>
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "toast",
  computed: {
    ...mapGetters("toast", ["snackbars"]),
  },
};
</script>

<style scoped></style>
