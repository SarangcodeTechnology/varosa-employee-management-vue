<template>
  <v-card
    class="mx-auto"
    max-width="344"
  >
    <v-card-text>
      <div>Link</div>
      <p class="text-h4 text--primary">
       {{title}}
      </p>
      <div class="text--primary">
        {{description}}
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn
        text
        color="teal accent-4"
        @click="navigateToRoute"
      >
        Learn More
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  export default {
    name: "Dashboard Card",
    props: ['title', 'description', 'to'],
    methods: {
      navigateToRoute(){
        console.log(this) ;
      }
    },
  }
</script>

<style>
.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}
</style>