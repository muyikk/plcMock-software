# kl-mockplc
模拟plc服务器的程序，可以自定义plc的结构体、变量。<br>兼容`opcua`、`modbus(待实现)`协议<br>并且实现设置变量的 `心跳`、`监听值并作出反馈`、`自增`、`自减`功能<br>启动服务后能够实时监控和修改所有变量的值

https://github.com/muyikk/plcMock-software
### 一、服务名称
plc模拟程序v1.0.0
	
### 二、使用方式
1.编辑基础设置（ip、端口、结构体）<br>
2.设置参数列表<br>
3.设置参数特性，如：心跳、监听、自增、自减 （可选）<br>
#### 心跳设置
![image](https://github.com/muyikk/plcMock-software/IMAGE/pic1.png)
心跳将会在`值1`和`值2`之间以`间隔时间`反复变化
#### 监听设置
![image](https://github.com/muyikk/plcMock-software/IMAGE/pic2.png)
当监听到`参数名`的值变成`参数值`时，`被改变的参数名`的值会变为`被改变的值`
#### 自增设置
![image](https://github.com/muyikk/plcMock-software/IMAGE/pic3.png)
`参数名`的值会以`自增公差`，以`时间间隔`进行递增
#### 自减设置
同***自增设置***
#### 实时监控
![image](https://github.com/muyikk/plcMock-software/IMAGE/pic4.png)
### 三、编辑config文件（可选）
1、编辑自定义的opcua-data.json文件
```json
{
	"protocol": "opcua",  // 服务器类型
	"port": "4334",  // 服务器端口号(本地调用ip: 127.0.0.1)
	"structure": "stCCD1",  // 定义你的结构体
  // 定义你的变量
  // 他的type类型和value初始值
	"params": {  
		"iCCDHeart": { "type": "Int16", "value": 1 },
		"iState": { "type": "Int16", "value": 1 },
		"ichangeParam": { "type": "Int16", "value": 1 },
		"rchangeParam": { "type": "Double", "value": 1.5 },
		"inCrease": { "type": "Int16", "value": 1 },
		"deCrease": { "type": "Int16", "value": 1 }
	},
  // 设置心跳参数
  // 心跳将会在data1和data2间来回跳动，时间间隔为interval参数(ms)
	"hearts": {  
		"iCCDHeart": { "data1": 0, "data2": 1, "interval": 2000 }
	},
  // 设置监听参数
  // 例：当 iState 的data值为 1 时，会将param参数 ichangeParam 改变为 1
  // 例：当 ichangeParam 的data值为 1 时，会将param参数 rchangeParam 改变为 1.5
	"listens": {  
		"iState": [
			{ "data": 1, "change": { "param": "ichangeParam", "value": 1 } },
			{ "data": 0, "change": { "param": "ichangeParam", "value": 0 } }
		],
		"ichangeParam": [
			{ "data": 1, "change": { "param": "rchangeParam", "value": 1.5 } }
		]
	},
  // 设置自增参数
  // 自增变量会按照公差tolerance，每interval(ms)进行自增
	"increase": {
		"inCrease": { "tolerance": 1, "interval": 1000 }
	},
  // 设置自减参数
  // 自减变量会按照公差tolerance，每interval(ms)进行自减
	"decrease": {
		"deCrease": { "tolerance": 1, "interval": 1000 }
	}
}

```
2、将mockPLC.json文件放入可执行文件.exe的同级目录下，启动.exe文件

**注:如果缺少凭证文件`privateKey.pem`和`certificate.pem`，会提示报错<br>可以选择执行以下代码重新生成自签名证书和私钥**
```bash
openssl req -x509 -newkey rsa:2048 -keyout privateKey.pem -out certificate.pem -days 365 -nodes
```
(可以一直回车跳过)