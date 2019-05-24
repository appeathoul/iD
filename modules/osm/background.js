import _map from 'lodash-es/map';
import _forEach from 'lodash-es/forEach';

export function osmBakcground() {
    if (!(this instanceof osmBakcground)) {
        return (new osmBakcground()).initialize(arguments);
    } else if (arguments.length) {
        this.initialize(arguments);
    }
}

Object.assign(osmBakcground.prototype, {
    type: 'background',
    backgrounds: [],
    initialize: function (backgrounds) {
        var that = this;
        _forEach(backgrounds[0], function (value, index) {
            that.setBackground(value);
        });
    },
    setBackground: function (_bac) {
        var attributes = _bac.attributes;
        var _zoomExtent = JSON.parse(attributes.zoomExtent.value);
        var json = {
            id: attributes.id.value,
            name: attributes.name.value,
            type: attributes.type.value === 'wms' ? 'wms' : 'tms',
            template: attributes.template.value,
            projection: attributes.projection.value === 'EPSG:4326' ? 'EPSG:4326' : 'EPSG:3857',
            zoomExtent: _zoomExtent,
            endDate: attributes.endDate.value,
            startDate: attributes.startDate.value,
            default: attributes.default.value === 'true' ? true : false,
            icon: attributes.icon.value,
            overlay: attributes.overlay.value === 'false' ? '' : true,
            terms_url: attributes.terms_url.value,
            terms_text: attributes.terms_text.value,
            description: attributes.description.value,
            polygon: attributes.polygon.value
        };
        // 去除空字段
        _map(json, function (value, index) {
            if (!value) {
                delete json[index];
            }
        });
        this.backgrounds.push(json);
    },
    getBackground: function () {
        return this.backgrounds;
    },
    hasBackground: function () {
        if (this.backgrounds.length > 0) {
            return true;
        } else {
            return false;
        }
    }
});