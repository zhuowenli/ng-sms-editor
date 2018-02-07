/*
 * @Author: 卓文理
 * @Email: 531840344@qq.com
 * @Date: 2018-02-07 16:33:23
 */

'use strict';

// import angular from 'angular';
import Quill from 'quill';
import Delta from 'quill-delta';
import MarkBlot from './plugin/mark';

import './index.sass';

Quill.register(MarkBlot);

export default angular.module('ng-sms-editor', [])
    .directive('ngSmsEditor', () => ({
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            insertText: '=',
            key: '<',
        },
        link($scope, element, attr, ngModel) {
            if (!ngModel) return;

            const options = Object.assign($scope.options || {}, {
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

            console.log(element[0]);

            const quill = new Quill(element[0], options);

            // 填充文本
            ngModel.$render = () => {
                const value = ngModel.$viewValue;

                if (value) {
                    const textLength = quill.getLength();

                    if (textLength) {
                        quill.deleteText(0, textLength);
                    }

                    value.replace(/#[^a-z0-9A-Z]+?#/g, text => `@@@${text}@@@`)
                        .split('@@@')
                        .filter(x => x)
                        .map((text, inx) => {
                            const length = quill.getLength();

                            if (/#[^a-z0-9A-Z]+#/.test(text)) {
                                const id = parseInt(Math.random() * 1e8, 10);
                                quill.insertEmbed(length - 1, 'mark', { value: text, id }, Quill.sources.USER);
                                quill.insertText(length, ' ');

                                if (inx === value.length - 1) {
                                    quill.insertText(length + 1, '\uFEFF');
                                }
                            } else {
                                quill.insertText(length - 1, text);
                            }

                            return text;
                        });
                }
            };

            // 监听文本插入
            $scope.$watch('insertText', () => {
                let value = $scope.insertText;

                if (value) {
                    const range = quill.getSelection(true);
                    const id = parseInt(Math.random() * 1e8, 10);

                    if (/c\.tb\.cn/.test(value)) {
                        value = ` ${value} `;
                    }

                    quill.insertEmbed(range.index, 'mark', { value, id }, Quill.sources.USER);

                    const length = quill.getLength();

                    let text = ' ';

                    if (length - range.index <= 2) {
                        text += '\uFEFF';
                    }

                    // magic code: 插入后加一个空格
                    quill.insertText(range.index + 1, text);
                    quill.setSelection(range.index + 2, Quill.sources.SILENT);

                    $scope.insertText = '';
                }
            });

            // 监听文本改动
            quill.on('text-change', () => {
                const { ops } = quill.getContents();
                let text = '';

                ops.map((item) => {
                    if (item.insert) {
                        text += typeof item.insert === 'object' ? item.insert.mark : item.insert.trim();
                    }
                    return item;
                });

                // 移除非法字符、首尾空格
                text = text.replace(/(&#65279;|\uFEFF)/g, '').trim();

                ngModel.$setViewValue(text);
            });

            const emoji = /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|\ud83e[\udd10-\udd80]/g;

            // 过滤剪贴板emoji字符
            quill.clipboard.addMatcher(
                Node.ELEMENT_NODE,
                node => new Delta().insert(node.innerText.trim().replace(emoji, ''))
            );
            quill.clipboard.addMatcher(
                Node.TEXT_NODE,
                node => new Delta().insert(node.data.trim().replace(emoji, ''))
            );
        },
    }));
