/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxToolbar
 * 
 * Creates a toolbar inside a given DOM node. The toolbar may contain icons,
 * buttons and combo boxes.
 * 
 * Event: mxEvent.SELECT
 * 
 * Fires when an item was selected in the toolbar. The <code>function</code>
 * property contains the function that was selected in <selectMode>.
 * 
 * Constructor: mxToolbar
 * 
 * Constructs a toolbar in the specified container.
 *
 * Parameters:
 *
 * container - DOM node that contains the toolbar.
 */
function mxToolbar(container)
{
	this.container = container;
};

/**
 * Extends mxEventSource.
 */
mxToolbar.prototype = new mxEventSource();
mxToolbar.prototype.constructor = mxToolbar;

/**
 * Variable: container
 * 
 * Reference to the DOM nodes that contains the toolbar.
 */
mxToolbar.prototype.container = null;

/**
 * Variable: enabled
 * 
 * Specifies if events are handled. Default is true.
 */
mxToolbar.prototype.enabled = true;

/**
 * Variable: noReset
 * 
 * Specifies if <resetMode> requires a forced flag of true for resetting
 * the current mode in the toolbar. Default is false. This is set to true
 * if the toolbar item is double clicked to avoid a reset after a single
 * use of the item.
 */
mxToolbar.prototype.noReset = false;

/**
 * Variable: updateDefaultMode
 * 
 * Boolean indicating if the default mode should be the last selected
 * switch mode or the first inserted switch mode. Default is true, that
 * is the last selected switch mode is the default mode. The default mode
 * is the mode to be selected after a reset of the toolbar. If this is
 * false, then the default mode is the first inserted mode item regardless
 * of what was last selected. Otherwise, the selected item after a reset is
 * the previously selected item.
 */
mxToolbar.prototype.updateDefaultMode = true;

/**
 * Function: addItem
 * 将给定函数添加为具有指定标题和图标的图像,并返回新的图像节点。
 * 
 * Parameters:
 * title - 用作工具提示的可选字符串。
 * icon - 要使用的图像的可选URL。如果没有给出URL，则使用按钮被创建
 * funct - 函数在单击鼠标时执行
 * pressedIcon - 按下图像的可选URL。默认是灰色背景颜色
 * style - 可选样式类名。默认是mxToolbarItem
 * factoryMethod - 可选的工厂方法弹出菜单，如.
 * function(menu, evt, cell) { menu.addItem('Hello, World!'); }
 */

mxToolbar.prototype.addItem = function(title, icon, funct, pressedIcon, style, factoryMethod)
{
	var img = document.createElement((icon != null) ? 'img' : 'button');
	var initialClassName = style || ((factoryMethod != null) ?
			'mxToolbarMode' : 'mxToolbarItem');
	img.className = initialClassName;
	img.setAttribute('src', icon);
	
	if (title != null)
	{
		if (icon != null)
		{
			img.setAttribute('title', title);
		}
		else
		{
			mxUtils.write(img, title);
		}
	}
	this.container.appendChild(img);

	// 在单击工具栏项时调用函数
	if (funct != null)
	{
		mxEvent.addListener(img, 'click', funct);
		
		if (mxClient.IS_TOUCH)
		{
			mxEvent.addListener(img, 'touchend', funct);
		}
	}

	var mouseHandler = mxUtils.bind(this, function(evt)
	{
		if (pressedIcon != null)
		{
			img.setAttribute('src', icon);
		}
		else
		{
			img.style.backgroundColor = '';
		}
	});

	// 用灰色背景突出显示工具栏项，当它被鼠标点击时
	mxEvent.addGestureListeners(img, mxUtils.bind(this, function(evt)
	{
		if (pressedIcon != null)
		{
			img.setAttribute('src', pressedIcon);
		}
		else
		{
			img.style.backgroundColor = 'gray';
		}
		
		// 弹出菜单
		if (factoryMethod != null)
		{
			if (this.menu == null)
			{
				this.menu = new mxPopupMenu();
				this.menu.init();
			}
			
			var last = this.currentImg;
			
			if (this.menu.isMenuShowing())
			{
				this.menu.hideMenu();
			}
			
			if (last != img)
			{
				// 将工厂方法重定向到本地工厂方法
				this.currentImg = img;
				this.menu.factoryMethod = factoryMethod;
				
				var point = new mxPoint(
					img.offsetLeft,
					img.offsetTop + img.offsetHeight);
				this.menu.popup(point.x, point.y, null, evt);

				// 设置和重写以恢复类名
				if (this.menu.isMenuShowing())
				{
					img.className = initialClassName + 'Selected';
					
					this.menu.hideMenu = function()
					{
						mxPopupMenu.prototype.hideMenu.apply(this);
						img.className = initialClassName;
						this.currentImg = null;
					};
				}
			}
		}
	}), null, mouseHandler);

	mxEvent.addListener(img, 'mouseout', mouseHandler);
	
	return img;
};

/**
 * Function: addCombo
 * 
 *使用给定的样式添加并返回一个新的SELECT元素。元素被放置在带有mxToolbarComboContainer样式类名的DIV中。
 * 
 * Parameters:
 * 
 * style -可选样式类名。默认是mxToolbarCombo.
 */
mxToolbar.prototype.addCombo = function(style)
{
	var div = document.createElement('div');
	div.style.display = 'inline';
	div.className = 'mxToolbarComboContainer';
	
	var select = document.createElement('select');
	select.className = style || 'mxToolbarCombo';
	div.appendChild(select);
	
	this.container.appendChild(div);
	
	return select;
};

/**
 * Function: addActionCombo
 * 
 * 使用给定的标题作为默认的元素。在每个元素之后，所选内容将重置为该元素改变。
 * 
 * Parameters:
 * 
 * title - 指定默认元素标题的字符串
 * style - 可选样式类名。默认是mxToolbarCombo
 */
mxToolbar.prototype.addActionCombo = function(title, style)
{
	var select = document.createElement('select');
	select.className = style || 'mxToolbarCombo';
	this.addOption(select, title, null);
	
	mxEvent.addListener(select, 'change', function(evt)
	{
		var value = select.options[select.selectedIndex];
		select.selectedIndex = 0;
		
		if (value.funct != null)
		{
			value.funct(evt);
		}
	});
	
	this.container.appendChild(select);
	
	return select;
};

/**
 * Function: addOption
 * 
 *在给定的SELECT元素中添加并返回一个新的OPTION元素。
 *如果给定的值是一个函数，那么它将被存储在选项的函数中
 *字段。
 * 
 * Parameters:
 * 
 * combo - 元素，该元素将包含新条目.
 * title - 指定选项标题的字符串.
 * value - 指定与此选项关联的值.
 */
mxToolbar.prototype.addOption = function(combo, title, value)
{
	var option = document.createElement('option');
	mxUtils.writeln(option, title);
	
	if (typeof(value) == 'function')
	{
		option.funct = value;
	}
	else
	{
		option.setAttribute('value', value);
	}
	
	combo.appendChild(option);
	
	return option;
};

/**
 * Function: addSwitchMode
 * 
 * 向工具栏添加一个新的可选择项。只有一个开关模式项目可以
 * 每次被选中。当前选中的项为默认项重置工具栏后。
 */
mxToolbar.prototype.addSwitchMode = function(title, icon, funct, pressedIcon, style)
{
	var img = document.createElement('img');
	img.initialClassName = style || 'mxToolbarMode';
	img.className = img.initialClassName;
	img.setAttribute('src', icon);
	img.altIcon = pressedIcon;
	
	if (title != null)
	{
		img.setAttribute('title', title);
	}
	
	mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt)
	{
		var tmp = this.selectedMode.altIcon;
		
		if (tmp != null)
		{
			this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
			this.selectedMode.setAttribute('src', tmp);
		}
		else
		{
			this.selectedMode.className = this.selectedMode.initialClassName;
		}
		
		if (this.updateDefaultMode)
		{
			this.defaultMode = img;
		}
		
		this.selectedMode = img;
		
		var tmp = img.altIcon;
		
		if (tmp != null)
		{
			img.altIcon = img.getAttribute('src');
			img.setAttribute('src', tmp);
		}
		else
		{
			img.className = img.initialClassName+'Selected';
		}
		
		this.fireEvent(new mxEventObject(mxEvent.SELECT));
		funct();
	}));
	
	this.container.appendChild(img);
	
	if (this.defaultMode == null)
	{
		this.defaultMode = img;
		
		// 函数应该只触发一次，因此不要将它与选择事件一起传递
		this.selectMode(img);
		funct();
	}
	
	return img;
};

/**
 * Function: addMode
 * 
 * 向工具栏添加新项目。选择通常在之后重置物品已被消费，
 * 例如通过向图中添加一个新顶点。如果双击该项，则不会执行重置。
 * 
 * 函数参数使用以下签名:funct(evt, cell)，其中evt是本机鼠标事件，cell是鼠标下的单元。
 */
mxToolbar.prototype.addMode = function(title, icon, funct, pressedIcon, style, toggle)
{
	toggle = (toggle != null) ? toggle : true;
	var img = document.createElement((icon != null) ? 'img' : 'button');
	
	img.initialClassName = style || 'mxToolbarMode';
	img.className = img.initialClassName;
	img.setAttribute('src', icon);
	img.altIcon = pressedIcon;

	if (title != null)
	{
		img.setAttribute('title', title);
	}
	
	if (this.enabled && toggle)
	{
		mxEvent.addListener(img, 'click', mxUtils.bind(this, function(evt)
		{
			this.selectMode(img, funct);
			this.noReset = false;
		}));
		
		mxEvent.addListener(img, 'dblclick', mxUtils.bind(this, function(evt)
		{
			this.selectMode(img, funct);
			this.noReset = true;
		}));
		
		if (this.defaultMode == null)
		{
			this.defaultMode = img;
			this.defaultFunction = funct;
			this.selectMode(img, funct);
		}
	}

	this.container.appendChild(img);					

	return img;
};

/**
 * Function: selectMode
 * 
 * 重置先前选择的模式的状态，并按所选的方式显示给定的DOM节点。此函数以给定函数作为参数触发选择事件
 */
mxToolbar.prototype.selectMode = function(domNode, funct)
{
	if (this.selectedMode != domNode)
	{
		if (this.selectedMode != null)
		{
			var tmp = this.selectedMode.altIcon;
			
			if (tmp != null)
			{
				this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
				this.selectedMode.setAttribute('src', tmp);
			}
			else
			{
				this.selectedMode.className = this.selectedMode.initialClassName;
			}
		}
		
		this.selectedMode = domNode;
		var tmp = this.selectedMode.altIcon;
		
		if (tmp != null)
		{
			this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
			this.selectedMode.setAttribute('src', tmp);
		}
		else
		{
			this.selectedMode.className = this.selectedMode.initialClassName+'Selected';
		}
		
		this.fireEvent(new mxEventObject(mxEvent.SELECT, "function", funct));
	}
};

/**
 * Function: resetMode
 * 选择默认模式并重置先前所选模式的状态。
 */
mxToolbar.prototype.resetMode = function(forced)
{
	if ((forced || !this.noReset) && this.selectedMode != this.defaultMode)
	{
		// 最后选择的切换模式将被激活，因此该功能已经执行，不再需要这里
		this.selectMode(this.defaultMode, this.defaultFunction);
	}
};

/**
 * Function: addSeparator
 * 
 * 将指定图像添加为分隔符。
 * 
 * Parameters:
 * 
 * icon - 分隔符图标的URL.
 */
mxToolbar.prototype.addSeparator = function(icon)
{
	return this.addItem(null, icon, null);
};

/**
 * Function: addBreak
 * 
 * 向容器添加中断。
 */
mxToolbar.prototype.addBreak = function()
{
	mxUtils.br(this.container);
};

/**
 * Function: addLine
 * 
 * 向容器添加一条水平线。
 */
mxToolbar.prototype.addLine = function()
{
	var hr = document.createElement('hr');
	
	hr.style.marginRight = '6px';
	hr.setAttribute('size', '1');
	
	this.container.appendChild(hr);
};

/**
 * Function: destroy
 * 
 * 删除工具栏及其所有关联资源.
 */
mxToolbar.prototype.destroy = function ()
{
	mxEvent.release(this.container);
	this.container = null;
	this.defaultMode = null;
	this.defaultFunction = null;
	this.selectedMode = null;
	
	if (this.menu != null)
	{
		this.menu.destroy();
	}
};
