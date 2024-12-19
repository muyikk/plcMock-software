import { MockOPCUA } from "./opcua";
import { MockModbus } from "./modbus";
import { MockMC } from "./MC";
import { Utiles } from "./utiles";
import { app, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { dayjs } from "element-plus";

class Service {
	win: any;
	utiles: Utiles;
	OPCUAServer: MockOPCUA;
	ModbusServer: MockModbus;
	MCServer: MockMC;
	polling_intervalOPCUA: any;
	polling_intervalModbus: any;
	polling_intervalMC: any;
	constructor(win) {
		this.win = win
		this.utiles = new Utiles()
		this.initOPCUA();
		this.saveOPCUA();
		this.loadOPCUA();
		this.startOPCUA();
		this.closeOPCUA();
		this.updateOPCUA();
		this.pollingOPCUA();

		this.saveModbus();
		this.loadModbus();
		this.startModbus();
		this.closeModbus();
		this.updateModbus();
		this.pollingModbus();

		this.saveMC();
		this.loadMC();
		this.startMC();
		this.closeMC();
		this.updateMC();
		this.pollingMC();
	}


	/**
	 * 保存MC服务参数
	 */
	saveMC() {
		ipcMain.on("saveMC", (event, messageString) => {
			try {
				const message = JSON.parse(messageString);
				console.log("Received MC message:", message);

				// 定义要写入的文件路径
				const filePath = this.utiles.getConfigPath(`MC-data_${dayjs().format(`YYYYMMDD-HHmmss`)}`);

				// 将消息对象写入文件
				fs.writeFile(filePath, JSON.stringify(message, null, 2), (err) => {
					if (err) {
						console.error("Failed to write file:", err);
						event.reply("saveMC_response", {
							success: false,
							error: err.message,
						});
					} else {
						console.log("File written successfully:", filePath);
						event.reply("saveMC_response", { success: true });
					}
				});
			} catch (error) {
				console.error("Failed to parse message:", error);
				event.reply("saveMC_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 读取MC服务参数
	 */
	loadMC() {
		ipcMain.on("loadMC", (event, messageString) => {
			try {
				const data = fs.readFileSync(messageString[0], 'utf-8');
				// const jsonObject = JSON.parse(data);
				event.reply("loadMC_response", { data, success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("loadMC_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 启动MC服务
	 */
	startMC() {
		ipcMain.on("startMC", (event, messageString) => {
			try {
				// console.log(messageString)
				// const config = this.utiles.cfgFormat2serFormat(JSON.parse(messageString))
				const config = JSON.parse(messageString)
				console.log(config)
				if(Object.keys(config.listens).length != 0)
				 config.listens = JSON.parse(messageString).listens;
				if(config.name != 'MC') throw Error('该数据不是MC服务器！')
				this.MCServer = new MockMC(config)
				this.MCServer.init()
				// const jsonObject = JSON.parse(data);
				event.reply("startMC_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("startMC_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 关闭MC服务
	 */
	closeMC() {
		ipcMain.on("closeMC", (event, messageString) => {
			try {
				this.polling_intervalMC ? clearInterval(this.polling_intervalMC) : null
				this.MCServer.destory()
				event.reply("closeMC_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("closeMC_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 更新MC数据
	 */
	updateMC() {
		ipcMain.on("updateMC", (event, { param, newValue }) => {
			try {
				console.log(param, newValue, Number(newValue))
				this.MCServer.setValueMC(param, newValue)
				event.reply("updateMC_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("updateMC_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 轮询MC数据
	 */
	pollingMC() {
		ipcMain.on("pollingMC", (event, messageString) => {
			try {
				this.polling_intervalMC ? clearInterval(this.polling_intervalMC) : null
				this.polling_intervalMC = setInterval(() => {
					let params = this.MCServer.configParams
					let mock = this.MCServer.mockParams
					for (const key in Object.entries(params)){
						params[key].value = this.MCServer.getValueMC(params[key].addr, params[key].type)
						params[key]['address'] = this.MCServer.getRegister(params[key].addr, params[key].type)
					}
					this.win.webContents.send("pollingMC_response", { success: true, polling: params });
				}, 200)
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("pollingMC_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}

	/**
	 * 保存Modbus服务参数
	 */
	saveModbus() {
		ipcMain.on("saveModbus", (event, messageString) => {
			try {
				const message = JSON.parse(messageString);
				console.log("Received Modbus message:", message);

				// 定义要写入的文件路径
				const filePath = this.utiles.getConfigPath(`Modbus-data_${dayjs().format(`YYYYMMDD-HHmmss`)}`);

				// 将消息对象写入文件
				fs.writeFile(filePath, JSON.stringify(message, null, 2), (err) => {
					if (err) {
						console.error("Failed to write file:", err);
						event.reply("saveModbus_response", {
							success: false,
							error: err.message,
						});
					} else {
						console.log("File written successfully:", filePath);
						event.reply("saveModbus_response", { success: true });
					}
				});
			} catch (error) {
				console.error("Failed to parse message:", error);
				event.reply("saveModbus_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 读取Modbus服务参数
	 */
	loadModbus() {
		ipcMain.on("loadModbus", (event, messageString) => {
			try {
				const data = fs.readFileSync(messageString[0], 'utf-8');
				// const jsonObject = JSON.parse(data);
				event.reply("loadModbus_response", { data, success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("loadModbus_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 启动Modbus服务
	 */
	startModbus() {
		ipcMain.on("startModbus", (event, messageString) => {
			try {
				// console.log(messageString)
				const config = this.utiles.cfgFormat2serFormat(JSON.parse(messageString))
				console.log(config)
				if(Object.keys(config.listens).length != 0)
				 config.listens = JSON.parse(messageString).listens;
				if(config.name != 'modbus') throw Error('该数据不是modbus服务器！')
				this.ModbusServer = new MockModbus(config)
				// const jsonObject = JSON.parse(data);
				event.reply("startModbus_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("startModbus_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 关闭Modbus服务
	 */
	closeModbus() {
		ipcMain.on("closeModbus", (event, messageString) => {
			try {
				this.polling_intervalModbus ? clearInterval(this.polling_intervalModbus) : null
				this.ModbusServer.destroy()
				event.reply("closeModbus_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("closeModbus_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 更新Modbus数据
	 */
	updateModbus() {
		ipcMain.on("updateModbus", (event, { param, newValue }) => {
			try {
				console.log(param, newValue, Number(newValue))
				this.ModbusServer.setValueModbus(param, newValue)
				event.reply("updateModbus_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("updateModbus_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 轮询Modbus数据
	 */
	pollingModbus() {
		ipcMain.on("pollingModbus", (event, messageString) => {
			try {
				this.polling_intervalModbus ? clearInterval(this.polling_intervalModbus) : null
				this.polling_intervalModbus = setInterval(() => {
					let params = this.ModbusServer.configParams
					let mock = this.ModbusServer.mockParams
					for (const [key, param] of Object.entries(params)){
						params[key].value = this.ModbusServer.getValueModbus(key)
						params[key]['address'] = this.ModbusServer.getRegister(params[key].addr, params[key].type)
					}
					this.win.webContents.send("pollingModbus_response", { success: true, polling: params });
				}, 200)
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("pollingModbus_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}

	/**
	 * todo 初始化opcua参数
	 */
	initOPCUA() {
		ipcMain.on("initOPCUA", (event, messageString) => {
			console.log('privateKey:', path.dirname(process.execPath) + `\\privateKey.pem`)
			console.log('certificate:', path.dirname(process.execPath) + `\\certificate.pem`)
			if (!fs.existsSync(path.dirname(process.execPath) + `privateKey.pem`) || !fs.existsSync(path.dirname(process.execPath) + `certificate.pem`)) {
				this.utiles.runCommand();
			}
			event.reply("initOPCUA_response", { success: true });
		})
	}
	/**
	 * 保存OPCUA服务参数
	 */
	saveOPCUA() {
		ipcMain.on("saveOPCUA", (event, messageString) => {
			try {
				const message = JSON.parse(messageString);
				console.log("Received OPCUA message:", message);

				// 定义要写入的文件路径
				const filePath = this.utiles.getConfigPath(`opcua-data_${dayjs().format(`YYYYMMDD-HHmmss`)}`);

				// 将消息对象写入文件
				fs.writeFile(filePath, JSON.stringify(message, null, 2), (err) => {
					if (err) {
						console.error("Failed to write file:", err);
						event.reply("saveOPCUA_response", {
							success: false,
							error: err.message,
						});
					} else {
						console.log("File written successfully:", filePath);
						event.reply("saveOPCUA_response", { success: true });
					}
				});
			} catch (error) {
				console.error("Failed to parse message:", error);
				event.reply("saveOPCUA_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 读取OPCUA服务参数
	 */
	loadOPCUA() {
		ipcMain.on("loadOPCUA", (event, messageString) => {
			try {
				const data = fs.readFileSync(messageString[0], 'utf-8');

				// const jsonObject = JSON.parse(data);
				event.reply("loadOPCUA_response", { data, success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("loadOPCUA_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 启动OPCUA服务
	 */
	startOPCUA() {
		ipcMain.on("startOPCUA", async (event, messageString) => {
			try {
				const config = this.utiles.cfgFormat2serFormat(JSON.parse(messageString))
				// console.log(messageString)
				console.log(config)
				this.OPCUAServer = new MockOPCUA(config, this.utiles)
				await this.OPCUAServer.initServer()
				event.reply("startOPCUA_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("startOPCUA_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 关闭OPCUA服务
	 */
	closeOPCUA() {
		ipcMain.on("closeOPCUA", (event, messageString) => {
			try {
				this.polling_intervalOPCUA ? clearInterval(this.polling_intervalOPCUA) : null
				this.OPCUAServer.destroy()
				event.reply("closeOPCUA_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("closeOPCUA_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 更新OPCUA数据
	 */
	updateOPCUA() {
		ipcMain.on("updateOPCUA", (event, { param, newValue }) => {
			try {
				console.log(param, newValue)
				console.log(this.OPCUAServer.listens)
				console.log(this.OPCUAServer.listenList)
				// console.log(this.OPCUAServer.mockParams)
				if(this.OPCUAServer.mockParams[param].type == 'String') {
					this.OPCUAServer.mockParams[param].value = newValue
				} else if (this.OPCUAServer.mockParams[param].type.includes('Array')) {
					this.OPCUAServer.mockParams[param].value = this.utiles.stringToInt16Array(newValue)
				} else {
					this.OPCUAServer.mockParams[param].value = Number(newValue)
				}
				this.OPCUAServer.listen()
				console.log(this.OPCUAServer.mockParams)
				event.reply("updateOPCUA_response", { success: true });
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("updateOPCUA_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
	/**
	 * 轮询OPCUA数据
	 */
	pollingOPCUA() {
		ipcMain.on("pollingOPCUA", (event, messageString) => {
			try {
				this.polling_intervalOPCUA ? clearInterval(this.polling_intervalOPCUA) : null
				this.polling_intervalOPCUA = setInterval(() => {
					// console.log(this.OPCUAServer.mockParams)
					this.win.webContents.send("pollingOPCUA_response", { success: true, polling: this.OPCUAServer.mockParams });
					// event.reply("pollingOPCUA_response", { success: true, polling: this.OPCUAServer.mockParams});
				}, 200)
			} catch (error) {
				console.error("Failed to read file:", error);
				event.reply("pollingOPCUA_response", {
					success: false,
					error: error.message,
				});
			}
		});
	}
}

export default Service;
