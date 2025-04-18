## 1 URI和URL

### 1.1 URI(统一资源标识符)，用来唯一的标识一个资源。

- 访问资源的命名机制
- 存放资源的主机名
- 资源自身的名称，由路径表示，着重强调于资源。

### 1.2 URL(统一资源定位符)，是一种具体的URI，可以用来标识一个资源。

**组成：**

- 协议(或称为服务方式)
- 存有该资源的主机IP地址(有时也包括端口号)
- 主机资源的具体地址。如目录和文件名等

## 2 HTTP的特点

- 支持客户/服务器模式(C/S)。
- 简单快速：只需传送请求方法和路径，因程序规模小而通信速度快。
- 灵活：允许传输任意类型的数据对象。
- 无连接：限制每次连接只处理一个请求，完成应答即断开连接节省时间。
- 无状态：对事务处理没有记忆能力。

## 3 HTTP的工作过程

建立连接，发送请求信息，发送响应信息，关闭连接。

## 4 HTTP格式

> HTTP有两类报文，请求报文和响应报文，组成一样。

- 开始行：区别两者。请求报文中称为请求行，响应报文称为响应行。
- 首部行：说明浏览器、服务器或报文主体的一些信息。∂
- 附属体行：一般不使用。

## 5 状态码

> 参考维基百科 [HTTP状态码](https://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81 "HTTP状态码")

***常见状态码***

| 状态码   | 含义                                     |
|-------|----------------------------------------|
| 200   | 成功处理了请求。 通常，这表示服务器提供了请求的网页。            |
| 204   | 处理了请求，但没有返回任何内容。                       |
| 206   | 客户端进行了范围请求，服务器成功执行。                    |
| 300   | 针对请求，服务器可执行多种操作。                       |
| 301   | 请求的网页已永久移动到新位置。                        |
| 304   | 自从上次请求后，请求的网页未修改过。                     |
| 305   | 请求者只能使用代理访问请求的网页。                      |
| 400   | 服务器不理解请求的语法。                           |
| 401   | 请求要求身份验证。                              |
| 403   | 服务器拒绝请求。                               |
| 404   | 服务器找不到请求的网页。                           |
| 500   | 服务器遇到错误，无法完成请求。                        |
| 501   | 服务器不具备完成请求的功能。例如，服务器无法识别请求方法时可能会返回此代码。 |
| 503   | 服务器目前无法使用(由于超载或停机维护)。 通常，这只是暂时状态。      |
| 505   | 服务器不支持请求中所用的 HTTP 协议版本。                |

## 6 六、请求方法

| 方法名     | 方法作用                                    |
|---------|-----------------------------------------|
| GET     | GET方法请求一个指定资源的表示形式. 使用GET的请求应该只被用于获取数据. |
| POST    | POST方法用于将实体提交到指定的资源，通常导致状态或服务器上的副作用的更改. |
| OPTIONS | OPTIONS方法用于描述目标资源的通信选项。                 |
| PUT     | PUT方法用请求有效载荷替换目标资源的所有当前表示。              |
| HEAD    | HEAD方法请求一个与GET请求的响应相同的响应，但没有响应体.        |
| DELETE  | DELETE方法删除指定的资源。                        |
| CONNECT | CONNECT方法建立一个到由目标资源标识的服务器的隧道。           |
| TRACE   | TRACE方法沿着到目标资源的路径执行一个消息环回测试。            |
| PATCH   | PATCH方法用于对资源应用部分修改。                     |

***GET和POST的区别：***

|          | GET                                                           | POST                                                                  |
|----------|---------------------------------------------------------------|-----------------------------------------------------------------------|
| 后退按钮/刷新  | 无害                                                            | 数据会被重新提交（浏览器应该告知用户数据会被重新提交）。                                          |
| 书签       | 可收藏为书签                                                        | 不可收藏为书签                                                               |
| 缓存       | 能被缓存                                                          | 不能缓存                                                                  |
| 编码类型     | application/x-www-form-urlencoded                             | application/x-www-form-urlencoded 或 multipart/form-data。为二进制数据使用多重编码。 |
| 历史       | 参数保留在浏览器历史中。                                                  | 参数不会保存在浏览器历史中。                                                        |
| 对数据长度的限制 | 是的。当发送数据时，GET 方法向 URL 添加数据；URL 的长度是受限制的（URL 的最大长度是 2048 个字符）。 | 无限制。                                                                  |
| 对数据类型的限制 | 只允许 ASCII 字符。                                                 | 没有限制。也允许二进制数据。                                                        |
| 安全性      | 安全性较差，因为所发送的数据是 URL 的一部分。&#xA;在发送密码或其他敏感信息时绝不要使用 GET ！        | 较安全，参数不会被保存在浏览器历史或 web 服务器日志中。                                        |
| 可见性      | 数据在 URL 中对所有人都是可见的。                                           | 数据不会显示在 URL 中。                                                        |
