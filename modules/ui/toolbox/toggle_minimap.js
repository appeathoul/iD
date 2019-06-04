import { t, textDirection } from '../../util/locale';
import { tooltip } from '../../util/tooltip';
import { event as d3_event } from 'd3-selection';
import { svgIcon } from '../../svg/icon';
import { uiMapInMap } from '../map_in_map';


export function uiToggleMiniMap(context) {


    function click() {
        d3_event.preventDefault();
        uiMapInMap.toggle();
    }


    return function (selection) {
        selection
            .append('button')
            .attr('tabindex', -1)
            .attr('title', '小地图')
            .on('click', click)
            .call(svgIcon('#iD-icon-inmap', 'light'))
            .call(tooltip()
                .placement((textDirection === 'rtl') ? 'right' : 'left'));
    };
}
