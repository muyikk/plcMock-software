# kl-mockplc
模拟plc服务器的程序，可以自定义plc的结构体、变量。<br>兼容`opcua`、`modbus(待实现)`协议<br>并且实现设置变量的 `心跳`、`监听值并作出反馈`、`自增`、`自减`功能<br>启动服务后能够实时监控和修改所有变量的值

https://github.com/muyikk/plcMock-software
### 一、服务名称
plc模拟程序v1.0.0
	
### 二、使用方式
1.编辑基础设置（ip、端口、结构体）<br>
2.设置参数列表<br>
3.设置参数特性，如：心跳、监听、自增、自减 （可选）<br>
4.config文件默认保存在`软件根目录/config/`里
#### 心跳设置
![image](https://github.com/muyikk/plcMock-software/blob/main/IMAGE/pic1.png)
<br>心跳将会在`值1`和`值2`之间以`间隔时间`反复变化
#### 监听设置
![image](https://github.com/muyikk/plcMock-software/blob/main/IMAGE/pic2.png)
<br>当监听到`参数名`的值变成`参数值`时，`被改变的参数名`的值会变为`被改变的值`
#### 自增设置
![image](https://github.com/muyikk/plcMock-software/blob/main/IMAGE/pic3.png)
<br>`参数名`的值会以`自增公差`，以`时间间隔`进行递增
#### 自减设置
同***自增设置***
#### 实时监控
![image](https://github.com/muyikk/plcMock-software/blob/main/IMAGE/pic4.png)
### 三、编辑config文件（可选）
1、编辑自定义的opcua-data.json文件
```json
{
  "name": "opcua",
  "ip": "127.0.0.1",
  "port": 4334,
  "structure": "stCCD",
  "mockParams": [
    {
      "param": "iCCDHeart",
      "type": "Int16",
      "value": "1"
    },
    {
      "param": "iState",
      "type": "Int16",
      "value": "1"
    },
    {
      "param": "ichangeParam",
      "type": "Int16",
      "value": "1"
    },
    {
      "param": "rchangeParam",
      "type": "Double",
      "value": "2.5"
    },
    {
      "param": "inCrease",
      "type": "Int16",
      "value": "1"
    },
    {
      "param": "deCrease",
      "type": "Int16",
      "value": "1"
    }
  ],
  "hearts": [
    {
      "param": "iCCDHeart",
      "data1": "0",
      "data2": "1",
      "interval": "2000"
    }
  ],
  "listens": [
    {
      "param": "iState",
      "data": "1",
      "changeParam": "ichangeParam",
      "changeValue": "1"
    },
    {
      "param": "ichangeParam",
      "data": "2",
      "changeParam": "rchangeParam",
      "changeValue": "1.5"
    },
    {
      "param": "iState",
      "data": "5",
      "changeParam": "rchangeParam",
      "changeValue": "5.5"
    }
  ],
  "increase": [
    {
      "param": "inCrease",
      "tolerance": "1",
      "interval": "1000"
    }
  ],
  "decrease": [
    {
      "param": "deCrease",
      "tolerance": "1",
      "interval": "1000"
    }
  ]
}

```

**注:如果缺少凭证文件`privateKey.pem`和`certificate.pem`，会提示报错<br>可以选择执行以下代码重新生成自签名证书和私钥**
```bash
openssl req -x509 -newkey rsa:2048 -keyout privateKey.pem -out certificate.pem -days 365 -nodes
```
(可以一直回车跳过)
