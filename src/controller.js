/*
 * @Author: 卓文理
 * @Email: 531840344@qq.com
 * @Date: 2018-02-23 11:01:19
 */

class ngSmsEditor {
    constructor($scope, $element, $sce) {
        this.$scope = $scope;
        this.$element = $element;
        this.$sce = $sce;

        this.insertText = '';
        this.content = this.content || '';
        this.labels = this.labels || [];
        this.placeholderMap = this.genPlaceholderMap(this.labels);

        $scope.$watch('ctrl.labels', (newValue) => {
            if (newValue && newValue.length) {
                this.placeholderMap = this.genPlaceholderMap(this.labels);
            }
        }, true);
        $scope.$watch('ctrl.content', () => this.countContentLen());
    }

    /**
     * 插入预设标签
     * @param {Object} label 标签
     */
    insert(label) {
        if (label.name === '#店铺名称#') {
            this.insertText = label.placeholder ? label.placeholder : label.name;
        } else if (label.type === 'placeholder') {
            this.insertText = label.name;
        }
    }

    /**
     * 统计短信条数
     * @return {number} 短信条数
     */
    countSms() {
        const smsLen = this.contentLength;
        let smsCount = 1;

        if (smsLen > 70) {
            smsCount = Math.ceil(smsLen / 67);
        }

        this.smsCount = smsCount;
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
        const { content } = this;

        if (content) {
            contentParsered = this.replaceLabels(content);
            realContent = contentParsered.replace(/<\/?em>/g, '');
            contentLength = realContent.length;

            // 计算长度之后替换内容
            realContent = realContent.replace(/张三三/g, '#买家姓名#');
            realContent = realContent.replace(/ c.tb.cn\/C.cxKC /g, '#付款链接#');
            realContent = realContent.replace(/ c.tb.cn\/F.yyyyx /g, '#评价链接#');

            this.contentParsered = this.$sce.trustAsHtml(contentParsered);
            this.realContent = realContent;
            // 7 = 2('【】') + 5(' 退订回T');

            this.contentLength = this.signContent.length + contentLength + 7;
        }
    }
}

ngSmsEditor.$inject = ['$scope', '$element', '$sce'];

export default ngSmsEditor;
