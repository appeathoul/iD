import { t } from '../util/locale';


export function uiTooltipHeaderHtml() {
    var s = '';

    s += '<div class="tooltip-header_body">'
        + '<div class="tooltip-header_body_edit">'
            + '<div class="tooltip-header_body_edit_flex"><label>启用编辑</label><input type="checkbox"></div>'
        + '</div>'
        + '<div class="tooltip_header_body_menu">'
            + '<div class="tooltip_header_body_menu_item"><div class="tooltip_header_body_menu_item_icon"><svg class="icon "><use xlink:href="#iD-icon-member"></use></svg></div>'
                +'<div class="tooltip_header_body_menu_item_position">'
                    +'<span>成员</span>'
                +'</div>'
            +'</div>'
            + '<div class="tooltip_header_body_menu_item"><div class="tooltip_header_body_menu_item_icon"><svg class="icon "><use xlink:href="#iD-icon-manage"></use></svg></div>'
                +'<div class="tooltip_header_body_menu_item_position">'
                    +'<span>管理后台</span>'
                +'</div>'
            +'</div>'
            + '<div class="tooltip_header_body_menu_item"><div class="tooltip_header_body_menu_item_icon"><svg class="icon "><use xlink:href="#iD-icon-setup"></use></svg></div>'
                +'<div class="tooltip_header_body_menu_item_position">'
                    +'<span>系统模版管理</span>'
                +'</div>'
            +'</div>'
        + '</div>'
        + '</div>';

    return s;
}
