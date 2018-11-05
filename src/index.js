/*
 * @Author: 卓文理
 * @Email: 531840344@qq.com
 * @Date: 2018-02-08 14:37:19
 */

import app from './components';
import smsEditorContent from './sms-editor-content';
import template from './template.html';
import './resource';
import './index.sass';

class ngSmsEditor {
    /** 短信签名 */
    diySigns = []
    signList = []

    /** 店铺名称 */
    shopName = ''

    /** 显示短信模板弹窗 */
    dialogSmsTmpl = false
    currentTabId = 1
    tmplModel = {}
    tmpl = ''

    /** 显示宝贝选择弹窗 */
    dialogItemsFilter = false

    /** 显示优惠券选择弹窗 */
    dialogCoupon = false
    couponsList = []
    selectedCoupon = {}

    /** 显示自定义短链弹窗 */
    dialogCustom = false;
    customUrl = ''

    /** 显示手机号绑定弹窗 */
    dialogBindPhone = false;
    dialogBindPhoneFrom = '';

    /** 短信内容检验提示 */
    urlWithSpaceEnd = false;
    urlWithSpaceStart = false;
    invalidSmsShown = false;
    illegalContentVar = '';

    constructor($scope, $element, $sce) {
        this.$scope = $scope;
        this.$element = $element;
        this.$sce = $sce;

        this.insertText = '';
        this.smsOptions = this.smsOptions || {};
        this.smsOptions.content = this.smsOptions.content || '';
        this.smsOptions.labels = this.smsOptions.labels || [
            {
                name: '#收货人姓名#',
                type: 'placeholder',
                placeholder: '张三三'
            },
            {
                name: '#买家昵称#',
                type: 'placeholder',
                placeholder: 'tb88888_2017'
            },
            {
                name: '店铺首页',
                type: 'link_home'
            },
            {
                name: '宝贝',
                type: 'dialog_items'
            },
            {
                name: '优惠券',
                type: 'dialog_coupon'
            },
            {
                name: '自定义页面',
                type: 'dialog_custom'
            },
            {
                name: '短信模板',
                type: 'tmpl'
            }
        ];
        this.smsOptions.contentLength = this.smsOptions.contentLength || 0;
        this.placeholderMap = this.genPlaceholderMap(this.smsOptions.labels);

        // 插入变量
        $scope.$watch('$ctrl.smsOptions.labels', (newValue) => {
            if (newValue && newValue.length) {
                this.placeholderMap = this.genPlaceholderMap(this.smsOptions.labels);
            }
        }, true);

        // 额外插入变量
        $scope.$watch('$ctrl.smsOptions.multivariate', (newValue) => {
            if (newValue && newValue.length) {
                newValue.map((item) => {
                    if (item === '#收货人姓名#') {
                        this.placeholderMap['#收货人姓名#'] = '张三三';
                    }
                });
            }
        }, true);

        $scope.$watch('$ctrl.smsOptions.sign_content', (newValue, oldValue) => {
            if (newValue !== oldValue) {
                this.countContentLen();
            }
        });

        $scope.$watch('$ctrl.smsOptions.content', async () => {
            this.validateContent();
            this.countContentLen();
        });

        $scope.$on('CRM:BINDPHONE:SHOW', async () => {
            this.dialogBindPhoneFrom = '';
            this.dialogBindPhone = true;
        });

        this.init();
    }

    init() {
    }

    /**
     * 更换模板内容
     *
     * @memberof ngSmsEditor
     */
    async changeTmpl() {
        this.smsOptions.content = this.tmplModel.content;
        return this.smsOptions.content;
    }

    /**
     * 插入预设标签
     * @param {Object} label 标签
     */
    async onInsertLabel(label) {
        if (label && (label.insertText || typeof label === 'string')) {
            this.insertText = label.insertText || label;
            return;
        }

        switch (label.type) {
        case 'placeholder':
            this.insertText = label.name;
            break;
        default:
            this.$scope.$emit('NG:SMS:EDITOR', label.type);
            break;
        }
    }

    /**
     * 统计短信条数
     * @return {number} 短信条数
     */
    countSms() {
        const smsLen = this.smsOptions.contentLength;
        let smsCount = 1;

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
    replaceLabels(content) {
        const rreEscape = /[-/\\^$*+?.()|[\]{}]/g;

        let reg;

        for (const key in this.placeholderMap) {
            reg = new RegExp(key.replace(rreEscape, '\\$&'), 'g');
            content = content.replace(reg, `<em>${this.placeholderMap[key]}</em>`);
        }

        return content;
    }

    /**
     * 生成占位符map
     * @param  {array} labels  标签列表
     * @return {object}        占位符map
     */
    genPlaceholderMap(labels) {
        let label;
        const map = {};

        for (let i = 0, len = labels.length; i < len; i += 1) {
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
    countContentLen() {
        let contentParsered;
        let contentLength;
        let realContent;
        const { content } = this.smsOptions;

        if (content) {
            contentParsered = this.replaceLabels(content);
            realContent = contentParsered.replace(/<\/?em>/g, '');
            contentLength = realContent.length;

            // 计算长度之后替换内容
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
    validateContent() {
        const value = this.smsOptions.content;
        const links =
            value.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&/\/=]*)?./gi);
        let notSpaceEnd = false;
        let notSpaceStart = false;
        const regHAN = /[^\x00-\xff]/;
        const regSpace = /[\s]/;

        let linkPosition;
        let startChar;

        if (links) {
            for (let i = 0, len = links.length; i < len; i += 1) {
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

        let endChar;
        if (links) {
            for (let i = 0, len = links.length; i < len; i += 1) {
                endChar = links[i].slice(-1);
                if (endChar.match(regHAN)) {
                    notSpaceEnd = true;
                    break;
                }
            }
        }

        this.urlWithSpaceEnd = notSpaceEnd;
        this.urlWithSpaceStart = notSpaceStart;
        // 短信内容不能包含 “【” 和 “】”
        this.invalidSmsShown = !!value.match(/[【】]/);
        // 短信中含有，但是canSignVariales数组中没有的变量
        this.illegalContentVar = '';

        /**
         * 当插入的变量没有可替换的数据时弹窗
         */
        let canSignVariales = [];
        const contentVariales = value.match(/#(?!\s*#)[^#]+#/g); // 短信内容中含有的变量

        this.smsOptions.labels.map(label => canSignVariales.push(label.name));

        if (this.smsOptions.multivariate && this.smsOptions.multivariate.length) {
            // 可以插入的变量为 导入变量+原有变量
            canSignVariales = canSignVariales.concat(this.smsOptions.multivariate);
        }

        if (contentVariales && contentVariales.length) {
            contentVariales.map((contentVar) => {
                if (canSignVariales.indexOf(contentVar) == -1) {
                    this.illegalContentVar += contentVar;
                }
            });
        }

        return value;
    }
}

ngSmsEditor.$inject = [
    '$scope', '$element', '$sce'
];

export default app
    .filter('label', () => text => text.replace(/#/g, ''))
    .directive('smsEditorContent', smsEditorContent)
    .component('ngSmsEditor', {
        template,
        controller: ngSmsEditor,
        bindings: {
            smsOptions: '=',
            insertText: '<',
        },
        transclude: {
            header: '?slotHeader',
            footer: '?slotFooter'
        },
    });
