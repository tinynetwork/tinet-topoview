<template>
  <v-container fill-height class="justify-center">
    <v-card class="mx-auto" outlined raised>
      <v-row justify="center" align="center">
        <v-col cols="auto">
          <div
            class="display-3 text--primary"
          >Network Topology Visualization from tinet configuration file.</div>
        </v-col>
      </v-row>
      <br />
      <v-list align="center">
        <v-list-item-title class="display-1">
          Visualize the network topology by writing tinet configuration files.
          =>
          <router-link to="/view">View</router-link>
        </v-list-item-title>
        <br />
        <br />
        <v-list-item-title class="display-1">
          [WIP] Generate tinet configuration files
          <br />by adding nodes or
          drawing lines between nodes. =>
          <router-link to="/edit">Draw</router-link>
        </v-list-item-title>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "home",
  components: {}
};
</script>
