<script setup>
import { useRouter } from "vue-router";
import { ref } from 'vue';

const router = useRouter();
const activeRoute = ref("modbus"); // 使用 ref 保存当前路径
const routeMap = {
  '1': '/opcua',
  '2': '/modbus',
  '3': '/MC',
};

const handleTabClick = (index) => {
  const route = routeMap[index];
  if (route) {
    router.push(route); // 路由跳转
    activeRoute.value = route; // 更新当前活动路由
  }
};
</script>

<template>
  <div id="app">
    <div class="tabs">
      <el-menu :default-active="activeRoute" mode="horizontal" @select="handleTabClick" background-color="#545c64"
        text-color="#fff" active-text-color="#ffd04b">
        <el-menu-item index="1">opcua</el-menu-item>
        <el-menu-item index="2">modbus</el-menu-item>
        <el-menu-item index="3">Mitsubishi MC</el-menu-item>
      </el-menu>
    </div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f0f0f0;
}

.tabs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f1f1f1;
  z-index: 1000;
  padding: 0px;
}

.content {
  /* margin-top: 60px; 留出空间以防内容被标签遮挡 */
  /* margin-bottom: 60px; */
}
</style>
