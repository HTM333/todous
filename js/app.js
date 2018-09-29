(function (window) {
	'use strict';

	// Your starting point. Enjoy the ride!

	let mv = new Vue({
		el: '#app',
		data: {
			list: [{
					text: '吃饭',
					status: true,
				},
				{
					text: '吃饭',
					status: false,
				},
				{
					text: '吃饭',
					status: false
				},
			],
			newText: '',
			editList: '',
			listStaus: 'all'
		},
		methods: {
			alerts() {
				alert('hello world.双击编辑、回车添加、单选全选、批量删除')
			},
			addList() {
				if (this.newText.trim() == '') {
					alert('不能为空')
					this.newText = ''
					return
				}
				this.list.push({
					text: this.newText,
					status: false
				})
				this.newText = ''
			},
			isShow(valueStatus) {
				switch (this.listStaus) {
					case 'all':
						return true;
						break;
					case 'active':
						return !valueStatus;
						break;
					case 'completed':
						return valueStatus;
						//break;
					default:
						return true;
						break;
				}
			},
		},
		computed: { //计算属性
			checkAll: {
				// 设置
				set(newValue) {
					this.list.forEach(v => {
						v.status = newValue
					});
				},
				get() {
					var temList = this.list.filter(value => {
						return !value.status
					})
					return !temList.length
				}
			}
		},
		updated() {
			localStorage.setItem('todoList', JSON.stringify(this.list))
		},

		mounted() {
			if (!localStorage.getItem('todoList')) {
				return
			}
			this.list = JSON.parse(localStorage.getItem('todoList'))
		}

	});
})(window);
