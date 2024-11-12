import fs from "fs";
import path from "path";
import { exec, spawn } from'child_process';
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
      params: {},
      hearts: {},
      listens: {},
      increase: {},
      decrease: {},
    };

    // 转换 mockParams
    format1.mockParams.forEach(param => {
      format2.params[param.param] = {
        type: param.type,
        addr: param?.addr,
        value: Number(param.value),
      };
    });

    // 转换 hearts
    format1.hearts.forEach(heart => {
      format2.hearts[heart.param] = {
        data1: Number(heart.data1),
        data2: Number(heart.data2),
        interval: Number(heart.interval),
      };
    });

    // 转换 listens
    for (let i in format1.listens) {
      let listen = format1.listens[i]
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

    // 转换 increase
    format1.increase.forEach(increase => {
      format2.increase[increase.param] = {
        tolerance: Number(increase.tolerance),
        interval: Number(increase.interval),
      };
    });

    // 转换 decrease
    format1.decrease.forEach(decrease => {
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

}
