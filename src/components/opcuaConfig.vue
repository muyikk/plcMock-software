<template>
  <div>
    <div class="content">
      <el-tabs type="border-card">
        <el-tab-pane label="基础配置">
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
              <label class="input-label">凭证文件:</label>
              <el-switch v-model="autoPem" active-text="自动" inactive-text="手动" />
              <el-popover placement="top-start" title="凭证文件说明" :width="500" trigger="hover" content="默认使用自动凭证文件，用于启动opcua服务器。  如果报错Failed to read file: Error: ENOENT: no such file or directory,可以在cmd执行以下代码重新生成自签名证书和私钥，并且切到手动凭证文件，详细问题查看README```
openssl req -x509 -newkey rsa:2048 -keyout privateKey.pem -out certificate.pem -days 365 -nodes```">
                <template #reference>
                  <el-icon color="gray">
                    <QuestionFilled />
                  </el-icon>
                </template>
              </el-popover>
            </div>
          </div>
          <el-divider class="divider" />
          <div class="table">
            <!-- 参数列表 -->
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
                    <el-option label="Int32" value="Int32"></el-option>
                    <el-option label="Int64" value="Int64"></el-option>
                    <el-option label="Double" value="Double"></el-option>
                    <el-option label="Float" value="Float"></el-option>
                    <el-option label="String" value="String"></el-option>
                    <el-option label="Array<Int16>" value="Array<Int16>"></el-option>
                    <el-option label="Array<Int32>" value="Array<Int32>"></el-option>
                    <el-option label="Array<Int64>" value="Array<Int64>"></el-option>
                    <el-option label="Array<Float>" value="Array<Float>"></el-option>
                    <el-option label="Array<Double>" value="Array<Double>"></el-option>
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
                  <el-button @click.prevent="addForm(addParams)" type="text" size="small">
                    新增
                  </el-button>
                </template>
              </el-table-column>

              <el-table-column fixed="right" width="80" align="center">
                <template v-slot="scope">
                  <el-button @click.prevent="remove(addParams, scope.$index)" type="text" size="small"
                    style="color: red;">移除</el-button>
                </template>
              </el-table-column>
            </el-table>

          </div>
        </el-tab-pane>
        <el-tab-pane label="心跳设置">
          <!-- 心跳设置 -->
          <div class="table">
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
        </el-tab-pane>
        <el-tab-pane label="监听设置">
          <div class="table">
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
        </el-tab-pane>
        <el-tab-pane label="自增设置">
          <div class="table">
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
        </el-tab-pane>
        <el-tab-pane label="自减设置">
          <div class="table">
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
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <el-tooltip placement="left-start" effect="light" content="实时监控">
    <el-button class="viewParams" size="large" @click="drawer = true" type="primary" circle>
      <el-icon :size="20">
        <View />
      </el-icon>
    </el-button>
  </el-tooltip>

  <el-drawer v-model="drawer" direction="btt" size="80%" title="I am the title" :with-header="false">
    <viewListOPCUA :params="pollingParams" @update-value="update" />
  </el-drawer>

  <div class="footer">
    <div class="button-container">
      <div style="display: flex">
        <el-button v-if="!this.globalStore.$state.isStart" size="default" type="primary" round @click="start"><el-icon>
            <SwitchButton />
          </el-icon>启动服务</el-button>
        <el-button v-if="this.globalStore.$state.isStart" size="default" type="danger" round @click="close"><el-icon>
            <SwitchButton />
          </el-icon>断开服务</el-button>
      </div>
      <div>
        <el-button size="default" type="info" round @click="load">导入参数</el-button>
        <el-button :loading="loading.save" size="default" type="info" round @click="save">保存参数</el-button>
      </div>
    </div>
  </div>
</template>

<script >
import { ref, onUnmounted } from 'vue'
import viewListOPCUA from './viewListOPCUA.vue'
import { ElNotification } from 'element-plus'
import { useGlobalStore } from '../stores/global';
export default {
  components: {
    viewListOPCUA,
  },
  data() {
    return {
      globalStore: useGlobalStore(),
      name: "opcua",
      ip: "127.0.0.1",
      port: 4334,
      structure: "stCCD",
      autoPem: true,
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
    // 判断是否数据填写完整
    hasObjectWithNoEmptyValues(obj) {
      // 遍历对象的值，判断是否至少有一个嵌套对象的所有属性值都不为 ''
      return Object.values(obj).some(
        nestedObj => typeof nestedObj === 'object' && nestedObj !== null &&
          Object.values(nestedObj).every(value => value !== '')
      );
    },
    // 添加操作
    addForm(fromData) {
      console.log(fromData)
      fromData.push({

      });
    },
    // 删除操作
    remove(fromData, index) {
      console.log(fromData, index)
      if (fromData.length <= 1) {
        return;
      }
      fromData.splice(index, 1);
    },
    initOPCUA() {
      window.ipcRenderer.initOPCUA()
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
          autoPem: true,
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
      if (!this.hasObjectWithNoEmptyValues(this.addParams)) {
        ElNotification({
          title: '警告',
          message: '请完善基本参数',
          type: 'warning'
        });
        return
      }
      this.globalStore.$state.isStart = true
      window.ipcRenderer.startOPCUA(
        JSON.stringify({
          name: this.name,
          ip: this.ip,
          port: this.port,
          autoPem: this.autoPem,
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
      this.globalStore.$state.isStart = false
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
    window.ipcRenderer.onInitOPCUAResponse((response) => {
      if (response.success) {
        console.log('OPCUA param init successfully!');
        ElNotification({
          title: '成功',
          message: 'OPCUA服务初始化完成',
          type: 'success'
        });
      }
    });
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
        // this.loading.start = true
      } else {
        this.globalStore.$state.isStart = false
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
        // this.loading.start = false
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
      // this.loading.save = false
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
      let data = JSON.parse(response?.data)
      if (response.success && data.name != 'opcua') {
        ElNotification({
          title: '错误',
          message: '该配置不是opcua配置',
          type: 'error'
        });
        // throw Error('该配置不是modbus配置')
      } else if (response.success) {
        let data = JSON.parse(response.data)
        this.ip = data.ip
        this.port = data.port
        this.structure = data.structure
        this.autoPem = true
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
  margin-bottom: 20px;
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
  margin-bottom: 20px;
}

.table {
  width: 100%;
  /* 确保表格宽度为 100% */
  max-width: 800px;
  /* 设置表格的最大宽度 */
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
