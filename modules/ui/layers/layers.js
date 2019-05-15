import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';
import { utilFunctor } from '../../util/index';
import { uiLayersItem } from './layers_item';

export function uiLayers(context) {
    var wrap = d3_select(null),
        container = d3_select(null);
    function layers(selection) {
        wrap = selection;
        container = d3_select('#id-layers-container');
        selection.call(render);
    }

    var _layerscount = utilFunctor(0);

    // get set
    layers.layers = function (val) {
        if (arguments.length) {
            _layerscount = utilFunctor(~~val);
            return layers;
        } else {
            return _layerscount;
        }
    };

    // 初始化渲染
    function render(selection) {
        var titleContainer = selection.selectAll('.layers-container-title')
            .data([0]);
        var titleContainerEnter = titleContainer
            .enter()
            .append('div')
            .attr('class', 'layers-container-title');
        titleContainerEnter
            .append('div')
            .attr('class', 'layers-container-title-content')
            .text('地图图层：' + _layerscount.apply(this, arguments) + '个图层');
        var layersContainer = selection.selectAll('.layers-container')
            .data([0]);
        layersContainer
            .enter()
            .append('div')
            .attr('class', 'layers-container')
            .call(uiLayersItem());
    }
    return layers;
}