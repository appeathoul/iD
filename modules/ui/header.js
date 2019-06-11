import _throttle from 'lodash-es/throttle';
import _debounce from 'lodash-es/debounce';

import { drag as d3_drag } from 'd3-drag';
import { easeLinear as d3_easeLinear } from 'd3-ease';
import { svgIcon } from '../svg';
import { tooltip } from '../util/tooltip.kelai';
import { uiTooltipHeaderHtml } from './tooltipHeaderHtml';
import { defaultUserIcon } from '../util/default_user';
import { uiShortcuts } from './shortcuts';

import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';

export function uiHeader(context) {
    var osm = context.connection();
    var wrap = d3_select(null),
        container = d3_select(null),
        openMenu = false,
        headerUser = d3_select(null),
        tools = [
            { id: 'help', icon: 'iD-icon-help' },
            { id: 'news', icon: 'iD-icon-top-news' },
            { id: 'notice', icon: 'iD-icon-top-notice' }
        ],
        menus = [
            { id: 'edit', icon: 'iD-icon-top-edit', text: '实时编辑', select: true },
            { id: 'my', icon: 'iD-icon-top-my', text: '我的' }
        ],
        details = [
            { id: 'info', text: '详情' },
            { id: 'setting', text: '设置', },
            { id: 'logout', text: '注销' }
        ];
    function header(selection) {
        wrap = selection;
        container = d3_select('#id-header-container');
        selection.call(render);
    }

    // 打开详情页
    header.openMenu = function (selection) {
        renderDetailPanel();
    };

    // 关闭详情页
    header.closeMenu = function (selection) {
        selection.select('.detail-panel')
            .transition()
            .duration(250)
            .ease(d3_easeLinear)
            .style('opacity', 0)
            .on('end', function (d) {
                d3_select(this)
                    .remove();
            });
    };

    // update
    function render(selection) {
        // 添加标题
        var headerTitle = wrap.selectAll('.header-title')
            .data([0]);
        var headerTitleEnter = headerTitle.enter()
            .append('div')
            .attr('class', 'header-title');
        // 添加标题
        headerTitleEnter
            .append('span')
            .attr('class', 'label')
            .text('铜川网格化编辑平台');
        // 添加图标
        headerTitleEnter
            .call(svgIcon('#iD-icon-down'))
            .on('click.dropdown', function (d) {

            });
        // 添加气泡
        headerTitleEnter.call(tooltip()
            .placement('bottom')
            .customclass('tooltip-header-wrap')
            .html(true)
            .triggerbyclick(true)
            .bindevent([{
                bind: '.tooltip_header_body_menu_item',
                call: function () {
                    alert('123');
                }
            }])
            .title(function (d) { return uiTooltipHeaderHtml('测试', '描述'); })
        );
        headerTitle = headerTitleEnter.merge(headerTitle);
        // 插入用户工具栏
        var headerTools = wrap
            .append('div')
            .attr('class', 'header-tools');
        headerUser = headerTools.selectAll('.header-user-tool')
            .data([0]);
        var headerUserEnter = headerUser.enter();
        var headerUserEnterTool = headerUserEnter.append('div')
            .attr('class', 'header-user-tool');
        headerUserEnterTool.append('div')
            .attr('class', 'header-user-tool-avatar')
            .append('img')
            .attr('src', defaultUserIcon)
            .on('click', function (d) {
                if (openMenu) {
                    header.closeMenu(selection);
                    openMenu = false;
                } else {
                    header.openMenu(selection);
                    openMenu = true;
                }
            });

        var headerUserEnterToolWarpper = headerUserEnterTool.append('div')
            .attr('class', 'header-user-tool-wrapper');
        headerUser = headerUserEnter.merge(headerUser);
        // 插入toolbar按钮
        headerUserEnterToolWarpper.selectAll('.header-toolbar')
            .data(tools)
            .enter()
            .append('div')
            .attr('class', 'icon-wrapper')
            .call(function (selection) {
                selection.each(function (d) {
                    this.iconContent = d.icon;
                    svgIcon('#' + this.iconContent, 'inline')(d3_select(this));
                });
            }).on('click', function (o) {
                var that = this;
                switch (o.id) {
                    case 'help': context.container().call(uiShortcuts(context), true); break;
                    default: break;
                }
            });
        initMenu(headerTools);
        update(selection);
        if (openMenu) {
            header.openMenu();
        }
    }

    function renderDetailPanel() {
        var detailPanel = headerUser
            .append('div')
            .attr('class', 'detail-panel')
            .append('ul');
        var enter = detailPanel.selectAll('li')
            .data(details)
            .enter()
            .append('li');
        enter.on('click', function (d) {
            if (d.id === 'logout') {
                d3_event.preventDefault();
                osm.logout();
                window.location.reload();
            } else {
                d3_event.preventDefault();
                return false;
            }
        });
        enter.append('a').call(function (selection) {
            selection.each(function (d) {
                if (d.href) {
                    d3_select(this).attr('href', d.href);
                }
            });
        }).append('span')
            .text(function (d) { return d.text; });
    }

    //  从服务器请求权限接口更新
    function update(selection) {
        osm.userDetails(function (err, details) {
            var userAvatar = selection.select('.header-user-tool-avatar').select('img');
            if (err) return;
            var userUrl = osm.userURL(details.display_name),
                userImgUrl = details.image_url,
                userName = details.display_name;

            // 设置用户头像
            userAvatar.attr('src', userImgUrl);
        });
    }

    // 初始化menu
    function initMenu(selection) {
        // 插入用户工具栏
        var headerMenu = selection.selectAll('.header-menu-tool')
            .data([0]);
        var headerMenuEnter = headerMenu.enter()
            .append('div')
            .attr('class', 'header-menu-tool');

        var wrapperEnter = headerMenuEnter.selectAll('header-menu-tool-wrapper')
            .data(menus)
            .enter();

        var wrapperEnterEach = wrapperEnter.append('div')
            .attr('class', 'header-menu-tool-wrapper');

        // 选中效果
        wrapperEnterEach.call(function (selection) {
            selection.each(function (d) {
                this.isSelect = d.select;
                d3_select(this).classed('select', this.isSelect);
            });
        });

        var wrapper_icon = wrapperEnterEach.append('div')
            .attr('class', 'header-menu-tool-wrapper-icon')
            .append('div')
            .attr('class', 'wrapper-icon-border')
            .call(function (selection) {
                selection.each(function (d) {
                    this.iconContent = d.icon;
                    svgIcon('#' + this.iconContent, 'inline')(d3_select(this));
                });
            });
        var wrapper_content = wrapperEnterEach.append('div')
            .attr('class', 'header-menu-tool-wrapper-content')
            .text(function (d) { return d.text; });
    }
    return header;
}