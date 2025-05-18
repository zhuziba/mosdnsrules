const createVLESSServer = require('./index.js');

// 定义端口和 UUID
const port = 3001;
const uuid = 'd342d11e-d424-4583-b36e-524ab1f0afa4';

// 调用函数启动 VLESS 服务器
createVLESSServer(port, uuid);
