
// 请求副头部,固定5000| 网络号2| PLC编号,固定值FF| 目标模块io编号,固定FF03| 目标模块站号2| 数据长度,当前字节往后的字节长度4|PLC响应超时时间,以250ms单位4| 主命令4| 子命令4| 首地址4~6| 软元件区域代码2| 读取长度4
//      50 00            00           ff                 ff 03              00                   0c 00                            0a 00          01 04    00 00  00 00 00         a8         01 00

// 响应副头部,固定D000 | 2 | 网络号2 | PLC编号，固定值FF | 目标模块IO编号，固定值FF03 | 目标模块站号2 | 响应数据长度4 | 结束代码4 | 一个具体的word值4
//        D000                00            FF                    FF03                   00           0600          0000          23001D00

/**
 * MC指令
 */
export interface Order {
  /**请求数据 */
  request: Req;
  /**响应数据 */
  response: Res;
  /**请求副头部 */
  reqHead: string;
  /**响应副头部 */
  resHead: string;
  /**网络号 */
  netCode: string;
  /**PLC编号 */
  plcCode: string;
  /**IO编号 */
  ioCode: string;
  /**目标模块站号 */
  stationCode: string;
  /**
   * 格式化请求报文
   * @param message 请求报文
   * @returns 请求数据
   */
  getReq(message: Buffer): Req;
  // /**
  //  * 格式化响应报文
  //  * @param message 响应报文
  //  * @returns 响应数据
  //  */
  // getRes(message: Buffer): Res;
  /**
   * 转化输出响应报文
   * @param response 输出响应数据
   * @returns 输出响应报文
   */
  outResponse(response: Res): Buffer;
  // /**
  //  * 转化输出报文
  //  * @param response 输出请求数据
  //  * @returns 输出请求报文
  //  */
  // outRequest(request: Req): Buffer;
  /**
   * 生成响应报文
   * @param Req 请求数据
   * @param Object 服务器数据列表，仅在读取时可用
   * @returns 响应数据
   */
  initRes(request: Req, serviceData?: Object): Res;
  /**
   * 简单的高低位变换
   * @param str 低位
   * @returns 高位
   */
  LE2BE(string)
}

// ------------请求报文------------
export type Req = {
  /**剩余字节长度 */
  overlength: number;
  /**默认响应超时时间 `0a00` */
  outTime: number;
  /**命令 */
  order: string;
  /**首地址 */
  adrrCode: number;
  /**区域代码 */
  areaCode: string;
  /**操作长度：读取长度|写入长度 */
  handle: number;
  /**若为写入，写入具体数据 */
  data?: object;
}

// ------------响应报文------------
export type Res = {
  // 剩余字节长度
  overlength: number;
  // 结束代码，状态码。默认：0000
  state: string;
  // 数据。只有是读取的响应，存在该字段，在overlength中体现
  data?: object;
  // 写入成功。只有是写入的响应，存在该字段
  padding?: string;
}


