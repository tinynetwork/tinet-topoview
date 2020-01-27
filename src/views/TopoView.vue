<template>
  <div id="view">
    <v-container fluid>
      <div id="optb">
        <v-col class="d-flex ma-2">
          <v-select
            :items="dropdown_layout"
            label="Layout Style"
            outlined
            value="grid"
            v-model="selectedLayout"
            v-on:change="changeLayout"
          ></v-select>
        </v-col>
        <v-btn class="ma-2" tile outlined color="success" v-on:click="textarea_cytoscape_view">
          <v-icon left>mdi-pencil</v-icon>Draw
        </v-btn>
        <v-btn class="ma-2" tile outlined color="red" v-on:click="textarea_cytoscape_view">
          <v-icon left>fas fa-redo</v-icon>Reload
        </v-btn>
      </div>
      <v-row>
        <v-col cols="6">
          <v-textarea
            clearable
            clear-icon="fas fa-window-close"
            label="Tinet Config"
            v-model="textdata"
            filled
            auto-grow
          ></v-textarea>
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
const panzoom = require("cytoscape-panzoom");
const yaml = require("js-yaml");

cytoscape.use(cola);
panzoom(cytoscape);

export default {
  name: "Cytoscape",
  components: {},
  created: function() {},
  data: function() {
    return {
      dropdown_layout: [
        { text: "fcose" },
        { text: "grid" },
        { text: "random" },
        { text: "circle" },
        { text: "concentric" },
        { text: "breadthfirst" },
        { text: "cose" },
        { text: "cola" }
      ],

      selectedLayout: "cola",
      input: "",
      output: "",
      msg: "vue to cytoscape",
      count: 0,
      textdata: `
nodes:
  - name: dc-R0
    image: slankdev/frr
    interfaces:
      - { name: net0, type: direct, args: dc-R1#net0 }
      - { name: net1, type: direct, args: hoge-R2#net0 }
  - name: dc-R1
    image: slankdev/frr
    interfaces:
      - { name: net0, type: direct, args: dc-R0#net0 }
      - { name: net1, type: direct, args: hoge-R3#net0 }
  - name: hoge-R2
    image: slankdev/frr
    interfaces:
      - { name: net0, type: direct, args: dc-R0#net1 }
      - { name: net1, type: direct, args: C0#net0 }
  - name: hoge-R3
    image: slankdev/frr
    interfaces:
      - { name: net0, type: direct, args: dc-R1#net1 }
      - { name: net1, type: direct, args: C1#net0 }

  - name: C0
    image: slankdev/ubuntu:16.04
    interfaces:
      - { name: net0, type: direct, args: hoge-R2#net1 }
  - name: C1
    image: slankdev/ubuntu:16.04
    interfaces:
      - { name: net0, type: direct, args: hoge-R3#net1 }

node_configs:
  - name: R0
    cmds:
      - cmd: /usr/lib/frr/frr start
      - cmd: ip addr add 10.0.0.1/24 dev net0
      - cmd: ip addr add 10.1.0.1/24 dev net1
      - cmd: >-
          vtysh -c "conf t"
          -c "router bgp 100"
          -c "bgp router-id 1.1.1.1"
          -c "neighbor 10.0.0.2 remote-as 200"
          -c "neighbor 10.1.0.2 remote-as 300"
          -c "network 10.1.0.0/24"
          -c "network 10.1.2.0/24"
  - name: R1
    cmds:
      - cmd: /usr/lib/frr/frr start
      - cmd: ip addr add 10.0.0.2/24 dev net0
      - cmd: ip addr add 10.2.0.1/24 dev net1
      - cmd: >-
          vtysh -c "conf t"
          -c "router bgp 200"
          -c "bgp router-id 2.2.2.2"
          -c "neighbor 10.0.0.1 remote-as 100"
          -c "neighbor 10.2.0.2 remote-as 400"
          -c "network 10.2.0.0/24"
          -c "network 10.2.4.0/24"
  - name: R2
    cmds:
      - cmd: /usr/lib/frr/frr start
      - cmd: ip addr add 10.1.0.2/24 dev net0
      - cmd: ip addr add 10.3.0.1/24 dev net1
      - cmd: >-
          vtysh -c "conf t"
          -c "router bgp 300"
          -c "bgp router-id 3.3.3.3"
          -c "neighbor 10.1.0.1 remote-as 100"
          -c "network 10.3.0.0/24"
  - name: R3
    cmds:
      - cmd: /usr/lib/frr/frr start
      - cmd: ip addr add 10.2.0.2/24 dev net0
      - cmd: ip addr add 10.4.0.1/24 dev net1
      - cmd: >-
          vtysh -c "conf t"
          -c "router bgp 400"
          -c "bgp router-id 4.4.4.4"
          -c "neighbor 10.2.0.1 remote-as 200"
          -c "network 10.4.0.0/24"
  - name: C0
    cmds:
      - cmd: ip addr add 10.3.0.2/24 dev net0
      - cmd: ip route del default
      - cmd: ip route add default via 10.3.0.1
  - name: C1
    cmds:
      - cmd: ip addr add 10.4.0.2/24 dev net0
      - cmd: ip route del default
      - cmd: ip route add default via 10.4.0.1

test:
  - cmds:
      - cmd: docker exec C0 ping -c2 10.4.0.2
`
    };
  },
  methods: {
    textarea_cytoscape_view: function() {
      try {
        const tnconfig = yaml.safeLoad(this.textdata);
        let nodes = [];
        let edges = [];

        let edgeMap = {};
        let nodeGroups = [];
        for (let i = 0; i < tnconfig.nodes.length; i++) {
          let nodeNameArg = tnconfig.nodes[i].name.split("-");
          let nodeName = "";
          let nodeGroup = "";
          if (nodeNameArg.length > 1) {
            nodeName = nodeNameArg[1];
            nodeGroup = nodeNameArg[0];
            nodeGroups.push(nodeGroup);
          } else {
            nodeName = nodeNameArg[0];
          }

          let node = "";
          if (nodeGroup != "") {
            node = {
              data: { id: nodeName, name: nodeName, parent: nodeGroup }
            };
          } else {
            node = {
              data: { id: nodeName, name: nodeName }
            };
          }
          nodes.push(node);

          for (let j = 0; j < tnconfig.nodes[i].interfaces.length; j++) {
            let infArgs = tnconfig.nodes[i].interfaces[j].args.split("#");
            let infNodeArgs = infArgs[0].split("-");
            let targetNode = "";
            if (infNodeArgs.length > 1) {
              targetNode = infNodeArgs[1];
            } else {
              targetNode = infNodeArgs[0];
            }
            let sourceNode = nodeName;
            let sourceInf = tnconfig.nodes[i].interfaces[j].name;
            let targetInf = infArgs[1];
            let infLinkInfo = sourceInf + ":" + targetInf;
            let key = sourceNode + ":" + targetNode;
            let reverseKey = targetNode + ":" + sourceNode;

            if (!edgeMap[reverseKey]) {
              edgeMap[key] = infLinkInfo;
            }
          }
        }

        let edgeMapKeys = Object.keys(edgeMap);

        let setNodeGroups = new Set(nodeGroups);
        let setNodeGroups2Arr = Array.from(setNodeGroups);

        for (let k = 0; k < edgeMapKeys.length; k++) {
          let edgeInfo = edgeMapKeys[k].split(":");
          let linkName = edgeMap[edgeMapKeys[k]];
          let edge = {
            data: { source: edgeInfo[0], target: edgeInfo[1], name: linkName }
          };
          edges.push(edge);
        }

        for (let l = 0; l < setNodeGroups2Arr.length; l++) {
          let nodeGroupInfo = setNodeGroups2Arr[l];
          let nodeGroupData = {
            data: {
              id: nodeGroupInfo,
              type: nodeGroupInfo,
              name: nodeGroupInfo
            }
          };
          nodes.push(nodeGroupData);
        }

        let elements = { nodes: nodes, edges: edges };

        this.view_draw(elements);
      } catch (e) {
        console.log(e);
        alert("Failed!!\nPlease check the textarea!");
      }
    },
    view_draw: function(elements) {
      this.cy = cytoscape({
        container: document.getElementById("cy"),
        boxSelectionEnabled: false,
        autounselectify: true,
        elements: elements,
        layout: {
          name: this.selectedLayout,
          directed: true,
          padding: 70,
          avoidOverlap: true,
          animate: false,
          fit: true
        }
      });
      this.cy.nodes().forEach(node => {
        let data = node.json().data;
        if (!data.type) {
          node.css("width", "label");
          node.css("height", "label");
          node.css("padding", "20px");
          node.css("content", data.name);
          node.css("text-justification", "left");
          node.css("text-valign", "center");
          node.css("text-halign", "center");
          node.css("text-wrap", "wrap");
          node.css("shape", "round-rectangle");
          node.css("background-color", "#29B6F6");
        } else if (data.type) {
          const colors = [
            "#E53935",
            "#FF5252",
            "#8E24AA",
            "#4A148C",
            "#5E35B1",
            "#3949AB",
            "#42A5F5",
            "#0D47A1",
            "#039BE5",
            "#00ACC1",
            "#00897B",
            "#43A047",
            "#7CB342",
            "#FFEE58",
            "#FFB300",
            "#B2EDCE",
            "#4eb7d9",
            "#ffdaf4"
          ];
          node.css("content", data.name);
          node.css("text-valign", "top");
          node.css(
            "background-color",
            colors[Math.floor(Math.random() * colors.length)]
          );
        }
      });

      this.cy.edges().forEach(edge => {
        let data = edge.json().data;
        edge.css("content", data.name);
        edge.css("padding", "20px");
        edge.css("text-valign", "top");
        edge.css("text-halign", "center");
        edge.css("width", "6");
        edge.css("color", "#263238");
        edge.css("curve-style", "bezier");
        edge.css("target-arrow-shape", "none");
        edge.css("text-rotation", "autorotate");
        edge.css("text-margin-x", "0px");
        edge.css("text-margin-y", "0px");
      });

      this.cy.panzoom({});
    },
    changeLayout: function() {
      let layout = {
        name: this.selectedLayout,
        // fit: true,
        // animate: true
        directed: true,
        padding: 10
      };
      this.cy.layout(layout).run();
    }
  },
  computed: {},
  mounted: function() {
    this.textarea_cytoscape_view();
  }
};
</script>
<style scoped>
#cy {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 999;
  /* top: 300px; */
  background-color: #e9e9e9;
}

#optb {
  text-align: center;
}

body {
  font: 10px helvetica neue, helvetica, arial, sans-serif;
}
</style>
