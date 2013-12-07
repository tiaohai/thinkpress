/**
 * 文章管理
 * @return {[type]} [description]
 */
module.exports = inherits("Admin/BaseController", function(){
	return {
		navType: "post",
		/**
		 * 列表
		 * @return {[type]} [description]
		 */
		listAction: function(){
			var self = this;
			var model = this.model();
			var listPromise = model._adminPostList(this.http).then(function(data){
				self.assign("list", data || []);
			});
			var countPromise = model.count("id").then(function(count){
				self.assign("count", count || 0);
			});
			when.all([
				listPromise,
				countPromise
			]).then(function(){
				self.display();
			});
		},
		/**
		 * 单条
		 * @return {[type]} [description]
		 */
		itemAction: function(){
			var self = this;
			var model = this.model();
			if (this.isGet()) {
				var id = this.get("id");
				var allPromise = [];
				//设置初始化数据，减少在模版里的数据类型判断
				self.assign({
					item: {},
					cate_ids: [],
					cate: [],
					tag: []
				});
				if (id) {
					//获取详细信息
					var itemPromise = model.find(id).then(function(data){
						self.assign("item", data || {})
					});
					allPromise.push(itemPromise);
					//获取已经选择的分类id
					var postCatePromise = this.model("PostCate").getCateIds(id).then(function(data){
						self.assign("cate_ids", data || []);
					})
					allPromise.push(postCatePromise);
					//获取标签
					var postTagModel = this.model("PostTag");
					var postTagPromise = postTagModel.getPostTag(id).then(function(data){
						self.assign("tag", data || []);
					});
					allPromise.push(postTagPromise);
				};
				//分类列表
				var catePromise = this.model("Cate")._adminGetList(true).then(function(data){
					self.assign("cate", data || []);
				});
				allPromise.push(catePromise);
				//
				when.all(allPromise).then(function(){
					self.display();
				})
			}else if (this.isPost()) {
				model._adminItemPost(this.http).then(function(rows){
					self.json({
						errno: rows ? 0 : 1
					});
				})
			};
		}
	}
})