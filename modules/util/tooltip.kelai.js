import { select as d3_select, event as d3_event } from 'd3-selection';
import { utilFunctor } from './util';
import _map from 'lodash-es/map';

var _tooltipID = 0;

// 对多个元素绑定tooltip
// 2-14增加初始化不显示，点击后显示元素
export function tooltip(klass) {
    // 每次循环id+1
    var _id = _tooltipID++;
    // 循环安装tooltip
    var tooltip = function (selection) {
        selection.each(setup);
    };
    // 不开启动画
    var _animation = utilFunctor(false);
    // 获得传入的title
    var _title = function () {
        // 应该为获得d3 title的写法
        var title = this.getAttribute('data-original-title');
        if (title) {
            return title;
        } else {
            title = this.getAttribute('title');
            this.removeAttribute('title');
            this.setAttribute('data-original-title', title);
        }
        return title;
    };
    var _html = utilFunctor(false);
    var _placement = utilFunctor('top');

    // 是否点击后触发事件,默认鼠标移入触发
    var _triggerbyclick = utilFunctor(false);
    // 自定义样式
    var _customclass = utilFunctor(null);
    // 绑定事件
    var _bindevent = utilFunctor({});

    // get set方法
    tooltip.title = function (val) {
        if (arguments.length) {
            _title = utilFunctor(val);
            return tooltip;
        } else {
            return _title;
        }
    };


    tooltip.html = function (val) {
        if (arguments.length) {
            _html = utilFunctor(val);
            return tooltip;
        } else {
            return _html;
        }
    };


    tooltip.placement = function (val) {
        if (arguments.length) {
            _placement = utilFunctor(val);
            return tooltip;
        } else {
            return _placement;
        }
    };

    tooltip.triggerbyclick = function (val) {
        if (arguments.length) {
            _triggerbyclick = utilFunctor(val);
            return tooltip;
        } else {
            return _triggerbyclick;
        }
    };

    tooltip.customclass = function (val) {
        if (arguments.length) {
            _customclass = utilFunctor(val);
            return tooltip;
        } else {
            return _customclass;
        }
    };

    tooltip.bindevent = function (val) {
        if (arguments.length) {
            _bindevent = utilFunctor(val);
            return tooltip;
        } else {
            return _bindevent;
        }
    };


    tooltip.show = function (selection) {
        selection.each(show);
    };


    tooltip.hide = function (selection) {
        selection.each(hide);
    };


    tooltip.toggle = function (selection) {
        selection.each(toggle);
    };


    tooltip.destroy = function (selection, selector) {
        // by default, just destroy the current tooltip
        selector = selector || '.tooltip-' + _id;

        selection
            // 注销事件
            .on('mouseenter.tooltip', null)
            .on('mouseleave.tooltip', null)
            .style('cursor', 'default')
            .on('click.tooltip', null)
            .attr('title', function () {
                return this.getAttribute('data-original-title') || this.getAttribute('title');
            })
            .attr('data-original-title', null)
            // 删除元素
            .selectAll(selector)
            .remove();
    };


    // 清除所有.tooltip元素
    tooltip.destroyAny = function (selection) {
        selection.call(tooltip.destroy, '.tooltip');
    };

    var isTouchEvent = false;

    function setup() {
        var root = d3_select(this);
        var animate = _animation.apply(this, arguments);
        var tip = root.selectAll('.tooltip-' + _id)
            .data([0]);

        var custom = _customclass.apply(this, arguments);
        var enter;
        if (custom) {
            enter = tip.enter()
                .append('div')
                .attr('class', 'tooltip tooltip-' + _id + ' ' + custom);
        } else {
            enter = tip.enter()
                .append('div')
                .attr('class', 'tooltip tooltip-' + _id + ' ' + (klass ? klass : ''));
        }


        enter
            .append('div')
            .attr('class', 'tooltip-arrow');

        enter
            .append('div')
            .attr('class', 'tooltip-inner');

        tip = enter
            .merge(tip);

        if (animate) {
            tip.classed('fade', true);
        }

        // 获得当前对象位置
        var place = _placement.apply(this, arguments);
        tip.classed(place, true);
        // 鼠标移入显示，移出隐藏
        var trigger = _triggerbyclick.apply(this, arguments);
        if (!trigger) {
            root.on('mouseenter.tooltip', show);
            root.on('mouseleave.tooltip', hide);
        } else {
            root.style('cursor', 'pointer');
            root.on('click.tooltip', toggle);
            tip.on('click.tooltipinner', function () {
                // 不触发toggle事件
                // d3_event.preventDefault();
                d3_event.stopPropagation();
            });
        }

        root.on('touchstart.tooltip', function () {
            // hack to avoid showing tooltips upon touch input
            isTouchEvent = true;
        });
    }

    // 绑定事件
    function setEvent(selection) {
        var _event = _bindevent.apply(this, arguments);
        _map(_event, function (value) {
            var bind = value.bind;
            selection.selectAll(bind).on('click', function () {
                value.call.apply(this, arguments);
            });
        });
    }

    function show() {
        if (isTouchEvent) {
            isTouchEvent = false;
            return;
        }
        var root = d3_select(this);
        var content = _title.apply(this, arguments);
        var tip = root.selectAll('.tooltip-' + _id);

        if (tip.empty()) {   // tooltip was removed somehow, put it back
            root.call(tooltip.destroy);
            root.each(setup);
            tip = root.selectAll('.tooltip-' + _id);
        }

        tip.classed('in', true);
        var markup = _html.apply(this, arguments);

        // 设置要显示的内容
        tip.selectAll('.tooltip-inner')[markup ? 'html' : 'text'](content);
        // 绑定事件
        tip.call(setEvent);

        var place = _placement.apply(this, arguments);
        var outer = getPosition(root.node());
        var inner = getPosition(tip.node());
        var pos;

        switch (place) {
            case 'top':
                pos = { x: outer.x + (outer.w - inner.w) / 2, y: outer.y - inner.h };
                break;
            case 'right':
                pos = { x: outer.x + outer.w, y: outer.y + (outer.h - inner.h) / 2 };
                break;
            case 'left':
                pos = { x: outer.x - inner.w, y: outer.y + (outer.h - inner.h) / 2 };
                break;
            case 'bottom':
                pos = { x: outer.x + (outer.w - inner.w) / 2, y: outer.y + outer.h };
                break;
        }

        if (pos) {
            tip.style('left', ~~pos.x + 'px').style('top', ~~pos.y + 'px');
        } else {
            tip.style('left', null).style('top', null);
        }

        this.tooltipVisible = true;


        function getPosition(node) {
            var mode = d3_select(node).style('position');
            if (mode === 'absolute' || mode === 'static') {
                return {
                    x: node.offsetLeft,
                    y: node.offsetTop,
                    w: node.offsetWidth,
                    h: node.offsetHeight
                };
            } else {
                return {
                    x: 0,
                    y: 0,
                    w: node.offsetWidth,
                    h: node.offsetHeight
                };
            }
        }
    }


    function hide() {
        d3_select(this).selectAll('.tooltip-' + _id).classed('in', false);
        this.tooltipVisible = false;
    }


    function toggle() {
        if (this.tooltipVisible) {
            hide.apply(this, arguments);
        } else {
            show.apply(this, arguments);
        }
    }
    return tooltip;
}
