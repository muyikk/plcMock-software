import { Res, Req, Order } from "./interface";
import net, { Server } from 'net'
import { MCOrder, orderType, headType, Utiles } from "./utiles";

// 配置服务器端口和地址
const PORT = 4334;
const HOST = '0.0.0.0';


export class MockMC {
  utiles: Utiles;
  server: Server;
  host: string;
  port: number;
  configParams: any;
  mockParams: Object;
  listens: any; // 监听设置
  heartBeats: any; // 心跳设置
  increaseList: any; // 递增设置
  decreaseList: any; // 递减设置
  constructor(config) {
    this.utiles = new Utiles()
    this.host = config.host
    this.port = config.port
    this.configParams = config.mockParams
    this.mockParams = this.initParams(config.mockParams)
    this.listens = config.listens;
    this.heartBeats = config.hearts;
    this.increaseList = config.increase;
    this.decreaseList = config.decrease;
  }

  /**
   * 启动MC服务
   */
  init() {
    // 创建TCP服务器
    this.server = net.createServer((socket) => {
      console.log(`客户端已连接: ${socket.remoteAddress}:${socket.remotePort}`);

      // 监听客户端数据
      socket.on('data', (data) => {
        const response = this.handleRequest(data);
        socket.write(response); // 发送响应
      });

      // 处理客户端断开
      socket.on('end', () => {
        console.log('客户端已断开');
      });

      // 处理错误
      socket.on('error', (err) => {
        console.error('发生错误:', err.message);
      });
    });

    // 启动服务器
    this.server.listen(this.port, this.host, () => {
      console.log(`服务器已启动，监听 ${this.host}:${this.port}`);
      this.initListen()
      this.initHeartBeats()
      this.initIncreases()
      this.initDecreases()
    });
  }
  /**
   * 销毁MC服务
   */
  destory() {
    this.server.close()
  }

  // 模拟三菱MC协议的响应数据
  handleRequest(data: Buffer) {
    // 将报文转为16进制字符串
    let string = data.toString('hex')
    // 初始化一个命令组
    let order = new MCOrder()
    // 当获取到的是request请求时
    if (string.slice(0, 4) == headType.reqHead) {
      // 格式化报文
      let request = order.getReq(data)
      // 如果是写入请求
      if (request.order == 'write') {
        Object.assign(this.mockParams, request.data)
        order.initRes(request)
      }
      // 如果是读取请求
      if (order.request.order == 'read') {
        order.initRes(request, this.mockParams)
      }
      console.log(this.mockParams)
      return order.outResponse(order.response)
    } else { // 当获取的是response响应时
      console.log(`get response`)
    }
  }

  /**
   * 初始化参数
   * @param params 初始化参数
   * @returns 
   */
  initParams(params: any) {
    let mockParams = {}
    for (let i in params) {
      if (params[i].type == 'short') {
        let v = this.utiles.LE2BE(Number(params[i].value).toString(16).padStart(4, "0"))
        mockParams[params[i].addr] = v
      } else if (params[i].type == 'float') {
        let floatValue = params[i].value
        const buffer = Buffer.alloc(4);
        buffer.writeFloatLE(floatValue, 0);  // 将浮点数写入缓冲区，使用小端序
        let high = buffer.toString('hex', 0, 2)
        let low = buffer.toString('hex', 2, 4)
        mockParams[params[i].addr] = high
        mockParams[this.utiles.getAdrrPlus1(params[i].addr)] = low
      }
    }
    console.log(mockParams)
    return mockParams
  }

  /**
 * 初始化心跳变量
 */
  initHeartBeats() {
    // 判断至少有一条数据
    if (!this.heartBeats.some(obj => Object.values(obj).every(value => value !== ''))) return
    for (let heart in this.heartBeats) {
      if (!this.configParams[heart]) {
        console.log(`心跳参数 ${heart} 未初始化`)
        continue
      }
      const param = this.configParams.find(item => item.param === this.heartBeats[heart].param)
      let data1 = this.heartBeats[heart].data1
      let data2 = this.heartBeats[heart].data2
      setInterval(() => {
        if (this.getValueMC(param.addr, param.type) == this.heartBeats[heart].data1)
          this.setValueMC(param.param, data2);
        else this.setValueMC(param.param, data1);
      }, this.heartBeats[heart].interval);
    }
  }

  /**
   * 初始化自增变量
   */
  initIncreases() {
    // 判断至少有一条数据
    if (!this.increaseList.some(obj => Object.values(obj).every(value => value !== ''))) return
    for (let increase in this.increaseList) {
      if (!this.configParams[increase]) {
        console.log(`自增参数 ${increase} 未初始化`)
        continue
      }
      let tolerance = this.increaseList[increase].tolerance
      const param = this.configParams.find(item => item.param === this.increaseList[increase].param)
      setInterval(() => {
        let data = this.getValueMC(param.addr, param.type)
        this.setValueMC(param.param, data + Number(tolerance));
      }, this.increaseList[increase].interval);
    }
  }

  /**
   * 初始化自增变量
   */
  initDecreases() {
    // 判断至少有一条数据
    if (!this.decreaseList.some(obj => Object.values(obj).every(value => value !== ''))) return
    for (let decrease in this.decreaseList) {
      if (!this.configParams[decrease]) {
        console.log(`自增参数 ${decrease} 未初始化`)
        continue
      }
      let tolerance = this.decreaseList[decrease].tolerance
      const param = this.configParams.find(item => item.param === this.decreaseList[decrease].param)
      setInterval(() => {
        let data = this.getValueMC(param.addr, param.type)
        this.setValueMC(param.param, data - Number(tolerance));
      }, this.decreaseList[decrease].interval);
    }
  }
  /**
   * 初始化监听变量
   */
  initListen() {
    // 判断至少有一条数据
    if (!this.listens.some(obj => Object.values(obj).every(value => value !== ''))) return
    for (let listen of this.listens) {
      const param = this.configParams.find(item => item.param === listen.param)
      setInterval(() => {
        if (this.getValueMC(param.addr, param.type) == listen.data) {
          this.setValueMC(listen.changeParam, listen.changeValue)
        }
      }, 200);
    }
  }

  /**
   * 获取服务器中的值
   * @param addr 地址
   * @param type 类型
   * @returns 值
   */
  getValueMC(addr: string, type: string): number {
    if (type == 'short') {
      return parseInt(this.utiles.LE2BE(this.mockParams[addr]), 16)
    } else if (type == 'float') {
      const register1 = parseInt(this.mockParams[addr], 16)
      const register2 = parseInt(this.mockParams[this.utiles.getAdrrPlus1(addr)], 16)
      const buffer = Buffer.alloc(4);
      // 小端序读取
      buffer.writeUInt16LE(register2, 0);
      buffer.writeUInt16LE(register1, 2);

      // 将缓冲区内容读取为 IEEE 754 单精度浮点数
      const floatValue = buffer.readFloatBE(0);
      return floatValue
    }
  }
  /**
   * 设置服务器中的值
   * @param name 参数名
   * @param newValue 更新值
   */
  setValueMC(name: string, newValue: number): void {
    const param = this.configParams.find(item => item.param === name)
    if (param.type == 'short') {
      let v = this.utiles.LE2BE(Number(newValue).toString(16).padStart(4, "0"))
      this.mockParams[param.addr] = v
    } else if (param.type == 'float') {
      let floatValue = newValue
      const buffer = Buffer.alloc(4);
      buffer.writeFloatLE(floatValue, 0);  // 将浮点数写入缓冲区，使用小端序
      let high = buffer.toString('hex', 0, 2)
      let low = buffer.toString('hex', 2, 4)
      this.mockParams[param.addr] = high
      this.mockParams[this.utiles.getAdrrPlus1(param.addr)] = low
    }
  }
  /**
   * 
   * @param addr 地址
   * @param type 数据类型
   * @returns 地址与hex值的数组
   */
  getRegister(addr: string, type: string): Array<any> {
    const Array = []
    if (type == 'short') {
      Array.push({ address: addr, value: this.mockParams[addr] })
    } else if (type == 'float') {
      let addr1 = this.utiles.getAdrrPlus1(addr)
      Array.push({ address: addr, value: this.mockParams[addr] })
      Array.push({ address: addr1, value: this.mockParams[addr1] })
    }
    return Array
  }
}


