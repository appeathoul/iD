import { t, textDirection } from '../../util/locale';
import { tooltip } from '../../util/tooltip';
import { geoExtent } from '../../geo';
import { modeBrowse } from '../../modes/browse';
import { svgIcon } from '../../svg/icon';
import { uiLoading } from '../loading';


export function uiGeoSelect(context) {


    function click() {
        context.enter(modeBrowse(context));
    }


    return function (selection) {
        selection
            .append('button')
            .attr('tabindex', -1)
            .attr('title', '选取')
            .on('click', click)
            .call(svgIcon('#iD-icon-select', 'light'))
            .call(tooltip()
                .placement((textDirection === 'rtl') ? 'right' : 'left'));
    };
}
