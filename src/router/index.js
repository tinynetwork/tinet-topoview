import Vue from 'vue';
import VueRouter from 'vue-router';
import TopoView from '../views/TopoView.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'topoview',
    component: TopoView
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
