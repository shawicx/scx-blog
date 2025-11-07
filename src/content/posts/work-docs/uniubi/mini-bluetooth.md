---
title: '小程序蓝牙开发指南'
description: '微信小程序蓝牙通信协议实现，包含中回回弹仪设备连接和数据交互'
draft: false
published: 2025-08-09
---

# 小程序蓝牙

## 目录

- [中回 回弹仪](#中回-回弹仪)

## 中回 回弹仪

文档 [中回无线蓝牙数字回弹仪通信协议（V1.2） .pdf](<https://www.yuque.com/attachments/yuque/0/2023/pdf/22890312/1685598468945-64c89754-eb02-435c-8cc2-99a6e16eefc7.pdf?_lake_card={"src"%3A"https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2023%2Fpdf%2F22890312%2F1685598468945-64c89754-eb02-435c-8cc2-99a6e16eefc7.pdf"%2C"name"%3A"中回无线蓝牙数字回弹仪通信协议（V1.2） .pdf"%2C"size"%3A207255%2C"ext"%3A"pdf"%2C"source"%3A""%2C"status"%3A"done"%2C"download"%3Atrue%2C"taskId"%3A"u7366cbb8-cfea-4082-b609-e33a8475131"%2C"taskType"%3A"transfer"%2C"type"%3A"application%2Fpdf"%2C"mode"%3A"title"%2C"id"%3A"u00dc7892"%2C"card"%3A"file"}> "中回无线蓝牙数字回弹仪通信协议（V1.2） .pdf")

![image.png](https://cdn.nlark.com/yuque/0/2023/png/22890312/1685438292734-02e1d8de-8c24-422d-a127-a832703faf58.png#averageHue=%233c2e2b\&clientId=u88b57cb8-32c0-4\&from=paste\&height=737\&id=uea56a64e\&originHeight=737\&originWidth=877\&originalType=binary\&ratio=1\&rotation=0\&showTitle=false\&size=249979\&status=done\&style=none\&taskId=u553b9e09-3edf-4484-8451-9747372228f\&title=\&width=877 "image.png")

```typescript
// 监听信道
const startNotify = (hexValues: number[]) => {
  Taro.notifyBLECharacteristicValueChange({
    state: true,
    deviceId: deviceId.current,
    serviceId: serviceId.current,
    characteristicId: notifyId.current,
    success: () => {},
    fail: () => {},
    complete: () => {
      startWrite(hexValues);
    },
  });
  Taro.onBLECharacteristicValueChange(result => {
    const value = BufferToString(result.value);
    console.log(result, value, 'onBLECharacteristicValueChange');
  });
};

// 发送信令
const startWrite = (message: number[]) => {
  // 创建一个Uint8Array
  const uint8Array = new Uint8Array(message);
  // 将Uint8Array转换为ArrayBuffer
  const arrayBuffer = uint8Array.buffer;
  Taro.writeBLECharacteristicValue({
    deviceId: deviceId.current,
    serviceId: serviceId.current,
    characteristicId: writeId.current,
    value: arrayBuffer,
    success: () => {
      console.log('写入成功');
    },
    fail: () => {
      console.log('写入失败');
    },
  });
};

  // 通知设备：获取设备信息
  const getDeviceInfo = () => {
    const hexValues = [0x24, 0x52, 0x44, 0x49, 0xdf, 0x23, 0x0d, 0x0a];
    startNotify(hexValues);
  };

  // 通知设备：准备采集数据
  const prepare = () => {
    const hexValues = [0x24, 0x53, 0x52, 0x53, 0xf8, 0x23, 0x0d, 0x0a];
    startNotify(hexValues);
  };

  // 通知设备：停止采集数据
  const disconnect = () => {
    const hexValues = [0x24, 0x45, 0x52, 0x53, 0xea, 0x23, 0x0d, 0x0a];
    startNotify(hexValues);
  };

```
