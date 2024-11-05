<template>
  <div>
    <div class="content">
      <div class="baseConfig">
        <!-- IP 和端口配置 -->
        <div class="input">
          <label class="input-label">IP 地址:</label>
          <el-input v-model="ip" type="text" placeholder="127.0.0.1" style="width: 200px" />
          <label class="input-label">端口:</label>
          <el-input v-model="port" type="number" placeholder="4334" style="width: 200px" />
        </div>
        <div class="input">
          <label class="input-label">结构体:</label>
          <el-input v-model="structure" type="text" placeholder="stCCD" style="width: 200px" />
        </div>
      </div>
      <el-divider class="divider" />
      <div class="table">
        <!-- 参数列表 -->
        <h3>参数列表</h3>
        <el-table :data="addParams" style="width: 100%;">
          <el-table-column prop="param" label="参数名" min-width="150" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.param"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="类型" prop="type" min-width="120" align="center">
            <template v-slot="scope">
              <el-select v-model="scope.row.type" placeholder="请选择类型">
                <el-option label="Int16" value="Int16"></el-option>
                <el-option label="Double" value="Double"></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column prop="value" label="值" min-width="150" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.value"></el-input>
            </template>
          </el-table-column>

          <el-table-column fixed="right" min-width="80" align="center">
            <template v-slot="scope">
              <el-button @click="addForm(addParams)" type="text" size="small">
                新增
              </el-button>
            </template>
          </el-table-column>

          <el-table-column fixed="right" min-width="80" align="center">
            <template v-slot="scope">
              <el-button @click="remove(addParams, scope.row)" type="text" size="small" style="color: red;">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

      </div>
    </div>
    <div class="table">
      <!-- 心跳设置 -->
      <div class="table">
        <h3>心跳设置</h3>
        <el-table :data="hearts" style="width: 100%;">
          <el-table-column label="参数名" prop="param" min-width="150" align="center">
            <template v-slot="scope">
              <el-select v-model="scope.row.param" placeholder="请选择参数名">
                <el-option v-for="item in addParams" :key="item.param" :label="item.param"
                  :value="item.param"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="data1" label="值1" min-width="100" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.data1"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="data2" label="值2" min-width="100" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.data2"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="interval" label="间隔时间(ms)" min-width="120" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.interval"></el-input>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="80" align="center">
            <template v-slot="scope">
              <el-button @click.prevent="addForm(hearts)" type="text" size="small">新增</el-button>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="80" align="center">
            <template v-slot="scope">
              <el-button @click.prevent="remove(hearts, scope.$index)" type="text" size="small"
                style="color: red;">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="table">
        <h3>监听设置</h3>
        <el-table :data="listens" style="width: 100%;">
          <el-table-column label="参数名" prop="param" min-width="170" align="center">
            <template v-slot="scope">
              <el-select v-model="scope.row.param" placeholder="请选择参数名">
                <el-option v-for="item in addParams" :key="item.param" :label="item.param"
                  :value="item.param"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="data" label="参数值" min-width="100" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.data"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="被改变的参数名" prop="changeParam" min-width="170" align="center">
            <template v-slot="scope">
              <el-select v-model="scope.row.changeParam" placeholder="请选择参数名">
                <el-option v-for="item in addParams" :key="item.param" :label="item.param"
                  :value="item.param"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="changeValue" label="被改变的值" min-width="100" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.changeValue"></el-input>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="80" align="center">
            <template v-slot="scope">
              <el-button @click.prevent="addForm(listens)" type="text" size="small">新增</el-button>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="80" align="center">
            <template v-slot="scope">
              <el-button @click.prevent="remove(listens, scope.$index)" type="text" size="small"
                style="color: red;">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="table">
        <h3>自增设置</h3>
        <el-table :data="increase" style="width: 100%;">
          <el-table-column label="参数名" prop="param" min-width="150" align="center">
            <template v-slot="scope">
              <el-select v-model="scope.row.param" placeholder="请选择参数名">
                <el-option v-for="item in addParams" :key="item.param" :label="item.param"
                  :value="item.param"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="tolerance" label="自增公差" min-width="100" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.tolerance"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="interval" label="时间间隔(ms)" min-width="110" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.interval"></el-input>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="80" align="center">
            <template v-slot="scope">
              <el-button @click.prevent="addForm(increase)" type="text" size="small">新增</el-button>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="80" align="center">
            <template v-slot="scope">
              <el-button @click.prevent="remove(increase, scope.$index)" type="text" size="small"
                style="color: red;">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="table">
        <h3>自减设置</h3>
        <el-table :data="decrease" style="width: 100%;">
          <el-table-column label="参数名" prop="param" min-width="150" align="center">
            <template v-slot="scope">
              <el-select v-model="scope.row.param" placeholder="请选择参数名">
                <el-option v-for="item in addParams" :key="item.param" :label="item.param"
                  :value="item.param"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="tolerance" label="自减公差" min-width="100" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.tolerance"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="interval" label="时间间隔(ms)" min-width="110" align="center">
            <template v-slot="scope">
              <el-input v-model="scope.row.interval"></el-input>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="80" align="center">
            <template v-slot="scope">
              <el-button @click.prevent="addForm(decrease)" type="text" size="small">新增</el-button>
            </template>
          </el-table-column>
          <el-table-column fixed="right" width="80" align="center">
            <template v-slot="scope">
              <el-button @click.prevent="remove(decrease, scope.$index)" type="text" size="small"
                style="color: red;">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <el-button class="viewParams" @click="drawer = true" type="primary" circle><el-icon>
      <View />
    </el-icon></el-button>

  <el-drawer v-model="drawer" direction="btt" size="80%" title="I am the title" :with-header="false">
    <viewList :params="pollingParams" @update-value="update" />
  </el-drawer>

  <div class="footer">
    <div class="button-container">
      <div style="display: flex">
        <el-button :loading="loading.save" size="small" type="info" round @click="save">保存参数</el-button>
        <el-button size="small" type="info" round @click="load">导入参数</el-button>
      </div>
      <div>
        <el-button :loading="loading.start" size="small" type="primary" round @click="start">启动服务</el-button>
        <el-button size="small" type="danger" round @click="close">断开服务</el-button>
        <!-- <Edit /> -->
      </div>
    </div>
  </div>
</template>

<script >
import { ref, onUnmounted } from 'vue'
import viewList from './viewList.vue'
import { ElNotification } from 'element-plus'
export default {
  components: {
    viewList,
  },
  data() {
    return {
      name: "modbus",
      ip: "127.0.0.1",
      port: 4334,
      structure: "stCCD",
      // 参数列表
      addParams: [
        {
          param: "test1",
          type: "Int16",
          value: "123",
        },
        {
          param: "test2",
          type: "",
          value: "",
        },
      ],
      // 心跳列表
      hearts: [
        {
          param: "",
          data1: "",
          data2: "",
          interval: ""
        }
      ],
      // 监听列表
      listens: [
        {
          param: "",
          data: "",
          changeParam: "",
          changeValue: ""
        }
      ],
      // 自增列表
      increase: [
        {
          param: "",
          tolerance: "",
          interval: ""
        }
      ],
      // 自减列表
      decrease: [
        {
          param: "",
          tolerance: "",
          interval: ""
        }
      ],
      loading: {
        save: false,
        load: false,
        start: false,
        close: false,
      },
      drawer: ref(false),
      // 轮询最新数据
      pollingParams: {},
    };
  },
  methods: {
    // 添加操作
    addForm(fromData) {
      console.log(fromData)
      fromData.push({

      });
    },
    // 删除操作
    remove(fromData, index) {
      if (fromData.length <= 1) {
        return;
      }
      fromData.splice(index, 1);
    },
    save() {
      this.loading.save = true;
      // 超过5s超时报警
      setTimeout(() => {
        if (this.loading.save == true) {
          this.loading.save = false
          ElNotification({
            title: '错误',
            message: '保存超时',
            type: 'error'
          });
        }
      }, 5000);
      // 发送保存数据
      window.ipcRenderer.saveOPCUA(
        JSON.stringify({
          name: this.name,
          ip: this.ip,
          port: this.port,
          structure: this.structure,
          mockParams: this.addParams,
          hearts: this.hearts,
          listens: this.listens,
          increase: this.increase,
          decrease: this.decrease
        })
      );
    },
    async load() {
      const filePaths = await window.electron.openFile();
      window.ipcRenderer.loadOPCUA(filePaths);
      console.log(filePaths)
    },
    start() {
      window.ipcRenderer.startOPCUA(
        JSON.stringify({
          name: this.name,
          ip: this.ip,
          port: this.port,
          structure: this.structure,
          mockParams: this.addParams,
          hearts: this.hearts,
          listens: this.listens,
          increase: this.increase,
          decrease: this.decrease
        })
      )
    },
    close() {
      console.log(`vue closeOPCUA`)
      window.ipcRenderer.closeOPCUA()
    },
    view() {
      this.drawer = true
    },
    update({ param, newValue }) {
      window.ipcRenderer.updateOPCUA({ param, newValue })
    },
    polling() {
      window.ipcRenderer.pollingOPCUA()
    },
  },
  mounted() {
    window.ipcRenderer.onPollingOPCUAResponse((response) => {
      if (response.success) {
        this.pollingParams = response.polling
        // console.log(this.pollingParams)
      } else {
        console.error('Error:', response.error);
        ElNotification({
          title: '错误',
          message: '获取服务器数据失败',
          message: response.error,
          type: 'error'
        });
      }
    });
    window.ipcRenderer.onStartOPCUAResponse((response) => {
      if (response.success) {
        console.log('server start successfully!');
        ElNotification({
          title: '成功',
          message: 'OPCUA服务启动成功',
          type: 'success'
        });

        this.polling()
        this.drawer = true
        this.loading.start = true
      } else {
        console.error('Error:', response.error);
        ElNotification({
          title: '错误',
          message: 'OPCUA服务启动失败',
          message: response.error,
          type: 'error'
        });
      }
    });
    window.ipcRenderer.onUpdateOPCUAResponse((response) => {
      // if (response.success) {
      //   console.log('server close successfully!');
      //   ElNotification({
      //     title: '警告',
      //     message: 'OPCUA服务已关闭',
      //     type: 'warning'
      //   });
      // } else {
      //   console.error('Error:', response.error);
      //   ElNotification.error({
      //     title: '错误',
      //     message: 'OPCUA服务关闭失败',
      //     message: response.error
      //   });
      // }
    });
    window.ipcRenderer.onCloseOPCUAResponse((response) => {
      if (response.success) {
        console.log('server close successfully!');
        ElNotification({
          title: '警告',
          message: 'OPCUA服务已关闭',
          type: 'warning'
        });
        this.loading.start = false
      } else {
        console.error('Error:', response.error);
        ElNotification({
          title: '错误',
          message: 'OPCUA服务关闭失败',
          message: response.error,
          type: 'error'
        });
      }
    });
    window.ipcRenderer.onSaveOPCUAResponse((response) => {
      this.loading.save = false
      if (response.success) {
        console.log('config saved successfully!');
        ElNotification({
          title: '成功',
          message: '保存成功',
          type: 'success'
        });
      } else {
        console.error('Error saving config:', response.error);
        ElNotification({
          title: '错误',
          message: response.error,
          type: 'error'
        });
      }
    });
    window.ipcRenderer.onLoadOPCUAResponse((response) => {
      if (response.success) {
        let data = JSON.parse(response.data)
        this.ip = data.ip
        this.port = data.port
        this.structure = data.structure
        this.addParams = data.mockParams
        this.hearts = data.hearts
        this.listens = data.listens
        this.increase = data.increase
        this.decrease = data.decrease

        console.log('config load successfully!');
        ElNotification({
          title: '成功',
          message: '读取成功',
          type: 'success'
        });
      } else {
        console.error('Error saving config:', response.error);
        ElNotification({
          title: '错误',
          message: response.error,
          type: 'error'
        });
      }
    });
  }
}

</script>

<style scoped>
.baseConfig {
  padding: 10px;
  display: flex;
  flex-direction: column;
  /* 垂直排列 */
  gap: 10px;
  /* 行间距 */

}

.input {
  display: flex;
  /* 水平排列输入框 */
  gap: 10px;
  /* 输入框之间的间距 */
}

.input-label {
  width: 100px;
  /* 设置固定宽度，以确保对齐 */
  margin-right: 10px;
  /* 标签与输入框之间的间距 */
  text-align: center;
}

.divider {
  margin: 0;
}

.table {
  width: 100%;
  /* 确保表格宽度为 100% */
  max-width: 800px;
  /* 设置表格的最大宽度 */
  margin: 0 auto;
  /* 中心对齐 */
}

.table-addParams {
  /* display: ruby; */
  background: #f0f0f0;
}

.footer {
  position: fixed;
  bottom: 0;
  /* 固定在底部 */
  left: 0;
  /* 左对齐 */
  right: 0;
  /* 右对齐 */
  background-color: #ffffff;
  /* 背景颜色 */
  padding: 10px;
  /* 内边距 */
  border-top: 1px solid #ccc;
  /* 顶部边框 */
  z-index: 1000;
}

.button-container {
  display: flex;
  justify-content: space-between;
  /* 左右分散对齐 */
  align-items: center;
  /* 垂直居中对齐 */
}

.viewParams {
  size: default;
  position: fixed;
  bottom: 60px;
  /* 固定在底部 */
  right: 15px;
  /* 右对齐 */
  padding: 10px;
  /* 顶部边框 */
  z-index: 1000;
}
</style>
