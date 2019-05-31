import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';
import { utilFunctor } from '../../util/index';
import { svgIcon } from '../../svg';
import _debounce from 'lodash-es/debounce';
import { uiToolSave, uiToolUndoRedo, uiMapControls } from './index';

export function uiToolbox(context) {
    var wrap = d3_select(null);
    var _current,
        _width = utilFunctor('278px'),
        _windowHeight, _windowWidth,
        toolboxWrapper;
    var undoRedo = uiToolUndoRedo(context),
        save = uiToolSave(context),
        mapControls = uiMapControls(context);

    function toolbox(selection) {
        var that = this;
        wrap = selection;

        // 绑定窗体大小改变事件
        d3_select(window).on('resize.curtain', resize);

        selection.call(render);

        var debouncedUpdate = _debounce(update, 250, { leading: true, trailing: true });
        context.history()
            .on('change.toolbox', debouncedUpdate);
        context.layers()
            .on('change.toolbox', debouncedUpdate);
        context.map()
            .on('move.toolbox', debouncedUpdate)
            .on('drawn.toolbox', debouncedUpdate);

        context.on('enter.toolbox', update);

        context.presets()
            .on('favoritePreset.toolbox', update)
            .on('recentsChange.toolbox', update);

        update();
        function update() {
            var tools = [
                'spacer'
            ];
            tools = tools.concat([undoRedo, save]);

            var toolbarItems = that.toolboxEditCommon.selectAll('.toolbar-item')
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
                    if (d.itemClass) classes += ' ' + d.itemClass;
                    return classes;
                });

            var actionableItems = itemsEnter.filter(function (d) { return typeof d !== 'string'; });

            actionableItems
                .append('div')
                .attr('class', function (d) {
                    var classes = 'item-content';
                    if (d.contentClass) classes += ' ' + d.contentClass;
                    return classes;
                })
                .each(function (d) {
                    d3_select(this).call(d.render, that.toolboxEditCommon);
                });

            actionableItems
                .append('div')
                .attr('class', 'item-label')
                .text(function (d) {
                    return d.label;
                });

            toolbarItems.merge(itemsEnter)
                .each(function (d) {
                    if (d.update) d.update();
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
        this.toolboxControls = toolboxWrapper
            .append('div')
            .attr('id', 'toolbox_controls')
            .attr('class', 'toolbox_controls toolbox_flex')
            .call(mapControls);
        // toolboxHeader.append('div')
        //     .attr('class', 'toolbox-close')
        //     .call(svgIcon('#iD-icon-close', 'inline'));
    }
    return toolbox;
}