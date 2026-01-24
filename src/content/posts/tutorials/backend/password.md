---
title: '密码加密实现'
description: 'Nestjs 实现密码加密功能'
draft: false
published: 2026-01-23
difficulty: 'intermediate' # beginner | intermediate | advanced
tags: ['Nestjs', '后端实战']
estimatedReadTime: 8 # minutes
category: 'backend'
type: 'tutorial'
---

# 密码登录功能实现详解

## 前端加密与后端解密

在用户密码登录过程中，为确保密码在传输过程中的安全性，系统采用前端加密、后端解密的方式处理密码。完整代码创查看[项目](https://github.com/shawicx/scx-service.git)

### 加密密钥管理

系统通过AuthService提供动态加密密钥：

```typescript
// 获取加密密钥供前端使用
async getEncryptionKey(): Promise<{ key: string; keyId: string }> {
  // 生成随机密钥并存储到缓存中，设置过期时间
  const key = CryptoUtil.generateKey();
  const keyId = uuidv4();
  await this.cacheService.setWithExpire(`encryption_key:${keyId}`, key, ENCRYPTION_KEY_TTL);
  return { key, keyId };
}
```

### 前端加密流程

前端在用户输入密码后，首先向后端请求加密密钥：

```typescript
// 前端获取加密密钥
const { key, keyId } = await getEncryptionKey();

// 使用CryptoUtil加密密码
const encryptedPassword = CryptoUtil.encrypt(password, key);

// 提交登录请求时携带加密密码和密钥ID
const loginData = {
  email,
  password: encryptedPassword,
  keyId
};
```

### 后端解密验证

UserService接收加密密码后进行解密和验证：

```typescript
async loginWithPassword(loginWithPasswordDto: LoginWithPasswordDto, keyId: string): Promise<LoginResponseDto> {
  const { email, password } = loginWithPasswordDto;

  // 验证密钥ID是否存在
  if (!keyId) {
    throw SystemException.invalidParameter('密码必须加密传输，请先获取加密密钥');
  }

  // 从缓存获取对应密钥
  const encryptionKey = await this.authService.getEncryptionKey(keyId);
  if (!encryptionKey) {
    throw SystemException.keyExpired('加密密钥已过期，请重新获取');
  }

  let decryptedPassword: string;
  try {
    // 解密密码
    decryptedPassword = CryptoUtil.decrypt(password, encryptionKey);
  } catch {
    throw SystemException.decryptionFailed('密码解密失败');
  }

  // 查询用户信息
  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) {
    throw SystemException.invalidCredentials('邮箱或密码错误');
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(decryptedPassword, user.password);
  if (!isPasswordValid) {
    throw SystemException.invalidCredentials('邮箱或密码错误');
  }

  // 更新登录信息并生成token
  await this.updateLoginInfo(user.id, clientIp);
  const accessToken = await this.authService.generateAccessToken(user.id, user.email);
  const refreshToken = await this.authService.generateRefreshToken(user.id, user.email);

  return new LoginResponseDto(user, accessToken, refreshToken);
}
```

## CryptoUtil工具类

CryptoUtil封装了AES-256-CTR算法的加密解密操作：

```typescript
export class CryptoUtil {
  private static readonly ALGORITHM = 'aes-256-ctr';
  private static readonly IV_LENGTH = 16;
  private static readonly KEY_LENGTH = 32;

  static encrypt(text: string, key: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, keyBuffer, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(encryptedText: string, key: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('加密数据格式错误');
    }

    const [ivHex, encrypted] = parts;
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.ALGORITHM, keyBuffer, ivBuffer);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

## 安全性保障

1. 密钥时效性：每次请求生成的加密密钥都有固定有效期，过期后需要重新获取
2. 传输加密：密码在传输过程中始终以加密形式存在
3. 存储安全：数据库中存储的密码经过bcrypt哈希处理
4. 验证机制：解密失败或密钥过期时会抛出相应异常
