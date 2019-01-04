/**
 * Created by hanqilin on 17/03/15.
 */
const vm = new Vue({
    el: '#ydb',
    mixins: [mixin],
    data: {
        postCompleted: false
    },
    computed: {},
    watch: {
        postCompleted: function () {
            if (this.postCompleted) {
                this.$indicator.close();
            }
        }
    },
    methods: {
        a: function () {

        },
        ab() {

        }
    },
    // ready
    mounted: function () {
        setTimeout(function () {
            vm.postCompleted = true;
        }, 2000)
    },
    // 创建vue
    created: function () {
        this.$indicator.open();
    }
});
