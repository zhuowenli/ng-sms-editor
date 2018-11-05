/*
 * @Author: 卓文理
 * @Email: 531840344@qq.com
 * @Date: 2018-02-07 16:33:23
 */

import Quill from 'quill';
import Delta from 'quill-delta';
import MarkBlot from './plugin/mark';

Quill.register(MarkBlot);

export default function () {
    return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            insertText: '=',
            labels: '<', // 默认短信变量
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

            const quill = new Quill(element[0], options);

            // 填充文本
            ngModel.$render = () => {
                const value = ngModel.$viewValue;

                if (value) {
                    const length = quill.getLength();
                    const labels = [];

                    // 短信变量
                    if ($scope.labels && $scope.labels.length) {
                        $scope.labels.map((item) => {
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

                    value.replace(/#(?!\s*#)[^#]+#/g, text => `@@@${text}@@@`)
                        .split('@@@')
                        .filter(x => x)
                        .map((text, inx) => {
                            const length = quill.getLength();

                            // 如果不是 ## 包裹的内容，直接插入文本
                            // ## 包裹的内容：没有传默认短信变量，插入变量
                            // ## 包裹的内容：有传默认短信变量、并且文本在默认短信变量内，插入变量
                            if (/#(?!\s*#)[^#]+#/.test(text) && (!labels.length || labels.indexOf(text) >= 0)) {
                                const id = parseInt(Math.random() * 1e8, 10);
                                quill.insertEmbed(length - 1, 'mark', { value: text, id }, Quill.sources.USER);
                                quill.insertText(length, ' ');

                                if (inx === value.length - 1) {
                                    quill.insertText(length + 1, '\uFEFF');
                                }
                            } else {
                                quill.insertText(length - 1, text);
                            }
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
                        if (typeof item.insert === 'object') {
                            text += /短?链接?/.test(item.insert.mark) ? ` ${item.insert.mark} ` : item.insert.mark;
                        } else if (
                            /^\s*[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&/\/=]*)?./
                                .test(item.insert)
                        ) {
                            text += ` ${item.insert.trim()} `;
                        } else if (
                            /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&/\/=]*)?.\s*$/
                                .test(item.insert)
                        ) {
                            text += `${item.insert.trim()} `;
                        } else {
                            text += item.insert.trim();
                        }
                    }
                    return item;
                });

                // 移除非法字符、首尾空格
                text = text.replace(/(&#65279;|\uFEFF)/g, '').trim();

                ngModel.$setViewValue(text);
            });

            quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node) => {
                const { innerText } = node;
                const text = /^\s*c\.tb\.cn/.test(innerText) ? innerText : innerText.trim();

                return new Delta().insert(text.replace(
                    /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|\ud83e[\udd10-\udd80]/g,
                    ''
                ));
            });

            quill.clipboard.addMatcher(Node.TEXT_NODE, (node) => {
                const { data } = node;
                const text = /^\s*c\.tb\.cn/.test(data) ? data : data.trim();

                // 过滤emoji
                return new Delta().insert(text.replace(
                    /\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|\ud83e[\udd10-\udd80]/g,
                    ''
                ));
            });
        },
    };
}
