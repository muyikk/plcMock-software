import fs from "fs";
import path from "path";

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
      let dir = path.resolve(path.dirname(process.execPath), '../../..')
			configPath =  dir + `\\config\\${fileName}.json`;
			logPath = dir + "\\log\\";
		}
		console.log("configPath:", configPath);
		console.log("logPath:", logPath);
		fs.existsSync(logPath) ? null : fs.mkdirSync(logPath);
		return configPath;
	}
  /**
   * 将config文件的 储存格式转化为服务器参数格式
   */
  cfgFormat2serFormat(format1) {
    const format2 = {
      name: format1.name,
      ip: format1.ip,
      port: format1.port.toString(), // 转换为字符串
      structure: format1.structure,
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
    for(let i in format1.listens) {
      let listen = format1.listens[i]
      if(!(listen.param in format2.listens)) {
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
      structure: format2.structure,
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
  
}
