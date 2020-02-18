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
      swInputName: "SW",
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
            "border-color": "#000080",
            "border-width": 3,
            "border-opacity": 0.5,
            content: "data(name)",
            "text-valign": "center",
            color: "#000"
          })
          .selector('node[type = "switch"]')
          .css({
            height: 80,
            width: 80,
            shape: "square",
            "background-fit": "cover",
            "border-color": "#000",
            "border-width": 3,
            "border-opacity": 0.5,
            content: "data(name)",
            "text-valign": "center",
            color: "#000"
          })
          .selector("edge")
          .css({
            width: 6,
            "target-arrow-shape": "none",
            "line-color": "#000",
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
      nodeJson.nodes.forEach(node => {
        let type = node.data.type;
        nodeJson.edges.forEach(edge => {
          edge.data["type"] = type;
        });
      });

      for (let i = 0; i < Object.keys(nodeJson.edges).length; i++) {
        if (nodeMap[nodeJson.edges[i].data.source] === undefined) {
          nodeMap[nodeJson.edges[i].data.source] = [
            nodeJson.edges[i].data.target
          ];
        } else {
          nodeMap[nodeJson.edges[i].data.source].push(
            nodeJson.edges[i].data.target
          );
        }

        if (nodeMap[nodeJson.edges[i].data.target] === undefined) {
          nodeMap[nodeJson.edges[i].data.target] = [
            nodeJson.edges[i].data.source
          ];
        } else {
          nodeMap[nodeJson.edges[i].data.target].push(
            nodeJson.edges[i].data.source
          );
        }
      }

      let infConf = {};
      let nodes = {};
      nodes["nodes"] = [];
      nodes["switches"] = [];

      nodeJson.nodes.forEach(nodeinfo => {
        let nodeName = nodeinfo.data.name;
        let num = 0;
        if (nodeMap[nodeName]) {
          nodeMap[nodeName].forEach(node => {
            if (node.indexOf("SW") != -1) {
              if (infConf[nodeName] === undefined) {
                infConf[nodeName] = [
                  {
                    name: "net" + num,
                    type: "bridge",
                    args: node
                  }
                ];
              } else {
                infConf[nodeName].push({
                  name: "net" + num,
                  type: "bridge",
                  args: node
                });
              }
            } else if (nodeName.indexOf("SW") != -1) {
              if (infConf[nodeName] === undefined) {
                infConf[nodeName] = [
                  {
                    name: "net" + nodeMap[node].indexOf(nodeName),
                    type: "docker",
                    args: node
                  }
                ];
              } else {
                infConf[nodeName].push({
                  name: "net" + nodeMap[node].indexOf(nodeName),
                  type: "docker",
                  args: node
                });
              }
            } else {
              if (infConf[nodeName] === undefined) {
                infConf[nodeName] = [
                  {
                    name: "net" + num,
                    type: "direct",
                    args: node + "#net" + nodeMap[node].indexOf(nodeName)
                  }
                ];
              } else {
                infConf[nodeName].push({
                  name: "net" + num,
                  type: "direct",
                  args: node + "#net" + nodeMap[node].indexOf(nodeName)
                });
              }
            }
            num += 1;
          });

          if (nodeName.indexOf("SW") != -1) {
            nodes["switches"].push({
              name: nodeName,
              interfaces: infConf[nodeName]
            });
          } else {
            nodes["nodes"].push({
              name: nodeName,
              image: "slankdev/frr",
              interfaces: infConf[nodeName]
            });
          }
        }
      });

      this.tinetConfig = yaml.safeDump(nodes, {
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
