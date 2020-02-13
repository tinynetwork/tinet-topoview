<template>
  <div id="edit">
    <v-container fluid>
      <v-row>
        <v-col cols="6">
          <div id="editoption">
            <v-dialog v-model="nodedialog" persistent max-width="600px">
              <template v-slot:activator="{ on }">
                <v-btn class="ma-2" tile outlined color="success" v-on="on">
                  <v-icon left>fas fa-plus</v-icon>Add Node
                </v-btn>
              </template>
              <v-card id="addDialog">
                <v-card-title>
                  <span class="headline">Node</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field label="Name*" required v-model="nodeInputName"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="nodedialog = false">Close</v-btn>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="
                      add_node();
                      nodedialog = false;
                    "
                  >addNode</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="swdialog" persistent max-width="600px">
              <template v-slot:activator="{ on }">
                <v-btn class="ma-2" tile outlined color="success" v-on="on">
                  <v-icon left>fas fa-plus</v-icon>Add Switch
                </v-btn>
              </template>
              <v-card id="addDialog">
                <v-card-title>
                  <span class="headline">Switch</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field label="Name*" required v-model="swInputName"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="swdialog = false">Close</v-btn>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="
                      add_switch();
                      swdialog = false;
                    "
                  >addSwitch</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-btn class="ma-2" tile outlined color="blue" v-on:click="saveConfig">
              <v-icon left>fas fa-edit</v-icon>Write Config
            </v-btn>
            <v-btn class="ma-2" tile outlined color="red" v-on:click="Init">
              <v-icon left>fas fa-redo</v-icon>Reload
            </v-btn>
            <v-textarea
              name="tinetConfig"
              filled
              label="tinet Config"
              auto-grow
              v-model="tinetConfig"
            ></v-textarea>
          </div>
        </v-col>
        <v-col cols="6">
          <div id="cy"></div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
const cytoscape = require("cytoscape");
const cola = require("cytoscape-cola");
const edgehandles = require("cytoscape-edgehandles");
const yaml = require("js-yaml");

cytoscape.use(cola);
cytoscape.use(edgehandles);

export default {
  name: "TopoEdit",
  components: {},
  created: function() {},
  data: function() {
    return {
      nodedialog: false,
      swdialog: false,
      nodeInputName: "",
      swInputName: "",
      tinetConfig: ""
    };
  },
  methods: {
    add_node: function() {
      this.cy.add([
        {
          group: "nodes",
          data: {
            id: this.nodeInputName,
            name: this.nodeInputName,
            type: "node"
          },
          position: { x: 300, y: 200 }
        }
      ]);
    },
    add_switch: function() {
      this.cy.add([
        {
          group: "nodes",
          data: {
            id: this.swInputName,
            name: this.swInputName,
            type: "switch"
          },
          position: { x: 400, y: 300 }
        }
      ]);
    },
    view_init: function() {
      this.cy = cytoscape({
        container: document.getElementById("cy"),
        boxSelectionEnabled: false,
        autounselectify: true,
        style: cytoscape
          .stylesheet()
          .selector('node[type = "node"]')
          .css({
            height: 80,
            width: 80,
            "background-fit": "cover",
            "border-color": "#000",
            "border-width": 3,
            "border-opacity": 0.5,
            content: "data(name)",
            "text-valign": "center"
          })
          .selector('node[type = "switch"]')
          .css({
            height: 80,
            width: 80,
            shape: "square",
            "background-fit": "cover",
            "border-color": "red",
            "border-width": 3,
            "border-opacity": 0.5,
            content: "data(name)",
            "text-valign": "center"
          })
          .selector("edge")
          .css({
            width: 6,
            "target-arrow-shape": "none",
            "line-color": "#ffaaaa",
            "target-arrow-color": "#ffaaaa",
            "curve-style": "bezier"
          }),
        elements: {
          nodes: [],
          edges: []
        },
        layout: {
          name: "cola",
          directed: true,
          padding: 10
        }
      });
      this.cy.edgehandles();
    },
    saveConfig: function() {
      const cytoscapeJson = this.cy.json();

      this.cytoscape2tnconf(cytoscapeJson.elements);
    },
    cytoscape2tnconf: function(nodeJson) {
      const nodeMap = {};
      console.log(nodeJson);
      console.log(nodeJson.edges);
      for (let i = 0; i < nodeJson.edges.length; i++) {
        if (nodeMap[nodeJson.edges[i].data.source] == undefined) {
          nodeMap[nodeJson.edges[i].data.source] = [
            nodeJson.edges[i].data.target + "#" + "net" + i
          ];
        } else {
          nodeMap[nodeJson.edges[i].data.source].push(
            nodeJson.edges[i].data.target + "#" + "net" + i
          );
        }

        if (nodeMap[nodeJson.edges[i].data.target] == undefined) {
          nodeMap[nodeJson.edges[i].data.target] = [
            nodeJson.edges[i].data.source + "#" + "net" + i
          ];
        } else {
          nodeMap[nodeJson.edges[i].data.target].push(
            nodeJson.edges[i].data.source + "#" + "net" + i
          );
        }
      }

      const keys = Object.keys(nodeMap);
      const keysLength = keys.length;
      let confMap = {};
      let infMaps = {};
      for (let j = 0; j < keysLength; j++) {
        let key = keys[j];
        let val = nodeMap[key];
        console.log("nodemap for");
        console.log("key ", key);
        console.log("val ", val);
        confMap["interfaces"] = [];
        for (let k = 0; k < val.length; k++) {
          let inf = { name: "net" + k, type: "direct", args: val[k] };
          confMap["interfaces"].push(inf);
        }
        infMaps[key] = confMap["interfaces"];
      }
      console.log(infMaps);

      let confs = [];
      keys.forEach(key => {
        confMap = {};
        confMap["name"] = key;
        confMap["image"] = "slankdev/frr";
        confMap["interfaces"] = infMaps[key];
        confs.push(confMap);
      });
      console.log(confs);

      this.tinetConfig = yaml.safeDump(confs, {
        indent: 4
      });
    },
    Init: function() {
      this.tinetConfig = "";
      this.view_init();
    }
  },
  computed: {},
  mounted: function() {
    this.view_init();
  }
};
</script>

<style scoped>
#cy {
  position: absolute;
  width: 50%;
  height: 100%;
  z-index: 999;
  /* right: 30px; */
  /* top: 300px; */
  background-color: #e9e9e9;
}

#addDialog {
  position: absolute;
  top: 100px;
  width: 40%;
  left: 80px;
}
body {
  font: 14px helvetica neue, helvetica, arial, sans-serif;
}
</style>
