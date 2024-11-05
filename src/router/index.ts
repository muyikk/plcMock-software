import { createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import opcua from '../components/opcuaConfig.vue';
import modbus from '../components/modbusConfig.vue';
import MC from '../components/MCConfig.vue'


const routes: RouteRecordRaw[] = [
  { path: '/opcua', component: opcua, name: 'opcua' },
  { path: '/modbus', component: modbus, name: 'modbus' },
  { path: '/MC', component: MC, name: 'MC' },
  { path: '/', redirect: '/opcua' },
];
const router = createRouter({ history: createWebHashHistory(), routes });
export default router;

