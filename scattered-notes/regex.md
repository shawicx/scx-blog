# 正则

```typescript
// 允许中文、英文字母、数字、空格和特殊字符，长度1-32位
const reg = /^[\u4e00-\u9fa5a-zA-Z\d\s_~!@#$%^&*()[\]{}+-=.,;/\\|"']{1,32}$/;
```

```typescript
// 只允许中文和英文字母，长度1-64位
const reg = /^[\u4e00-\u9fa5a-zA-Z]{1,64}$/;
```

```typescript
// 允许任意字符，长度1-128位
const reg = /^.{1,128}$/;
```

```typescript
// URL地址校验（支持http、https、ftp协议）
const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.([a-zA-Z]{2,}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
```

```typescript
// 密码校验：6-18位，不能是纯数字、纯字母或纯特殊字符
const reg = /(?!^(\d+|[a-zA-Z]+|[_~!@#$%^&*()[\]{}+-=.,;/\\|"']+)$)^[\w_~!@#$%^&*()[\]{}+-=.,;/\\|"']{6,18}$/;
```

```typescript
// 允许任意字符，长度1-255位
const reg = /^.{1,255}$/;
```

```typescript
// 手机号码校验（11位，以1开头）
const reg = /^1[0-9]{10}$/;
```

```typescript
// 固定电话校验（可选3-4位区号-7-8位号码）
const reg = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
```

```typescript
// 数字校验（10-30位，不能以0开头）
const reg = /^[1-9]\d{9,29}$/;
```

```typescript
// IPv4地址校验（0-255.0-255.0-255.0-255）
const reg = /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))/;
```

```typescript
// MAC地址校验（支持xx-xx-xx-xx-xx-xx或xx:xx:xx:xx:xx:xx格式）
const reg = /^[A-Fa-f0-9]{2}(-[A-Fa-f0-9]{2}){5}$|^[A-Fa-f0-9]{2}(:[A-Fa-f0-9]{2}){5}$/;
```

```typescript
// 身份证号码校验（18位）
const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
```

```typescript
// 电子邮箱校验
const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
```

```typescript
// 8位数字校验
const reg = /^[0-9]{8}$/;
```

```typescript
// 正整数校验（不能以0开头）
const reg = /^[1-9]{1,}[\d]*$/
```
