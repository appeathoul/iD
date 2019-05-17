import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';
import { utilFunctor } from '../../util/index';
import { svgIcon } from '../../svg';
import _debounce from 'lodash-es/debounce';
import { uiToolSave, uiToolUndoRedo } from './index';

export function uiToolbox(context) {
    var wrap = d3_select(null);
    var _current,
        _width = utilFunctor('278px'),
        _windowHeight, _windowWidth,
        toolboxWrapper;
    var undoRedo = uiToolUndoRedo(context),
        save = uiToolSave(context);

    function toolbox(selection) {
        wrap = selection;

        // 绑定窗体大小改变事件
        d3_select(window).on('resize.curtain', resize);

        selection.call(render);

        var debouncedUpdate = _debounce(update, 500, { leading: true, trailing: true });
        context.layers()
            .on('change.topToolbar', debouncedUpdate);

        update();
        function update() {
            var tools = [
                'spacer'
            ];
            tools = tools.concat([undoRedo, save]);

            var toolbarItems = this.toolboxEditCommon.selectAll('.toolbar-item')
                .data(tools, function (d) {
                    return d.id || d;
                });
            toolbarItems.exit()
                .each(function (d) {
                    if (d.uninstall) {
                        d.uninstall();
                    }
                })
                .remove();
            var itemsEnter = toolbarItems
                .enter()
                .append('div')
                .attr('class', function (d) {
                    var classes = 'toolbar-item ' + (d.id || d).replace('_', '-');
                    if (d.klass) classes += ' ' + d.klass;
                    return classes;
                });

            var actionableItems = itemsEnter.filter(function (d) { return d !== 'spacer'; });

            actionableItems
                .append('div')
                .attr('class', 'item-content')
                .each(function (d) {
                    d3_select(this).call(d.render, this.toolboxEditCommon);
                });

            actionableItems
                .append('div')
                .attr('class', 'item-label')
                .text(function (d) {
                    return d.label;
                });
        }
    }

    toolbox.width = function (val) {
        if (arguments.length) {
            _width = utilFunctor(val);
            return toolbox;
        } else {
            return _width;
        }
    };

    function resize() {
        _windowHeight = window.innerHeight;
        _windowWidth = window.innerWidth;

        var width = _width.apply(this, arguments);
        // 计算窗体高度
        var height = (parseFloat(_windowHeight) - 50) > 800 ? 550 : ((parseFloat(_windowHeight) - 50) * 2 / 3);
        toolboxWrapper.style('width', width)
            .style('height', height + 'px');
    }

    // 渲染主界面
    function render(selection) {

        toolboxWrapper = selection
            .append('div')
            .attr('id', 'toolbox-wrapper');
        resize();
        var toolboxHeader = toolboxWrapper
            .append('div')
            .attr('class', 'toolbox-header clearfloat');
        toolboxHeader.append('div')
            .attr('class', 'toolbox-title')
            .text('工具箱');
        this.toolboxEditCommon = toolboxWrapper
            .append('div')
            .attr('id', 'toolbox_bar')
            .attr('class', 'toolbox_bar');
        // toolboxHeader.append('div')
        //     .attr('class', 'toolbox-close')
        //     .call(svgIcon('#iD-icon-close', 'inline'));
    }
    return toolbox;
}