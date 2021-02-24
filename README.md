# preact-event-delegate

[![NPM Version](https://img.shields.io/npm/v/preact-event-delegate.svg?style=flat-square)](https://www.npmjs.com/package/preact-event-delegate)
[![NPM Downloads](https://img.shields.io/npm/dm/preact-event-delegate.svg?style=flat-square)](https://www.npmjs.com/package/preact-event-delegate)

> 实现 Preact X 的 dom 事件委托

## 安装

```bash
$ npm i -S preact-event-delegate
```

## 使用说明

在 JSX DOM 上设置 `on` 属性，值为委托处理方法，该方法会传入一个委托对象 `delegate`，仿照 jQuery 写法，使用 `delegate.on(events, selector, handler)` 方法就可以进行事件委托。

在事件处理函数中执行 `return false`，可以阻止该节点后续事件委托的执行，同时会停止事件冒泡。

### 支持的事件

参照 React 说明，[https://reactjs.org/docs/events.html#supported-events](https://reactjs.org/docs/events.html#supported-events)，理论上可以对所有支持冒泡的事件进行委托。

事件名采用驼峰形式，如 `touchstart` 事件要用 `touchStart` 进行委托。

### 调用示例

```js
// index.js
import { Component, h } from 'preact';
import 'preact-event-delegate';

class App extends Component {
    render() {
        return (
            <article
                on={delegate =>
                    delegate
                        .on('click', '.btn', function(e) {
                            console.log('click .btn', this, e);
                        })
                        .on('touchStart', '.wrap', function(e) {
                            console.log('touchStart .wrap', this, e);
                            return false;
                        })
                        .on('touchMove', '.wrap', function(e) {
                            console.log('touchMove .wrap', this, e);
                        })
                        .on('touchEnd', '.wrap', function(e) {
                            console.log('touchEnd .wrap', this, e);
                        })
                        .on('click', 'header', function(e) {
                            console.log('click header', this, e);
                            return false;
                        })
                        .on('click', function(e) {
                            console.log('click this', this, e);
                        })
                }
            >
                <header>preact-event-delegate</header>
                <section class="wrap">
                    <button class="btn">按钮</button>
                </section>
                <footer>
                    <a href="https://github.com/xingqiao">@xingqiao</a>
                </footer>
            </article>
        );
    }
}

render(<App />, document.body);
```
