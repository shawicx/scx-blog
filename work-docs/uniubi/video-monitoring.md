<!--
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-28 19:14:12
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-08-09 09:40:35
 * @Description: 
-->
# 视频监控

## 1. 平台端

### 1.1 ehome 协议 缓冲很频繁

hls 播放地址的 ts 切片时长是1s，网速比较慢的情况下缓冲会比较频繁， gc的服务参数配置里 可以将切片改成更长时间，减少http请求数量。

### 1.2 直播延迟优化

- 使用更快的网络连接，如有线网络或 5G 网络。
- 减少编码器的编码延迟，这可以通过调整编码器的配置参数来实现。
- 采用实时流处理技术，如 WebRTC，它可以大幅降低直播延迟。
- ~~使用内容分发网络（CDN），它可以通过缓存和分发内容来提高网络性能。~~

### 1.3 直播流延迟优化（HLS）

- 减小片段长度：通常情况下，片段长度越小，直播延迟越小。不过，如果片段长度太小，会导致视频质量下降，因此减小片段长度的**前提**是 可以保证视频质量。
- 使用配置更高的服务器：高性能服务器降低延迟 ~~（打钱）~~。
- ~~使用 CDN 加速：使用 CDN (内容分发网络) 能够帮助将直播流媒体的数据分发到用户的设备上，从而减少延迟。~~
- 使用更好的网络：直播流媒体传输的延迟与网络环境有很大关系，因此应该选择一个稳定性较高的网络来进行直播。

## 2 小程序

![image.png](https://cdn.nlark.com/yuque/0/2022/png/22890312/1663920612466-836ce386-90a9-45bd-a29a-7ccf5225f46f.png#averageHue=%23faf9f9\&clientId=u4a56f34d-1aa8-4\&from=paste\&height=358\&id=u34e1b5bd\&originHeight=422\&originWidth=722\&originalType=binary\&ratio=1\&rotation=0\&showTitle=false\&size=55057\&status=done\&style=none\&taskId=uce3fcd01-694c-4a5a-9149-99199282115\&title=\&width=613 "image.png")

![企业微信截图\_317cc2b2-76a1-4bbf-bd93-06429b948fbc.png](https://cdn.nlark.com/yuque/0/2022/png/22890312/1663920704553-e5690ab5-40c0-480a-9c5a-647633c22ff6.png#averageHue=%23fcfbfb\&clientId=u4a56f34d-1aa8-4\&from=paste\&height=280\&id=u7cece303\&originHeight=552\&originWidth=603\&originalType=binary\&ratio=1\&rotation=0\&showTitle=false\&size=60655\&status=done\&style=none\&taskId=u173c7e0f-b095-4cdb-8d31-e93d861b33f\&title=\&width=306 "企业微信截图_317cc2b2-76a1-4bbf-bd93-06429b948fbc.png")

![企业微信截图\_665a1898-18f4-4b18-b178-5e7e946b45c6.png](https://cdn.nlark.com/yuque/0/2022/png/22890312/1663920717161-70059e4b-cf3a-4f7d-bd68-6128533d1572.png#averageHue=%23fbf9f9\&clientId=u4a56f34d-1aa8-4\&from=paste\&height=278\&id=u4f1b5ca6\&originHeight=402\&originWidth=604\&originalType=binary\&ratio=1\&rotation=0\&showTitle=false\&size=49113\&status=done\&style=none\&taskId=ua069a4c3-aad0-4580-993c-e2978918180\&title=\&width=418 "企业微信截图_665a1898-18f4-4b18-b178-5e7e946b45c6.png")

1. 必须https
2. 目前是由运维放置校验文件，因为 校验文件 放在 public 下面会被打包进 dist/js 中
3. 资质文件: 认证 比较困难，在 h5 页面实现功能，通过 webview 嵌套。
4. token 通过 url 传递到 h5 页面。

## 3 三合一组件

```json
"xgplayer": "^2.31.2",
"xgplayer-flv.js": "^2.3.0",
"xgplayer-hls.js": "^2.6.0"
"qn-rtplayer-web": "^1.0.1",
"ezuikit-js": "^0.2.3",
```

### 3.1 引用关系

![image.png](https://cdn.nlark.com/yuque/0/2022/png/22890312/1646640230444-7257d0ec-ae50-41c1-a97b-5971a3bbebb6.png#averageHue=%23262b32\&clientId=uc2971265-8f6f-4\&from=paste\&height=405\&id=u411717d9\&originHeight=405\&originWidth=338\&originalType=binary\&ratio=1\&rotation=0\&showTitle=false\&size=35992\&status=done\&style=none\&taskId=u9df10ad1-3833-4a43-bbe2-c797a2303b9\&title=\&width=338 "image.png")

![](https://cdn.nlark.com/yuque/0/2022/jpeg/22890312/1646641132081-cdbec8f9-6341-46eb-b974-df147182c6d6.jpeg)

### 3.2 VideoPlayer - 萤石云播放

#### 3.2.1 文档

[GitHub - Ezviz-OpenBiz/EZUIKit-JavaScript-npm: 轻应用npm版本，降低接入难度，适配自定义UI，适配主流框架 轻应用npm版本，降低接入难度，适配自定义UI，适配主流框架. Contribute to Ezviz-OpenBiz/EZUIKit-JavaScript-npm development by creating an account on GitHub. https://github.com/Ezviz-OpenBiz/EZUIKit-JavaScript-npm](https://github.com/Ezviz-OpenBiz/EZUIKit-JavaScript-npm "GitHub - Ezviz-OpenBiz/EZUIKit-JavaScript-npm: 轻应用npm版本，降低接入难度，适配自定义UI，适配主流框架 轻应用npm版本，降低接入难度，适配自定义UI，适配主流框架. Contribute to Ezviz-OpenBiz/EZUIKit-JavaScript-npm development by creating an account on GitHub. https://github.com/Ezviz-OpenBiz/EZUIKit-JavaScript-npm")

#### 3.2.2 暂停

萤石云播放器(直播模式)暂停后播放器显示为黑色背景，这里使用 `ezuikit-js`的截图 API `capturePicture`截取最后一帧的图片 覆盖于播放器上方。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/22890312/1646640850898-68d51382-dce2-405c-a462-be7ff07557f3.png#averageHue=%23292e36\&clientId=uc2971265-8f6f-4\&from=paste\&height=154\&id=ue6094e4e\&originHeight=154\&originWidth=905\&originalType=binary\&ratio=1\&rotation=0\&showTitle=false\&size=46456\&status=done\&style=none\&taskId=u2c704f21-d973-4bb1-9c8c-3ca3fadb3fb\&title=\&width=905 "image.png")

![image.png](https://cdn.nlark.com/yuque/0/2022/png/22890312/1646640880703-83f32b91-4471-472f-ba36-1d17b39988f4.png#averageHue=%23292d36\&clientId=uc2971265-8f6f-4\&from=paste\&height=821\&id=WywmD\&originHeight=821\&originWidth=836\&originalType=binary\&ratio=1\&rotation=0\&showTitle=false\&size=135158\&status=done\&style=none\&taskId=u3c8afea5-d35a-4349-a1c6-0b4b882bb03\&title=\&width=836 "image.png")

### 3.3 WebRtcPlayer - 七牛云 webrtc

#### 3.3.1 文档地址

[低延时 Web SDK\_SDK 下载\_直播云 - 七牛开发者中心 低延时 Web SDK https://developer.qiniu.com/pili/7730/geek-web-sdk](https://developer.qiniu.com/pili/7730/geek-web-sdk "低延时 Web SDK_SDK 下载_直播云 - 七牛开发者中心 低延时 Web SDK https://developer.qiniu.com/pili/7730/geek-web-sdk")

#### 3.3.2 状态

只有停止状态 无暂停状态

## 4 FlvPlayer - 七牛云 Flv / IPC Flv 播放

### 4.1 HlsPlayer - 七牛云 Hls / IPC Hls 播放

#### 4.1.1 文档地址

[xgplayer](https://v2.h5player.bytedance.com/gettingStarted/ "xgplayer")

[xgplayer-hls-js](https://v2.h5player.bytedance.com/plugins/#xgplayer-hls-js "xgplayer-hls-js")

[hls.js](https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning "hls.js")

### 4.2 注意点

1. 工地这边视频组件有大量工地业务相关的内容。
2. 目前是使用播放器自带的播放/暂停/全屏等功能，播放不同地址的视频时UI 没有完全统一。
3. 工地业务上，不能使用 `xgplayer-flv`与 `xgplayer-hls`，应该是兼容性问题
   1. `xgplayer-flv`是 字节团队自己开发的播放库，没有其他依赖，`xgplayer-flv.js`是在 `flv.js`的基础上封装。`xgplayer-flv.js`兼容性要好一些。
