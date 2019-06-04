import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';
import { utilFunctor } from '../../util/index';
import { svgIcon } from '../../svg';
import { uiZoom, uiGeolocate, uiGeoSelect, uiToggleMiniMap } from './index';
export function uiMapTools(context) {
    var wrap = d3_select(null),
        zoom = uiZoom(context),
        geolocate = uiGeolocate(context),
        geoselect = uiGeoSelect(context),
        togglemap = uiToggleMiniMap(context);

    function maptools(selection) {
        wrap = selection;

        selection.call(render);

        function render(selection) {
            var wrapper = selection
                .append('div')
                .attr('class', 'toolbox-controls-normal')
                .call(zoom)
                .call(geolocate)
                .call(geoselect)
                .call(togglemap);

        }
    }

    return maptools;
}
