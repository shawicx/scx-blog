## 原生API

1. PC 兼容性很好。
2. 代码非常简洁。

```typescript
const text = "哈哈哈哈哈"

const synth = window.speechSynthesis;
let utterance: SpeechSynthesisUtterance | null =
  new SpeechSynthesisUtterance(text);
synth.speak(utterance);
// 销毁实例
utterance = null;
```

但是：**电视机大屏APP 无法使用**，APP 的浏览器外壳版本不支持，所以尝试 自定义polyfill。

## polyfill - audio 标签 + queue

```typescript
constructor() {
  this.utteranceQueue: SpeechSynthesisUtterance[] = [];
  this.audio = new Audio();
}


private async playNext (utteranceQueue): void => {
  const SpeechSynthesisUtterancePolyfill = utteranceQueue.shift();
  
  this.speaking = false;
  if (utteranceQueue.length) {
    this.pending = true;
  } else {
    this.pending = false;
  }
  
  if (SpeechSynthesisUtterancePolyfill) {
    this.audio.src = '-----';
   	await this.audio.play();
  }
};

speak(SpeechSynthesisUtterancePolyfill: SpeechSynthesisUtterance) {
  this.pending = true;
  utteranceQueue.push(SpeechSynthesisUtterancePolyfill);
  if (this.speaking || this.paused) {
    
  } else {
    this.playNext(utteranceQueue);
  }
};

```

polyfill： 数据推送时 根据数据得到播报文本 后合成为语音，并转为一个语音地址，随后 实例化 一个 audio 标签，用这个标签播放语音地址。现在使用的 合成 API是 Google 的， \~\~虽然免费 （以公司业务量，免费的额度不够用） \~\~ 但是合成得到的 语音地址国内十有八九无法访问，所以需要国内厂商提供的 API （公司没有）。

### 自定义 polyfill (audio标签)  后的 问题：

1. APP 外壳不支持 audio 标签 ~~（升级可能可以解决）~~。 升级无法解决，应该不是audio的问题，25 楼 5个电视机，测试 1个可以，3个不可用，1个未测试。其中，可用的电视机与一个不可用电视机 型号、系统版本等 都一样。
2. **需要进行语音合成（阿里云、腾讯云、华为云......）。**
3. **DOMExpection**: 无法看出是什么类型的错误，未知原因，外壳是X5？？？QQ 浏览器 对这个API的支持是未知。

## polyfill - AudioContext + queue

2个版本：前一个版本比较通用，当前版本比较受 业务 限制，但是可以减少 **入队列到播放** 的等待时间。

### 提前初始化音频

在实例化 class 之后立即 将音频资源初始化为 `Audio Buffer` , 这样可以在播放音频的时候， 资源请求和 Buffer 化的时间可以省略下来，在网络较差的时候 体验有比较大的提升。
**但是，提前初始化意味着资源是确定的，如果 资源不确定就要在入栈时即时转换为 Buffer.**
以下是主要代码

```typescript
// 签到音频
const IN_URL =
  'https://fe-cloud.uni-ubi.com/radio/1681294990939-%E7%AD%BE%E5%88%B0%E6%88%90%E5%8A%9F.mp3';

// 签退音频
const OUT_URL =
  'https://fe-cloud.uni-ubi.com/radio/1681294990954-%E7%AD%BE%E9%80%80%E6%88%90%E5%8A%9F.mp3';

const queue = new AudioQueue();

// 提前初始化音频Buffer。
// AudioQueue.initInBuffer();
// AudioQueue.initOutBuffer()

export default class AudioQueue {
  private audioContext: AudioContext;
  private queue: string[];
  private isPlaying: boolean;
  private inBuffer: AudioBuffer;
  private outBuffer: AudioBuffer;

  constructor() {
    this.audioContext = new AudioContext();
    this.queue = [];
    this.isPlaying = false;
    this.inBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 2,
      this.audioContext.sampleRate,
    );
    this.outBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 2,
      this.audioContext.sampleRate,
    );
  }

  // 新播报 入队列
  enqueue(audioType: string): void {
    this.queue.push(audioType);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  // 初始化音频
  async initInBuffer() {
    const audioBuffer = await fetch(IN_URL)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer));
    this.inBuffer = audioBuffer;
  }

  // 初始化音频
  async initOutBuffer() {
    const audioBuffer = await fetch(OUT_URL)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer));
    this.outBuffer = audioBuffer;
  }

  // 播放音频
  private async playAudio(audioType: string): Promise<void> {
    // 资源地址不确定时 使用这种方案
    // const audioBuffer = await fetch(audioUrl)
    //   .then((response) => response.arrayBuffer())
    //   .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer));
    // const audioSource = this.audioContext.createBufferSource();
    // 取 buffer
    audioSource.buffer = audioType === 'in' ? this.inBuffer : this.outBuffer;
    audioSource.connect(this.audioContext.destination);
    audioSource.start();

    return new Promise((resolve) => {
      // 播放结束
      audioSource.onended = () => {
        resolve();
      };
    });
  }

  // 播放队列中的下一个音频
  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    // const nextAudioType = this.queue.shift() as string;
    const url = this.queue.shift()
    await this.playAudio(nextAudioType);
    await this.playNext();
  }
}

```

## 其他尝试

[https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills "https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills")
