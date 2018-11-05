'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Quill = _interopDefault(require('quill'));
var Delta = _interopDefault(require('quill-delta'));

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

/*
 * @Author: 卓文理
 * @Email: 531840344@qq.com
 * @Date: 2018-11-02 14:20:03
 */
var app = angular.module('hlg.component', []);

var BlockEmbed = Quill.import('blots/embed');

var MarkBlot =
/*#__PURE__*/
function (_BlockEmbed) {
  _inherits(MarkBlot, _BlockEmbed);

  function MarkBlot() {
    _classCallCheck(this, MarkBlot);

    return _possibleConstructorReturn(this, _getPrototypeOf(MarkBlot).apply(this, arguments));
  }

  _createClass(MarkBlot, null, [{
    key: "create",
    value: function create(_ref) {
      var value = _ref.value,
          id = _ref.id;

      var node = _get(_getPrototypeOf(MarkBlot), "create", this).call(this);

      node.innerText = value;
      node.setAttribute('data-id', id);
      return node;
    }
  }, {
    key: "value",
    value: function value(node) {
      return node.innerText;
    }
  }]);

  return MarkBlot;
}(BlockEmbed);

MarkBlot.blotName = 'mark';
MarkBlot.tagName = 'mark';

Quill.register(MarkBlot);
function smsEditorContent () {
  return {
    restrict: 'AE',
    require: 'ngModel',
    scope: {
      insertText: '=',
      labels: '<' // 默认短信变量

    },
    link: function link($scope, element, attr, ngModel) {
      if (!ngModel) return;
      var options = Object.assign($scope.options || {}, {
        modules: {
          toolbar: '',
          clipboard: {
            matchVisual: false
          }
        },
        formats: ['mark']
      });

      if (attr.placeholder != null) {
        options.placeholder = attr.placeholder;
      }

      var quill = new Quill(element[0], options); // 填充文本

      ngModel.$render = function () {
        var value = ngModel.$viewValue;

        if (value) {
          var length = quill.getLength();
          var labels = []; // 短信变量

          if ($scope.labels && $scope.labels.length) {
            $scope.labels.map(function (item) {
              if (typeof item === 'string') {
                labels.push(item);
              } else if (item.name) {
                labels.push(item.name);
              }
            });
          }

          if (length) {
            quill.deleteText(0, length);
          }

          value.replace(/#(?!\s*#)[^#]+#/g, function (text) {
            return "@@@".concat(text, "@@@");
          }).split('@@@').filter(function (x) {
            return x;
          }).map(function (text, inx) {
            var length = quill.getLength(); // 如果不是 ## 包裹的内容，直接插入文本
            // ## 包裹的内容：没有传默认短信变量，插入变量
            // ## 包裹的内容：有传默认短信变量、并且文本在默认短信变量内，插入变量

            if (/#(?!\s*#)[^#]+#/.test(text) && (!labels.length || labels.indexOf(text) >= 0)) {
              var id = parseInt(Math.random() * 1e8, 10);
              quill.insertEmbed(length - 1, 'mark', {
                value: text,
                id: id
              }, Quill.sources.USER);
              quill.insertText(length, ' ');

              if (inx === value.length - 1) {
                quill.insertText(length + 1, "\uFEFF");
              }
            } else {
              quill.insertText(length - 1, text);
            }
          });
        }
      }; // 监听文本插入


      $scope.$watch('insertText', function () {
        var value = $scope.insertText;

        if (value) {
          var range = quill.getSelection(true);
          var id = parseInt(Math.random() * 1e8, 10);

          if (/c\.tb\.cn/.test(value)) {
            value = " ".concat(value, " ");
          }

          quill.insertEmbed(range.index, 'mark', {
            value: value,
            id: id
          }, Quill.sources.USER);
          var length = quill.getLength();
          var text = ' ';

          if (length - range.index <= 2) {
            text += "\uFEFF";
          } // magic code: 插入后加一个空格


          quill.insertText(range.index + 1, text);
          quill.setSelection(range.index + 2, Quill.sources.SILENT);
          $scope.insertText = '';
        }
      }); // 监听文本改动

      quill.on('text-change', function () {
        var _quill$getContents = quill.getContents(),
            ops = _quill$getContents.ops;

        var text = '';
        ops.map(function (item) {
          if (item.insert) {
            if (_typeof(item.insert) === 'object') {
              text += /短?链接?/.test(item.insert.mark) ? " ".concat(item.insert.mark, " ") : item.insert.mark;
            } else if (/^\s*[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&/\/=]*)?./.test(item.insert)) {
              text += " ".concat(item.insert.trim(), " ");
            } else if (/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&/\/=]*)?.\s*$/.test(item.insert)) {
              text += "".concat(item.insert.trim(), " ");
            } else {
              text += item.insert.trim();
            }
          }

          return item;
        }); // 移除非法字符、首尾空格

        text = text.replace(/(&#65279;|\uFEFF)/g, '').trim();
        ngModel.$setViewValue(text);
      });
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node) {
        var innerText = node.innerText;
        var text = /^\s*c\.tb\.cn/.test(innerText) ? innerText : innerText.trim();
        return new Delta().insert(text.replace(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|\ud83e[\udd10-\udd80]/g, ''));
      });
      quill.clipboard.addMatcher(Node.TEXT_NODE, function (node) {
        var data = node.data;
        var text = /^\s*c\.tb\.cn/.test(data) ? data : data.trim(); // 过滤emoji

        return new Delta().insert(text.replace(/\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|\ud83e[\udd10-\udd80]/g, ''));
      });
    }
  };
}

var template = "<section class=\"ng-sms-editor\">\n        <header class=\"ng-sms-editor__header\">\n            <span class=\"sms-text\">插入</span>\n            <a href=\"javascript:;\" ng-if=\"$ctrl.smsOptions.type === 'mobile' && $ctrl.smsOptions.multivariate.length > 0\" ng-repeat=\"label in $ctrl.smsOptions.multivariate\" class=\"sms-label sms-label__placeholder\" ng-click=\"$ctrl.onInsertLabel(label)\">{{label | label}}</a>\n            <a href=\"javascript:;\" ng-repeat=\"label in $ctrl.smsOptions.labels\" ng-click=\"$ctrl.onInsertLabel(label)\" class=\"sms-label sms-label__{{label.type}}\">{{label.name | label}}</a>\n            <div class=\"sms-custom\" ng-transclude=\"header\"></div>\n        </header>\n\n        <sms-editor-content ng-model=\"$ctrl.smsOptions.content\" insert-text=\"$ctrl.insertText\" labels=\"$ctrl.smsOptions.labels\"></sms-editor-content>\n\n        <footer class=\"ng-sms-editor__footer\">\n            <div class=\"sms-custom\" ng-transclude=\"footer\"></div>\n            <span class=\"sms-total\">\n                已输入 <em>{{$ctrl.smsOptions.contentLength}}</em> 个字，共计 <em>{{$ctrl.countSms()}}</em> 条短信\n            </span>\n            <span class=\"sms-rule\">\n                <i class=\"icon-info\"></i>\n                <div class=\"sms-tooltip\">\n                    <i class=\"sms-tooltip-arrow\"></i>\n                    <div class=\"sms-tooltip-inner\">\n                        <p>1、70字计1条短信收费，超出70字按67字每条计。</p>\n                        <p>2、一个汉字，字母或标点都算一个字。</p>\n                        <p>3、自动替换的内容以实际发送为准，有可能超过默认字数。</p>\n                        <p>4、受短信运营商限制，签名和退订回T，包含在字数中</p>\n                    </div>\n                </div>\n            </span>\n        </footer>\n\n        <div class=\"ui-sms-preview\" ng-if=\"$ctrl.smsOptions.showPreview\">\n            <div class=\"ui-sms-content\"><span ng-if=\"$ctrl.smsOptions.showDiySigns === undefined || $ctrl.smsOptions.showDiySigns\">【{{$ctrl.smsOptions.sign_content}}】</span><span ng-bind-html=\"$ctrl.contentParsered\"></span>&nbsp;退订回T</div>\n            <i class=\"icon-sms-tail\"></i>\n        </div>\n    </section>\n\n    <!-- 提示 -->\n    <div class=\"ui-sms-editor-message\" ng-show=\"$ctrl.urlWithSpaceEnd\"><em>提示：链接后面必须有空格，否则链接无效</em></div>\n    <div class=\"ui-sms-editor-message\" ng-show=\"$ctrl.urlWithSpaceStart\"><em>提示：链接前面必须有空格，否则链接无效</em></div>\n    <div class=\"ui-sms-editor-message\" ng-show=\"$ctrl.invalidSmsShown\"><em>提示：短信内容不能包含 “【” 和 “】”</em></div>\n    <div class=\"ui-sms-editor-warn\" ng-show=\"$ctrl.illegalContentVar\"><em>温馨提示：短信中的 <span>{{$ctrl.illegalContentVar}}</span> 只是普通文本，不是变量哦</em></div>";

/*
 * Author: 绿间
 * Email: lvjian@huanleguang.com
 * Date: 2018-07-24 16:26:54
 */

app.factory('tbShortLink', ['$resource', function ($resource) {
  return $resource('/crm/shorturl');
}]); // 更新店铺签名

app.factory('updateShopTitle', ['$resource', function ($resource) {
  return $resource('/crm/care/title');
}]); // 自定义签名

app.factory('SignContentDiyVerify', ['$resource', function ($resource) {
  return $resource('/crm/groupsign', null, {
    update: {
      method: 'POST'
    },
    remove: {
      method: 'DELETE'
    }
  });
}]);
app.factory('SignContentDiyNoverify', ['$resource', function ($resource) {
  return $resource('/crm/care/sign', null, {
    modify: {
      method: 'put'
    }
  });
}]); // 更新店铺名

app.factory('updateShopName', ['$resource', function ($resource) {
  return $resource('/update-shop-title');
}]);
app.factory('couponLinks', ['$resource', function ($resource) {
  return $resource('/material/wireless/links/coupons', {}, {
    put: {
      method: 'PUT'
    },
    query: {
      method: 'GET',
      isArray: false
    }
  });
}]); // 修改绑定手机号

app.factory('MyNotice', ['$resource', function ($resource) {
  return $resource('/my/notice', null, {
    post: {
      method: 'POST'
    }
  });
}]);

var ngSmsEditor =
/*#__PURE__*/
function () {
  /** 短信签名 */

  /** 店铺名称 */

  /** 显示短信模板弹窗 */

  /** 显示宝贝选择弹窗 */

  /** 显示优惠券选择弹窗 */

  /** 显示自定义短链弹窗 */

  /** 显示手机号绑定弹窗 */

  /** 短信内容检验提示 */
  function ngSmsEditor($scope, $element, $sce) {
    var _this = this;

    _classCallCheck(this, ngSmsEditor);

    _defineProperty(this, "diySigns", []);

    _defineProperty(this, "signList", []);

    _defineProperty(this, "shopName", '');

    _defineProperty(this, "dialogSmsTmpl", false);

    _defineProperty(this, "currentTabId", 1);

    _defineProperty(this, "tmplModel", {});

    _defineProperty(this, "tmpl", '');

    _defineProperty(this, "dialogItemsFilter", false);

    _defineProperty(this, "dialogCoupon", false);

    _defineProperty(this, "couponsList", []);

    _defineProperty(this, "selectedCoupon", {});

    _defineProperty(this, "dialogCustom", false);

    _defineProperty(this, "customUrl", '');

    _defineProperty(this, "dialogBindPhone", false);

    _defineProperty(this, "dialogBindPhoneFrom", '');

    _defineProperty(this, "urlWithSpaceEnd", false);

    _defineProperty(this, "urlWithSpaceStart", false);

    _defineProperty(this, "invalidSmsShown", false);

    _defineProperty(this, "illegalContentVar", '');

    this.$scope = $scope;
    this.$element = $element;
    this.$sce = $sce;
    this.insertText = '';
    this.smsOptions = this.smsOptions || {};
    this.smsOptions.content = this.smsOptions.content || '';
    this.smsOptions.labels = this.smsOptions.labels || [{
      name: '#收货人姓名#',
      type: 'placeholder',
      placeholder: '张三三'
    }, {
      name: '#买家昵称#',
      type: 'placeholder',
      placeholder: 'tb88888_2017'
    }, {
      name: '店铺首页',
      type: 'link_home'
    }, {
      name: '宝贝',
      type: 'dialog_items'
    }, {
      name: '优惠券',
      type: 'dialog_coupon'
    }, {
      name: '自定义页面',
      type: 'dialog_custom'
    }, {
      name: '短信模板',
      type: 'tmpl'
    }];
    this.smsOptions.contentLength = this.smsOptions.contentLength || 0;
    this.placeholderMap = this.genPlaceholderMap(this.smsOptions.labels); // 插入变量

    $scope.$watch('$ctrl.smsOptions.labels', function (newValue) {
      if (newValue && newValue.length) {
        _this.placeholderMap = _this.genPlaceholderMap(_this.smsOptions.labels);
      }
    }, true); // 额外插入变量

    $scope.$watch('$ctrl.smsOptions.multivariate', function (newValue) {
      if (newValue && newValue.length) {
        newValue.map(function (item) {
          if (item === '#收货人姓名#') {
            _this.placeholderMap['#收货人姓名#'] = '张三三';
          }
        });
      }
    }, true);
    $scope.$watch('$ctrl.smsOptions.sign_content', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        _this.countContentLen();
      }
    });
    $scope.$watch('$ctrl.smsOptions.content', function () {
      return new Promise(function ($return, $error) {
        _this.validateContent();

        _this.countContentLen();

        return $return();
      });
    });
    $scope.$on('CRM:BINDPHONE:SHOW', function () {
      return new Promise(function ($return, $error) {
        _this.dialogBindPhoneFrom = '';
        _this.dialogBindPhone = true;
        return $return();
      });
    });
    this.init();
  }

  _createClass(ngSmsEditor, [{
    key: "init",
    value: function init() {}
    /**
     * 更换模板内容
     *
     * @memberof ngSmsEditor
     */

  }, {
    key: "changeTmpl",
    value: function changeTmpl() {
      return new Promise(function ($return, $error) {
        this.smsOptions.content = this.tmplModel.content;
        return $return(this.smsOptions.content);
      }.bind(this));
    }
    /**
     * 插入预设标签
     * @param {Object} label 标签
     */

  }, {
    key: "onInsertLabel",
    value: function onInsertLabel(label) {
      return new Promise(function ($return, $error) {
        if (label && (label.insertText || typeof label === 'string')) {
          this.insertText = label.insertText || label;
          return $return();
        }

        switch (label.type) {
          case 'placeholder':
            this.insertText = label.name;
            break;

          default:
            this.$scope.$emit('NG:SMS:EDITOR', label.type);
            break;
        }

        return $return();
      }.bind(this));
    }
    /**
     * 统计短信条数
     * @return {number} 短信条数
     */

  }, {
    key: "countSms",
    value: function countSms() {
      var smsLen = this.smsOptions.contentLength;
      var smsCount = 1;

      if (smsLen > 70) {
        smsCount = Math.ceil(smsLen / 67);
      }

      this.smsOptions.smsCount = smsCount;
      return smsCount;
    }
    /**
     * 替换占位符为对应示例文案
     * @param  {string} content 短信内容
     * @return {string}         替换占位符后的内容
     */

  }, {
    key: "replaceLabels",
    value: function replaceLabels(content) {
      var rreEscape = /[-/\\^$*+?.()|[\]{}]/g;
      var reg;

      for (var key in this.placeholderMap) {
        reg = new RegExp(key.replace(rreEscape, '\\$&'), 'g');
        content = content.replace(reg, "<em>".concat(this.placeholderMap[key], "</em>"));
      }

      return content;
    }
    /**
     * 生成占位符map
     * @param  {array} labels  标签列表
     * @return {object}        占位符map
     */

  }, {
    key: "genPlaceholderMap",
    value: function genPlaceholderMap(labels) {
      var label;
      var map = {};

      for (var i = 0, len = labels.length; i < len; i += 1) {
        label = labels[i];

        if (label.type === 'placeholder') {
          map[label.name] = label.placeholder;
        }
      }

      return map;
    }
    /**
     * 计算短信长度、生成预览短信
     */

  }, {
    key: "countContentLen",
    value: function countContentLen() {
      var contentParsered;
      var contentLength;
      var realContent;
      var content = this.smsOptions.content;

      if (content) {
        contentParsered = this.replaceLabels(content);
        realContent = contentParsered.replace(/<\/?em>/g, '');
        contentLength = realContent.length; // 计算长度之后替换内容

        realContent = realContent.replace(/张三三/g, '#收货人姓名#');
        realContent = realContent.replace(/ c.tb.cn\/C.cxKC /g, '#付款链接#');
        realContent = realContent.replace(/ c.tb.cn\/F.yyyyx /g, '#评价链接#');
        this.contentParsered = this.$sce.trustAsHtml(contentParsered);
        this.smsOptions.realContent = realContent;
        this.smsOptions.contentLength = this.smsOptions.sign_content.length + contentLength + 7;
      }
    }
    /**
     * 校验短信文本内容
     *
     * @memberof ngSmsEditor
     */

  }, {
    key: "validateContent",
    value: function validateContent() {
      var _this2 = this;

      var value = this.smsOptions.content;
      var links = value.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&/\/=]*)?./gi);
      var notSpaceEnd = false;
      var notSpaceStart = false;
      var regHAN = /[^\x00-\xff]/;
      var regSpace = /[\s]/;
      var linkPosition;
      var startChar;

      if (links) {
        for (var i = 0, len = links.length; i < len; i += 1) {
          linkPosition = value.indexOf(links[i]);

          if (linkPosition > 0) {
            startChar = value[linkPosition - 1];

            if (!startChar.match(regSpace)) {
              notSpaceStart = true;
              break;
            }
          }
        }
      }

      var endChar;

      if (links) {
        for (var _i = 0, _len = links.length; _i < _len; _i += 1) {
          endChar = links[_i].slice(-1);

          if (endChar.match(regHAN)) {
            notSpaceEnd = true;
            break;
          }
        }
      }

      this.urlWithSpaceEnd = notSpaceEnd;
      this.urlWithSpaceStart = notSpaceStart; // 短信内容不能包含 “【” 和 “】”

      this.invalidSmsShown = !!value.match(/[【】]/); // 短信中含有，但是canSignVariales数组中没有的变量

      this.illegalContentVar = '';
      /**
       * 当插入的变量没有可替换的数据时弹窗
       */

      var canSignVariales = [];
      var contentVariales = value.match(/#(?!\s*#)[^#]+#/g); // 短信内容中含有的变量

      this.smsOptions.labels.map(function (label) {
        return canSignVariales.push(label.name);
      });

      if (this.smsOptions.multivariate && this.smsOptions.multivariate.length) {
        // 可以插入的变量为 导入变量+原有变量
        canSignVariales = canSignVariales.concat(this.smsOptions.multivariate);
      }

      if (contentVariales && contentVariales.length) {
        contentVariales.map(function (contentVar) {
          if (canSignVariales.indexOf(contentVar) == -1) {
            _this2.illegalContentVar += contentVar;
          }
        });
      }

      return value;
    }
  }]);

  return ngSmsEditor;
}();

ngSmsEditor.$inject = ['$scope', '$element', '$sce'];
var index = app.filter('label', function () {
  return function (text) {
    return text.replace(/#/g, '');
  };
}).directive('smsEditorContent', smsEditorContent).component('ngSmsEditor', {
  template: template,
  controller: ngSmsEditor,
  bindings: {
    smsOptions: '=',
    insertText: '<'
  },
  transclude: {
    header: '?slotHeader',
    footer: '?slotFooter'
  }
});

module.exports = index;
