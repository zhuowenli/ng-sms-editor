/*
 * Author: 绿间
 * Email: lvjian@huanleguang.com
 * Date: 2018-07-24 16:26:54
 */

import app from './components';

// 淘宝短链接
app.factory('tbShortLink', ['$resource', function ($resource) {
    return $resource('/crm/shorturl');
}]);

// 更新店铺签名
app.factory('updateShopTitle', ['$resource', function ($resource) {
    return $resource('/crm/care/title');
}]);

// 自定义签名
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
}]);

// 更新店铺名
app.factory('updateShopName', ['$resource', function ($resource) {
    return $resource('/update-shop-title');
}]);

app.factory('couponLinks', ['$resource', function ($resource) {
    return $resource(
        '/material/wireless/links/coupons', {},
        {
            put: {
                method: 'PUT'
            },
            query: {
                method: 'GET',
                isArray: false
            }
        }
    );
}]);

// 修改绑定手机号
app.factory('MyNotice', ['$resource', function ($resource) {
    return $resource('/my/notice', null, {
        post: {
            method: 'POST'
        }
    });
}]);

export default app;

