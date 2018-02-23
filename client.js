/* eslint-disable */
var app = angular.module('module', ['ng-sms-editor']);

app.controller("ctrl", ["$scope", function($scope) {
    $scope.content = '#买家昵称#你好，#店铺名称#周年庆，全场宝贝3折起，更有精美礼品1000套免费送，先到先得。抢购链接：';
    $scope.sign_content = '淘宝';
    $scope.labels = [
        {
            name: '#店铺名称#',
            type: 'placeholder',
            placeholder: '无敌美店'
        },
        {
            name: '#买家姓名#',
            type: 'placeholder',
            placeholder: '张三三'
        },
        {
            name: '#买家昵称#',
            type: 'placeholder',
            placeholder: 'tb88888_2017'
        },
    ];

    $scope.$watch('content', res => console.log(res))
}]);

angular.element().ready(function () {
    var context = document.getElementsByTagName('body');
    angular.bootstrap(context, [app.name]);
});