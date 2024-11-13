import { ServerTCP } from "modbus-serial";

export class MockModbus {
	server
	port
	unitID
	mockParams
	configParams
	byteOrder
	test
	listenList; // 监听缓存值
	listens; // 监听设置
	heartBeats; // 心跳设置
	increaseList; // 递增设置
	decreaseList; // 递减设置
	constructor(config) {
		this.port = config.port;
		this.unitID = config.unitID;
		this.byteOrder = config.byteOrder == 'CDAB' ? true : false;
		this.configParams = config.params;
		this.mockParams = this.initParam();
		this.listenList = this.getListenList(config.listens);
		this.listens = config.listens;
		this.heartBeats = config.hearts;
		this.increaseList = config.increase;
		this.decreaseList = config.decrease;
		this.start()
	}

	/**
	 * 初始化监听缓存值
	 * @param {Object} listens 监听规则对象
	 * @returns 
	 */
	getListenList(listens) {
		let listenList = {};
		for (let listen in listens) {
			listenList[listen] = this.mockParams[listen]?.value;
		}
		return listenList;
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
				console.log(mockParams);
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
	 * @returns
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
}