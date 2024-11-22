/**
 * 将小端字节序的 Buffer 转换为浮点数
 * @param buffer 小端序的 Buffer（长度必须为4字节）
 * @returns 转换后的浮点数
 */
function littleEndianToFloat(buffer) {
  if (buffer.length !== 4) {
    throw new Error('Buffer 长度必须为 4 字节');
  }
  // 使用 DataView 解析小端序数据
  const view = new DataView(buffer.buffer);
  return view.getFloat32(0, true); // true 表示小端序
}

// 示例数据（小端序）
const littleEndianBuffer = Buffer.from([0xCC, 0xCD, 0x41, 0x94]);

// 转换为浮点数
const floatResult = littleEndianToFloat(littleEndianBuffer);

console.log('浮点数:', floatResult); // 输出 18.6
