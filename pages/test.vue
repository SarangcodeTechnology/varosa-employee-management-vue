<template>
<v-container fluid>
 {{ result }}
</v-container>
</template>

<script>
import NepaliDate from 'nepali-date-converter';

export default {
  name: "test",
  data(){return{
  }},methods:{

  },
  computed:{
    result(){
      return new NepaliDate().getMonth();
      const currentEnglishDate = new Date();
      return currentEnglishDate
      // return currentEnglishDate.getFullYear()
      // return currentEnglishDate.getMonth() + 1
      return currentEnglishDate.getDate()
      // this.result = NepaliDate(currentEnglishDate);
    }
  },
  mounted(){
  }
}
</script>

<style scoped>

</style>
