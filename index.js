import { options } from 'preact';

function isFunction(obj) {
    return typeof obj === 'function';
}

function isString(obj) {
    return typeof obj === 'string';
}

/** 事件委托 */
class Delegate {
    constructor(vnode) {
        this.vnode = vnode;
        this.map = {};
        // 用来给委托任务编号，事件触发时按顺序执行
        this.index = 0;
    }
    /**
     * 将事件处理函数添加到当前节点
     * @param {string} events 事件名，多个事件用空格分隔
     * @param {string} selector 选择器
     * @param {function} handler 事件处理函数
     */
    on(events, selector, handler) {
        const { map, vnode } = this;
        if (isFunction(selector)) {
            handler = selector;
            selector = null;
        }
        if (isString(events) && isFunction(handler)) {
            const index = this.index++;
            if (!isString(selector)) {
                selector = null;
            }
            events.split(/[\s,]+/).forEach(eventName => {
                if (eventName) {
                    if (!map[eventName]) {
                        map[eventName] = [];
                        const { props } = vnode;
                        // 事件名采用驼峰形式
                        const eventBindName = `on${eventName.replace(/^\w/, w => w.toUpperCase())}`;
                        let oldHandler = props[eventBindName];
                        if (!isFunction(oldHandler)) {
                            oldHandler = null;
                        }
                        props[eventBindName] = event => {
                            if (oldHandler) {
                                oldHandler(event);
                            }
                            this.exec(eventName, event);
                        };
                    }
                    map[eventName].push({ index, selector, handler });
                }
            });
        }
        return this;
    }
    /**
     * 执行附加到节点上的指定事件的所有处理函数
     * @param {string} eventName 事件名
     * @param {Event} event
     */
    exec(eventName, event) {
        let { currentTarget: root, target } = event;
        const execList = [];
        const list = this.map[eventName];
        // 查找子元素命中的委托
        while (target && root && target !== root) {
            const matches = {};
            list.forEach(({ index, selector, handler }) => {
                if (selector) {
                    if (matches[selector] == null) {
                        const finds = root.querySelectorAll(selector);
                        matches[selector] = Array.prototype.indexOf.call(finds, target) > -1;
                    }
                    if (matches[selector]) {
                        execList.push({
                            index,
                            target,
                            handler,
                            event: Object.assign({}, event, { target })
                        });
                    }
                }
            });
            target = target.parentElement || root;
        }
        // 查找当前元素命中的委托
        list.forEach(({ index, selector, handler }) => {
            if (!selector) {
                execList.push({ index, target: root, handler, event });
            }
        });
        // 依次执行命中的委托
        execList.sort((a, b) => a.index - b.index);
        while (execList.length) {
            const { target, handler, event } = execList.shift();
            // 在事件处理函数中返回 false 时，停止后续的委托处理
            if (handler.call(target, event) === false) {
                event.cancelBubble = true;
                event.defaultPrevented = true;
                return false;
            }
        }
    }
}

//#region 通过vnode钩子函数解析on属性，并进行事件委托
let oldHook = options.vnode; // 保存之前的钩子函数
options.vnode = vnode => {
    // 设置了on属性时，创建Delegate对象进行委托
    let { on } = vnode.props || {};
    if (on && isFunction(on)) {
        on(new Delegate(vnode));
        delete vnode.props.on;
    }
    // 执行之前的钩子函数
    if (oldHook) {
        oldHook(vnode);
    }
};
//#endregion