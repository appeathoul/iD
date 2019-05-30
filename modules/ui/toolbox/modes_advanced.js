import _debounce from 'lodash-es/debounce';

import { select as d3_select } from 'd3-selection';

import {
    modeAddArea,
    modeAddLine,
    modeAddPoint,
    modeBrowse
} from '../../modes';

import { t } from '../../util/locale';
import { svgIcon } from '../../svg';
import { tooltip } from '../../util/tooltip';
import { uiTooltipHtml } from '../tooltipHtml';

export function uiToolOldDrawModesAdvanced(context) {
    debugger;
    var tool = {
        id: 'old_modes_advanced',
        // label: t('toolbar.add_feature')
        label: '高级绘制'
    };
    var modes = [
        {
            title: '合并面',
            button: 'tool_line_division',
            description: t('modes.add_point.description')
        },
        {
            title: '面分割',
            button: 'tool_plane_division',
            description: t('modes.add_line.description')
        },
        {
            title: '线分割',
            button: 'tool_plane_merge',
            description: t('modes.add_area.description')
        },
        {
            title: '面分离',
            button: 'tool_plane_separate',
            description: t('modes.add_line.description')
        },
        {
            title: '缓冲区',
            button: 'tool_plane_buffer',
            description: t('modes.add_area.description')
        }
    ];


    function enabled() {
        return osmEditable();
    }

    function osmEditable() {
        var mode = context.mode();
        return context.editable() && mode && mode.id !== 'save';
    }

    tool.render = function (selection) {
        var wrap = selection
            .append('div')
            .style('display', 'flex');

        update();


        function update() {

            var buttons = wrap.selectAll('button.add-button')
                .data(modes, function (d) { return d.id; });

            // exit
            buttons.exit()
                .remove();

            // enter
            var buttonsEnter = buttons.enter()
                .append('button')
                .attr('tabindex', -1)
                .attr('class', function (d) { return d.id + ' add-button bar-button'; })
                .on('click.mode-buttons', function (d) {
                    // if (!enabled(d)) return;

                    // // When drawing, ignore accidental clicks on mode buttons - #4042
                    // var currMode = context.mode().id;
                    // if (/^draw/.test(currMode)) return;

                    // if (d.id === currMode) {
                    //     context.enter(modeBrowse(context));
                    // } else {
                    //     context.enter(d);
                    // }
                })
                .call(tooltip()
                    .placement('bottom')
                    .html(true)
                    .title(function (d) { return uiTooltipHtml(d.description, d.key); })
                );

            buttonsEnter
                .append('div')
                .attr('class', 'border');

            buttonsEnter
                .each(function (d) {
                    d3_select(this)
                        .call(svgIcon('#iD-' + d.button));
                });

            buttonsEnter
                .append('span')
                .attr('class', 'label')
                .text(function (mode) { return mode.title; });

            // if we are adding/removing the buttons, check if toolbar has overflowed
            if (buttons.enter().size() || buttons.exit().size()) {
                context.ui().checkOverflow('#bar', true);
            }

            // update
            buttons = buttons
                .merge(buttonsEnter)
                .classed('disabled', function (d) { return !enabled(d); });
        }
    };

    return tool;
}
