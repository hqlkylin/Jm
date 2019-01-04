
var vm = new Vue({
    el: '#app',
    mixins: [mixin, mixinPC],
    data: {


    },
    methods: {

    },
    created(){

    },
    mounted(){

        var loading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.1)'
        });

        setTimeout(() => {
            loading.close();
            this.$notify.error({
                title: '错误',
                message: '这是一条错误的提示消息'
            });
        }, 5000);
    }

})
