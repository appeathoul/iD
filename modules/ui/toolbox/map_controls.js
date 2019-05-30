import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';
import { utilFunctor } from '../../util/index';
import { svgIcon } from '../../svg';
import { uiToolOldDrawModes, uiToolOldDrawModesAdvanced } from './index';
export function uiMapControls(context) {
    var wrap = d3_select(null),
        modes = uiToolOldDrawModes(context),
        modesAdvanced = uiToolOldDrawModesAdvanced(context);

    function mapcontrols(selection) {
        wrap = selection;

        selection.call(render);

        function render(selection) {
            var wrapper = selection
                .append('div')
                .attr('class', 'toolbox-controls-normal');
            update(wrapper);
            var wrapperAdvanced = selection
                .append('div')
                .attr('class', 'toolbox-controls-advanced');
            updateAdvanced(wrapperAdvanced);
        }

        function update(wrapper) {

            var tools = [
                modes,
                'spacer'
                //    searchAdd
            ];
            /*
            if (context.presets().getFavorites().length > 0) {
                tools.push(addFavorite);
            }

            if (addRecent.shouldShow()) {
                tools.push(addRecent);
            }*/

            var toolbarItems = wrapper.selectAll('.toolbar-item')
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
                .attr('class', 'item-label')
                .text(function (d) {
                    return d.label;
                });

            actionableItems
                .append('div')
                .attr('class', 'item-content')
                .each(function (d) {
                    d3_select(this).call(d.render, wrapper);
                });
        }

        function updateAdvanced(wrapper) {

            var tools = [
                modesAdvanced,
                'spacer'
                //    searchAdd
            ];
            /*
            if (context.presets().getFavorites().length > 0) {
                tools.push(addFavorite);
            }

            if (addRecent.shouldShow()) {
                tools.push(addRecent);
            }*/

            var toolbarItems = wrapper.selectAll('.toolbar-item')
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
                .attr('class', 'item-label')
                .text(function (d) {
                    return d.label;
                });

            actionableItems
                .append('div')
                .attr('class', 'item-content')
                .each(function (d) {
                    d3_select(this).call(d.render, wrapper);
                });
        }
    }

    return mapcontrols;
}