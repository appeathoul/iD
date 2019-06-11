import {
    select as d3_select,
    selectAll as d3_selectAll
} from 'd3-selection';

import { t, textDirection } from '../../util/locale';
import { dispatch as d3_dispatch } from 'd3-dispatch';
import { utilFunctor } from '../../util/index';
import { tooltip } from '../../util/tooltip';
import { uiTooltipHtml } from '../tooltipHtml';

export function uiLegend(context) {
    var osm, history, hash, center, zoom, background, overlays, layers;
    var dispatch = d3_dispatch(
        // 隐藏图层
        'hide',
        // 显示图层
        'show'
    );
    var legendData = [{
        id: 'authData',
        text: '权限数据',
        color: '#ff26d4',
        title: '用户只能编辑权限范围内的数据'
    }, {
        id: 'ViewData',
        text: '可查看数据',
        color: '#5c94f9',
        title: '只能查看，不可编辑的数据'
    }];
    function legend(selection) {
        osm = context.connection();
        history = context.history().toJSON();
        hash = window.location.hash;
        center = context.map().center();
        zoom = context.map().zoom();
        layers = context.layers();
        background = context.background().baseLayerSource();
        overlays = context.background().overlayLayerSources();
        var wrapper = selection
            .append('div')
            .attr('class', 'legend_wrapper');
        wrapper.call(render);
        // 渲染地图权限图层
        getAuthLayer();
    }

    function render(wrapper) {
        var wrapperBorder = wrapper
            .append('div')
            .attr('class', 'legend_wrapper_border');
        var enter = wrapperBorder.selectAll('.legend_item')
            .data(legendData)
            .enter()
            .append('div')
            .attr('class', 'legend_item').each(function (d) {
                var tooltipBehavior = tooltip()
                    .placement('left')
                    .html(true)
                    .title(uiTooltipHtml(d.title));
                d3_select(this)
                    .call(tooltipBehavior);
            });

        enter.on('click', function (d) {
            var layer = layers.layer('data');
            var select = d3_select(this);
            if (select.classed('nochecked')) {
                select.classed('nochecked', false);
            } else {
                select.classed('nochecked', true);
            }
            if (d.id === 'authData') {
                layer.enabled(!select.classed('nochecked'));
            } else if (d.id === 'ViewData') {
                //
            }
        });

        enter.append('div')
            .attr('class', 'legend_color')
            .style('background-color', function (d) { return d.color; });
        enter.append('span')
            .attr('class', 'legend_span')
            .text(function (d) { return d.text; })
            .merge(wrapperBorder);
    }

    function getAuthLayer() {
        var layer = layers.layer('data');
        osm.userDetails(function (err, details) {
            var geojson = details.authJson;
            layer.setFile('.geojson', geojson);
            layer.fitZoom();
        });
    }

    return utilFunctor(legend, dispatch, 'on');
}