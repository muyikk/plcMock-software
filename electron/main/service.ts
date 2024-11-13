import { MockOPCUA } from "./opcua";
import { MockModbus } from "./modbus";
import { Utiles } from "./utiles";
import { app, ipcMain } from "electron";
import fs from "fs";
import path from "path";

class Service {
	win: any;
	utiles: Utiles;
	OPCUAServer: MockOPCUA;
	ModbusServer: MockModbus;
	polling_intervalOPCUA: any;
	polling_intervalModbus: any;
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
				const filePath = this.utiles.getConfigPath("Modbus-data");

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
				const config = this.utiles.cfgFormat2serFormat(JSON.parse(messageString))
				// console.log(config)
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
				let params = this.ModbusServer.configParams
				let ieees =  this.ModbusServer.mockParams
				switch (params[param].type) {
					case 'short': ieees[params[param].addr] = Number(newValue);break;
					case 'float': 
						let arr = this.ModbusServer.float2IEEE(Number(newValue));
						ieees[params[param].addr] = arr[0];
						ieees[(parseInt(params[param].addr) + 1).toString()] = arr[1];break;
				}

				// this.ModbusServer.mockParams[param].value = Number(newValue)
				// this.ModbusServer.listen()
				// console.log(this.ModbusServer.mockParams)
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
					let ieees =  this.ModbusServer.mockParams
					let param = this.mergeData(params, ieees)
					// console.log(ieees)
					// console.log(param)
					this.win.webContents.send("pollingModbus_response", { success: true, polling: param });
					// event.reply("pollingModbus_response", { success: true, polling: this.ModbusServer.mockParams});
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

	mergeData(paramTypes, addrValues) {
		const result = {};
	
		// 遍历每个参数
		for (const [key, param] of Object.entries(paramTypes)) {
			const newParam = { ...param };
	
			if (newParam.type === "short") {
				// 如果是 short 类型，地址对应的值是一个
				newParam.address = [{address: newParam.addr, value:addrValues[newParam.addr]}];
				newParam.value = addrValues[newParam.addr];
			} else if (newParam.type === "float") {
				// 如果是 float 类型，地址占两位
				const addr1 = newParam.addr;
				const addr2 = (parseInt(addr1) + 1).toString(); // 假设 float 类型的地址是连续的
				newParam.address = [
					{	address: addr1, value: addrValues[addr1]}, {address: addr2, value: addrValues[addr2] }
				]
				newParam.value = this.ModbusServer.IEEE2float(addr1); // 保证 value 是 float 类型
			}
	
			// 将整合后的参数保存到结果对象
			result[key] = newParam;
		}
	
		return result;
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
				const filePath = this.utiles.getConfigPath("opcua-data");

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
		ipcMain.on("startOPCUA", (event, messageString) => {
			try {
				const config = this.utiles.cfgFormat2serFormat(JSON.parse(messageString))
				this.OPCUAServer = new MockOPCUA(config)
				// const jsonObject = JSON.parse(data);
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
				this.OPCUAServer.mockParams[param].value = Number(newValue)
				this.OPCUAServer.listen()
				// console.log(this.OPCUAServer.mockParams)
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
