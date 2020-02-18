<template>
  <v-app>
    <v-app-bar app color="green lighten-3" dark>
      <p class="display-3">tinet</p>
      <v-spacer></v-spacer>

      <v-tabs fixed-tabs background-color="green lighten-3" dark>
        <v-tab to="/">Home</v-tab>
        <v-tab to="/view">View</v-tab>
        <v-tab to="/edit">Draw</v-tab>
      </v-tabs>
      <v-spacer></v-spacer>
      <v-btn href="https://github.com/tinynetwork/tinet/tree/master/examples" target="_blank" text>
        <span class="mr-2">tinet config example</span>
        <v-icon>fab fa-github</v-icon>
      </v-btn>

      <v-btn href="https://github.com/tinynetwork/tinet" target="_blank" text>
        <span class="mr-2">tinet-go</span>
        <v-icon>fab fa-github</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data: () => ({})
};
</script>
