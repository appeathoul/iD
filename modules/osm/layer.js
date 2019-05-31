import _map from 'lodash-es/map';
import _forEach from 'lodash-es/forEach';

export function osmLayer() {
    if (!(this instanceof osmLayer)) {
        return (new osmLayer()).initialize(arguments);
    } else if (arguments.length) {
        this.initialize(arguments);
    }
}

Object.assign(osmLayer.prototype, {
    type: 'layer',
    layers: [],
    initialize: function (layers) {
        var that = this;
        _forEach(layers[0], function (value, index) {
            that.setLayer(value);
        });
    },
    setLayer: function (_lay) {
        var attributes = _lay.attributes;
        var json = {
            id: attributes.id.value,
            key: attributes.key.value,
            name: attributes.name.value,
            title: attributes.name.value,
            type: attributes.type.value,
            typeIcon: attributes.icon.value,
            geotype: attributes.geotype.value,
            order: attributes.order.value,
            sign: attributes.sign.value,
            regionCode: attributes.region_code.value,
            refer: attributes.refer.value,
            status: attributes.status.value,
            condition: attributes.condition.value,
            editlevel: attributes.editlevel.value
        };
        // 设置类型图片
        if (json.geotype === 'Polygon') {
            json.icon = 'icon-plane';
        } else if (json.geotype === 'Point') {
            json.icon = 'icon-spot';
        } else if (json.geotype === 'Line') {
            json.icon = 'icon-line-new';
        }
        // 设置是否锁定
        if (json.status === '1') {
            json.lock = false;
        } else {
            json.lock = true;
        }
        // 去除空字段
        _map(json, function (value, index) {
            if (!value) {
                delete json[index];
            }
        });
        this.layers.push(json);
    },
    getLayers: function () {
        return this.layers;
    },
    hasLayers: function () {
        if (this.layers.length > 0) {
            return true;
        } else {
            return false;
        }
    }
});