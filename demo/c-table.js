function Table(options) {
	const that = this;
	that.calce = '30px'; // 间距
	that.options = $.extend(true, {
		col: [],
		checkbox: true,
		filterObj: {}, //子table过滤 默认用父级
		subCol: {}, //子表格td 默认用父级
		defaultFilter: null,
		autoshow: false
	}, options);
	const { defaultFilter, col, checkbox } = that.options;
	if(!defaultFilter || typeof defaultFilter !== 'function' ) {
		throw new Error('defaultFilter为必填参数，且是方法')
	}
	that.colTpl = that.renderHideTr(col);
	that.tpl = `
		<div class="grid-border">
			<div class="grid-header">
				<table border="0" cellspacing="0">
					${checkbox?`
						<th class="check-group pw-2 text-center">
							<span class="sku-check">
								<label>
									<input type="checkbox" table-checkAllCategory class="pointer" >
									<i class="fa fa-check pointer"></i>
								</label>
							</span>
						</th>
					`:''}
					<th style="width:24px"></th>
					${col.map(colItem => {
						return `<th  ${colItem.class?`class="${colItem.class}"`:''} ${colItem.fixed?`style="width:${colItem.fixed}px"`:''}>${colItem.name}</th>`
					}).join('')}
				</table>
			</div>
			<div class="grid-body">
				<table border="0" cellspacing="0">
					<tbody class="grid-content">
						${that.colTpl}
						<tr class="grid-text-tr">
							<td class="center-tips" colspan="13">
								<div class="tips-body">
									<i class="fa fa-search"></i> 初次打开页面不加载数据，请组合条件进行搜索。</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	`;
	that.init();
};

Table.prototype = {
	init: function() {
		const that = this;
		const { options, tpl } = that;
		const $table = $(options.selector);
		$table.append(tpl);
		that.subKey = options.subKey
		that.$table = $table;
		that.$header = $table.find('.grid-header');
		that.$body = $table.find('.grid-content');
		that.$textTr = $table.find('.grid-text-tr');
		that.bindEvent();
	},
	bindEvent: function() {
		const that = this;
		that.$table.on('click', 'tr', function(e){
			if($(e.target).hasClass('pointer') || $(e.target).hasClass('check-item')) return;
			$(this).find('input.check-item').trigger('click');
			return false;
		})
		that.$table.on('change', '[table-togglesub]', function(e){
			const $target = $(this).parents('tr').eq(0).next();
			$target.fadeToggle(200);
			that.setScrollerWidth();
		})
		that.$table.on('change', 'input.check-item', function(e) {
			const $that = $(this);
			const checkbox = $that.prop('checked');
			const $tr = $that.parents('tr:not(".sub-child")')
			checkbox ?
				$tr.addClass('active')
				:
				$tr.removeClass('active');
			// 修改下层tr
			const $next = $that.parents('tr').eq(0).next();
			if($next.hasClass('sub-child')){
				const $target = $next.find('input.check-item');
				checkbox?
					$target.prop('checked', true).change()
					:
					$target.prop('checked', false).change();
			}
			// 修改上层tr
			// const $prev = $that.parents('.sub-child');
			// if($prev.length){
			// 	$prev.each((i,prevItem) => {
			// 		const ischeck = $(prevItem).find('input.check-item:checked').length;
			// 		$(prevItem).prev().find('input.check-item').prop('checked',ischeck)
			// 	})
			// }
		})
		that.$table.on('change', '[table-checkAllCategory]', function(e) {
				that.$table.find('input.check-item').prop('checked', $(e.target).prop('checked'))
		})
	},
	renderData: function (data) {
		const that = this;
		const { defaultFilter, checkbox, autoshow, filterObj } = that.options;
		this.cacheData = data;
		if(!data || !data.length) {
			that.$textTr.show();
			that.$body.find("tr:gt(1)").remove();
			that.$textTr.find('.tips-body').html('<i class="fa fa-info-circle"></i>没有符合条件的数据，请尝试其他搜索条件。');
			return ;
		}
		that.$textTr.hide();
		const finalTpl = data.map((trItem,index) => {
			return `<tr>
			${checkbox?`
				<td class="text-center">
					<span class="sku-check">
						<label>
							<input data-index='${index}' type="checkbox" class='check-item'>
							<i class="fa fa-check"></i>
						</label>
					</span>
				</td>`:''}
				${ trItem[that.subKey]?
						`<td>
							<div class="toggle-child" >
								<input ${autoshow?'checked': ''} class="pointer" table-togglesub type="checkbox"/>
								<i class="fa fa-caret-down"></i>
							</div>
						</td>`: '<td></td>'}
				${filterObj[0]?filterObj[0](trItem):defaultFilter(trItem)}
			</tr>
			${trItem[that.subKey]? that.renderSub(trItem[that.subKey], 1, index):''}
			`
		}).join('')
		that.$body.find("tr:gt(1)").remove();
		that.$body.append(finalTpl)
		that.setScrollerWidth()
	},
	renderSub: function (subData, level, parentIndex) {
		const that = this;
		const { checkbox, col, filterObj, subCol, defaultFilter, autoshow } =  that.options;
		const trClass = `sub-${level}`;
		const finalTpl = subData.map((trItem, index) => {
			return `<tr class="subtr">
			${new Array(level).fill(that.calce).map(i => `<td style="width:${i}"></td>`).join('')}
			${checkbox?`
				<td class="text-center">
					<span class="sku-check">
						<label>
							<input data-index="${parentIndex+'-'+index}" type="checkbox" class='check-item'>
							<i class="fa fa-check"></i>
						</label>
					</span>
				</td>`:''}
				${ trItem[that.subKey]?
					`<td>
						<div class="toggle-child" >
							<input ${autoshow?'checked': ''} class="pointer" table-togglesub type="checkbox"/>
							<i class="fa fa-caret-down"></i>
						</div>
					</td>`: '<td></td>'}
				${filterObj[level] ? filterObj[level](trItem):defaultFilter(trItem)}
				${trItem[that.subKey]? that.renderSub(trItem[that.subKey], level+1, index):''}
			</tr>`;
		}).join('');
		return `
			<tr class="sub-child ${trClass}" style="display:${autoshow?'':'none'};">
				<td colspan="${col.length +3*level}" class="subtd">
					<table border="0" cellspacing="0">
						${that.renderHideTr(subCol[level]||col, level)}
						${finalTpl}
					</table>
				</td>
			</tr>
		`
	},
	renderHideTr: function (col, level) {
		const that = this;
		if(!col) return false
		var sunFixed = 0;
		if(level) {
			const deleteW = parseInt(that.calce)*level - 2*level;
			const fixedW = col.find(i => i.fixed);
			sunFixed = fixedW?fixedW["fixed"]-Math.round(deleteW): 0
		}
		return `<tr class="grid-hidden-tr">
			${(level?new Array(level).fill(that.calce).map(i => `<td style="width:${i}"></td>`):[]).join('')}
			${that.options.checkbox?`
			<td class="pw-2"></td>
			<td style="width:24px;"></td>
			`:''}
			${col.map(colItem => {
				return `<td  ${colItem.class?`class="${colItem.class}"`:''} ${colItem.fixed?sunFixed?`style="width:${sunFixed}px"`:!level?`style="width:${colItem.fixed}px"`:'':''}></td>`
			}).join('')}
		</tr>`;
	},
	getChecked: function() {
		const that = this;
		const $target = that.$body.find('input.check-item:checked');
		const result = []
		$target.each((i,item) => {
			const indexArr = $(item).attr('data-index').split('-');
			if(indexArr && indexArr.length){
				var data = '';
				for(let i =0; i<indexArr.length;i++){
					const index = indexArr[i];
					data = data?data[that.subKey][index]:that.cacheData[index];
				}
				result.push(data)
			}
			
		})
		return result;
	},
	setScrollerWidth: function() {
		const that = this;
		const bodyEl = that.$table.find('.grid-body')[0];
		if(bodyEl.scrollHeight>bodyEl.clientHeight) {
			that.$header.css('padding-right', '18px')
		} else {
			that.$header.css('padding-right', '0')
		}
	}
}
// export default Table;
