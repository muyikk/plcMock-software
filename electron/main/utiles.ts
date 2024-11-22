import fs from "fs";
import path from "path";
import { exec, spawn } from 'child_process';
import { Res, Req, Order } from "./interface";
export class Utiles {
  constructor() {

  }
  /**
   * 获取config地址
   */
  getConfigPath(fileName) {
    // 获取config地址
    const isPkg = typeof process.pkg !== "undefined";
    let rootDir,
      configPath,
      logPath
    if (isPkg) {
      rootDir = path.dirname(process.execPath);
      configPath = rootDir + `\\config\\${fileName}.json`;
      logPath = rootDir + "\\log\\";
    } else {
      // let dir = path.resolve(path.dirname(process.execPath), '../../..')
      let dir = path.dirname(process.execPath);
      configPath = dir + `\\config\\`;
      logPath = dir + "\\log\\";
    }
    console.log("configPath:", configPath);
    console.log("logPath:", logPath);
    fs.existsSync(logPath) ? null : fs.mkdirSync(logPath);
    fs.existsSync(configPath) ? null : fs.mkdirSync(configPath);
    return configPath + `${fileName}.json`;
  }
  /**
   * 将config文件的 储存格式转化为服务器参数格式
   */
  cfgFormat2serFormat(format1) {
    const format2 = {
      name: format1.name,
      ip: format1.ip,
      port: format1.port.toString(), // 转换为字符串
      structure: format1?.structure,
      byteOrder: format1?.byteOrder,
      autoPem: format1?.autoPem,
      params: {},
      hearts: {},
      listens: {},
      increase: {},
      decrease: {},
    };

    // 转换 mockParams
    format1.mockParams.forEach(param => {
      if (param.type != '')
        format2.params[param.param] = {
          type: param.type,
          addr: param?.addr,
          value: Number(param.value),
        };
    });

    // 转换 hearts
    format1.hearts.forEach(heart => {
      if (heart.param != '')
        format2.hearts[heart.param] = {
          data1: Number(heart.data1),
          data2: Number(heart.data2),
          interval: Number(heart.interval),
        };
    });

    // 转换 listens
    for (let i in format1.listens) {
      let listen = format1.listens[i]
      if (listen.param != '') {

        if (!(listen.param in format2.listens)) {
          format2.listens[listen.param] = []
        }
        format2.listens[listen.param].push({
          data: Number(listen.data),
          change: {
            param: listen.changeParam,
            value: Number(listen.changeValue),
          },
        });
      }
    }

    // 转换 increase
    format1.increase.forEach(increase => {
      if (increase.param != '')
        format2.increase[increase.param] = {
          tolerance: Number(increase.tolerance),
          interval: Number(increase.interval),
        };
    });

    // 转换 decrease
    format1.decrease.forEach(decrease => {
      if (decrease.param != '')
        format2.decrease[decrease.param] = {
          tolerance: Number(decrease.tolerance),
          interval: Number(decrease.interval),
        };
    });

    return format2;
  }
  /**
   * 将config文件的 服务器参数格式转化为储存格式
   */
  serFormat2cfgFormat(format2) {
    const format1 = {
      name: format2.name,
      ip: format2.ip,
      port: Number(format2.port), // 转换为数字
      structure: format2?.structure,
      byteOrder: format2?.byteOrder,
      autoPem: format2?.autoPem,
      mockParams: [],
      hearts: [],
      listens: [],
      increase: [],
      decrease: [],
    };

    // 转换 params
    for (const [key, value] of Object.entries(format2.params)) {
      format1.mockParams.push({
        param: key,
        type: value.type,
        addr: value?.type,
        value: String(value.value),
      });
    }

    // 转换 hearts
    for (const [key, value] of Object.entries(format2.hearts)) {
      format1.hearts.push({
        param: key,
        data1: String(value.data1),
        data2: String(value.data2),
        interval: String(value.interval),
      });
    }

    // 转换 listens
    for (const [key, value] of Object.entries(format2.listens)) {
      format1.listens.push({
        param: key,
        data: String(value[0].data),
        changeParam: value[0].change.param,
        changeValue: String(value[0].change.value),
      });
    }

    // 转换 increase
    for (const [key, value] of Object.entries(format2.increase)) {
      format1.increase.push({
        param: key,
        tolerance: String(value.tolerance),
        interval: String(value.interval),
      });
    }

    // 转换 decrease
    for (const [key, value] of Object.entries(format2.decrease)) {
      format1.decrease.push({
        param: key,
        tolerance: String(value.tolerance),
        interval: String(value.interval),
      });
    }

    return format1;
  }


  // 执行命令时需要指定当前工作目录
  runCommand() {
    const openssl = spawn('openssl', [
      'req', '-x509', '-newkey', 'rsa:2048', '-keyout', 'privateKey.pem', '-out', 'certificate.pem', '-days', '365', '-nodes'
    ]);

    // 标记哪些字段需要跳过
    let inputCount = 0;

    openssl.stderr.on('data', (data) => {
      const message = data.toString();

      console.log(`stderr: ${message}`);

      openssl.stdin.write('\n');  // 输入回车跳过
      // 判断是否是需要输入回车的提示
      // if (message.includes('Country Name (2 letter code)')) {
      //   openssl.stdin.write('\n');  // 输入回车跳过
      //   inputCount++;
      // } else if (message.includes('State or Province Name (full name)')) {
      //   openssl.stdin.write('\n');  // 输入回车跳过
      //   inputCount++;
      // } else if (message.includes('Locality Name (eg, city)')) {
      //   openssl.stdin.write('\n');  // 输入回车跳过
      //   inputCount++;
      // } else if (message.includes('Organization Name (eg, company)')) {
      //   openssl.stdin.write('\n');  // 输入回车跳过
      //   inputCount++;
      // } else if (message.includes('Organizational Unit Name (eg, section)')) {
      //   openssl.stdin.write('\n');  // 输入回车跳过
      //   inputCount++;
      // } else if (message.includes('Common Name (eg, your name or your server\'s hostname)')) {
      //   openssl.stdin.write('\n');  // 输入回车跳过
      //   inputCount++;
      // } else if (message.includes('Email Address')) {
      //   openssl.stdin.write('\n');  // 输入回车跳过
      //   inputCount++;
      // }

      // 检查是否已经输入了 7 个回车，完成所有输入
      // if (inputCount >= 7) {
      //   console.log('已完成所有输入');
      // }
    });

    // 捕获 openssl 的标准输出
    openssl.stdout.on('data', (data) => {
      console.log(`stdout: ${data.toString()}`);
    });

    // 捕获 openssl 的错误输出
    openssl.stderr.on('data', (data) => {
      console.error(`stderr: ${data.toString()}`);
    });

    // // 打印进程退出码
    // openssl.on('close', (code) => {
    //   console.log(`openssl 进程退出，退出码: ${code}`);
    // });
  };
  /**
   * 简单的高低位交换工具
   * @param str 
   * @returns 
   */
  LE2BE(str: string): string {
    if (str.length === 4) {
      return str.slice(2, 4) + str.slice(0, 2);
    } else if (str.length === 6) {
      return str.slice(4, 6) + str.slice(2, 4) + str.slice(0, 2);
    }
  }
  /**
   * 带字母的地址递增
   * @param original 原地址
   * @returns 下一个地址
   */
  getAdrrPlus1(original: string): string {
    const match = original.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      const prefix = match[1]; // 提取字母部分 'D'
      const number = parseInt(match[2], 10); // 提取数字部分 4567 并转为整数

      // 增加数字并拼接
      const newString = `${prefix}${(number + 1)}`;
      return newString
    } else {
      // console.error('Invalid format');
    }
  }
}

/**主命令+辅命令 */
export const orderType = {
  // 命令 成批读入 字操作
  read: `01040000`,
  // 命令 成批写入 字操作
  write: `01140000`
}
/**默认副头部，用于区分请求和响应 */
export const headType = {
  reqHead: '5000',
  resHead: 'D000'
}

/**表示读取PLC寄存器的类型 */
const areaType = {
  'a8': 'D',
  '90': 'M',
  '9c': 'X',
  '9d': 'Y',
  'af': 'R',
  'a0': 'B',
  '93': 'F',
  'b0': 'ZR',
}

/**
 * MC协议的命令组
 * 每个命令组里面会有一对request和response
 * 可以用于解析报文，通过request自动生成response
 */
export class MCOrder implements Order {
  request: Req;
  response: Res;
  reqHead: string;
  resHead: string;
  netCode: string;
  plcCode: string;
  ioCode: string;
  stationCode: string;
  areaCode: string;
  constructor() {

  }
  initRes(request: Req, serviceData?: Object): Res {
    if (request.order == 'write') {
      // 当请求为写入时
      return this.response = {
        overlength: 3,
        state: '0000',
        padding: '10',
      }
    } else {
      // 当请求为读取时
      let data = {}
      for (let i = 0; i < request.handle; i++) {
        let addr = request.areaCode + (Number(request.adrrCode) + i).toString()
        data[addr] = serviceData[addr]
      }
      return this.response = {
        overlength: 2 + request.handle * 2,
        state: '0000',
        data: data,
      }
    }
  }
  LE2BE(str: string): string {
    if (str.length === 4) {
      return str.slice(2, 4) + str.slice(0, 2);
    } else if (str.length === 6) {
      return str.slice(4, 6) + str.slice(2, 4) + str.slice(0, 2);
    }
  }
  getReq(message: Buffer): Req {
    console.log('收到请求:', message.toString('hex'));
    let string = message.toString('hex')
    this.reqHead = headType.reqHead
    this.netCode = string.slice(4, 6)
    this.plcCode = string.slice(6, 8)
    this.ioCode = string.slice(8, 12)
    this.stationCode = string.slice(12, 14)
    let overlength = parseInt(this.LE2BE(string.slice(14, 18)), 16)
    let outTime = parseInt(this.LE2BE(string.slice(18, 22)), 16)
    let order = string.slice(22, 30) == orderType.read ? 'read' : 'write'
    let adrrCode = parseInt(this.LE2BE(string.slice(30, 36)), 16)
    let areaCode = areaType[string.slice(36, 38)]
    let handle = parseInt(this.LE2BE(string.slice(38, 42)), 16)
    let data = new Object
    if (order == 'write') {
      for (let i = 0; i < handle; i++) {
        data[areaCode + Number(adrrCode + i)] = string.slice(42 + i * 4, 42 + (i + 1) * 4)
      }
      this.request = {
        overlength: overlength,
        outTime: outTime,
        order: order,
        adrrCode: adrrCode,
        areaCode: areaCode,
        handle: handle,
        data: data
      };
    } else {
      this.request = {
        overlength: overlength,
        outTime: outTime,
        order: order,
        adrrCode: adrrCode,
        areaCode: areaCode,
        handle: handle,
      };
    }

    return this.request
  }
  outResponse(response: Res): Buffer {
    let resStr = headType.resHead + this.netCode + this.plcCode + this.ioCode + this.stationCode + this.LE2BE(response.overlength.toString(16).padStart(4, "0")) + response.state
    if (response.hasOwnProperty("padding")) {
      // 如果是写入响应
      resStr += response.padding
    } else {
      // 如果是读取响应
      let data = Object.values(response.data).join("");
      resStr += data
    }
    console.log(this.request)
    console.log(this.response)
    console.log(`响应: ${resStr}`)
    return Buffer.from(resStr, 'hex');
  }
}
