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
    initialize(backgrounds) {
        _forEach(backgrounds[0], (value, index) => {
            this.setBackground(value);
        });
    },
    setBackground(_bac) {
        let attributes = _bac.attributes;
        let _zoomExtent = JSON.parse(attributes.zoomExtent.value);
        let json = {
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
        _map(json, (value, index) => {
            if (!value) {
                delete json[index];
            }
        });
        this.backgrounds.push(json);
    },
    getBackground() {
        return this.backgrounds;
    },
    hasBackground() {
        if (this.backgrounds.length > 0) {
            return true;
        } else {
            return false;
        }
    }
});