<template>
    <v-breadcrumbs class="ml-n5" large :items="crumbs">
      <template v-slot:divider>
        <v-icon x-small>fa-solid fa-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>
</template>

<script>


export default {
  name: 'Breadcrumb',
  computed: {
    crumbs () {
      const pathArray = this.$route.path.split('/')
      pathArray.shift()
      const breadcrumbs = pathArray.reduce((breadcrumbArray, path, idx) => {
          breadcrumbArray.push({
            href: breadcrumbArray[idx - 1]
              ? '/' + breadcrumbArray[idx - 1].path + '/' + path
              : '/' + path,
            text: path.split('-')
              .map(word => {
                return word.slice(0, 1).toUpperCase() + word.slice(1)
              })
              .join(' '),
            disabled:true
          })
        return breadcrumbArray
      }, [])
      return breadcrumbs
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
