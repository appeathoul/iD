import _throttle from 'lodash-es/throttle';

import { dispatch as d3_dispatch } from 'd3-dispatch';
import { xml as d3_xml } from 'd3-fetch';

import osmAuth from 'osm-auth';
import _isFunction from 'lodash-es/isFunction';
import _assign from 'lodash-es/assign';
// 基于rtree的空间查找找树
import rbush from 'rbush';
// 转换xml数据到json
import { JXON } from '../util/jxon';
import { osmBakcground, osmLayer } from '../osm';
import { utilArrayChunk, utilArrayGroupBy, utilArrayUniq, utilRebind, utilTiler, utilQsString } from '../util';
import co from 'co';
var tiler = utilTiler();
var dispatch = d3_dispatch('authLoading', 'authDone');
// 配置的远程服务地址
var urlroot = 'http://192.168.3.101:3000';
// osm服务权限认证
var oauth = osmAuth({
    url: urlroot,
    oauth_consumer_key: 'SWFGlfmQcEdOyOzG3STbO9I90gjMFLqkCX5MCOop',
    oauth_secret: 'w9745aYboKgQJKTOtqXs8WCEuLnk7EszeJHilqon',
    singlepage: true,
    landing: './land.html',
    loading: authLoading,
    done: authDone
});

var _deferred = new Set();
var _connectionID = 1;
var _rateLimitError;

function authLoading() {
    dispatch.call('authLoading');
}


function authDone() {
    dispatch.call('authDone');
}


var parsers = {
    maps: function nodeData(obj, uid) {
        var childrens = obj.children;
        return new osmBakcground(childrens);
    },
    templates: function layerData(obj) {
        // 获得 layer
        var layersCollection = obj.children[0].children;
        if (layersCollection.length > 0) {
            return new osmLayer(layersCollection[0].children);
        } else {
            return new osmLayer([]);
        }
    }
};

function parseXML(xml, callback, options) {
    options = Object.assign({ skipSeen: true }, options);
    if (!xml || !xml.childNodes) {
        return callback({ message: 'No XML', status: -1 });
    }

    var root = xml.childNodes[0];
    var children = root.childNodes;

    var handle = window.requestIdleCallback(function () {
        var results = [];
        var result;
        for (var i = 0; i < children.length; i++) {
            result = parseChild(children[i]);
            if (result) results.push(result);
        }
        callback(null, results);
    });

    _deferred.add(handle);

    function parseChild(child) {
        var parser = parsers[child.nodeName];
        if (!parser) return null;
        var uid;
        // if (child.nodeName === 'maps') {
        //     uid = child.attributes.id.value;
        //     if (options.skipSeen && _userCache.user[uid]) {
        //         delete _userCache.toLoad[uid];
        //         return null;
        //     }

        // } else if (child.nodeName === 'note') {
        //     uid = child.getElementsByTagName('id')[0].textContent;

        // } else {
        //     uid = osmEntity.id.fromOSM(child.nodeName, child.attributes.id.value);
        //     if (options.skipSeen) {
        //         if (_tileCache.seen[uid]) return null;  // avoid reparsing a "seen" entity
        //         _tileCache.seen[uid] = true;
        //     }
        // }

        return parser(child, uid);
    }
}

function wrapcb(thisArg, callback, cid) {
    return function (err, result) {
        if (err) {
            // 400 Bad Request, 401 Unauthorized, 403 Forbidden..
            if (err.status === 400 || err.status === 401 || err.status === 403) {
                thisArg.logout();
            }
            return callback.call(thisArg, err);

        } else if (thisArg.getConnectionId() !== cid) {
            return callback.call(thisArg, { message: 'Connection Switched', status: -1 });

        } else {
            return callback.call(thisArg, err, result);
        }
    };
}

export default {
    init: function () {
        utilRebind(this, dispatch, 'on');
    },
    reset: function () {
        _connectionID++;
        return this;
    },
    getConnectionId: function () {
        return _connectionID;
    },
    getUrlRoot: function () {
        return urlroot;
    },
    // Generic method to load data from the OSM API
    // Can handle either auth or unauth calls.
    loadFromAPI: function (path, callback, options) {
        options = Object.assign({ skipSeen: true, async: false }, options);
        var that = this;
        var cid = _connectionID;

        function done(err, xml) {
            if (that.getConnectionId() !== cid) {
                if (callback) callback({ message: 'Connection Switched', status: -1 });
                return;
            }

            var isAuthenticated = that.authenticated();

            // 400 Bad Request, 401 Unauthorized, 403 Forbidden
            // Logout and retry the request..
            if (isAuthenticated && err && err.status &&
                (err.status === 400 || err.status === 401 || err.status === 403)) {
                that.logout();
                that.loadFromAPI(path, callback, options);

                // else, no retry..
            } else {
                // 509 Bandwidth Limit Exceeded, 429 Too Many Requests
                // Set the rateLimitError flag and trigger a warning..
                if (!isAuthenticated && !_rateLimitError && err && err.status &&
                    (err.status === 509 || err.status === 429)) {
                    _rateLimitError = err;
                    dispatch.call('change');
                }

                if (callback) {
                    if (err) {
                        return callback(err);
                    } else {
                        return parseXML(xml, callback, options);
                    }
                }
            }
        }

        if (this.authenticated()) {
            return oauth.xhr({ method: 'GET', path: path }, done);
        } else {
            var url = urlroot + path;
            // 手动终止fetch接口
            var controller = new AbortController();
            d3_xml(url, { signal: controller.signal })
                .then(function (data) {
                    done(null, data);
                })
                .catch(function (err) {
                    if (err.name === 'AbortError') return;
                    // d3-fetch includes status in the error message,
                    // but we can't access the response itself
                    // https://github.com/d3/d3-fetch/issues/27
                    var match = err.message.match(/^\d{3}/);
                    if (match) {
                        done({ status: +match[0], statusText: err.message });
                    } else {
                        done(err.message);
                    }
                });
            return controller;
        }
    },
    // 获得背景图参数
    loadBackground: function (callback, options) {
        this.loadFromAPI(
            '/api/0.6/map/find_all',
            function (err, backgrounds) {
                if (callback) callback(err, { backgrounds: backgrounds });
            },
            options
        );
    },
    // 获得左侧图层参数
    getTemplete: function (callback, options) {
        this.loadFromAPI(
            '/api/0.6/template/find_tmpl',
            function (err, layers) {
                if (callback) callback(err, { layers: layers });
            },
            options
        );
    },
    logout: function () {
        oauth.logout();
        dispatch.call('change');
        return this;
    },
    /** 将function转换为promise */
    toPromise: function (fun, ...args) {
        var that = this;
        return new Promise(function (resolve, reject) {
            fun.call(that, function (err, backgrounds) {
                if (err) {
                    reject(err);
                } else {
                    resolve(backgrounds);
                }
            }, ...args.slice(1, args.length - 1));

        });
    },
    authenticate: function (callback) {
        var that = this;
        var cid = _connectionID;
        function done(err, res) {
            if (err) {
                if (callback) callback(err);
                return;
            }
            if (that.getConnectionId() !== cid) {
                if (callback) callback({ message: 'Connection Switched', status: -1 });
                return;
            }
            _rateLimitError = undefined;
            dispatch.call('change');
            if (callback) callback(err, res);
            that.userChangesets(function () { });  // eagerly load user details/changesets
        }

        return oauth.authenticate(done);
    },
    authenticated: function () {
        return oauth.authenticated();
    },
};
