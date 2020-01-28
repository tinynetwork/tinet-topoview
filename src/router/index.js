import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import TopoView from '../views/TopoView.vue';
import TopoEdit from '../views/TopoEdit.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/view',
    name: 'topoview',
    component: TopoView
  },
  {
    path: '/edit',
    name: 'topoedit',
    component: TopoEdit
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
