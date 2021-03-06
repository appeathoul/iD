import {
    select as d3_select,
    event as d3_event,
    selectAll as d3_selectAll
} from 'd3-selection';
import { dispatch as d3_dispatch } from 'd3-dispatch';
import { utilFunctor } from '../../util/index';
import { uiLayersItem } from './layers_item';
import {
    utilNoAuto,
    utilRebind
} from '../../util';
import _forEach from 'lodash-es/forEach';
import _filter from 'lodash-es/filter';
import co from 'co';

export function uiLayers(context) {
    var wrap = d3_select(null),
        dispatch = d3_dispatch('switch'),
        container = d3_select(null),
        layersitem = uiLayersItem(context),
        search,
        osmKelai = context.connectionKelai(),
        itemSelect = null,
        layersArr = [];
    /**
     * [{
        id: 1,
        // 显示内容
        title: '省级行政区',
        // 空间类型图标
        icon: 'iD-icon-plane',
        // 属性类型图标
        typeIcon: 'iD-icon-district',
        // 是否锁定
        lock: true
    }, {
        id: 2,
        title: '市级行政区',
        icon: 'iD-icon-plane',
        typeIcon: 'iD-icon-district'
    }, {
        id: 3,
        title: '区县行政区',
        icon: 'iD-icon-plane',
        typeIcon: 'iD-icon-district'
    }, {
        id: 4,
        title: '镇村行政区',
        icon: 'iD-icon-plane',
        typeIcon: 'iD-icon-district'
    }, {
        id: 5,
        title: '街道',
        icon: 'iD-icon-line-new',
        typeIcon: 'iD-icon-floor'
    }, {
        id: 6,
        title: '社区',
        icon: 'iD-icon-line-new',
        typeIcon: 'iD-icon-floor'
    }, {
        id: 7,
        title: '网格',
        icon: 'iD-icon-line-new',
        typeIcon: 'iD-icon-floor'
    }, {
        id: 8,
        title: '楼栋',
        icon: 'iD-icon-spot',
        typeIcon: 'iD-icon-floor'
    }]
     */
    function layers(selection) {
        wrap = selection;
        container = d3_select('#id-layers-container');
        selection.call(render);

        // 初始化渲染
        function render(selection) {
            co(function* () {
                var titleContainer = selection.selectAll('.layers-container-title')
                    .data([0]);
                var titleContainerEnter = titleContainer
                    .enter()
                    .append('div')
                    .attr('class', 'layers-container-title');
                titleContainerEnter
                    .append('div')
                    .attr('class', 'layers-container-title-content')
                    .text('地图图层：' + _layerscount.apply(this, arguments) + '个图层');

                // 添加查询框过滤图层
                var searchWrap = selection
                    .append('div')
                    .attr('class', 'layers-search-header');

                search = searchWrap
                    .append('input')
                    .attr('placeholder', '请输入要过滤的图层名')
                    .attr('type', 'search')
                    .call(utilNoAuto)
                    .on('keydown', keydown)
                    .on('input', inputevent);
                var layersTemplete = yield layers.loadTemplete();
                layersArr = layersTemplete.layers[0].getLayers();

                addFeatureRule(layersArr);

                titleContainerEnter.selectAll('.layers-container-title-content')
                    .text('地图图层：共' + _layerscount.apply(this, arguments) + '个图层');
                layersItems('');
            });
        }

        // 添加矢量数据过滤rule
        function addFeatureRule(layersArr) {
            _forEach(layersArr, function (value) {
                let conditionSplit = value.condition ? value.condition.split(',') : []
                    , conditionSplitValue
                    , conditionSplitTag;
                if (conditionSplit.length > 1) {
                    conditionSplitValue = conditionSplit[1];
                } else {
                    conditionSplitValue = 'none';
                }
                if (conditionSplit.length > 0) {
                    conditionSplitTag = conditionSplit[0];
                }
                context.features().pushRule(value.key, conditionSplitTag, conditionSplitValue);
            });
        }

        function layersItems(tag) {
            let _layers = _filter(layersArr, function (val) {
                if (val.name.indexOf(tag) !== -1) {
                    return true;
                } else {
                    return false;
                }
            });
            // 每次先清空元素
            selection.selectAll('.layers-container')
                .data([])
                .exit()
                .remove();
            var layersContainer = selection.selectAll('.layers-container')
                .data([0]);
            layersContainer
                .enter()
                .append('div')
                .attr('class', 'layers-container')
                .call(layersitem, _layers);
        }

        //  点击esc失去焦点
        function keydown() {
            if (d3_event.keyCode === 27) {  // escape
                search.node().blur();
            }
        }

        function inputevent() {
            var q = search.property('value');
            layersItems(q);
        }

        layersitem.on('select', function (o) {
            itemSelect = o;
            dispatch.call('switch', this, o);
        });
    }
    var _layerscount = function () {
        return layersArr.length;
    };


    // get set
    layers.layers = function (val) {
        if (arguments.length) {
            _layerscount = utilFunctor(~~val);
            return layers;
        } else {
            return _layerscount;
        }
    };

    layers.getSelect = function () {
        return itemSelect;
    };

    layers.loadTemplete = function () {
        if (!osmKelai.authenticated()) {
            return new Promise(function (resolve, reject) {
                osmKelai.authenticate(function (err) {
                    if (err) {
                        reject(err);
                        // cancel();   // quit save mode..
                    } else {
                        resolve(layers.loadTemplete());  // continue where we left off..
                    }
                });
            });
        }
        return osmKelai.toPromise(osmKelai.getTemplete);
    };

    return utilRebind(layers, dispatch, 'on');
}