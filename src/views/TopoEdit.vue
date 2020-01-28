<template>
  <div id="edit">
    <v-container fluid>
      <v-row>
        <v-col cols="6">
          <div id="editoption">
            <v-dialog v-model="dialog" persistent max-width="600px">
              <template v-slot:activator="{ on }">
                <v-btn class="ma-2" tile outlined color="success" v-on="on">
                  <v-icon left>fas fa-plus</v-icon>Add Node
                </v-btn>
              </template>
              <v-card id="addNodeDialog">
                <v-card-title>
                  <span class="headline">Node</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          label="Name*"
                          required
                          v-model="InputName"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="dialog = false"
                    >Close</v-btn
                  >
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="
                      add_node();
                      dialog = false;
                    "
                    >addNode</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-btn
              class="ma-2"
              tile
              outlined
              color="blue"
              v-on:click="saveConfig"
            >
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
const cytoscape = require('cytoscape');
const cola = require('cytoscape-cola');
const edgehandles = require('cytoscape-edgehandles');
const yaml = require('js-yaml');

cytoscape.use(cola);
cytoscape.use(edgehandles);

export default {
  name: 'TopoEdit',
  components: {},
  created: function() {},
  data: function() {
    return {
      dialog: false,
      InputName: '',
      tinetConfig: ''
    };
  },
  methods: {
    add_node: function() {
      this.cy.add([
        {
          group: 'nodes',
          data: { id: this.InputName, name: this.InputName },
          position: { x: 300, y: 200 }
        }
      ]);
    },
    view_init: function() {
      this.cy = cytoscape({
        container: document.getElementById('cy'),
        boxSelectionEnabled: false,
        autounselectify: true,
        style: cytoscape
          .stylesheet()
          .selector('node')
          .css({
            height: 80,
            width: 80,
            'background-fit': 'cover',
            'border-color': '#000',
            'border-width': 3,
            'border-opacity': 0.5,
            content: 'data(name)',
            'text-valign': 'center'
          })
          .selector('edge')
          .css({
            width: 6,
            'target-arrow-shape': 'none',
            'line-color': '#ffaaaa',
            'target-arrow-color': '#ffaaaa',
            'curve-style': 'bezier'
          }),
        elements: {
          nodes: [],
          edges: []
        },
        layout: {
          name: 'cola',
          directed: true,
          padding: 10
        }
      });
      this.cy.edgehandles();
      // this.cy.edgeEditing({ undoable: true, bendRemovalSensitivity: 16 });
      // this.cy.style().update();
    },
    saveConfig: function() {
      const cytoscapeJson = this.cy.json();

      this.cytoscape2tnconf(cytoscapeJson.elements);
    },
    cytoscape2tnconf: function(nodeJson) {
      const nodeMap = {};
      for (let i = 0; i < nodeJson.nodes.length; i++) {
        let nodeName = nodeJson.nodes[i].data.name;
        let node = {};
        node['name'] = nodeName;
        nodeMap[nodeName] = true;
      }

      const nodeEdges = {};
      for (let j = 0; j < nodeJson.edges.length; j++) {
        const sourceNode = nodeJson.edges[j].data.source;
        const targetNode = nodeJson.edges[j].data.target;
        console.log('nodeEdges');
        console.log(nodeEdges[sourceNode]);
        if (nodeEdges[sourceNode] === undefined) {
          nodeEdges[sourceNode] = [{ num: j, node: targetNode }];
        } else {
          nodeEdges[sourceNode].push({ num: j, node: targetNode });
        }

        if (nodeEdges[targetNode] === undefined) {
          nodeEdges[targetNode] = [{ num: j, node: sourceNode }];
        } else {
          nodeEdges[targetNode].push({ num: j, node: sourceNode });
        }
        console.log('waiwai' + String(j));
        console.log(nodeEdges[sourceNode]);
        console.log(nodeEdges[targetNode]);
      }

      const nodeEdgesKey = Object.keys(nodeEdges);

      const nodes = {};
      nodes['nodes'] = [];

      const nodeConf = {};

      nodeEdgesKey.forEach(nodeEdge => {
        console.log(nodeEdges[nodeEdge]);
        for (let k = 0; k < nodeEdges[nodeEdge].length; k++) {
          const infNum = nodeEdges[nodeEdge][k].num;
          const tgtNode = nodeEdges[nodeEdge][k].node;
          const link = {
            node: nodeEdge,
            interfaces: {
              name: 'net' + infNum,
              type: 'direct',
              target: tgtNode
            }
          };
          if (nodeConf[link['node']] === undefined) {
            nodeConf[link['node']] = [link];
          } else {
            nodeConf[link['node']].push(link);
          }

          nodes['nodes'].push(link);
        }
      });

      for (const key in nodeConf) {
        nodeConf[key].forEach(node => {
          console.log(node['node']);
          console.log(node['interfaces']);
          const tgtNode = node['interfaces']['target'];
          nodeConf[tgtNode].forEach(target => {
            console.log('target: ' + target['node'], target['interfaces']);
            if (target['interfaces']['target'] === node['node']) {
              const args = target['node'] + '#' + target['interfaces']['name'];
              const targetArgs =
                node['node'] + '#' + node['interfaces']['name'];
              console.log('args: ', args);
              node['interfaces']['args'] = args;
              target['interfaces']['args'] = targetArgs;
            }
          });
          delete node['interfaces']['target'];
          console.log('node: ' + node);
        });
      }

      const nodesMap = {};
      for (let key in nodes['nodes']) {
        console.log('key: ' + key + ', value: ' + nodes['nodes'][key]['node']);
        if (nodesMap[nodes['nodes'][key]['node']] === undefined) {
          nodesMap[nodes['nodes'][key]['node']] = [
            nodes['nodes'][key]['interfaces']
          ];
        } else {
          nodesMap[nodes['nodes'][key]['node']].push(
            nodes['nodes'][key]['interfaces']
          );
        }
      }

      const nodeSettings = [];
      for (const nodeKey in nodesMap) {
        const setting = {
          name: nodeKey,
          image: '',
          interfaces: nodesMap[nodeKey]
        };
        nodeSettings.push(setting);
      }
      this.tinetConfig = yaml.safeDump(nodeSettings, {
        indent: 4
      });
    },
    Init: function() {
      this.tinetConfig = '';
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

#addNodeDialog {
  position: absolute;
  top: 100px;
  width: 40%;
  left: 80px;
}
body {
  font: 14px helvetica neue, helvetica, arial, sans-serif;
}
</style>
