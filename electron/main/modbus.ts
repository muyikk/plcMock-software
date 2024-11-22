import { ServerTCP } from "modbus-serial";
import { Utiles } from "./utiles";

export class MockModbus {
	utiles: Utiles
	server: ServerTCP;
	port: number;
	unitID: number;
	mockParams: object;
	configParams: object;
	byteOrder: boolean;
	listens: any; // 监听设置
	heartBeats: object; // 心跳设置
	increaseList: object; // 递增设置
	decreaseList: object; // 递减设置
	constructor(config) {
		this.utiles = new Utiles()
		this.port = config.port;
		this.unitID = config.unitID;
		this.byteOrder = config.byteOrder == 'CDAB' ? true : false;
		this.configParams = config.params;
		this.mockParams = this.initParam();
		this.listens = config.listens;
		this.heartBeats = config.hearts;
		this.increaseList = config.increase;
		this.decreaseList = config.decrease;
		this.start()
	}

	/**
	 * 初始化心跳变量
	 */
	initHeartBeats() {
		for (let heart in this.heartBeats) {
			if (!this.configParams[heart]) {
				console.log(`心跳参数 ${heart} 未初始化`)
				continue
			}
			let data1 = this.heartBeats[heart].data1
			let data2 = this.heartBeats[heart].data2
			setInterval(() => {
				if (this.getValueModbus(heart) == this.heartBeats[heart].data1)
					this.setValueModbus(heart, data2);
				else this.setValueModbus(heart, data1);
			}, this.heartBeats[heart].interval);
		}
	}

	/**
	 * 初始化自增变量
	 */
	initIncreases() {
		for (let increase in this.increaseList) {
			if (!this.configParams[increase]) {
				console.log(`自增参数 ${increase} 未初始化`)
				continue
			}
			let tolerance = this.increaseList[increase].tolerance
			setInterval(() => {
				let data = this.getValueModbus(increase)
				this.setValueModbus(increase, data + tolerance);
			}, this.increaseList[increase].interval);
		}
	}

	/**
	 * 初始化自增变量
	 */
	initDecreases() {
		for (let decrease in this.decreaseList) {
			if (!this.configParams[decrease]) {
				console.log(`自增参数 ${decrease} 未初始化`)
				continue
			}
			let tolerance = this.decreaseList[decrease].tolerance
			setInterval(() => {
				let data = this.getValueModbus(decrease)
				this.setValueModbus(decrease, data - tolerance);
			}, this.decreaseList[decrease].interval);
		}
	}
	/**
	 * 初始化监听变量
	 */
	initListens() {
		if(Object.keys(this.listens).length == 0) return
		for(let listen of this.listens) {
			setInterval(() => {
				if (this.getValueModbus(listen.param) == listen.data){
					this.setValueModbus(listen.changeParam, listen.changeValue)
				} 
			}, 200);
		}
	}
	/**
	 * 创建服务器
	 */
	start() {
		const vector = this.getVector(this.mockParams);

		this.server = new ServerTCP(
			vector,
			{
				host: "0.0.0.0", // 服务器地址
				port: this.port, // 端口，默认为 502
				debug: true, // 启用调试模式以输出更多信息
				unitID: this.unitID, // Modbus 单元标识符，默认设置为1
			}
		);
		this.initHeartBeats()
		this.initIncreases()
		this.initDecreases()
		this.initListens()
	}
	/**
	 * 关闭服务器
	 */
	destroy() {
		if (this.server) {
			this.server.close((err) => {
				if (err) {
					console.error("Error closing the Modbus server:", err);
				} else {
					console.log("Modbus server closed successfully.");
				}
			});
		} else {
			console.log("Modbus server is not running.");
		}
	}

	/**
	 * 定义服务器响应向量
	 * @returns 响应向量
	 */
	getVector(mockParams) {
		return {
			/**
			 * 将 float型 转化为 IEEE 754 单精度浮点数
			 * @param {number} floatValue float型的值
			 * @param {number} swap 是否需要交换高低位
			 * @returns
			 */
			float2IEEE: function (floatValue, swap) {
				// 创建一个 4 字节的缓冲区来存储浮点数
				let buffer = Buffer.alloc(4);
				buffer.writeFloatBE(floatValue, 0); // 将浮点数写入缓冲区，使用大端序

				// 从缓冲区中获取两个 16 位寄存器的值
				let high = buffer.readUInt16BE(0); // 高 16 位
				let low = buffer.readUInt16BE(2); // 低 16 位

				// 是否需要交换高低位的值
				if (swap) {
					[high, low] = [low, high];
				}
				return [high, low];
			},
			/**
			 * 将 IEEE 754 单精度浮点数 转化为 float型
			 * @param {number} addr 模拟寄存器中的地址
			 * @param {number} swap 是否需要交换高低位
			 * @returns
			 */
			IEEE2float: function (addr, swap) {
				let addrP;
				let match = addr.match(/\d+/);
				if (match) {
					let num = parseInt(match[0], 10);
					addrP = addr.replace(num, num + 1);
				}
				let high = mockParams[addr]; // 高 16 位寄存器值
				let low = mockParams[addrP]; // 低 16 位寄存器值

				// 是否需要交换高低位的值
				if (swap) {
					[high, low] = [low, high];
				}

				// 创建 4 字节缓冲区，将寄存器值按大端序写入
				let buffer = Buffer.alloc(4);
				buffer.writeUInt16BE(high, 0); // 高位寄存器
				buffer.writeUInt16BE(low, 2); // 低位寄存器

				// 从缓冲区读取浮点数
				let floatValue = buffer.readFloatBE(0);
				return floatValue;
			},
			getInputRegister: function (addr, unitID) {
				// console.log("Read to register", addr, mockParams[addr]);
				// 返回输入寄存器的值
				return addr;
			},
			getHoldingRegister: function (addr, unitID) {
				// console.log("Read to register", addr, mockParams);
				// 返回保持寄存器的值
				return mockParams[addr];
			},
			getCoil: function (addr, unitID) {
				// 返回线圈的状态，偶数地址为 true，奇数地址为 false
				return addr % 2 === 0;
			},
			setRegister: function (addr, value, unitID) {
				// 写入保持寄存器的值
				mockParams[addr] = value;
				// this.test = value
				// console.log(mockParams);
				console.log("Write to register", addr, value);
			},
			setCoil: function (addr, value, unitID) {
				// 设置线圈的状态
				console.log("Write to coil", addr, value);
			},
			readDeviceIdentification: function (addr) {
				// 设备识别信息
				return {
					0x00: "kl-mockPLC",
					0x01: "ModlbusTCP",
				};
			},
		};
	}

	/**
	 * 初始化模拟寄存器中的参数
	 * @returns
	 */
	initParam() {
		let res = {};
		for (let param in this.configParams) {
			switch (this.configParams[param].type) {
				case "short":
					res[this.configParams[param].addr] = this.configParams[param].value;
					break;
				case "float":
					let addr = this.configParams[param].addr;
					let addrP;
					let match = addr.match(/\d+/);
					if (match) {
						let num = parseInt(match[0], 10);
						addrP = addr.replace(num, num + 1);
					}
					let ieee = this.float2IEEE(this.configParams[param].value, this.byteOrder);
					res[addr] = ieee[0];
					res[addrP] = ieee[1];
					break;
			}
		}
		// console.log(res);
		return res;
	}

	/**
	 * 将 float型 转化为 IEEE 754 单精度浮点数
	 * @param {number} floatValue float型的值
	 * @param {number} swap 是否需要交换高低位
	 * @returns {Array<number>} [high, low]
	 */
	float2IEEE(floatValue, swap = true) {
		// 创建一个 4 字节的缓冲区来存储浮点数
		let buffer = Buffer.alloc(4);
		buffer.writeFloatBE(floatValue, 0); // 将浮点数写入缓冲区，使用大端序

		// 从缓冲区中获取两个 16 位寄存器的值
		let high = buffer.readUInt16BE(0); // 高 16 位
		let low = buffer.readUInt16BE(2); // 低 16 位

		// 是否需要交换高低位的值
		if (swap) {
			[high, low] = [low, high];
		}
		return [high, low];
	}

	/**
 * 将 IEEE 754 单精度浮点数 转化为 float型
 * @param {number} addr 模拟寄存器中的地址
 * @param {number} swap 是否需要交换高低位
 * @returns
 */
	IEEE2float(addr, swap = true) {
		let addrP;
		let match = addr.match(/\d+/);
		if (match) {
			let num = parseInt(match[0], 10);
			addrP = addr.replace(num, num + 1);
		}
		let high = this.mockParams[addr]; // 高 16 位寄存器值
		let low = this.mockParams[addrP]; // 低 16 位寄存器值

		// 是否需要交换高低位的值
		if (swap) {
			[high, low] = [low, high];
		}

		// 创建 4 字节缓冲区，将寄存器值按大端序写入
		let buffer = Buffer.alloc(4);
		buffer.writeUInt16BE(high, 0); // 高位寄存器
		buffer.writeUInt16BE(low, 2); // 低位寄存器

		// 从缓冲区读取浮点数
		let floatValue = buffer.readFloatBE(0);
		return floatValue;
	}

	/**
	 * modbus服务器赋值
	 * @param name 参数key
	 * @param value 参数值
	 */
	setValueModbus(name, value) {
		let address = this.configParams[name].addr
		switch (this.configParams[name].type) {
			case 'short': this.mockParams[address] = parseInt(value); break;
			case 'float':
				let [high, low] = this.float2IEEE(Number(value), this.byteOrder);
				this.mockParams[address] = high;
				this.mockParams[(parseInt(address) + 1).toString()] = low;
				break;
		}
	}

	/**
	 * modbus服务器取值
	 * @param name 参数key
	 * @returns value 参数值
	 */
	getValueModbus(name) {
		let address = this.configParams[name].addr
		switch (this.configParams[name].type) {
			case 'short': return this.mockParams[address];
			case 'float': return this.IEEE2float(address, this.byteOrder)
		}
	}

	getRegister(addr, type) {
		const Array = []
    if(type == 'short'){
      Array.push({address: addr, value: this.mockParams[addr]})
    } else if(type == 'float') {
      let addr1 = (Number(addr)+1).toString()
      Array.push({address: addr, value: this.mockParams[addr]})
      Array.push({address: addr1, value: this.mockParams[addr1]})
    }
    return Array
	}
}