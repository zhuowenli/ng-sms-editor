/*
 * @Author: 卓文理
 * @Email: 531840344@qq.com
 * @Date: 2018-02-07 16:40:25
 */

import Quill from 'quill';

const BlockEmbed = Quill.import('blots/embed');

class MarkBlot extends BlockEmbed {
    static create({ value, id }) {
        const node = super.create();
        node.innerText = value;
        node.setAttribute('data-id', id);
        return node;
    }
    static value(node) {
        return node.innerText;
    }
}

MarkBlot.blotName = 'mark';
MarkBlot.tagName = 'mark';

export default MarkBlot;
