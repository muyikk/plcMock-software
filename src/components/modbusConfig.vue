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
          <label class="input-label"> 字节顺序:</label>
         <el-select v-model="byteOrder" style="width: 200px">
            <option value="CDAB">CDAB</option>
            <option value="ABCD">ABCD</option>
          </el-select>
          （国内常用ABCD，国外常用CDAB）
        </div>
      </div>
      <el-divider class="divider" />
      <div class="table">
        <!-- 参数列表 -->
        <h3>参数列表</h3>
        <div class="table-addParams">
          <el-table :data="addParams" style="width: 90%;">

            <el-table-column prop="param" label="参数名" width="100%">
              <template v-slot="scope">
                <el-input v-model="scope.row.param"></el-input>
              </template>
            </el-table-column>

            <el-table-column prop="addr" label="地址" width="100%">
              <template v-slot="scope">
                <el-input v-model="scope.row.addr"></el-input>
              </template>
            </el-table-column>

            <el-table-column label="类型" prop="type" width="110%">
              <template v-slot="scope">
                <el-select v-model="scope.row.type" placeholder="请选择类型">
                  <el-option label="short" value="short"></el-option>
                  <el-option label="float" value="float"></el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column prop="value" label="值" width="200%">
              <template v-slot="scope">
                <el-input v-model="scope.row.value"></el-input>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template>
                <el-button @click.native.prevent="addForm(addParams)" type="text" size="small">
                  新增
                </el-button>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template slot-scope="scope">
                <el-button @click.native.prevent="remove(addParams, scope.$index)" type="text" size="small"
                  style="color: red;">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="table">
        <!-- 心跳设置 -->
        <h3>心跳设置</h3>
        <div class="table-hearts">
          <el-table :data="hearts" style="width: 90%;">

            <el-table-column label="参数名" prop="param" width="150%">
              <template v-slot="scope">
                <el-select v-model="scope.row.param" placeholder="请选择参数名">
                  <el-option v-for="item in addParams" :key="item.param" :label="item.param" :value="item.param">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column prop="data1" label="值1" width="100%">
              <template v-slot="scope">
                <el-input v-model="scope.row.data1"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="data2" label="值2" width="100%">
              <template v-slot="scope">
                <el-input v-model="scope.row.data2"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="interval" label="间隔时间(ms)" width="120%">
              <template v-slot="scope">
                <el-input v-model="scope.row.interval"></el-input>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template>
                <el-button @click.native.prevent="addForm(hearts)" type="text" size="small">
                  新增
                </el-button>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template slot-scope="scope">
                <el-button @click.native.prevent="remove(hearts, scope.$index)" type="text" size="small"
                  style="color: red;">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="table">
        <!-- 监听设置 -->
        <h3>监听设置</h3>
        <div class="table-listens">
          <el-table :data="listens" style="width: 90%;">

            <el-table-column label="参数名" prop="param" width="150%">
              <template v-slot="scope">
                <el-select v-model="scope.row.param" placeholder="请选择参数名">
                  <el-option v-for="item in addParams" :key="item.param" :label="item.param" :value="item.param">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column prop="data" label="参数值" width="100%">
              <template v-slot="scope">
                <el-input v-model="scope.row.data"></el-input>
              </template>
            </el-table-column>

            <el-table-column label="被改变的参数名" prop="changeParam" width="150%">
              <template v-slot="scope">
                <el-select v-model="scope.row.changeParam" placeholder="请选择参数名">
                  <el-option v-for="item in addParams" :key="item.param" :label="item.param" :value="item.param">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column prop="changeValue" label="被改变的值" width="100%">
              <template v-slot="scope">
                <el-input v-model="scope.row.changeValue"></el-input>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template>
                <el-button @click.native.prevent="addForm(listens)" type="text" size="small">
                  新增
                </el-button>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template slot-scope="scope">
                <el-button @click.native.prevent="remove(listens, scope.$index)" type="text" size="small"
                  style="color: red;">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="table">
        <!-- 自增设置 -->
        <h3>自增设置</h3>
        <div class="table-increase">
          <el-table :data="increase" style="width: 90%;">

            <el-table-column label="参数名" prop="param" width="150%">
              <template v-slot="scope">
                <el-select v-model="scope.row.param" placeholder="请选择参数名">
                  <el-option v-for="item in addParams" :key="item.param" :label="item.param" :value="item.param">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column prop="tolerance" label="自增公差" width="100%">
              <template v-slot="scope">
                <el-input v-model="scope.row.tolerance"></el-input>
              </template>
            </el-table-column>

            <el-table-column prop="interval" label="时间间隔(ms)" width="110%">
              <template v-slot="scope">
                <el-input v-model="scope.row.interval"></el-input>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template>
                <el-button @click.native.prevent="addForm(increase)" type="text" size="small">
                  新增
                </el-button>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template slot-scope="scope">
                <el-button @click.native.prevent="remove(increase, scope.$index)" type="text" size="small"
                  style="color: red;">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="table">
        <!-- 自减设置 -->
        <h3>自减设置</h3>
        <div class="table-decrease">
          <el-table :data="decrease" style="width: 90%;">

            <el-table-column label="参数名" prop="param" width="150%">
              <template v-slot="scope">
                <el-select v-model="scope.row.param" placeholder="请选择参数名">
                  <el-option v-for="item in addParams" :key="item.param" :label="item.param" :value="item.param">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column prop="tolerance" label="自减公差" width="100%">
              <template v-slot="scope">
                <el-input v-model="scope.row.tolerance"></el-input>
              </template>
            </el-table-column>

            <el-table-column prop="interval" label="时间间隔(ms)" width="110%">
              <template v-slot="scope">
                <el-input v-model="scope.row.interval"></el-input>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template>
                <el-button @click.native.prevent="addForm(decrease)" type="text" size="small">
                  新增
                </el-button>
              </template>
            </el-table-column>

            <el-table-column fixed="right" width="50%">
              <template slot-scope="scope">
                <el-button @click.native.prevent="remove(decrease, scope.$index)" type="text" size="small"
                  style="color: red;">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="button-container">
        <div style="display: flex">
          <el-button size="small" type="info" round @click="save">保存参数</el-button>
          <el-button size="small" type="info" round @click="load">导入参数</el-button>
        </div>
        <div>
          <el-button :loading="loading"  size="small" style="background-color: #ffd04b; color: #fff;" round @click="start">启动服务</el-button>
          <el-button size="small" type="danger" round @click="close">断开服务</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script >
// const { ipcRenderer } = require('electron');
// const fs = require('fs');
export default {
  data() {
    return {
      name: "modbus",
      ip: "127.0.0.1",
      port: 4334,
      byteOrder: "CDAB",
      // 参数列表
      addParams: [
        {
          param: "test1",
          addr: "123",
          type: "short",
          value: "123",
        },
        {
          param: "test2",
          addr: "",
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
      loading: false
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
      window.electron.sendMessage({mockParams:this.addParams, hearts:this.hearts, listens:this.listens, increase:this.increase, decrease:this.decrease});
      // ipcRenderer.send('saveModbus', {mockParams:this.addParams, hearts:this.hearts, listens:this.listens, increase:this.increase, decrease:this.decrease});
    },
    load() {
      window.electron.sendMessage('123456');
    },
    start() {
      this.clickLoad()
    },
    close() {

    },
    clickLoad() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 2000);
    }
  },
};
</script>

<style scoped>
.baseConfig {
  padding: 10px;
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 10px; /* 行间距 */
}
.input {
  display: flex; /* 水平排列输入框 */
  gap: 10px; /* 输入框之间的间距 */
}
.input-label {
  width: 120px; /* 设置固定宽度，以确保对齐 */
  margin-right: 10px; /* 标签与输入框之间的间距 */
  text-align: center;
}
.divider {
  margin:  0;
}
.table {
  width: 100%;
  /* 确保表格宽度为 100% */
  max-width: 700px;
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
}</style>
