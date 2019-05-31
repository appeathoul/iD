import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';
import { dispatch as d3_dispatch } from 'd3-dispatch';
import { utilRebind } from '../../util';
import { utilFunctor } from '../../util/index';
import { t, textDirection } from '../../util/locale';
import { svgIcon } from '../../svg';
import { tooltip } from '../../util/tooltip.kelai';
import { uiTooltipHtml } from '../tooltipHtml';

export function uiLayersItem(context) {
    var dispatch = d3_dispatch(
        // 选中事件
        'select')
        , wrap = null
        , lockIcon = 'iD-icon-lock'
        , osmKelai = context.connectionKelai()
        , layers;
    // 绘制
    function redraw(selection) {
        var itemsContainer = selection
            .append('div')
            .attr('class', 'layers-items-container');

        var items = itemsContainer.selectAll('.layers-items-container')
            .data(layers)
            .enter()
            .append('div')
            .attr('class', 'layers-item')
            .on('click.layers', function (o) {
                var that = this;
                selection.selectAll('.layers-item')
                    .classed('active', function (mode, b, c) {
                        return that === c[b];
                    });
                dispatch.call('select', this, o);
            });
        // 添加属性类型图标
        items
            .append('div')
            .attr('class', 'layers-item-type')
            .append('div')
            .attr('class', 'layers-item-type-box')
            .call(function (selection) {
                selection.each(function (d) {
                    let rootUrl = osmKelai.getUrlRoot();
                    this.iconContent = rootUrl + '/' + d.typeIcon;
                    d3_select(this)
                        .append('img')
                        .attr('src', this.iconContent)
                        .style('height', '80%');
                    // svgIcon('#' + this.typeIconContent, 'inline')(d3_select(this));
                });
            });
        // 添加空间型图标和文字
        items
            .append('div')
            .attr('class', 'layers-item-type-icon')
            .call(function (selection) {
                selection.each(function (d) {
                    this.iconContent = d.icon;
                    svgIcon('#' + this.iconContent, 'inline layer-icon')(d3_select(this));
                });
            });
        // 设置显示内容
        items.append('span')
            .text(function (d) { return d.title; });
        var tooltipBehavior = tooltip()
            .placement('right')
            .triggerbyclick(true)
            .html(true)
            .title(uiTooltipHtml('锁定:这个图层无法编辑'));
        // 设置锁定图标显示
        items.append('div')
            .attr('class', 'layers-item-lock-icon')
            .call(function (selection) {
                selection.each(function (d) {
                    this.islockIconUse = d.lock;
                    // 如果使用
                    if (this.islockIconUse) {
                        svgIcon('#' + lockIcon, 'inline layer-lock-icon')(d3_select(this));
                        // d3_select(this).call(tooltipBehavior);
                    }
                });
            });
    }

    function layersItem(selection, _layers) {
        wrap = selection;
        layers = _layers;
        selection.call(redraw);
    }

    return utilRebind(layersItem, dispatch, 'on');
}
