import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';
import { utilFunctor } from '../../util/index';
import _debounce from 'lodash-es/debounce';
export function uiCenterZoom(context) {
    var wrap = d3_select(null);
    function centerzoom(selection) {
        wrap = selection;
        var wrapper = wrap
            .append('div')
            .attr('class', 'toolbox-mapzoom');

        render(wrapper);
        var debouncedUpdate = _debounce(update, 500, { leading: true, trailing: true });
        context.map().on('move.centerzoom', function () {
            update(wrapper);
        });
        update(wrapper);
    }

    // 渲染
    function render(wrapper) {
        wrapper
            .append('span')
            .attr('id', 'toolbox-zoom')
            .attr('class', 'zoom');
        wrapper
            .append('span')
            .attr('id', 'toolbox-center')
            .attr('class', 'center');
    }

    // 更新
    function update(wrapper) {
        var map = context.map();
        var center = map.center();
        var zoom = Math.floor(map.zoom());
        wrapper.select('#toolbox-zoom').text(zoom + '级');
        // eslint-disable-next-line radix
        wrapper.select('#toolbox-center').text(parseInt(center[0] * 1000 + '') / 1000 + '  ,  ' + parseInt(center[1] * 1000 + '') / 1000);
    }

    return centerzoom;
}