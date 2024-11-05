<template>
  <el-table :data="localParams" style="width: 100%">
    <el-table-column prop="param" label="参数名" width="150" align="left">
      <template v-slot="scope">
        <el-input v-model="scope.row.param" disabled></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="type" label="类型" width="100" align="center">
      <template v-slot="scope">
        <el-input v-model="scope.row.type" disabled></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="value" label="值" width="200" align="right">
      <template v-slot="scope">
        <el-input v-model="scope.row.value" disabled></el-input>
      </template>
    </el-table-column>
    <el-table-column label="修改值" width="200" align="center">
      <template v-slot="scope">
        <el-input v-model="scope.row.newValue" placeholder="输入新值"></el-input>
      </template>
    </el-table-column>
    <el-table-column width="100" align="center">
      <template v-slot="scope">
        <el-button type="primary" circle @click="updateValue(scope.row)">
          <el-icon><Edit /></el-icon>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { Edit } from '@element-plus/icons-vue';

export default {
  props: {
    params: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localParams: this.transformDataToArray(this.params) // 转换数据
    };
  },
 watch: {
  params: {
    handler(newParams) {
      let oldData = this.localParams
      this.localParams = this.transformDataToArray(newParams); 
      // 保证 newValue 保持不变
      for(let key in this.localParams) {
        this.localParams[key].newValue = oldData[key]?.newValue
      }
      // oldData.forEach(item => {
      //   item.newValue = item.newValue; // 保持用户输入的临时值
      // });
    },
    deep: true
  }
},

  methods: {
    transformDataToArray(params) {
      // 将对象转换为数组格式，以便在表格中显示
      return Object.keys(params).map(key => ({
        param: key,
        type: params[key].type,
        value: params[key].value,
        newValue: '' // 用于编辑
      }));
    },
    updateValue(row) {
      // 更新值并记录
      // row.value = row.newValue;

      // 发送更新的值到父组件
      console.log({ param: row.param, newValue: row.newValue })
      this.$emit('update-value', { param: row.param, newValue: row.newValue });
    }
  },
  components: {
    Edit
  }
};
</script>

<style scoped>
.el-table {
  margin: 20px 0;
}
</style>
