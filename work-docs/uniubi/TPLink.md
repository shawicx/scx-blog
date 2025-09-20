# TPLink 路由器

## 路由器配置

### 认证规则配置

![image.png](/assets/imgs/tplink_config_portal.png)

### 免认证策略 添加认证地址

以下配置需要2个，一个TCP 一个UDP

![image.png](/assets/imgs/tplink_config_url.png)

## 问题记录

### 华为手机无法进入Wi-Fi认证页面

> 表现为 一直在 connectivitycheck.cbgapp.huawei.com 这个地址加载)

各大平台/终端有Wi-Fi认证地址，这个认证地址会告知用户 Wi-Fi是否需要登录，如果需要登录会跳转到Wi-Fi的认证页面。华为自带浏览器/UC浏览器无法处理手机认证结果。

**Wi-Fi认证流程如下图**

![](/assets/imgs/tplink_portal_flow.jpeg)

解决方式：换QQ浏览器/Chrome。
可用: QQ浏览器/Chrome浏览器
不可用: UC浏览器/360浏览器/夸克浏览器/百度
未测试:  手机厂商自带浏览器与其他

### 各平台Wi-Fi认证地址

1. 通用
    1. ios/mac [http://captive.apple.com/](http://captive.apple.com/ "http://captive.apple.com/")
    2. win
       10 [http://www.msftconnecttest.com/redirect](http://www.msftconnecttest.com/redirect "http://www.msftconnecttest.com/redirect")
    3. win
       11 [http://edge.microsoft.com/captiveportal/generate\_204](http://edge.microsoft.com/captiveportal/generate_204 "http://edge.microsoft.com/captiveportal/generate_204")
    4. android
        - [http://www.gstatic.com/generate\_204](http://www.gstatic.com/generate_204 "http://www.gstatic.com/generate_204")
        - [http://connectivitycheck.gstatic.com/generate\_204](http://connectivitycheck.gstatic.com/generate_204 "http://connectivitycheck.gstatic.com/generate_204")
2. 第三方
    1.
   华为 [http://connectivitycheck.cbg-app.huawei.com](http://connectivitycheck.cbg-app.huawei.com "http://connectivitycheck.cbg-app.huawei.com")
    2.
   小米 [http://connect.rom.miui.com/generate\_204](http://connect.rom.miui.com/generate_204 "http://connect.rom.miui.com/generate_204")
    3.
   vivo [http://wifi.vivo.com.cn/generate\_204](http://wifi.vivo.com.cn/generate_204 "http://wifi.vivo.com.cn/generate_204")
    4. google ...

### from action

配置了action属性时，form 会将form包裹的表单值提交到 action对应的URL。

```tsx
const formRef = useRef<HTMLFormElement>(null);

<form
  style={{ display: 'none' }}
  id="formQuestion"
  name="formQuestion"
  method="get"
  action={`http://${state.wlanacip}:8080/portal/auth`}
  target="_self"
  ref={formRef}
>
  <input
    type="hidden"
    id="username"
    name="username"
    value={state.username}
  />
  <input
    type="hidden"
    id="password"
    name="password"
    value={state.password}
  />
</from>
<button
  onClick={() => {
    if (fromRef.current) {
      fromRef.current.submit();
    }
  }}
>
  提交
</button>
```

**问题: 无法获取到URL请求结果**

### jquery get

```ts
const parseConfig = (data: string) => {
  try {
    const startIndex = data.indexOf('{');
    const endIndex = data.indexOf('}');
    const cfg = data.substring(startIndex, endIndex + 1);
    const cfgPara = $.parseJSON(cfg);
    if (WIFI_SUCCESS_TIPS.includes(cfgPara.logonTip)) {
      // ...
    } else if (WIFI_FAILURE_TIPS.includes(cfgPara.logonTip)) {
      // ...
    } else {
      console.log('未知错误，请联系管理员);
    }
  } catch (e) {
    console.log(e, '未知错误，请联系管理员');
  }
};


const { ssid, ...restState } = state;
$.get(
  `http://${
    state.wlanacip
  }:8080/portal/auth?${QueryString.stringify({
    ...restState,
    username: userName,
    password: passWord,
    ssid: decodeURIComponent(ssid),
    authtype: 5,
  })}`,
  parseConfig,
);
```

jquery 的 get 方法可以得到 \_本地请求 \_的返回结果

### iframe 嵌套、postMessage

都因为 跨域获取不到认证请求结果。
