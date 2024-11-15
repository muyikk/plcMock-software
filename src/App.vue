<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from 'vue';
// debugger
const activeRoute = ref("/opcua"); // 使用 ref 保存当前路径
const router = useRouter();

const handleTabClick = (index) => {
  activeRoute.value = index;
  router.push(index);
};

onMounted(() => {
  // 设置 activeRoute 为当前路由,避免重新渲染造成活动状态重置
  activeRoute.value = router.currentRoute.value.path;
})
</script>

<template>
  <div id="app">
    <div class="tabs">
      <el-menu :default-active="activeRoute" mode="horizontal" @select="handleTabClick" background-color="#545c64"
        text-color="#fff">
        <el-menu-item index="/opcua" :exact="true">opcua</el-menu-item>
        <el-menu-item index="/modbus" :exact="true">modbus</el-menu-item>
        <el-menu-item index="/MC" :exact="true">Mitsubishi MC</el-menu-item>
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

</style>
