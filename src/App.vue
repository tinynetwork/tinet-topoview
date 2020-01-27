<template>
  <v-app>
    <v-app-bar app color="green lighten-3" dark>
      <p class="display-3">tinet</p>

      <v-spacer></v-spacer>
      <v-btn
        href="https://github.com/slankdev/tinet/tree/master/examples"
        target="_blank"
        text
      >
        <span class="mr-2">tinet config example</span>
        <v-icon>fab fa-github</v-icon>
      </v-btn>

      <v-btn href="https://github.com/slankdev/tinet" target="_blank" text>
        <span class="mr-2">tinet-go</span>
        <v-icon>fab fa-github</v-icon>
      </v-btn>

      <v-btn href="https://github.com/ak1ra24/tinet-go" target="_blank" text>
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
  name: 'App',

  components: {},

  data: () => ({})
};
</script>
