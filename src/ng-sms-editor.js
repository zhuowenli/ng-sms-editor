/*
 * @Author: 卓文理
 * @Email: 531840344@qq.com
 * @Date: 2018-02-08 14:37:19
 */

import directive from './directive';
import controller from './controller';

const template = `
<section class="ng-sms-editor">
    <header class="ng-sms-editor__header">
        <span class="sms-text">插入</span>
        <a href="javascript:;"
            ng-repeat="label in $ctrl.labels"
            ng-click="$ctrl.insert(label)"
            class="sms-label sms-label-{{label.type}}"
        >{{label.name}}</a>
        <div class="sms-custom" ng-transclude="header"></div>
    </header>
    <sms-editor ng-model="$ctrl.content" insert-text="$ctrl.insertText"></sms-editor>
    <footer class="ng-sms-editor__footer">
        <div class="sms-custom" ng-transclude="footer"></div>
        <span class="sms-total">已输入 <em>{{$ctrl.contentLength}}</em> 个字，共计 <em>{{$ctrl.countSms()}}</em> 条短信</span>
        <span class="sms-rule">
            计费规则
            <div class="sms-tooltip">
                <i class="sms-tooltip-arrow"></i>
                <div class="sms-tooltip-inner">
                    <p>1、70字计1条短信收费，超出70字按67字每条计。</p>
                    <p>2、一个汉字，字母或标点都算一个字。</p>
                    <p>3、自动替换的内容以实际发送为准，有可能超过默认字数。</p>
                    <p>4、受短信运营商限制，签名和退订回T，包含在字数中</p>
                </div>
            </div>
        </span>
    </footer>
</section>
`;

angular.module('ng-sms-editor', [])
    .directive('smsEditor', directive)
    .component('ngSmsEditor', {
        template,
        controller,
        bindings: {
            content: '=',
            labels: '<',
            signContent: '='
        },
        transclude: {
            header: '?slotHeader',
            footer: '?slotFooter'
        },
    });
