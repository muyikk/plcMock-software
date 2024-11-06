import { MockOPCUA } from "./opcua";
import { Utiles } from "./utiles";
import { app, ipcMain } from "electron";
import fs from "fs";
import path from "path";

class Service {
	win: any;
	utiles: Utiles;
	OPCUAServer: MockOPCUA;
	polling_interval: any;
	constructor(win) {
		this.win = win
		this.utiles = new Utiles()
		this.initOPCUA();
		this.saveOPCUA();
		this.loadOPCUA();
		this.startOPCUA();
		this.closeOPCUA();
		this.updateOPCUA();
		this.polling()
	}

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
				this.polling_interval ? clearInterval(this.polling_interval) : null
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
	 * 轮询数据
	 */
	polling() {
		ipcMain.on("pollingOPCUA", (event, messageString) => {
			try {
				this.polling_interval ? clearInterval(this.polling_interval) : null
				this.polling_interval = setInterval(() => {
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
