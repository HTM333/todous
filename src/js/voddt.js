function main(container,srcId,pageName,url){
    var req = mxUtils.load(url)
    var graph = new mxGraph(container)
   
    //禁用浏览器默认的右键菜单栏
    mxEvent.disableContextMenu(container);
    //允许移动背景,鼠标右键触发
    graph.setCellsMovable(false);
    graph.setAutoSizeCells(true);

    graph.centerZoom = false;
    //图形是否允许移动
    graph.setEnabled(false);

    //图形双击事件
    mxGraph.prototype.click = function (evt, cell) {
        console.log(evt)
        //判断点击的是不是图形
        if(evt.state!=undefined){
            var url=evt.state.cell.CUSTOM_COLOR_JUMPPATH
            if(url!=undefined && url!=''){
                // console.log(evt.state.cell.CUSTOM_COLOR_JUMPPATH)
                 window.location.href=url
            }
        }
    }

     
    //开始渲染xml
    //xml字符串
    var pointsTxt=req.request.responseText.toString()
    
    //xml字符串转换json数据(会带有@符号)
    var json = $.xml2json(pointsTxt);
    //把json数据转换为字符串
    var jsonStr=JSON.stringify(json)
    //替换所有的@符号(消除所有的@符号)
    jsonStr= jsonStr.replace(/@/g,'')
    
    //把jsonStr转回json数据
    var newJson=eval("("+jsonStr+")")
    
    //获取画板的背景样式
    var mgBgStyle=newJson.background

    var mxCells=newJson.root.mxCell   
    let cellsObj = {},edges = []
    graph.getModel().beginUpdate()
    var parent = graph.getDefaultParent();
    try {
        //保存所有cell的样式
        var CellsStyle=[]
        //出现只有一个图形的情况 会出现undefined
        var mxCellsLength=mxCells.length
        if(mxCells.length==undefined){
            mxCellsLength=1
        }

        // //调用获取数据并赋值
        // data()

        //循环处理节点cell 同时找出对应关系的线
        for (let i = 0; i < mxCellsLength; i++) {
            let mxCell 
            if(mxCellsLength==1){
                mxCell = mxCells
            }else{
                mxCell = mxCells[i]
            }
            
            let mxCellGeometry =mxCell.mxGeometry
            if (mxCell.vertex) {
                const geometry = mxCellGeometry
                var vertex = graph.insertVertex(
                    parent,
                    null,
                    mxCell.value,
                    geometry.x,
                    geometry.y,
                    geometry.width,
                    geometry.height,
                    mxCell.style
                )
                CellsStyle.push(mxCell.style)
                
                vertex.id = mxCell.id;                
                //动态的表达式变量
                vertex.CUSTOM_COLOR_VARIABLE=mxCell.CUSTOM_COLOR_VARIABLE
                //动态的数据内容
                vertex.CUSTOM_TEXT_VARIABLE=mxCell.CUSTOM_TEXT_VARIABLE
                //动态三种表达式
                vertex.CUSTOM_COLORSELECTONE=mxCell.CUSTOM_COLORSELECTONE
                vertex.CUSTOM_COLORSELECTTWO=mxCell.CUSTOM_COLORSELECTTWO
                vertex.CUSTOM_COLORSELECTTHREE=mxCell.CUSTOM_COLORSELECTTHREE
                //动态三种颜色选择
                vertex.CUSTOM_COLOR_ONE_VALUE=mxCell.CUSTOM_COLOR_ONE_VALUE
                vertex.CUSTOM_COLOR_TWO_VALUE=mxCell.CUSTOM_COLOR_TWO_VALUE
                vertex.CUSTOM_COLOR_THREE_VALUE=mxCell.CUSTOM_COLOR_THREE_VALUE
                //跳转路径
                vertex.CUSTOM_COLOR_JUMPPATH=mxCell.CUSTOM_COLOR_JUMPPATH
                cellsObj["vertex" + vertex.id] = vertex;
                
                //自定义图标
                var style = new Object(); 
                style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE; 
                style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter; 
                style[mxConstants.STYLE_IMAGE] = '../assets/log/yf.jpg';
                graph.getStylesheet().putCellStyle('image', style)

                //动态自定义图标
                // console.log(CellsStyle[i])
                var src,iconName
                // console.log(CellsStyle[i])
                 //判断是否是添加的图标，判断有没有result属性,true是添加的图标
                
                if(CellsStyle[i]!=undefined){
                    var addIcon=CellsStyle[i].indexOf("result") != -1

                    if(CellsStyle[i].split(';')[1]!=undefined && addIcon){
                        iconName=CellsStyle[i].split(';')[0]
                        CellsStyle[i].split(';')[0]
                        var iconType=CellsStyle[i].split('=')[1].split(';')[0]
                        var result=CellsStyle[i].split(';')[2].split('=')[1]
                        src = "data:" + iconType + ";base64," + result;
                        
    
                        var style = new Object(); 
                        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE; 
                        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter; 
                        style[mxConstants.STYLE_IMAGE] = src;
                        graph.getStylesheet().putCellStyle(iconName, style) 
                    }
                }                
            } else if (mxCell.edge) {
                edges.push(mxCell)
            } else {
                continue
            }
        }
    
        //拼接节点关联线
        // console.log(cellsObj)
        for (let i = 0; i < edges.length; i++) {
            let edge = edges[i]
            geometry = edge.mxGeometry
            // console.log(edge)
            // console.log(edge.source)    
            graph.insertEdge(
                parent,
                null,
                edge.value,
                cellsObj["vertex" + edge.source],
                cellsObj["vertex" + edge.target],
                edge.style
            ).setId(edge.id)                   
        }
        
        //画板背景
        if(mgBgStyle!=undefined){
            if(mgBgStyle.length==7){
                container.style.background = mgBgStyle
            }else{
                container.style.background = `url("`+mgBgStyle+`")`
            }
            document.body.appendChild(container) 
        }
        
    } 
    finally {
        graph.getModel().endUpdate()
    } 
    
    //-------------------------方法----------------------------
    
    //-----------获取图形信息------------
    // console.log(newJson)
    //保存图形信息
    var cellInfoMap = new Map()
    // 将cell的信息封装起来
    var cellInfo 
    //获取信息
    addDynamic()
    function addDynamic(){
        if (graph.getModel().cells) {
            Object.values(graph.getModel().cells).forEach((cell, index) => {
                //先判断类型,vertex表示点（既图形 ）,edge表示线
                var state;
                cellInfo = {} // 将cell的信息封装起来
                if (cell.edge && !cell.vertex) {
                    //连线的情况
                    state = graph.view.getState(cell);
                } else if (cell.vertex) {
                    //图形的情况
                    cellInfo.cell=cell
                    cellInfo.cellId=cell.id
                    //获取cell的state对象
                    state = graph.view.getState(cell)
                    cellInfo.cellState = state

                    //保存cell信息
                    cellInfoMap.set(cell.id, cellInfo)
                    // console.log(cellInfoMap)
                }
            })
        }else{
            //其他元素
            state = graph.view.getState(cell)
        }
    }//addDynamic方法

    //-----------获取点名------------
    getPoint()
    var PointName
    var PointNameMap
    function getPoint() {
        PointNameMap = new Map()
        var i=0
        
        cellInfoMap.forEach((cellInfo,key)=>{
            PointName={}
            //获取需要获取数据的cell图形
            if(cellInfo.cell.CUSTOM_TEXT_VARIABLE != undefined &&cellInfo.cell.CUSTOM_TEXT_VARIABLE !=''){   
                //图形
                PointName.cell=cellInfo.cell
                //动态文本内容变量名
                PointName.pointName=cellInfo.cell.CUSTOM_TEXT_VARIABLE
                //动态表达式变量名
                PointName.colorVariable=cellInfo.cell.CUSTOM_COLOR_VARIABLE
                //动态三种表达式
                PointName.colorSelOne=cellInfo.cell.CUSTOM_COLORSELECTONE
                PointName.colorSelTwo=cellInfo.cell.CUSTOM_COLORSELECTTWO
                PointName.colorSelThree=cellInfo.cell.CUSTOM_COLORSELECTTHREE
                //动态三种颜色选择
                PointName.colorOneVal=cellInfo.cell.CUSTOM_COLOR_ONE_VALUE
                PointName.colorTwoVal=cellInfo.cell.CUSTOM_COLOR_TWO_VALUE
                PointName.colorThreeVal=cellInfo.cell.CUSTOM_COLOR_THREE_VALUE

                PointNameMap.set(i,PointName)
                i++
            }
        })
    }//getPoint方法

    //调用获取数据并赋值
    data()
  
    //-----------连接后台 获取数据------------
    function data(){
        //地址参数
        var cementonelist = []
        //保存所有的文本变量名
        var textVariableName=[]
        //保存所有的颜色变量名
        var colorVariableName=[]
        if(srcId!=''){
            // console.log(PointNameMap)
            for(var i=0;i<PointNameMap.size;i++){
                //所有文本变量名
                textVariableName[i]=PointNameMap.get(i).pointName
                //所有颜色变量名
                colorVariableName[i]=PointNameMap.get(i).colorVariable
            }
            
            // console.log('文本变量名')
            // console.log(textVariableName)
            // console.log('颜色变量名')
            // console.log(colorVariableName)
            
            // cementonelist.push(srcId)
            // cementonelist.push('RD006590;RD006580;')

            //数组去重（Array.from(new Set(colorVariableName))）
            //拼接参数每个数组用“；”隔开（.join(';')）
            // Array.from(new Set(colorVariableName)).join(';')
            cementonelist.push(Array.from(new Set(colorVariableName)).join(';'))

            // console.log("srcId —— "+srcId)
            // console.log("pageName —— "+pageName)
            // console.log("cementonelist —— "+cementonelist)
            
            //调用后台的方法获取数据
            // mainFunction('SRC02',pageName,cementonelist,null)
            mainFunction(srcId,pageName,cementonelist,null)
    
            self.setInterval("dealData()",2000)
        }
    }
    
    //-----------给对应的cell的值赋值数据------------
    //保存填充颜色
    var bgcolor
    dealData=function(){
        // console.log("wwwww");
        var data=this.dataMap
        if(data!=undefined){
            //根据键获取后台数据
            // console.log(data['hd_recomskw'])
            // console.log(PointNameMap)
            
            for(var i=0;i<PointNameMap.size;i++){
                //获取节点名称
                // console.log(PointNameMap.get(i).pointName)
                //根据文本变量名键值对获取数据
                // console.log(data[PointNameMap.get(i).pointName])
                
                //获取颜色变量名称
                // console.log(PointNameMap.get(i).colorVariable)
                var colorVariable=PointNameMap.get(i).colorVariable

                // 获取三种颜色变量表达式
                var colorSelOne =PointNameMap.get(i).colorSelOne
                var colorSelTwo=PointNameMap.get(i).colorSelTwo
                var colorSelThree=PointNameMap.get(i).colorSelThree
                
                // 获取三种颜色选择
                var colorOneVal =PointNameMap.get(i).colorOneVal
                var colorTwoVal=PointNameMap.get(i).colorTwoVal
                var colorThreeVal=PointNameMap.get(i).colorThreeVal
                
                
                // 把颜色变量替换成数据 组成可判断的表达式(x>0 ——> 数据>0)
                // 一
                // console.log(PointNameMap.get(i).colorSelOne)
                // console.log(colorSelOne.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName]))
                // console.log(eval(colorSelOne.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName])))
                // 二
                // console.log(PointNameMap.get(i).colorSelTwo)  
                // console.log(colorSelTwo.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName]))
                // console.log(eval(colorSelTwo.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName])))
                // 三
                // console.log(PointNameMap.get(i).colorSelThree)
                // console.log(colorSelThree.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName]))
                // console.log(eval(colorSelThree.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName])))
                
                
                
                //判断三种表达式是否成立，成立则显示对应的背景颜色
                if(eval(colorSelOne.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName]))&&colorSelOne!=''){
                    // 判断第一条表达式
                    //红色
                    bgcolor=colorOneVal
                }else if(eval(colorSelTwo.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName]))&&colorSelTwo!=''){
                    //判断第二条表达式
                    //黄色
                    bgcolor=colorTwoVal
                }else if(eval(colorSelThree.replace(new RegExp(colorVariable, 'g'), data[PointNameMap.get(i).pointName]))&&colorSelThree!=''){
                    //判断第三条表达式
                    //绿色
                    bgcolor=colorThreeVal
                }
                

                //根据表达式动态改变颜色
                graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, bgcolor , [PointNameMap.get(i).cell])

                //获取数据赋值给Value
                graph.getModel().setValue(PointNameMap.get(i).cell, data[PointNameMap.get(i).pointName])
                //刷新画板
                graph.refresh() 
            }
        }
    }
  
}
