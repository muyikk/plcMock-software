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
    <el-container style="height: 100%; width: 100%;">
      <el-aside class="aside" width = "200px">
        <el-image src="src\assets\icon.png" style="width: 100px; height: 100px; " :fit="fit" />
        <div class="tabs">
          <el-menu :default-active="activeRoute" mode="vertical" @select="handleTabClick" background-color="#324057"
            text-color="#fff">
            <el-menu-item index="/opcua" :exact="true">opcua</el-menu-item>
            <el-menu-item index="/modbus" :exact="true">modbus</el-menu-item>
            <el-menu-item index="/MC" :exact="true">Mitsubishi MC</el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      <div class="content" style="height: 100%; width: 100%;">
        <router-view></router-view>
      </div>
    </el-container>
  </div>
</template>

<style>
#app {
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

.aside {
  background-color: #324057;
  /* z-index: 1000; */
}

.tabs {

}
</style>
