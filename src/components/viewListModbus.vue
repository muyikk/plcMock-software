<template>
  <!-- {{ localParams }} -->
  <el-table :data="localParams" style="width: 100%">
    <el-table-column prop="param" label="参数名" width="150" align="center">
      <template v-slot="scope">
        <el-input v-model="scope.row.param" disabled></el-input>
      </template>
    </el-table-column>
    <el-table-column type="expand" width="50  ">
      <template #default="props">
        <el-table :data="props.row.address">
          <el-table-column prop="address" label="address" />
          <el-table-column prop="value" label="value" />
        </el-table>
      </template>
    </el-table-column>
    <el-table-column prop="addr" label="地址" width="100" align="left">
      <template v-slot="scope">
        <el-input v-model="scope.row.addr" disabled></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="type" label="类型" width="100" align="center">
      <template v-slot="scope">
        <el-input v-model="scope.row.type" disabled></el-input>
      </template>
    </el-table-column>
    <el-table-column prop="value" label="值" width="150" align="center">
      <template v-slot="scope">
        <el-input v-model="scope.row.value" disabled></el-input>
      </template>
    </el-table-column>
    <el-table-column label="修改值" width="200" align="center">
      <template v-slot="scope">
        <el-input v-model="newValues[scope.row.param]" placeholder="输入新值"></el-input>
      </template>
    </el-table-column>
    <el-table-column width="100" align="center">
      <template v-slot="scope">
        <el-button type="primary" circle @click="updateValue(scope.row)">
          <el-icon>
            <Edit />
          </el-icon>
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
      newValues: {},
      localParams: [] // 转换数据
    };
  },
  watch: {
    params: {
      handler(newParams) {
        // console.log(this.localParams)
        if (this.localParams.length == 0) {
          this.localParams = this.transformDataToArray(newParams)
          this.newValues = this.transformNewValue(newParams)
        } else {
          let newData = this.transformDataToArray(newParams);
          for (let key in newData) {
            if (this.localParams[key].value != newData[key].value) {
              this.localParams[key].value = newData[key]?.value
              this.localParams[key].address = newData[key]?.address
            }
          }
        }
      },
      deep: true
    }
  },

  methods: {
    formatAddr(row) {
      return row.addr.map(item => `${item.addr}: ${item.value}`).join(', ');
    },
    transformDataToArray(params) {
      // 将对象转换为数组格式，以便在表格中显示
      return Object.keys(params).map(key => ({
        param: key,
        type: params[key].type,
        value: params[key].value,
        addr: params[key].addr,
        address: params[key].address,
        newValue: '' // 用于编辑
      }));
    },
    transformNewValue(params) {
      // 将对象转换为数组格式，以便在表格中显示
      return Object.keys(params).map(key => ({
        key: '',
      }));
    },
    updateValue(row) {
      // 更新值并记录

      // 发送更新的值到父组件
      console.log({ param: row.param, newValue: this.newValues[row.param] })
      this.$emit('update-value', { param: row.param, newValue: this.newValues[row.param] });
      row.newValue = '';

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
